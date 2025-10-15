import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import bcrypt from 'bcryptjs'
import coolsms from 'coolsms-node-sdk'

function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const specials = '!@#$%^&*'
  
  result += uppercase[Math.floor(Math.random() * uppercase.length)]
  result += lowercase[Math.floor(Math.random() * lowercase.length)]
  result += numbers[Math.floor(Math.random() * numbers.length)]
  result += specials[Math.floor(Math.random() * specials.length)]
  
  for (let i = 4; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  
  return result.split('').sort(() => Math.random() - 0.5).join('')
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { userId: userId }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '존재하지 않는 사용자입니다.'
      }, { status: 404 })
    }

    const tempPassword = generateTempPassword()
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

        await prisma.user.update({
          where: { userId: userId },
          data: { 
            password: hashedPassword,
            loginFailCount: 0,
            isLocked: false,
            lockedUntil: null
          }
        })


    try {
      const messageService = new coolsms(
        process.env.COOLSMS_API_KEY!,
        process.env.COOLSMS_API_SECRET!
      )

      const result: any = await messageService.sendOne({
        to: user.phone.replace(/-/g, ''),
        from: process.env.COOLSMS_SENDER!,
        text: `[하나모아] 임시 비밀번호: ${tempPassword}\n로그인 후 반드시 비밀번호를 변경해주세요.`,
        autoTypeDetect: true
      })


      let isSuccess = false
      
      if (Array.isArray(result) && result.length > 0) {
        const firstResult = result[0]
        isSuccess = firstResult.statusCode === '2000' || 
                   firstResult.status === 'success' ||
                   firstResult.statusMessage === 'success' ||
                   (firstResult && Object.keys(firstResult).length > 0)
      } else if (result && typeof result === 'object') {
        isSuccess = result.success === true || 
                   result.statusCode === '2000' || 
                   result.status === 'success' ||
                   result.errorCount === 0 ||
                   (result && !result.error && Object.keys(result).length > 0)
      } else {
        isSuccess = true
      }

      if (!isSuccess) {
        return NextResponse.json({
          success: false,
          message: 'SMS 발송에 실패했습니다.'
        }, { status: 500 })
      }

    } catch (smsError) {
      return NextResponse.json({
        success: false,
        message: 'SMS 발송 중 오류가 발생했습니다.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '임시 비밀번호가 SMS로 발송되었습니다.'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
    }
}
