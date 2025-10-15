import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reservationId, userId } = body

    if (!reservationId || !userId) {
      return NextResponse.json({
        success: false,
        error: '필수 정보가 누락되었습니다.'
      }, { status: 400 })
    }

    const reservation = await prisma.serviceRequest.findFirst({
      where: {
        id: reservationId,
        userId: userId
      }
    })

    if (!reservation) {
      return NextResponse.json({
        success: false,
        error: '예약을 찾을 수 없습니다.'
      }, { status: 404 })
    }

    if (reservation.status !== 'APPROVED') {
      return NextResponse.json({
        success: false,
        error: '진행중인 예약만 수령할 수 있습니다.'
      }, { status: 400 })
    }

    const now = new Date()
    const reservationDateTime = new Date(reservation.reservationDate)
    const [hours, minutes] = reservation.reservationTime.split(':').map(Number)
    reservationDateTime.setHours(hours, minutes, 0, 0)

    if (now < reservationDateTime) {
      return NextResponse.json({
        success: false,
        error: '아직 수령 가능한 시간이 아닙니다.'
      }, { status: 400 })
    }

    const updatedReservation = await prisma.serviceRequest.update({
      where: { id: reservationId },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: '자산 수령이 완료되었습니다.',
      data: updatedReservation
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '수령 처리 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

