import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { prismaPoint } from '@/lib/database-point'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, paymentMethod, fee, serviceRequestId } = body
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      )
    }
    
    if (!paymentMethod || !['account', 'point'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: '결제 방법을 선택해주세요.' },
        { status: 400 }
      )
    }
    
    if (!fee || fee <= 0) {
      return NextResponse.json(
        { success: false, error: '수수료가 올바르지 않습니다.' },
        { status: 400 }
      )
    }
    
    if (!serviceRequestId) {
      return NextResponse.json(
        { success: false, error: '수령 신청 정보가 필요합니다.' },
        { status: 400 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true
      }
    })
    
    if (!user || !user.accounts || user.accounts.length === 0) {
      return NextResponse.json(
        { success: false, error: '사용자 계좌 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    const account = user.accounts[0]
    
    if (paymentMethod === 'account') {
      if (account.balance < fee) {
        return NextResponse.json(
          { success: false, error: '계좌 잔액이 부족합니다.' },
          { status: 400 }
        )
      }
      
      await prisma.$transaction(async (tx) => {
        await tx.account.update({
          where: { id: account.id },
          data: {
            balance: {
              decrement: fee
            }
          }
        })
        
        await tx.transaction.create({
          data: {
            userId: user.id,
            accountId: account.id,
            type: 'WITHDRAWAL',
            amount: fee,
            balance: account.balance - fee,
            description: '자산 수령 신청 수수료',
            referenceId: serviceRequestId
          }
        })
        
        await tx.serviceRequest.update({
          where: { reservationNumber: serviceRequestId },
          data: {
            status: 'APPROVED'
          }
        })
      })
      
      return NextResponse.json({
        success: true,
        message: '수수료 결제가 완료되었습니다.',
        data: {
          paymentMethod: 'account',
          fee: fee,
          balance: account.balance - fee
        }
      })
      
    } else if (paymentMethod === 'point') {
      const pointAccount = await prismaPoint.hanaPoint.findUnique({
        where: { userId }
      })
      
      if (!pointAccount) {
        return NextResponse.json(
          { success: false, error: '하나머니 계정이 없습니다.' },
          { status: 404 }
        )
      }
      
      if (pointAccount.balance < fee) {
        return NextResponse.json(
          { success: false, error: '하나머니 잔액이 부족합니다.' },
          { status: 400 }
        )
      }
      
      await Promise.all([
        prismaPoint.$transaction(async (tx) => {
          const newBalance = pointAccount.balance - fee
          
          await tx.hanaPoint.update({
            where: { id: pointAccount.id },
            data: {
              balance: newBalance,
              totalUsed: { increment: fee }
            }
          })
          
          await tx.hanaPointHistory.create({
            data: {
              pointId: pointAccount.id,
              type: 'USE',
              amount: -fee,
              balance: newBalance,
              description: '자산 수령 신청 수수료',
              sourceSystem: 'hana-moai',
              sourceId: serviceRequestId
            }
          })
        }),
        
        prisma.serviceRequest.update({
          where: { reservationNumber: serviceRequestId },
          data: {
            status: 'APPROVED'
          }
        })
      ])
      
      return NextResponse.json({
        success: true,
        message: '수수료 결제가 완료되었습니다.',
        data: {
          paymentMethod: 'point',
          fee: fee,
          balance: pointAccount.balance - fee
        }
      })
    }
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '수수료 결제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
    await prismaPoint.$disconnect()
  }
}

