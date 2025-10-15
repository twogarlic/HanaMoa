import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params
    const body = await request.json()
    const { userId, optionIds } = body

    if (!userId || !optionIds || !Array.isArray(optionIds)) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 선택지 배열이 필요합니다.' },
        { status: 400 }
      )
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true
      }
    })

    if (!poll) {
      return NextResponse.json(
        { success: false, error: '투표를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!poll.isActive) {
      return NextResponse.json(
        { success: false, error: '종료된 투표입니다.' },
        { status: 400 }
      )
    }

    if (poll.endDate && new Date() > poll.endDate) {
      return NextResponse.json(
        { success: false, error: '투표 기간이 종료되었습니다.' },
        { status: 400 }
      )
    }

    await prisma.pollVote.deleteMany({
      where: {
        pollId: pollId,
        userId: userId
      }
    })

    let votes: any[] = []

    if (optionIds.length > 0) {
      if (!poll.isMultiple && optionIds.length > 1) {
        return NextResponse.json(
          { success: false, error: '하나의 선택지만 선택할 수 있습니다.' },
          { status: 400 }
        )
      }

      const validOptionIds = poll.options.map(option => option.id)
      const invalidOptions = optionIds.filter((id: string) => !validOptionIds.includes(id))
      if (invalidOptions.length > 0) {
        return NextResponse.json(
          { success: false, error: '유효하지 않은 선택지입니다.' },
          { status: 400 }
        )
      }

      votes = await Promise.all(
        optionIds.map(async (optionId: string) => {
          return prisma.pollVote.create({
            data: {
              pollId: pollId,
              optionId: optionId,
              userId: userId
            }
          })
        })
      )
    }

    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
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
    })

    return NextResponse.json({
      success: true,
      data: {
        poll: updatedPoll,
        userVotes: votes
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '투표 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const userVotes = await prisma.pollVote.findMany({
      where: {
        pollId: pollId,
        userId: userId
      },
      include: {
        option: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        hasVoted: userVotes.length > 0,
        votes: userVotes
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '투표 상태를 조회할 수 없습니다.' },
      { status: 500 }
    )
  }
}
