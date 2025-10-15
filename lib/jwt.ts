import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.')
}

const JWT_EXPIRES_IN = '1h'

export interface JWTPayload {
  userId: string
  id: number | string 
  email: string | null 
  name: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return decoded as JWTPayload
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * 쿠키 설정 옵션
 */
export const COOKIE_OPTIONS = {
  httpOnly: true, 
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, 
  maxAge: 60 * 60 * 1000,
  path: '/', 
}

/**
 * Request에서 JWT 토큰 추출
 */
export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return cookies['auth_token'] || null
}

/**
 * Request에서 사용자 정보 추출
 */
export function getUserFromRequest(request: Request): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null

  return verifyToken(token)
}

