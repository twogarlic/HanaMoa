import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const postIds = searchParams.get('postIds')
    
    if (!userId || !postIds) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID와 게시글 ID가 필요합니다.'
      }, { status: 400 })
    }
    
    const postIdArray = postIds.split(',')
    
    const likes = await prisma.postLike.findMany({
      where: {
        userId: userId,
        postId: { in: postIdArray }
      },
      select: {
        postId: true
      }
    })
    
    const likesMap: { [key: string]: boolean } = {}
    likes.forEach(like => {
      likesMap[like.postId] = true
    })
    
    return NextResponse.json({
      success: true,
      data: likesMap
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '좋아요 상태 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
