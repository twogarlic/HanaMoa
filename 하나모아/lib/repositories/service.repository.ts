import prisma from '@/lib/database'
import { Prisma } from '@prisma/client'

export class ServiceRepository {
  async findById(id: string) {
    return await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    })
  }

  async findByUserId(userId: string, status?: string) {
    const where: Prisma.ServiceRequestWhereInput = { userId }

    if (status) {
      where.status = status as any
    }

    return await prisma.serviceRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findByBranchAndDateTime(branchId: string, date: Date, time: string) {
    return await prisma.serviceRequest.findFirst({
      where: {
        branchId,
        reservationDate: date,
        reservationTime: time,
        status: {
          in: ['PENDING', 'APPROVED']
        }
      }
    })
  }

  async create(data: Prisma.ServiceRequestCreateInput) {
    return await prisma.serviceRequest.create({
      data
    })
  }

  async update(id: string, data: Prisma.ServiceRequestUpdateInput) {
    return await prisma.serviceRequest.update({
      where: { id },
      data
    })
  }

  async cancel(id: string) {
    return await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })
  }
}

export const serviceRepository = new ServiceRepository()

