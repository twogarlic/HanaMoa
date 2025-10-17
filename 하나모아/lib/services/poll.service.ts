import { pollRepository } from '@/lib/repositories/poll.repository'
import { ValidationError, NotFoundError } from '@/lib/api/utils/errors'

export class PollService {
  async getPolls() {
    return await pollRepository.findMany()
  }

  async getPoll(pollId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll) {
      throw new NotFoundError('투표를 찾을 수 없습니다')
    }

    return poll
  }

  async vote(pollId: string, userId: string, optionId: string) {
    const poll = await pollRepository.findById(pollId)

    if (!poll) {
      throw new NotFoundError('투표를 찾을 수 없습니다')
    }

    const hasVoted = await pollRepository.hasVoted(userId, pollId)

    if (hasVoted && !poll.isMultiple) {
      throw new ValidationError('이미 투표하셨습니다')
    }

    await pollRepository.vote(userId, optionId)

    return { message: '투표가 완료되었습니다' }
  }
}

export const pollService = new PollService()

