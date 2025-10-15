import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, friendPhone, friendName } = body

    if (!userId || !friendPhone) {
      return NextResponse.json({ 
        success: false, 
        error: '사용자 ID와 친구 전화번호가 필요합니다.' 
      }, { status: 400 })
    }

    const formatPhoneForSearch = (phoneNumber: string) => {
      const numbers = phoneNumber.replace(/[^0-9]/g, '')
      if (numbers.length === 11) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
      }
      return phoneNumber
    }

    const formattedPhone = formatPhoneForSearch(friendPhone)

    const existingUser = await prisma.user.findUnique({
      where: { phone: formattedPhone }
    })

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: '해당 전화번호로 가입된 사용자를 찾을 수 없습니다.' 
      }, { status: 404 })
    }

    if (userId === existingUser.id) {
      return NextResponse.json({ 
        success: false, 
        error: '자기 자신을 친구로 추가할 수 없습니다.' 
      }, { status: 400 })
    }

    const existingFriend = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: userId,
          friendId: existingUser.id
        }
      }
    })

    if (existingFriend) {
      return NextResponse.json({ 
        success: false, 
        error: '이미 친구로 등록된 사용자입니다.' 
      }, { status: 409 })
    }

    const friend = await prisma.friend.create({
      data: {
        userId: userId,
        friendId: existingUser.id,
        friendName: friendName || existingUser.name,
        friendPhone: formattedPhone,
        isAccepted: true 
      }
    })

    return NextResponse.json({
      success: true,
      data: friend,
      message: '친구가 추가되었습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '친구 추가에 실패했습니다.' },
      { status: 500 }
    )
    }
}
