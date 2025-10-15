import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'
import coolsms from 'coolsms-node-sdk'
import path from 'path'
import { sendPushNotification } from '../../../lib/fcm'

const sendGiftNotificationSMS = async (receiverPhone: string, senderName: string, asset: string, quantity: number) => {
  try {
    const messageService = new coolsms(
      process.env.COOLSMS_API_KEY!,
      process.env.COOLSMS_API_SECRET!
    )

    const assetNames: { [key: string]: string } = {
      'gold': '금',
      'silver': '은',
      'usd': '달러',
      'eur': '유로',
      'jpy': '엔화',
      'cny': '위안'
    }

    const assetName = assetNames[asset] || asset.toUpperCase()
    
    let giftDescription
    if (asset === 'gold' || asset === 'silver') {
      giftDescription = `${assetName} ${quantity}g`
    } else {
      giftDescription = `${quantity}${assetName}`
    }
    
    const message = `[하나모아] ${senderName}님이 ${giftDescription}을 선물로 보내셨어요! 지금 바로 하나모아에서 확인해보세요!`

    const imagePath = path.join(process.cwd(), 'public', 'images', 'ic_gift_sms.jpeg')
    
    const imageId = await messageService.uploadFile(imagePath, "MMS")
      .then(res => res.fileId)
      .catch(error => {
        return null
      })

    const result: any = await messageService.sendOne({
      to: receiverPhone.replace(/-/g, ''),
      from: process.env.COOLSMS_SENDER!,
      text: message,
      ...(imageId && { imageId }), 
      autoTypeDetect: true
    })

    return { success: true, result }
  } catch (error) {
    return { success: false, error }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') 

    if (!userId) {
      return NextResponse.json({ success: false, error: '사용자 ID가 필요합니다.' }, { status: 400 })
    }

    let gifts
    if (type === 'sent') {
      gifts = await prisma.gift.findMany({
        where: { senderId: userId },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (type === 'received') {
      gifts = await prisma.gift.findMany({
        where: { 
          receiverId: userId,
          status: 'PENDING'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      gifts = await prisma.gift.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({
      success: true,
      data: gifts
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '선물 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      senderId, 
      receiverId, 
      asset, 
      quantity, 
      messageCard, 
      message 
    } = body

    if (!senderId || !receiverId || !asset || !quantity) {
      return NextResponse.json({ 
        success: false, 
        error: '필수 정보가 누락되었습니다.' 
      }, { status: 400 })
    }

    if (senderId === receiverId) {
      return NextResponse.json({ 
        success: false, 
        error: '자기 자신에게는 선물할 수 없습니다.' 
      }, { status: 400 })
    }

    const senderHolding = await prisma.holding.findUnique({
      where: {
        userId_asset: {
          userId: senderId,
          asset: asset
        }
      }
    })

    if (!senderHolding || senderHolding.quantity < quantity) {
      return NextResponse.json({ 
        success: false, 
        error: '보유 자산이 부족합니다.' 
      }, { status: 400 })
    }

    const gift = await prisma.$transaction(async (tx) => {
      const newQuantity = Math.round((senderHolding.quantity - quantity) * 100) / 100
      const newTotalAmount = Math.round((newQuantity * senderHolding.averagePrice) * 100) / 100
      
      await tx.holding.update({
        where: { id: senderHolding.id },
        data: {
          quantity: newQuantity,
          totalAmount: newTotalAmount
        }
      })

      return await tx.gift.create({
        data: {
          senderId,
          receiverId,
          asset,
          quantity,
          messageCard,
          message,
          status: 'PENDING'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        }
      })
    })

    try {
      const [receiver, sender] = await Promise.all([
        prisma.user.findUnique({
          where: { id: receiverId },
          select: { phone: true }
        }),
        prisma.user.findUnique({
          where: { id: senderId },
          select: { name: true }
        })
      ])
      
      if (sender) {
        const assetNames: { [key: string]: string } = {
          'gold': '금',
          'silver': '은',
          'usd': '달러',
          'eur': '유로',
          'jpy': '엔화',
          'cny': '위안'
        }

        const assetName = assetNames[asset] || asset.toUpperCase()
        let giftDescription
        if (asset === 'gold' || asset === 'silver') {
          giftDescription = `${assetName} ${quantity}g`
        } else {
          giftDescription = `${quantity}${assetName}`
        }

        await Promise.allSettled([
          receiver && receiver.phone 
            ? sendGiftNotificationSMS(receiver.phone, sender.name, asset, quantity)
            : Promise.resolve(),
          sendPushNotification(
            receiverId,
            '새로운 선물이 도착했습니다!',
            `${sender.name}님이 ${giftDescription}을 선물했습니다.`,
            {
              type: 'GIFT_REQUEST',
              giftId: gift.id,
              senderId: senderId
            }
          )
        ])
      }
    } catch (notificationError) {
    }

    return NextResponse.json({
      success: true,
      data: gift,
      message: '선물이 성공적으로 전송되었습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '선물 전송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
