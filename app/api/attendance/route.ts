import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/database';
import prismaPoint from '../../../lib/database-point';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

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

    let attendances;
    
    if (year && month) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      
      attendances = await prismaPoint.attendance.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
    } else {
      attendances = await prismaPoint.attendance.findMany({
        where: { userId },
        orderBy: {
          date: 'desc'
        }
      });
    }

    const totalAttendance = attendances.length;
    
    const totalPoints = attendances.reduce((sum, att) => sum + att.points, 0);

    const today = new Date();
    const koreaTime = new Date(today.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
    const todayStr = koreaTime.toISOString().split('T')[0];
    const todayAttendance = attendances.find(att => att.date === todayStr);

    return NextResponse.json({
      success: true,
      data: {
        attendances,
        totalAttendance,
        totalPoints,
        todayAttended: !!todayAttendance,
        todayPoints: todayAttendance?.points || 0
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: '출석 기록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
