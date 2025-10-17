import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiResponse } from '../utils/response'

export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T,
  handler: (request: NextRequest, data: z.infer<T>) => Promise<Response>
): Promise<Response> {
  try {
    const body = await request.json()
    const validated = schema.safeParse(body)
    
    if (!validated.success) {
      const firstError = validated.error.errors[0]
      const message = firstError.message
      return ApiResponse.badRequest(message)
    }

    return await handler(request, validated.data)
  } catch (error) {
    return ApiResponse.badRequest('잘못된 요청 형식입니다')
  }
}

export async function validateQuery<T extends z.ZodType>(
  request: NextRequest,
  schema: T,
  handler: (request: NextRequest, data: z.infer<T>) => Promise<Response>
): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const queryObject = Object.fromEntries(searchParams.entries())
    
    const validated = schema.safeParse(queryObject)
    
    if (!validated.success) {
      const firstError = validated.error.errors[0]
      const message = firstError.message
      return ApiResponse.badRequest(message)
    }

    return await handler(request, validated.data)
  } catch (error) {
    return ApiResponse.badRequest('잘못된 쿼리 파라미터입니다')
  }
}

