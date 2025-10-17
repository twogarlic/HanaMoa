import { attendanceRepository } from '@/lib/repositories/attendance.repository'
import { pointRepository } from '@/lib/repositories/point.repository'
import { userRepository } from '@/lib/repositories/user.repository'
import { ValidationError, NotFoundError } from '@/lib/api/utils/errors'
import prismaPoint from '@/lib/database-point'

export class AttendanceService {
  private getKoreaDateString(): string {
    const today = new Date()
    const koreaTime = new Date(today.getTime() + (9 * 60 * 60 * 1000))
    return koreaTime.toISOString().split('T')[0]
  }

  async checkIn(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다')
    }

    const todayStr = this.getKoreaDateString()

    const existingAttendance = await attendanceRepository.findByUserIdAndDate(userId, todayStr)
    if (existingAttendance) {
      throw new ValidationError('오늘은 이미 출석체크를 하셨습니다')
    }

    const points = Math.floor(Math.random() * 100) + 1

    const attendance = await attendanceRepository.create(userId, todayStr, points)

    try {
      const pointAccount = await prismaPoint.hanaPoint.findUnique({
        where: { userId }
      })

      if (pointAccount) {
        await prismaPoint.hanaPoint.update({
          where: { userId },
          data: {
            balance: pointAccount.balance + points,
            totalEarned: pointAccount.totalEarned + points
          }
        })

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
        })
      }
    } catch (error) {
    }

    return {
      attendance,
      points,
      message: `${points} 하나머니를 받았습니다!`
    }
  }

  async getAttendances(userId: string, year?: string, month?: string) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다')
    }

    let startDate: string | undefined
    let endDate: string | undefined

    if (year && month) {
      startDate = `${year}-${month.padStart(2, '0')}-01`
      endDate = `${year}-${month.padStart(2, '0')}-31`
    }

    const attendances = await attendanceRepository.findManyByUserId(userId, startDate, endDate)

    const totalAttendance = attendances.length
    const totalPoints = attendances.reduce((sum, att) => sum + att.points, 0)

    const todayStr = this.getKoreaDateString()
    const todayAttendance = attendances.find(att => att.date === todayStr)

    return {
      attendances,
      totalAttendance,
      totalPoints,
      todayAttended: !!todayAttendance,
      todayPoints: todayAttendance?.points || 0
    }
  }
}

export const attendanceService = new AttendanceService()

