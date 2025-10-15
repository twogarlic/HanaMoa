import { NextRequest, NextResponse } from 'next/server'
import { NotificationType } from '../../../../lib/generated/prisma'
import prisma from '../../../../lib/database'
import { sendPushNotification } from '../../../../lib/fcm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'latest' 
    const asset = searchParams.get('asset') || 'gold'
    
    const skip = (page - 1) * limit

    const orderBy = sortBy === 'popular' 
      ? [{ likes: 'desc' as const }, { createdAt: 'desc' as const }]
      : [{ createdAt: 'desc' as const }]

    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false,
        asset: asset
      },
      select: {
        id: true,
        userId: true,
        asset: true,
        content: true,
        imageUrl: true,
        pollId: true,
        likes: true,
        comments: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            userId: true,
            profileImage: true,
            holdings: {
              where: {
                asset: asset,
                quantity: {
                  gt: 0
                }
              },
              select: {
                asset: true,
                quantity: true
              }
            }
          }
        },
        poll: {
          include: {
            options: {
              orderBy: { order: 'asc' },
              include: {
                _count: {
                  select: {
                    votes: true
                  }
                }
              }
            },
            _count: {
              select: {
                votes: true
              }
            }
          }
        },
        _count: {
          select: {
            commentList: {
              where: {
                isDeleted: false
              }
            },
            likeList: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    const totalPosts = await prisma.post.count({
      where: {
        isDeleted: false,
        asset: asset
      }
    })

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '게시글 목록을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const content = formData.get('content') as string
    const asset = formData.get('asset') as string
    const imageFile = formData.get('image') as File | null
    
    const pollDataStr = formData.get('pollData') as string | null
    let pollData = null
    if (pollDataStr) {
      try {
        pollData = JSON.parse(pollDataStr)
      } catch (error) {
      }
    }

    if (!userId || !asset) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (!content.trim() && !imageFile && !pollData) {
      return NextResponse.json(
        { success: false, error: '내용을 입력하거나 이미지를 첨부하거나 투표를 생성해주세요.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    let imageUrl: string | null = null
    let pollId: string | null = null

    if (pollData && pollData.title && pollData.options && Array.isArray(pollData.options) && pollData.options.length >= 2) {
      try {
        const poll = await prisma.poll.create({
          data: {
            title: pollData.title,
            description: pollData.description || null,
            isMultiple: pollData.isMultiple || false,
            endDate: pollData.endDate ? new Date(pollData.endDate) : null,
            options: {
              create: pollData.options.map((option: string, index: number) => ({
                text: option,
                order: index + 1
              }))
            }
          }
        })
        pollId = poll.id
      } catch (error) {
        return NextResponse.json(
          { success: false, error: '투표 생성에 실패했습니다.' },
          { status: 500 }
        )
      }
    }

    if (imageFile && imageFile.size > 0) {
      try {
        if (imageFile.size > 1.5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: '파일 크기는 1.5MB 이하여야 합니다.' },
            { status: 400 }
          )
        }

        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { success: false, error: '이미지 파일만 업로드할 수 있습니다.' },
            { status: 400 }
          )
        }

        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        
        imageUrl = `data:${imageFile.type};base64,${base64}`
      } catch (error) {
        return NextResponse.json(
          { success: false, error: '이미지 처리에 실패했습니다.' },
          { status: 500 }
        )
      }
    }

    const post = await prisma.post.create({
      data: {
        userId,
        asset,
        content,
        imageUrl,
        pollId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userId: true,
            profileImage: true
          }
        },
        poll: {
          include: {
            options: {
              orderBy: { order: 'asc' },
              include: {
                _count: {
                  select: {
                    votes: true
                  }
                }
              }
            },
            _count: {
              select: {
                votes: true
              }
            }
          }
        },
        _count: {
          select: {
            commentList: {
              where: {
                isDeleted: false
              }
            },
            likeList: true
          }
        }
      }
    })

    try {
      const followers = await prisma.userFollow.findMany({
        where: {
          followingId: userId
        },
        select: {
          followerId: true
        }
      })

      if (followers.length > 0) {
        await prisma.notification.createMany({
          data: followers.map(follow => ({
            userId: follow.followerId,
            type: NotificationType.NEW_POST,
            title: '새로운 글이 올라왔어요!',
            message: `${user.name}님이 새로운 글을 작성했습니다.`,
            data: {
              postId: post.id,
              authorId: userId,
              authorName: user.name,
              asset: asset
            }
          }))
        })

        await Promise.allSettled(
          followers.map(follow => 
            sendPushNotification(
              follow.followerId,
              '새로운 글이 올라왔어요!',
              `${user.name}님이 새로운 글을 작성했습니다.`,
              {
                type: 'NEW_POST',
                postId: post.id,
                authorId: userId,
                authorName: user.name,
                asset: asset
              }
            )
          )
        )

      }
    } catch (notificationError) {
    }

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '게시글 작성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
