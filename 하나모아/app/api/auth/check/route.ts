import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import { getUserFromRequest } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const jwtUser = getUserFromRequest(request)

    if (!jwtUser) {
      return NextResponse.json({
        success: true,
        message: '로그인이 필요합니다.',
        isAuthenticated: false
      }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: {
        userId: jwtUser.userId
      },
      include: {
        accounts: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: true,
        message: '사용자를 찾을 수 없습니다.',
        isAuthenticated: false
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      message: '인증되었습니다.',
      isAuthenticated: true,
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

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '인증 확인 중 오류가 발생했습니다.',
      isAuthenticated: false
    }, { status: 500 })
    }
}
