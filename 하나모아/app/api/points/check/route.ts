import { NextRequest, NextResponse } from 'next/server'
import { prismaPoint } from '@/lib/database-point'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, ssn } = body
    
    if (!name || !ssn) {
      return NextResponse.json(
        { success: false, error: '이름과 주민번호가 필요합니다.' },
        { status: 400 }
      )
    }
    
    const existingPoint = await prismaPoint.hanaPoint.findFirst({
      where: {
        name,
        ssn
      }
    })
    
    if (existingPoint) {
      return NextResponse.json({
        success: true,
        exists: true,
        isNewAccount: false,
        message: '기존 하나머니 계정이 연결됩니다.',
        data: {
          balance: existingPoint.balance,
          totalEarned: existingPoint.totalEarned,
          totalUsed: existingPoint.totalUsed,
          createdAt: existingPoint.createdAt
        }
      })
      
    } else {
      return NextResponse.json({
        success: true,
        exists: false,
        isNewAccount: true,
        message: '하나모아 가입 축하 1000P가 적립됩니다!',
        data: {
          balance: 1000, 
          totalEarned: 1000,
          totalUsed: 0,
          createdAt: null
        }
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '하나머니 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prismaPoint.$disconnect()
  }
}
