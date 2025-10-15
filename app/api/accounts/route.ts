import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }
    
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        accountNumber: true,
        accountName: true,
        balance: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({
      success: true,
      accounts
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '계좌 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, ssn } = body
    
    if (!name || !ssn) {
      return NextResponse.json({
        success: false,
        error: '이름과 주민등록번호가 필요합니다.'
      }, { status: 400 })
    }
    
    const existingUser = await prisma.user.findFirst({
      where: { ssn },
      include: {
        accounts: {
          select: {
            id: true,
            accountNumber: true,
            accountName: true,
            balance: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })
    
    if (existingUser && existingUser.accounts.length > 0) {
      return NextResponse.json({
        success: true,
        accounts: existingUser.accounts.map(account => ({
          ...account,
          isNew: false
        }))
      })
    } else {
      const bankCode = '282' // 계좌 시작 코드
      const randomNumber1 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      const randomNumber2 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      const newAccountNumber = `${bankCode}-${randomNumber1}-${randomNumber2}`
      
      const newAccount = {
        id: 'temp-new-account',
        accountNumber: newAccountNumber,
        accountName: `${name}의 하나모아 계좌`,
        balance: 0,
        isNew: true
      }
      
      return NextResponse.json({
        success: true,
        accounts: [newAccount]
      })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '계좌 조회 중 오류가 발생했습니다.'
    }, { status: 500 })
    }
}