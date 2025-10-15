import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: goalId } = await params
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

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: userId
      }
    })

    if (!existingGoal) {
      return NextResponse.json({
        success: false,
        error: '목표를 찾을 수 없거나 권한이 없습니다.'
      }, { status: 404 })
    }

    const updatedGoal = await prisma.goal.update({
      where: {
        id: goalId
      },
      data: {
        title,
        targetAmount,
        startDate: startDateObj,
        targetDate: targetDateObj,
        asset,
        description: description || null,
        color: color || '#03856E', 
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedGoal
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '목표 수정 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: goalId } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: userId
      }
    })

    if (!existingGoal) {
      return NextResponse.json({
        success: false,
        error: '목표를 찾을 수 없거나 권한이 없습니다.'
      }, { status: 404 })
    }

    await prisma.goal.delete({
      where: {
        id: goalId
      }
    })

    return NextResponse.json({
      success: true,
      message: '목표가 삭제되었습니다.'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '목표 삭제 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
