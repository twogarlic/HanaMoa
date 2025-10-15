import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import bcrypt from 'bcryptjs'

async function generateAccountNumber(): Promise<string> {
  const bankCode = '282' // 계좌 시작 코드
  let accountNumber: string = ''
  let isUnique = false
  
  while (!isUnique) {
    const randomNumber1 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    const randomNumber2 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    accountNumber = `${bankCode}-${randomNumber1}-${randomNumber2}`
    
    const existingAccount = await prisma.account.findUnique({
      where: { accountNumber }
    })
    
    if (!existingAccount) {
      isUnique = true
    }
  }
  
  return accountNumber
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      password, 
      name, 
      ssn, 
      phone, 
      provider, 
      providerId, 
      email,
      selectedAccount,
      accountPassword 
    } = await request.json()

    if (!name || !ssn || !phone) {
      return NextResponse.json(
        { success: false, message: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!provider && (!userId || !password)) {
      return NextResponse.json(
        { success: false, message: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (provider && !providerId) {
      return NextResponse.json(
        { success: false, message: '소셜 로그인 정보가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    if (provider) {
    }

    let existingUser
    if (provider && providerId) {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { 
              provider: provider,
              providerId: providerId
            },
            { ssn: ssn },
            { phone: phone }
          ]
        }
      })
    } else {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { userId: userId },
            { ssn: ssn },
            { phone: phone }
          ]
        }
      })
    }

    if (existingUser) {
      if (provider && existingUser.provider === provider && existingUser.providerId === providerId) {
        return NextResponse.json(
          { success: false, message: '이미 가입된 소셜 계정입니다.' },
          { status: 400 }
        )
      }
      if (!provider && existingUser.userId === userId) {
        return NextResponse.json(
          { success: false, message: '이미 사용 중인 아이디입니다.' },
          { status: 400 }
        )
      }
      if (existingUser.ssn === ssn) {
        return NextResponse.json(
          { success: false, message: '이미 등록된 주민등록번호입니다.' },
          { status: 400 }
        )
      }
      if (existingUser.phone === phone) {
        return NextResponse.json(
          { success: false, message: '이미 등록된 전화번호입니다.' },
          { status: 400 }
        )
      }
    }

    let hashedPassword = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const finalUserId = userId || `${provider}_${providerId}`
    
    if (provider) {
        provider, 
        providerId, 
        finalUserId,
        providerId_type: typeof providerId 
      })
    }

    const user = await prisma.user.create({
      data: {
        userId: finalUserId,
        password: hashedPassword || '',
        name,
        ssn,
        phone,
        provider: provider || null,
        providerId: providerId || null,
        email: email || null
      }
    })
    
    if (provider) {
        userId: user.userId, 
        provider: user.provider, 
        providerId: user.providerId 
      })
    }

    let userAccounts = []
    
    if (selectedAccount && accountPassword) {
      const isNewAccount = selectedAccount.includes('282-')
      
      if (isNewAccount) {
        let finalAccountNumber = selectedAccount
        
        const existingAccount = await prisma.account.findUnique({
          where: { accountNumber: selectedAccount }
        })
        
        if (existingAccount) {
          finalAccountNumber = await generateAccountNumber()
        }
        
        const accountTypes = ['하나모아']
        const randomAccountType = accountTypes[Math.floor(Math.random() * accountTypes.length)]
        
        const hashedAccountPassword = await bcrypt.hash(accountPassword, 12)
        
        const newAccount = await prisma.account.create({
          data: {
            accountNumber: finalAccountNumber, // 최종 계좌번호 사용
            accountName: randomAccountType,
            accountPassword: hashedAccountPassword,
            balance: Math.floor(Math.random() * 1000000) + 100000, // 10만원~110만원 랜덤 - 추후 수정 필요
            userId: user.id
          }
        })
        
        userAccounts.push(newAccount)
      } else {
        const account = await prisma.account.findUnique({
          where: { accountNumber: selectedAccount }
        })
        
        if (!account) {
          return NextResponse.json(
            { success: false, message: '선택한 계좌를 찾을 수 없습니다.' },
            { status: 400 }
          )
        }
        
        const isPasswordValid = await bcrypt.compare(accountPassword, account.accountPassword)
        if (!isPasswordValid) {
          return NextResponse.json(
            { success: false, message: '계좌 비밀번호가 일치하지 않습니다.' },
            { status: 400 }
          )
        }
        
        const updatedAccount = await prisma.account.update({
          where: { id: account.id },
          data: { userId: user.id }
        })
        
        userAccounts.push(updatedAccount)
      }
    } else {
      return NextResponse.json(
        { success: false, message: '계좌와 계좌 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    try {
      const normalizedPhone = phone.replace(/[^0-9]/g, '')
      
      const pendingGifts = await prisma.pendingGift.findMany({
        where: {
          receiverPhone: normalizedPhone,
          status: 'PENDING',
          expiresAt: {
            gt: new Date() // 만료되지 않은 것만
          }
        },
        include: {
          sender: {
            select: {
              name: true
            }
          }
        }
      })

      pendingGifts.forEach((gift, index) => {
      })

      for (const pendingGift of pendingGifts) {
        
        const newGift = await prisma.gift.create({
          data: {
            senderId: pendingGift.senderId,
            receiverId: user.id,
            asset: pendingGift.asset,
            quantity: pendingGift.quantity,
            messageCard: pendingGift.messageCard,
            message: pendingGift.message,
            status: 'PENDING', // 대기 상태로 설정
            sentAt: pendingGift.createdAt
          }
        })

        await prisma.pendingGift.update({
          where: { id: pendingGift.id },
          data: {
            status: 'CLAIMED',
            claimedAt: new Date(),
            claimedBy: user.id
          }
        })
      }

    } catch (giftError) {
    }

    let pointInfo = null
    try {
      const pointResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/points/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          ssn: user.ssn,
          phone: user.phone
        })
      })
      
      const pointResult = await pointResponse.json()
      
      if (pointResult.success) {
        pointInfo = pointResult
      } else {
      }
    } catch (pointError) {
    }

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        provider: user.provider
      },
      accounts: userAccounts.map(account => ({
        id: account.id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        balance: account.balance
      })),
      point: pointInfo ? {
        balance: pointInfo.data.balance,
        isNewAccount: pointInfo.isNewAccount,
        message: pointInfo.message
      } : null
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
    }
}
