import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { reservationId, userId, cancelReason } = await request.json()

    if (!reservationId || !userId) {
      return NextResponse.json({
        success: false,
        error: '예약 ID와 사용자 ID가 필요합니다.'
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

    if (reservation.status === 'CANCELLED') {
      return NextResponse.json({
        success: false,
        error: '이미 취소된 예약입니다.'
      }, { status: 400 })
    }

    if (reservation.status === 'COMPLETED') {
      return NextResponse.json({
        success: false,
        error: '이미 완료된 예약은 취소할 수 없습니다.'
      }, { status: 400 })
    }

    const today = new Date()
    const reservationDate = new Date(reservation.reservationDate)
    
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const reservationDateOnly = new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate())
    
    if (todayDateOnly.getTime() === reservationDateOnly.getTime()) {
      return NextResponse.json({
        success: false,
        error: '당일 예약은 취소할 수 없습니다.'
      }, { status: 400 })
    }
    
    let holdingToRestore = null
    
    if (['usd', 'eur', 'jpy', 'cny'].includes(reservation.assetType)) {
      const forexHoldings = await prisma.holding.findMany({
        where: {
          userId: userId,
          asset: reservation.assetType
        }
      })      
      holdingToRestore = forexHoldings[0] 
    } else {
      const holdings = await prisma.holding.findMany({
        where: {
          userId: userId,
          asset: reservation.assetType
        }
      })
      
      for (const holding of holdings) {        
        let assetUnit = `${holding.quantity}g`
                
        const assetUnitMatch = assetUnit.match(/^(\d+(?:\.\d+)?)(.*)$/)
        const selectedUnitMatch = (reservation.assetUnit || '').match(/^(\d+(?:\.\d+)?)(.*)$/)
        
        if (assetUnitMatch && selectedUnitMatch) {
          const assetUnitType = assetUnitMatch[2]
          const selectedUnitType = selectedUnitMatch[2]
          
          if (assetUnitType === selectedUnitType) {
            holdingToRestore = holding
            break
          }
        }

        if (assetUnit === (reservation.assetUnit || '')) {
          holdingToRestore = holding
          break
        }
      }
    }

    const newQuantity = holdingToRestore ? Math.round((holdingToRestore.quantity + reservation.assetAmount) * 100) / 100 : 0
    const newTotalAmount = holdingToRestore ? Math.round((newQuantity * holdingToRestore.averagePrice) * 100) / 100 : 0
    
    const [updatedReservation] = await prisma.$transaction([
      prisma.serviceRequest.update({
        where: {
          id: reservationId
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: cancelReason || '사용자 요청',
          updatedAt: new Date()
        }
      }),
      ...(holdingToRestore ? [
        prisma.holding.update({
          where: {
            id: holdingToRestore.id
          },
          data: {
            quantity: newQuantity,
            totalAmount: newTotalAmount,
            updatedAt: new Date()
          }
        })
      ] : [])
    ])

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: '예약이 취소되었습니다.'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '예약 취소 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
