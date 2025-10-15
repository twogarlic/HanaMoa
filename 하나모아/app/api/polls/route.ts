import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, options, isMultiple, endDate } = body

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { success: false, error: '투표 제목과 최소 2개의 선택지가 필요합니다.' },
        { status: 400 }
      )
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description: description || null,
        isMultiple: isMultiple || false,
        endDate: endDate ? new Date(endDate) : null,
        options: {
          create: options.map((option: string, index: number) => ({
            text: option,
            order: index + 1
          }))
        }
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
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
      data: poll
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '투표 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const polls = await prisma.poll.findMany({
      where: {
        isActive: true
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const totalPolls = await prisma.poll.count({
      where: {
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: polls,
      pagination: {
        page,
        limit,
        total: totalPolls,
        totalPages: Math.ceil(totalPolls / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '투표 목록을 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}
