import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json()
    
    const { userId, profileImage, isPublicProfile, isPostsPublic, notificationsEnabled } = body

    if (!userId || !profileImage) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID와 프로필 이미지가 필요합니다.'
      }, { status: 400 })
    }


    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        profileImage: profileImage,
        isPublicProfile: isPublicProfile,
        isPostsPublic: isPostsPublic,
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        isPublicProfile: true,
        isPostsPublic: true,
        notificationsEnabled: true,
        accounts: {
          select: {
            id: true,
            balance: true
          }
        }
      }
    })


    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '프로필 업데이트 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
    }
}
