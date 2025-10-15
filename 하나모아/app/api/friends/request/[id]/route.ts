import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../lib/database'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, userId } = body 

    if (!action || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: '액션과 사용자 ID가 필요합니다.' 
      }, { status: 400 })
    }

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json({ 
        success: false, 
        error: '유효하지 않은 액션입니다.' 
      }, { status: 400 })
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })

    if (!friendRequest) {
      return NextResponse.json({ 
        success: false, 
        error: '친구 신청을 찾을 수 없습니다.' 
      }, { status: 404 })
    }

    if (friendRequest.receiverId !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: '권한이 없습니다.' 
      }, { status: 403 })
    }

    if (friendRequest.status !== 'PENDING') {
      return NextResponse.json({ 
        success: false, 
        error: '이미 처리된 친구 신청입니다.' 
      }, { status: 409 })
    }

    if (action === 'accept') {
      await prisma.$transaction(async (tx) => {
        await tx.friendRequest.update({
          where: { id },
          data: { status: 'ACCEPTED' }
        })

        await tx.friend.createMany({
          data: [
            {
              userId: friendRequest.senderId,
              friendId: friendRequest.receiverId,
              friendName: friendRequest.receiver.name,
              friendPhone: friendRequest.receiver.phone,
              isAccepted: true
            },
            {
              userId: friendRequest.receiverId,
              friendId: friendRequest.senderId,
              friendName: friendRequest.sender.name,
              friendPhone: friendRequest.sender.phone,
              isAccepted: true
            }
          ],
          skipDuplicates: true
        })
      })

      return NextResponse.json({
        success: true,
        message: '친구 신청을 수락했습니다.'
      })
    } else {
      await prisma.friendRequest.update({
        where: { id },
        data: { status: 'DECLINED' }
      })

      return NextResponse.json({
        success: true,
        message: '친구 신청을 거절했습니다.'
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '친구 신청 처리에 실패했습니다.' },
      { status: 500 }
    )
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '사용자 ID가 필요합니다.' 
      }, { status: 400 })
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id }
    })

    if (!friendRequest) {
      return NextResponse.json({ 
        success: false, 
        error: '친구 신청을 찾을 수 없습니다.' 
      }, { status: 404 })
    }

    if (friendRequest.senderId !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: '권한이 없습니다.' 
      }, { status: 403 })
    }

    if (friendRequest.status !== 'PENDING') {
      return NextResponse.json({ 
        success: false, 
        error: '이미 처리된 친구 신청입니다.' 
      }, { status: 409 })
    }

    await prisma.friendRequest.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '친구 신청을 취소했습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '친구 신청 취소에 실패했습니다.' },
      { status: 500 }
    )
    }
}
