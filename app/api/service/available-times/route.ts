import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { branchId, date } = await request.json()

    if (!branchId || !date) {
      return NextResponse.json({
        success: false,
        error: '지점 ID와 날짜가 필요합니다.'
      }, { status: 400 })
    }

    const availableTimeSlots = [
      '09:00', '10:00', '11:00', '12:00', 
      '13:00', '14:00', '15:00', '16:00'
    ]

    const targetDate = new Date(date + 'T00:00:00+09:00') 
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    const existingReservations = await prisma.serviceRequest.findMany({
      where: {
        branchId: branchId,
        reservationDate: {
          gte: targetDate,
          lt: nextDay
        },
        status: {
          in: ['PENDING', 'APPROVED'] 
        }
      },
      select: {
        reservationTime: true,
        reservationDate: true,
        reservationNumber: true
      }
    })

    const bookedTimes = existingReservations.map(reservation => reservation.reservationTime)

    const availableTimes = availableTimeSlots.filter(time => !bookedTimes.includes(time))

    return NextResponse.json({
      success: true,
      data: {
        date: date,
        branchId: branchId,
        availableTimes: availableTimes,
        bookedTimes: bookedTimes,
        totalSlots: availableTimeSlots.length,
        availableSlots: availableTimes.length
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '예약 가능 시간 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
