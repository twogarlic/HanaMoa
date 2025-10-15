import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const existingCoinbox = await prisma.coinbox.findUnique({
      where: { userId }
    })

    if (existingCoinbox) {
      return NextResponse.json(
        { success: false, error: '이미 저금통이 개설되어 있습니다.' },
        { status: 400 }
      )
    }

    const generateAccountNumber = async (): Promise<string> => {
      let accountNumber: string = ''
      let isUnique = false
      let attempts = 0
      const maxAttempts = 10
      
      while (!isUnique && attempts < maxAttempts) {
        const firstPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
        const secondPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
        accountNumber = `282-${firstPart}-${secondPart}`
        
        const existingAccount = await prisma.account.findFirst({
          where: { accountNumber }
        })
        
        if (!existingAccount) {
          isUnique = true
        }
        
        attempts++
      }
      
      if (!isUnique) {
        throw new Error('고유한 계좌번호를 생성할 수 없습니다.')
      }
      
      return accountNumber
    }
    
    const accountNumber = await generateAccountNumber()

    const coinbox = await prisma.coinbox.create({
      data: {
        userId,
        accountNumber,
        accountName: '하나모아 저금통',
        balance: 0,
        maxLimit: 100000,
        isActive: true
      }
    })


    return NextResponse.json({
      success: true,
      data: coinbox
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '저금통 개설에 실패했습니다.' },
      { status: 500 }
    )
  }
}
