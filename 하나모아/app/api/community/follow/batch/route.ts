import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const followerId = searchParams.get('followerId')
    const followingIds = searchParams.get('followingIds')
    
    if (!followerId || !followingIds) {
      return NextResponse.json({
        success: false,
        error: '팔로워 ID와 팔로잉 ID가 필요합니다.'
      }, { status: 400 })
    }
    
    const followingIdArray = followingIds.split(',')
    
    const follows = await prisma.userFollow.findMany({
      where: {
        followerId: followerId,
        followingId: { in: followingIdArray }
      },
      select: {
        followingId: true
      }
    })
    
    const followsMap: { [key: string]: boolean } = {}
    follows.forEach(follow => {
      followsMap[follow.followingId] = true
    })
    
    return NextResponse.json({
      success: true,
      data: followsMap
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '팔로우 상태 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
