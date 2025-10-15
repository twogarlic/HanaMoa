import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { followerId, followingId } = body

    if (!followerId || !followingId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { success: false, error: '자기 자신을 팔로우할 수 없습니다.' },
        { status: 400 }
      )
    }

    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { id: followerId } }),
      prisma.user.findUnique({ where: { id: followingId } })
    ])

    if (!follower || !following) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (existingFollow) {
      await prisma.userFollow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          isFollowing: false
        }
      })
    } else {
      await prisma.userFollow.create({
        data: {
          followerId,
          followingId
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          isFollowing: true
        }
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '팔로우 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const followerId = searchParams.get('followerId')
    const followingId = searchParams.get('followingId')

    if (!followerId || !followingId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: !!follow
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '팔로우 상태를 확인할 수 없습니다.' },
      { status: 500 }
    )
  }
}
