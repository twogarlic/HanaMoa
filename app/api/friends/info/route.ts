import { NextRequest, NextResponse } from "next/server"
import prisma from '../../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const friendId = searchParams.get('friendId')

    if (!userId || !friendId) {
      return NextResponse.json({ 
        success: false, 
        error: "사용자 ID와 친구 ID가 필요합니다" 
      })
    }

    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId, isAccepted: true },
          { userId: friendId, friendId: userId, isAccepted: true }
        ]
      }
    })

    if (!friendship) {
      return NextResponse.json({ 
        success: false, 
        error: "친구 관계가 아닙니다" 
      })
    }

    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: { 
        id: true, 
        name: true, 
        profileImage: true, 
        isPublicProfile: true,
        createdAt: true
      }
    })

    if (!friend) {
      return NextResponse.json({ 
        success: false, 
        error: "친구 정보를 찾을 수 없습니다" 
      })
    }

    if (!friend.isPublicProfile) {
      return NextResponse.json({ 
        success: false, 
        error: "친구가 정보 공개를 설정하지 않았습니다" 
      })
    }

    const holdings = await prisma.holding.findMany({
      where: { userId: friendId },
      select: {
        asset: true,
        quantity: true,
        totalAmount: true
      }
    })

    const totalInvestment = holdings.reduce((sum, holding) => {
      return sum + (holding.quantity * 1000)
    }, 0)

    const totalCurrentValue = holdings.reduce((sum, holding) => {
      return sum + (holding.totalAmount || 0)
    }, 0)

    const returnRate = totalInvestment > 0 
      ? ((totalCurrentValue - totalInvestment) / totalInvestment) * 100 
      : 0

    const assetRatios = holdings
      .filter(holding => holding.totalAmount > 0)
      .map(holding => ({
        asset: holding.asset,
        percentage: (holding.totalAmount / totalCurrentValue) * 100,
        currentValue: holding.totalAmount
      }))
      .sort((a, b) => b.percentage - a.percentage)

    const friendInfo = {
      name: friend.name,
      profileImage: friend.profileImage,
      joinedAt: friend.createdAt,
      totalInvestment,
      totalCurrentValue,
      returnRate,
      assetRatios
    }

    return NextResponse.json({ 
      success: true, 
      data: friendInfo 
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "친구 정보 조회 중 오류가 발생했습니다" 
    })
  }
}
