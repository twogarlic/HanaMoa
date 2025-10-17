import { serviceRepository } from '@/lib/repositories/service.repository'
import { holdingRepository } from '@/lib/repositories/holding.repository'
import { ValidationError, NotFoundError, ConflictError } from '@/lib/api/utils/errors'
import prisma from '@/lib/database'
import type { RequestServiceInput } from '@/lib/api/validators/service.schema'

export class ServiceService {
  async requestService(data: RequestServiceInput) {
    const reservationDate = new Date(data.reservationDate)

    const existingReservation = await serviceRepository.findByBranchAndDateTime(
      data.branchId,
      reservationDate,
      data.reservationTime
    )

    if (existingReservation) {
      throw new ConflictError('해당 시간대는 이미 예약이 있습니다')
    }

    const reservationNumber = this.generateReservationNumber()

    const holding = await holdingRepository.findByUserIdAndAsset(data.userId, data.asset)

    return await serviceRepository.create({
      reservationNumber,
      user: { connect: { id: data.userId } },
      branchId: data.branchId,
      branchName: data.branchName,
      branchAddress: data.branchAddress,
      branchPhone: data.branchPhone,
      asset: data.asset,
      requestDate: data.requestDate ? new Date(data.requestDate) : new Date(),
      reservationDate,
      reservationTime: data.reservationTime,
      status: 'PENDING',
      holdingSnapshot: holding?.quantity || 0
    })
  }

  async getAvailableTimes(branchId: string, date: string) {
    const allTimes = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00'
    ]

    const reservationDate = new Date(date)

    const bookedServices = await prisma.serviceRequest.findMany({
      where: {
        branchId,
        reservationDate,
        status: {
          in: ['PENDING', 'APPROVED']
        }
      },
      select: {
        reservationTime: true
      }
    })

    const bookedTimes = bookedServices.map(s => s.reservationTime)

    return allTimes.filter(time => !bookedTimes.includes(time))
  }

  async cancelService(serviceId: string, userId: string) {
    const service = await serviceRepository.findById(serviceId)

    if (!service) {
      throw new NotFoundError('예약을 찾을 수 없습니다')
    }

    if (service.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    if (service.status !== 'PENDING' && service.status !== 'APPROVED') {
      throw new ValidationError('취소할 수 없는 예약 상태입니다')
    }

    return await serviceRepository.cancel(serviceId)
  }

  async completeService(serviceId: string, userId: string) {
    const service = await serviceRepository.findById(serviceId)

    if (!service) {
      throw new NotFoundError('예약을 찾을 수 없습니다')
    }

    if (service.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    return await serviceRepository.update(serviceId, {
      status: 'COMPLETED',
      completedAt: new Date()
    })
  }

  private generateReservationNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const timestamp = now.getTime().toString().slice(-6)

    return `SR${year}${month}${day}${timestamp}`
  }
}

export const serviceService = new ServiceService()

