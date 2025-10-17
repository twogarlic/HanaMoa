import { NextRequest } from 'next/server'
import { ApiResponse } from '@/lib/api/utils/response'

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
      return ApiResponse.badRequest('전화번호와 인증번호를 입력해주세요')
    }

    const storedData = verificationCodes.get(phone.replace(/-/g, ''))

    if (!storedData) {
      return ApiResponse.badRequest('인증번호를 먼저 발송해주세요')
    }

    if (Date.now() > storedData.expires) {
      verificationCodes.delete(phone.replace(/-/g, ''))
      return ApiResponse.badRequest('인증번호가 만료되었습니다. 다시 발송해주세요')
    }

    if (storedData.code === code) {
      verificationCodes.delete(phone.replace(/-/g, ''))
      return ApiResponse.success({}, '전화번호 인증이 완료되었습니다')
    } else {
      return ApiResponse.badRequest('인증번호가 일치하지 않습니다')
    }

  } catch (error) {
    return ApiResponse.serverError('인증번호 확인에 실패했습니다')
  }
}

export function storeVerificationCode(phone: string, code: string) {
  const expires = Date.now() + 1 * 60 * 1000
  verificationCodes.set(phone.replace(/-/g, ''), { code, expires })
}
