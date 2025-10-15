import { NextRequest, NextResponse } from 'next/server'

declare global {
  var verificationCodes: Map<string, { code: string; expires: number }> | undefined
}

const verificationCodes = globalThis.verificationCodes || new Map<string, { code: string; expires: number }>()
if (process.env.NODE_ENV === 'development') {
  globalThis.verificationCodes = verificationCodes
}

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: '전화번호와 인증번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const storedData = verificationCodes.get(phone.replace(/-/g, ''))
    
    if (!storedData) {
      return NextResponse.json(
        { success: false, message: '인증번호를 먼저 발송해주세요.' },
        { status: 400 }
      )
    }

    if (Date.now() > storedData.expires) {
      verificationCodes.delete(phone.replace(/-/g, ''))
      return NextResponse.json(
        { success: false, message: '인증번호가 만료되었습니다. 다시 발송해주세요.' },
        { status: 400 }
      )
    }

    if (storedData.code === code) {
      verificationCodes.delete(phone.replace(/-/g, ''))
      return NextResponse.json({
        success: true,
        message: '전화번호 인증이 완료되었습니다.'
      })
    } else {
      return NextResponse.json(
        { success: false, message: '인증번호가 일치하지 않습니다.' },
        { status: 400 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, message: '인증번호 확인에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export function storeVerificationCode(phone: string, code: string) {
  const expires = Date.now() + 1 * 60 * 1000
  verificationCodes.set(phone.replace(/-/g, ''), { code, expires })
}
