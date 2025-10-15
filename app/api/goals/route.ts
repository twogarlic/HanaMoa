import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: goals
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '목표 목록 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, targetAmount, startDate, targetDate, asset, description, color } = body

    if (!userId || !title || !targetAmount || !startDate || !targetDate || !asset) {
      return NextResponse.json({
        success: false,
        error: '모든 필수 항목을 입력해주세요.'
      }, { status: 400 })
    }

    if (targetAmount <= 0) {
      return NextResponse.json({
        success: false,
        error: '목표 금액은 0보다 커야 합니다.'
      }, { status: 400 })
    }

    const startDateObj = new Date(startDate)
    const targetDateObj = new Date(targetDate)
    
    if (targetDateObj <= startDateObj) {
      return NextResponse.json({
        success: false,
        error: '목표 날짜는 시작 날짜보다 늦어야 합니다.'
      }, { status: 400 })
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        targetAmount,
        startDate: startDateObj,
        targetDate: targetDateObj,
        asset,
        description: description || null,
        color: color || '#03856E',
        currentAmount: 0,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      data: goal
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '목표 생성 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
