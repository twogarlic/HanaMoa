import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function DELETE(
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


    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        isDeleted: true
      }
    })


    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (post.isDeleted) {
      return NextResponse.json(
        { success: false, error: '이미 삭제된 게시글입니다.' },
        { status: 400 }
      )
    }

    if (post.userId !== userId) {
      return NextResponse.json(
        { success: false, error: '게시글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }


    await prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true
      }
    })


    return NextResponse.json({
      success: true,
      message: '게시글이 삭제되었습니다.'
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: '게시글 삭제에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
    }
}