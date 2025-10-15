import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: '사용자 ID가 필요합니다.' }, { status: 400 })
    }

    const friends = await prisma.friend.findMany({
      where: {
        userId: userId,
        isAccepted: true
      },
      select: {
        id: true,
        friendId: true,
        friendName: true,
        friendPhone: true,
        createdAt: true,
        friendUser: {
          select: {
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const friendsWithProfile = friends.map(friend => ({
      id: friend.id,
      friendId: friend.friendId,
      friendName: friend.friendName,
      friendPhone: friend.friendPhone,
      createdAt: friend.createdAt,
      profileImage: friend.friendUser?.profileImage || null
    }))

    return NextResponse.json({
      success: true,
      data: friendsWithProfile
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '친구 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, friendName, friendPhone } = body

    if (!userId || !friendName || !friendPhone) {
      return NextResponse.json({ 
        success: false, 
        error: '사용자 ID, 친구 이름, 전화번호가 모두 필요합니다.' 
      }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: friendPhone }
    })

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: '해당 전화번호로 가입된 사용자를 찾을 수 없습니다.' 
      }, { status: 404 })
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
        friendName: friendName,
        friendPhone: friendPhone,
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
