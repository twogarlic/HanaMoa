import { NextRequest, NextResponse } from 'next/server'
import coolsms from 'coolsms-node-sdk'

declare global {
  var verificationCodes: Map<string, { code: string; expires: number }> | undefined
}

const verificationCodes = globalThis.verificationCodes || new Map<string, { code: string; expires: number }>()
if (process.env.NODE_ENV === 'development') {
  globalThis.verificationCodes = verificationCodes
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || !/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ''))) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 전화번호입니다.' },
        { status: 400 }
      )
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    const messageService = new coolsms(
      process.env.COOLSMS_API_KEY!,
      process.env.COOLSMS_API_SECRET!
    )

    const result: any = await messageService.sendOne({
      to: phone.replace(/-/g, ''),
      from: process.env.COOLSMS_SENDER!,
      text: `[하나모아] 인증번호는 ${verificationCode}입니다. 1분 내에 입력해주세요.`,
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
      const expires = Date.now() + 1 * 60 * 1000
      verificationCodes.set(phone.replace(/-/g, ''), { code: verificationCode, expires })
      
      return NextResponse.json({
        success: true,
        message: '인증번호가 발송되었습니다.',
        verificationCode
      })
    } else {
      throw new Error(`SMS 발송 실패: ${JSON.stringify(result)}`)
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, message: '인증번호 발송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
