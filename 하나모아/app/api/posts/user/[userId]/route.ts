import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const requesterId = searchParams.get('requesterId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const isOwnPosts = requesterId === userId

    if (!isOwnPosts) {
      const author = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPostsPublic: true }
      })

      if (!author || !author.isPostsPublic) {
        return NextResponse.json(
          { success: false, error: '작성자가 글을 공개하지 않았습니다.' },
          { status: 403 }
        )
      }
    }

    const posts = await prisma.post.findMany({
      where: {
        userId: userId,
        isDeleted: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        poll: {
          include: {
            options: {
              include: {
                votes: true
              }
            },
            votes: {
              where: {
                userId: requesterId || undefined
              }
            }
          }
        },
        likeList: {
          where: {
            userId: requesterId || undefined
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const postsWithVotes = posts.map(post => ({
      ...post,
      userLikes: post.likeList,
      userVotes: post.poll?.votes || []
    }))

    return NextResponse.json({
      success: true,
      posts: postsWithVotes
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '게시글 조회에 실패했습니다.' },
      { status: 500 }
    )
    }
}
