import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import { sendPushNotification } from '../../../../lib/fcm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, message } = body

    if (!senderId || !receiverId) {
      return NextResponse.json({ 
        success: false, 
        error: '신청자 ID와 수신자 ID가 필요합니다.' 
      }, { status: 400 })
    }

    if (senderId === receiverId) {
      return NextResponse.json({ 
        success: false, 
        error: '자기 자신에게 친구 신청을 보낼 수 없습니다.' 
      }, { status: 400 })
    }

    const existingFriend = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: senderId,
          friendId: receiverId
        }
      }
    })

    if (existingFriend) {
      return NextResponse.json({ 
        success: false, 
        error: '이미 친구로 등록된 사용자입니다.' 
      }, { status: 409 })
    }

    const existingRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: senderId,
          receiverId: receiverId
        }
      }
    })

    let friendRequest

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return NextResponse.json({ 
          success: false, 
          error: '이미 친구 신청을 보낸 사용자입니다.' 
        }, { status: 409 })
      } else if (existingRequest.status === 'ACCEPTED') {
        return NextResponse.json({ 
          success: false, 
          error: '이미 친구로 등록된 사용자입니다.' 
        }, { status: 409 })
      } else if (existingRequest.status === 'DECLINED') {
        friendRequest = await prisma.friendRequest.update({
          where: {
            senderId_receiverId: {
              senderId: senderId,
              receiverId: receiverId
            }
          },
          data: {
            message: message || null,
            status: 'PENDING',
            createdAt: new Date() 
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                phone: true,
                profileImage: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                phone: true,
                profileImage: true
              }
            }
          }
        })
      }
    }

    if (!friendRequest) {
      friendRequest = await prisma.friendRequest.create({
        data: {
          senderId,
          receiverId,
          message: message || null,
          status: 'PENDING'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true
            }
          }
        }
      })
    }

    try {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true }
      })
      
      if (sender) {
        await sendPushNotification(
          receiverId,
          '새로운 친구 신청이 있습니다',
          `${sender.name}님이 친구 신청을 보냈습니다.`,
          {
            type: 'FRIEND_REQUEST',
            requestId: friendRequest.id,
            senderId: senderId
          }
        )
      }
    } catch (pushError) {
    }

    return NextResponse.json({
      success: true,
      data: friendRequest,
      message: '친구 신청이 전송되었습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '친구 신청에 실패했습니다.' },
      { status: 500 }
    )
    }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '사용자 ID가 필요합니다.' 
      }, { status: 400 })
    }

    let requests
    if (type === 'sent') {
      requests = await prisma.friendRequest.findMany({
        where: { 
          senderId: userId,
          status: 'PENDING' 
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      const filteredRequests = []
      for (const request of requests) {
        const isAlreadyFriend = await prisma.friend.findFirst({
          where: {
            OR: [
              { userId: userId, friendId: request.receiverId },
              { userId: request.receiverId, friendId: request.receiverId }
            ]
          }
        })
        
        if (!isAlreadyFriend) {
          filteredRequests.push(request)
        }
      }
      requests = filteredRequests
      
    } else if (type === 'received') {
      requests = await prisma.friendRequest.findMany({
        where: { 
          receiverId: userId,
          status: 'PENDING'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      const filteredRequests = []
      for (const request of requests) {
        const isAlreadyFriend = await prisma.friend.findFirst({
          where: {
            OR: [
              { userId: userId, friendId: request.senderId },
              { userId: request.senderId, friendId: userId }
            ]
          }
        })
        
        if (!isAlreadyFriend) {
          filteredRequests.push(request)
        }
      }
      requests = filteredRequests
    } else {
      requests = await prisma.friendRequest.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              phone: true,
              profileImage: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({
      success: true,
      data: requests
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '친구 신청 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
    }
}
