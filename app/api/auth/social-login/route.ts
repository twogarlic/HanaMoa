import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database'
import { generateToken, COOKIE_OPTIONS } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { provider, providerId, email, name } = await request.json()


    if (!provider || !providerId) {
      return NextResponse.json({
        success: false,
        message: '소셜 로그인 정보가 올바르지 않습니다.'
      }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        provider: provider,
        providerId: providerId
      },
      include: {
        accounts: true
      }
    })

      found: !!user, 
      userId: user?.userId,
      provider: user?.provider,
      providerId: user?.providerId
    })

    if (user) {
      const token = generateToken({
        userId: user.userId,
        id: user.id,
        email: user.email,
        name: user.name
      })

      const response = NextResponse.json({
        success: true,
        isExistingUser: true,
        message: '로그인에 성공했습니다.',
        user: {
          id: user.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          isPublicProfile: user.isPublicProfile,
          isPostsPublic: user.isPostsPublic,
          notificationsEnabled: user.notificationsEnabled,
          accounts: user.accounts.map(account => ({
            id: account.id,
            accountNumber: account.accountNumber,
            accountName: account.accountName,
            balance: account.balance
          }))
        }
      })

      response.cookies.set('auth_token', token, COOKIE_OPTIONS)
      
      return response
    }

    return NextResponse.json({
      success: true,
      isExistingUser: false,
      message: '회원가입이 필요합니다.',
      socialUserInfo: {
        provider,
        providerId,
        email,
        name
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '소셜 로그인 확인 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

