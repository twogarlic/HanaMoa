import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/database';
import prismaPoint from '../../../../lib/database-point';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const today = new Date();
    const koreaTime = new Date(today.getTime() + (9 * 60 * 60 * 1000)); 
    const todayStr = koreaTime.toISOString().split('T')[0];

    const existingAttendance = await prismaPoint.attendance.findFirst({
      where: {
        userId,
        date: todayStr
      }
    });

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, error: '오늘은 이미 출석체크를 하셨습니다.' },
        { status: 400 }
      );
    }

    const points = Math.floor(Math.random() * 100) + 1;

    const attendance = await prismaPoint.attendance.create({
      data: {
        userId,
        date: todayStr,
        points
      }
    });

    try {
      const pointAccount = await prismaPoint.hanaPoint.findUnique({
        where: { userId }
      });

      if (pointAccount) {
        await prismaPoint.hanaPoint.update({
          where: { userId },
          data: {
            balance: pointAccount.balance + points,
            totalEarned: pointAccount.totalEarned + points
          }
        });

        await prismaPoint.hanaPointHistory.create({
          data: {
            pointId: pointAccount.id,
            type: 'EARN',
            amount: points,
            balance: pointAccount.balance + points,
            description: '출석체크 이벤트',
            sourceSystem: 'hana-moai',
            sourceId: attendance.id
          }
        });
      }
    } catch (error) {
    }

    return NextResponse.json({
      success: true,
      data: {
        attendance,
        points,
        message: `${points} 하나머니를 받았습니다!`
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '출석체크 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
