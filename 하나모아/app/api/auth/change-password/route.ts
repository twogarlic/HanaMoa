import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: '모든 정보를 입력해주세요.'
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { userId: userId }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      }, { status: 404 })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      }, { status: 400 })
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_-]/.test(newPassword)
    const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length

    if (newPassword.length < 8 || newPassword.length > 20 || typeCount < 2) {
      return NextResponse.json({
        success: false,
        message: '새 비밀번호는 8-20자 이내로 숫자, 특수문자, 영문자 중 2가지 이상을 조합해주세요.'
      }, { status: 400 })
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({
        success: false,
        message: '새 비밀번호는 현재 비밀번호와 달라야 합니다.'
      }, { status: 400 })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { userId: userId },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '비밀번호 변경 중 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
