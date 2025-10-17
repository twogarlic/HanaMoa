import { goalRepository } from '@/lib/repositories/goal.repository'
import { ValidationError, NotFoundError } from '@/lib/api/utils/errors'
import type { CreateGoalInput, UpdateGoalParams } from '@/lib/api/validators/goal.schema'

export class GoalService {
  async getGoals(userId: string, status?: string) {
    return await goalRepository.findByUserId(userId, status)
  }

  async getGoalById(goalId: string, userId: string) {
    const goal = await goalRepository.findById(goalId)

    if (!goal) {
      throw new NotFoundError('목표를 찾을 수 없습니다')
    }

    if (goal.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    return goal
  }

  async createGoal(data: CreateGoalInput) {
    const startDateObj = new Date(data.startDate)
    const targetDateObj = new Date(data.targetDate)

    if (targetDateObj <= startDateObj) {
      throw new ValidationError('목표 날짜는 시작 날짜보다 늦어야 합니다')
    }

    return await goalRepository.create({
      user: { connect: { id: data.userId } },
      title: data.title,
      targetAmount: data.targetAmount,
      startDate: startDateObj,
      targetDate: targetDateObj,
      asset: data.asset,
      description: data.description || null,
      color: data.color || '#03856E',
      currentAmount: 0,
      status: 'ACTIVE'
    })
  }

  async updateGoal(goalId: string, data: UpdateGoalParams) {
    const goal = await goalRepository.findById(goalId)

    if (!goal) {
      throw new NotFoundError('목표를 찾을 수 없습니다')
    }

    if (goal.userId !== data.userId) {
      throw new ValidationError('권한이 없습니다')
    }

    const startDateObj = new Date(data.startDate)
    const targetDateObj = new Date(data.targetDate)

    if (targetDateObj <= startDateObj) {
      throw new ValidationError('목표 날짜는 시작 날짜보다 늦어야 합니다')
    }

    return await goalRepository.update(goalId, {
      title: data.title,
      targetAmount: data.targetAmount,
      startDate: startDateObj,
      targetDate: targetDateObj,
      asset: data.asset,
      description: data.description || null,
      color: data.color || '#03856E',
      status: 'ACTIVE'
    })
  }

  async deleteGoal(goalId: string, userId: string) {
    const goal = await goalRepository.findById(goalId)

    if (!goal) {
      throw new NotFoundError('목표를 찾을 수 없습니다')
    }

    if (goal.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    await goalRepository.delete(goalId)

    return { message: '목표가 삭제되었습니다' }
  }

  async updateProgress(goalId: string, userId: string, currentAmount: number) {
    const goal = await goalRepository.findById(goalId)

    if (!goal) {
      throw new NotFoundError('목표를 찾을 수 없습니다')
    }

    if (goal.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    return await goalRepository.updateProgress(goalId, currentAmount)
  }
}

export const goalService = new GoalService()
