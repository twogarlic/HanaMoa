import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

function generateReservationNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const timestamp = now.getTime().toString().slice(-6) 
  
  return `SR${year}${month}${day}${timestamp}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      branchId, 
      branchName, 
      branchAddress, 
      branchPhone,
      asset, 
      requestDate,
      reservationDate,
      reservationTime 
    } = body

    if (!userId || !branchId || !asset || !reservationDate || !reservationTime) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const existingReservation = await prisma.serviceRequest.findFirst({
      where: {
        branchId: branchId,
        reservationDate: new Date(reservationDate),
        reservationTime: reservationTime,
        status: {
          in: ['PENDING', 'APPROVED']
        }
      }
    })

    if (existingReservation) {
      return NextResponse.json(
        { success: false, error: '해당 시간대는 이미 예약이 있습니다.' },
        { status: 409 }
      )
    }

    const reservationNumber = generateReservationNumber()
    
    let holdingToUpdate = null
    
    if (['usd', 'eur', 'jpy', 'cny'].includes(asset.type)) {
      const forexHoldings = await prisma.holding.findMany({
        where: {
          userId: userId,
          asset: asset.type
        }
      })
      
      holdingToUpdate = forexHoldings.find(holding => holding.quantity >= asset.amount)
    } else {
      const holdings = await prisma.holding.findMany({
        where: {
          userId: userId,
          asset: asset.type
        }
      })
      
      for (const holding of holdings) {      
        let assetUnit = `${holding.quantity}g`
                
        const assetUnitMatch = assetUnit.match(/^(\d+(?:\.\d+)?)(.*)$/)
        const selectedUnitMatch = (asset.unit || '').match(/^(\d+(?:\.\d+)?)(.*)$/)
        
        if (assetUnitMatch && selectedUnitMatch) {
          const assetUnitType = assetUnitMatch[2]
          const selectedUnitType = selectedUnitMatch[2]

          if (assetUnitType === selectedUnitType) {
            const selectedAmount = parseFloat(selectedUnitMatch[1])
            if (holding.quantity >= selectedAmount) {
              holdingToUpdate = holding
              break
            }
          }
        }

        if (assetUnit === (asset.unit || '') && holding.quantity >= 1) {
          holdingToUpdate = holding
          break
        }
      }
    }

    if (!holdingToUpdate) {
      return NextResponse.json(
        { success: false, error: '보유 자산이 부족합니다.' },
        { status: 400 }
      )
    }

    const newQuantity = Math.round((holdingToUpdate.quantity - asset.amount) * 100) / 100
    const newTotalAmount = Math.round((newQuantity * holdingToUpdate.averagePrice) * 100) / 100
    
    const [serviceRequest] = await prisma.$transaction([
      prisma.serviceRequest.create({
        data: {
          reservationNumber: reservationNumber,
          userId: userId,
          branchId: branchId,
          branchName: branchName || '',
          branchAddress: branchAddress || '',
          branchPhone: branchPhone || '',
          assetType: asset.type,
          assetUnit: asset.unit,
          assetAmount: asset.amount,
          requestDate: new Date(requestDate || new Date()),
          reservationDate: new Date(reservationDate),
          reservationTime: reservationTime,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.holding.update({
        where: {
          id: holdingToUpdate.id
        },
        data: {
          quantity: newQuantity,
          totalAmount: newTotalAmount,
          updatedAt: new Date()
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: serviceRequest,
      message: '수령 신청이 완료되었습니다.'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '수령 신청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const requests = await prisma.serviceRequest.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: requests
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '수령 신청 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
