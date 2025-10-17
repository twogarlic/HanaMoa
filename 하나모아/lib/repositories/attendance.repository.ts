import prismaPoint from '@/lib/database-point'

export class AttendanceRepository {
  async findByUserIdAndDate(userId: string, date: string) {
    return await prismaPoint.attendance.findFirst({
      where: {
        userId,
        date
      }
    })
  }

  async create(userId: string, date: string, points: number) {
    return await prismaPoint.attendance.create({
      data: {
        userId,
        date,
        points
      }
    })
  }

  async findManyByUserId(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId }
    
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    return await prismaPoint.attendance.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    })
  }
}

export const attendanceRepository = new AttendanceRepository()

