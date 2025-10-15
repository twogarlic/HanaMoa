import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../../lib/database'

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

    const post = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false }
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        isDeleted: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userId: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' 
      }
    })

    return NextResponse.json({
      success: true,
      data: comments
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '댓글 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const body = await request.json()
    const { userId, content } = body

    if (!userId || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 댓글 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false }
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
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

    const comment = await prisma.comment.create({
      data: {
        postId: postId,
        userId: userId,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userId: true,
            profileImage: true
          }
        }
      }
    })

    await prisma.post.update({
      where: { id: postId },
      data: {
        comments: {
          increment: 1
        }
      }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')
    const userId = searchParams.get('userId')

    if (!commentId || !userId) {
      return NextResponse.json(
        { success: false, error: '댓글 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId, isDeleted: false },
      select: {
        id: true,
        postId: true,
        userId: true,
        isDeleted: true
      }
    })

    if (!comment) {
      return NextResponse.json(
        { success: false, error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (comment.postId !== postId) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청입니다.' },
        { status: 400 }
      )
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        { success: false, error: '댓글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true
      }
    })

    await prisma.post.update({
      where: { id: postId },
      data: {
        comments: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '댓글 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
