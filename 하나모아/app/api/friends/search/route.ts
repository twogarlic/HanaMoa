import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const userId = searchParams.get('userId')

    if (!phone || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: '전화번호와 사용자 ID가 필요합니다.' 
      }, { status: 400 })
    }

    const formatPhoneForSearch = (phoneNumber: string) => {
      const numbers = phoneNumber.replace(/[^0-9]/g, '')
      if (numbers.length === 11) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
      }
      return phoneNumber
    }

    const formattedPhone = formatPhoneForSearch(phone)

    const user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
      select: {
        id: true,
        name: true,
        phone: true,
        profileImage: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: '해당 전화번호로 가입된 사용자를 찾을 수 없습니다.' 
      }, { status: 404 })
    }

    if (user.id === userId) {
      return NextResponse.json({ 
        success: false, 
        error: '자기 자신을 친구로 추가할 수 없습니다.' 
      }, { status: 400 })
    }

    const existingFriend = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: userId,
          friendId: user.id
        }
      }
    })

    const existingRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: userId,
          receiverId: user.id
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        user: user,
        isAlreadyFriend: !!existingFriend,
        hasPendingRequest: !!existingRequest,
        requestStatus: existingRequest?.status || null
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '친구 검색에 실패했습니다.' },
      { status: 500 }
    )
    }
}
