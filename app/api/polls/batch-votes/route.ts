import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const pollIds = searchParams.get('pollIds')
    
    if (!userId || !pollIds) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID와 투표 ID가 필요합니다.'
      }, { status: 400 })
    }
    
    const pollIdArray = pollIds.split(',')
    
    const votes = await prisma.pollVote.findMany({
      where: {
        userId: userId,
        pollId: { in: pollIdArray }
      },
      select: {
        pollId: true,
        optionId: true
      }
    })
    
    const votesMap: { [key: string]: any[] } = {}
    votes.forEach(vote => {
      if (!votesMap[vote.pollId]) {
        votesMap[vote.pollId] = []
      }
      votesMap[vote.pollId].push({ optionId: vote.optionId })
    })
    
    return NextResponse.json({
      success: true,
      data: votesMap
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '투표 상태 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
