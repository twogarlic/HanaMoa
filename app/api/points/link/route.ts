import { NextRequest, NextResponse } from 'next/server'
import { prismaPoint } from '@/lib/database-point'

/**
 * 하나머니 연결/생성 API
 * POST /api/points/link
 * 
 * 회원가입 시 호출:
 * 1. 이름 + 주민번호로 기존 하나머니 계정 조회
 * 2. 있으면 → userId 연결 (기존 하나회원)
 * 3. 없으면 → 새 계정 생성 (신규 회원)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, ssn, phone } = body
    
    if (!userId || !name || !ssn || !phone) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
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
      
      if (existingPoint.userId && existingPoint.userId !== userId) {
        return NextResponse.json(
          { 
            success: false, 
            error: '이미 다른 하나모아 계정과 연결되어 있습니다.' 
          },
          { status: 400 }
        )
      }
      
      const updatedPoint = await prismaPoint.hanaPoint.update({
        where: { id: existingPoint.id },
        data: {
          userId,
          phone, 
          isLinked: true,
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        isNewAccount: false,
        message: '기존 하나머니 계정이 연결되었습니다.',
        data: {
          pointId: updatedPoint.id,
          balance: updatedPoint.balance,
          totalEarned: updatedPoint.totalEarned,
          totalUsed: updatedPoint.totalUsed,
          createdAt: updatedPoint.createdAt
        }
      })
      
    } else {
      
      const duplicateCheck = await prismaPoint.hanaPoint.findUnique({
        where: { ssn }
      })
      
      if (duplicateCheck) {
        return NextResponse.json(
          { 
            success: false, 
            error: '이미 등록된 주민번호입니다.' 
          },
          { status: 400 }
        )
      }
      
      const newPoint = await prismaPoint.hanaPoint.create({
        data: {
          userId,
          name,
          ssn,
          phone,
          balance: 0,
          totalEarned: 0,
          totalUsed: 0,
          isLinked: true
        }
      })
      
      await prismaPoint.hanaPointHistory.create({
        data: {
          pointId: newPoint.id,
          type: 'EARN',
          amount: 1000,
          balance: 1000,
          description: '하나모아 가입 축하 포인트',
          sourceSystem: 'hana-moai',
          sourceId: userId
        }
      })
      
      const updatedPoint = await prismaPoint.hanaPoint.update({
        where: { id: newPoint.id },
        data: {
          balance: 1000,
          totalEarned: 1000
        }
      })
      
      return NextResponse.json({
        success: true,
        isNewAccount: true,
        message: '하나머니 계정이 생성되었습니다. 가입 축하 1000P가 적립되었습니다!',
        data: {
          pointId: updatedPoint.id,
          balance: updatedPoint.balance,
          totalEarned: updatedPoint.totalEarned,
          totalUsed: updatedPoint.totalUsed,
          createdAt: updatedPoint.createdAt
        }
      })
    }
    
  } catch (error: any) {
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      const fieldName = field === 'ssn' ? '주민번호' : field === 'phone' ? '전화번호' : '정보'
      return NextResponse.json(
        { success: false, error: `이미 등록된 ${fieldName}입니다.` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: '하나머니 연결 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prismaPoint.$disconnect()
  }
}
