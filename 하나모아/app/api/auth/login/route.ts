import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/database'
import { generateToken, COOKIE_OPTIONS } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json()

    if (!id || !password) {
      return NextResponse.json({
        success: false,
        message: '아이디와 비밀번호를 입력해주세요.'
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: {
        userId: id
      },
      include: {
        accounts: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      }, { status: 401 })
    }

    const currentFailCount = user.loginFailCount || 0
    const isLocked = user.isLocked || false
    const lockedUntil = user.lockedUntil

    if (isLocked && lockedUntil && new Date() < lockedUntil) {
      return NextResponse.json({
        success: false,
        message: '계정이 잠금되어 있습니다. 본인인증을 통해 잠금을 해제해주세요.',
        isLocked: true
      }, { status: 423 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      const newFailCount = currentFailCount + 1
      const shouldLock = newFailCount >= 5

      await prisma.user.update({
        where: { userId: id },
        data: {
          loginFailCount: newFailCount,
          isLocked: shouldLock,
          lockedUntil: shouldLock ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null // 24시간 후 자동 해제
        }
      })

      return NextResponse.json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        failCount: newFailCount,
        isLocked: shouldLock
      }, { status: 401 })
    }

    if (currentFailCount > 0 || isLocked) {
      await prisma.user.update({
        where: { userId: id },
        data: {
          loginFailCount: 0,
          isLocked: false,
          lockedUntil: null
        }
      })
    }

    const token = generateToken({
      userId: user.userId,
      id: user.id,
      email: user.email,
      name: user.name
    })

    const response = NextResponse.json({
      success: true,
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

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
