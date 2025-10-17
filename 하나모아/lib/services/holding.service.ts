import { holdingRepository } from '@/lib/repositories/holding.repository'

export class HoldingService {
  async getUserHoldings(userId: string) {
    return await holdingRepository.findByUserId(userId)
  }

  async getUserHoldingsByAsset(userId: string, asset: string) {
    return await holdingRepository.findByUserIdAndAsset(userId, asset)
  }
}

export const holdingService = new HoldingService()

