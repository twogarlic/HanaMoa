import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../../lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const skip = (page - 1) * limit

    const [comments, totalComments] = await Promise.all([
      prisma.comment.findMany({
        where: {
          postId,
          isDeleted: false
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              userId: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.comment.count({
        where: {
          postId,
          isDeleted: false
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total: totalComments,
        totalPages: Math.ceil(totalComments / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '댓글 목록을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const body = await request.json()
    const { userId, content } = body

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const [post, user] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId },
        select: { id: true }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      })
    ])

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          postId,
          userId,
          content
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              userId: true
            }
          }
        }
      })

      await tx.post.update({
        where: { id: postId },
        data: {
          comments: {
            increment: 1
          }
        }
      })

      return newComment
    })

    return NextResponse.json({
      success: true,
      data: comment
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
