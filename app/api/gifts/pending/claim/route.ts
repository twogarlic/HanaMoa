import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: '가입 시 자동으로 선물이 알림으로 전달됩니다.'
  }, { status: 410 })
}
