import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import coolsms from 'coolsms-node-sdk'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { phone, senderName, asset, quantity } = await request.json()

    if (!phone || !senderName || !asset || !quantity) {
      return NextResponse.json({
        success: false,
        error: '필수 정보가 누락되었습니다.'
      }, { status: 400 })
    }

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
    
    const message = `[하나모아] ${senderName}님이 ${giftDescription}을 선물로 보내셨습니다! 하나모아에 가입하여 선물을 받아보세요. https://www.hanamoa.co.kr `

    const imagePath = path.join(process.cwd(), 'public', 'images', 'ic_gift_sms.jpeg')
    
    let imageId = null
    try {
      const uploadResult = await messageService.uploadFile(imagePath, "MMS")
      imageId = uploadResult.fileId
    } catch (imageError) {
    }

    const result: any = await messageService.sendOne({
      to: phone.replace(/-/g, ''),
      from: process.env.COOLSMS_SENDER!,
      text: message,
      ...(imageId && { imageId }), 
      autoTypeDetect: true
    })

    let isSuccess = false
    
    if (Array.isArray(result) && result.length > 0) {
      const firstResult = result[0]
      isSuccess = firstResult.statusCode === '2000' || 
                 firstResult.status === 'success' ||
                 firstResult.statusMessage === 'success' ||
                 (firstResult && Object.keys(firstResult).length > 0)
    } else if (result && typeof result === 'object') {
      isSuccess = result.success === true || 
                 result.statusCode === '2000' || 
                 result.status === 'success' ||
                 result.errorCount === 0 ||
                 (result && !result.error && Object.keys(result).length > 0)
    } else {
      isSuccess = true
    }

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        data: {
          messageId: result.messageId || `sms_${Date.now()}`,
          sentAt: new Date(),
          result: result
        }
      })
    } else {
      throw new Error(`SMS 발송 실패: ${JSON.stringify(result)}`)
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'SMS 발송 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
