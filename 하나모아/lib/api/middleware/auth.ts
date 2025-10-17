import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { ApiResponse } from '../utils/response'

export interface AuthenticatedHandler {
  (request: NextRequest, userId: string): Promise<Response>
}

export async function withAuth(
  request: NextRequest,
  handler: AuthenticatedHandler
): Promise<Response> {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return ApiResponse.unauthorized('인증이 필요합니다')
    }

    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.id) {
      return ApiResponse.unauthorized('유효하지 않은 토큰입니다')
    }

    return await handler(request, decoded.id.toString())
  } catch (error) {
    return ApiResponse.unauthorized('인증에 실패했습니다')
  }
}

export async function optionalAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string | null) => Promise<Response>
): Promise<Response> {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return await handler(request, null)
    }

    const decoded = verifyToken(token)
    const userId = decoded?.id ? decoded.id.toString() : null
    
    return await handler(request, userId)
  } catch (error) {
    return await handler(request, null)
  }
}

