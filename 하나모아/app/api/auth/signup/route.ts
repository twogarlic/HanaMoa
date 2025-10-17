import { NextRequest } from 'next/server'
import { validateBody } from '@/lib/api/middleware/validation'
import { signupSchema } from '@/lib/api/validators/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { ApiResponse } from '@/lib/api/utils/response'

export async function POST(request: NextRequest) {
  return validateBody(request, signupSchema, async (request, data) => {
    try {
      const result = await authService.signup(data)

      const pointInfo = await linkPointAccount(result.user.id, data.name, data.ssn, data.phone)

      return ApiResponse.success({
        user: result.user,
        accounts: result.accounts,
        point: pointInfo ? {
          balance: pointInfo.data.balance,
          isNewAccount: pointInfo.isNewAccount,
          message: pointInfo.message
        } : null
      }, '회원가입이 완료되었습니다')
    } catch (error: any) {
      if (error.statusCode) {
        return ApiResponse.error(error.message, error.statusCode)
      }
      return ApiResponse.serverError('회원가입 중 오류가 발생했습니다')
    }
  })
}

async function linkPointAccount(userId: string, name: string, ssn: string, phone: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/points/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, ssn, phone })
    })

    const result = await response.json()

    if (result.success) {
      return result
    }
    return null
  } catch (error) {
    return null
  }
}
