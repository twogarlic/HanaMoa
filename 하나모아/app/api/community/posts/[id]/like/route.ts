import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../../lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { id: true, likes: true }
      })

      if (!post) {
        throw new Error('게시글을 찾을 수 없습니다.')
      }

      const existingLike = await tx.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      })

      if (existingLike) {
        await tx.postLike.delete({
          where: {
            postId_userId: {
              postId,
              userId
            }
          }
        })

        await tx.post.update({
          where: { id: postId },
          data: {
            likes: {
              decrement: 1
            }
          }
        })

        return {
          isLiked: false,
          likesCount: post.likes - 1
        }
      } else {
        await tx.postLike.create({
          data: {
            postId,
            userId
          }
        })

        await tx.post.update({
          where: { id: postId },
          data: {
            likes: {
              increment: 1
            }
          }
        })

        return {
          isLiked: true,
          likesCount: post.likes + 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '좋아요 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const like = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        isLiked: !!like
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '좋아요 상태를 확인할 수 없습니다.' },
      { status: 500 }
    )
  }
}
