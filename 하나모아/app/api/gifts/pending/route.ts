import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { 
      senderId, 
      receiverPhone, 
      receiverName,
      asset, 
      quantity, 
      messageCard, 
      message 
    } = await request.json()

    if (!senderId || !receiverPhone || !asset || !quantity || quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: '필수 정보가 누락되었습니다.'
      }, { status: 400 })
    }

    const normalizedPhone = receiverPhone.replace(/[^0-9]/g, '')

    const sender = await prisma.user.findUnique({
      where: { id: senderId }
    })

    if (!sender) {
      return NextResponse.json({
        success: false,
        error: '발신자를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    const holding = await prisma.holding.findUnique({
      where: {
        userId_asset: {
          userId: senderId,
          asset: asset
        }
      }
    })

    if (!holding || holding.quantity < quantity) {
      return NextResponse.json({
        success: false,
        error: '보유 자산이 부족합니다.'
      }, { status: 400 })
    }


    const result = await prisma.$transaction(async (tx) => {
      
      const newQuantity = Math.round((holding.quantity - quantity) * 100) / 100
      const newTotalAmount = Math.round((newQuantity * holding.averagePrice) * 100) / 100
      
      await tx.holding.update({
        where: {
          userId_asset: {
            userId: senderId,
            asset: asset
          }
        },
        data: {
          quantity: newQuantity,
          totalAmount: newTotalAmount
        }
      })

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      const pendingGift = await tx.pendingGift.create({
        data: {
          senderId,
          receiverPhone: normalizedPhone,
          receiverName,
          asset,
          quantity,
          messageCard,
          message,
          expiresAt
        }
      })

      const senderAccount = await tx.account.findFirst({
        where: { userId: senderId }
      })

      if (senderAccount) {
        await tx.transaction.create({
          data: {
            userId: senderId,
            accountId: senderAccount.id,
            type: 'GIFT_SEND',
            amount: 0, 
            balance: senderAccount.balance,
            description: `${asset.toUpperCase()} ${quantity}g 선물 (미가입자: ${normalizedPhone})`,
            referenceId: pendingGift.id
          }
        })
      }

      return pendingGift
    })

    try {
      const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sms/pending-gift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          senderName: sender.name,
          asset,
          quantity
        })
      })

      if (smsResponse.ok) {
        await prisma.pendingGift.update({
          where: { id: result.id },
          data: {
            smsStatus: 'SENT',
            smsSentAt: new Date()
          }
        })
      } else {
        await prisma.pendingGift.update({
          where: { id: result.id },
          data: {
            smsStatus: 'FAILED'
          }
        })
      }
    } catch (smsError) {
      await prisma.pendingGift.update({
        where: { id: result.id },
        data: {
          smsStatus: 'FAILED'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        message: '선물이 성공적으로 전송되었습니다. SMS로 알림이 발송됩니다.'
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '선물 전송 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({
        success: false,
        error: '전화번호가 필요합니다.'
      }, { status: 400 })
    }

    const normalizedPhone = phone.replace(/[^0-9]/g, '')

    const pendingGifts = await prisma.pendingGift.findMany({
      where: {
        receiverPhone: normalizedPhone,
        status: 'PENDING',
        expiresAt: {
          gt: new Date() 
        }
      },
      include: {
        sender: {
          select: {
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: pendingGifts
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '선물 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
