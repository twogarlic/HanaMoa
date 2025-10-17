import prisma from '@/lib/database'

export class PollRepository {
  async findById(id: string) {
    return await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                votes: true
              }
            }
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    })
  }

  async findMany() {
    return await prisma.poll.findMany({
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                votes: true
              }
            }
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async vote(userId: string, optionId: string) {
    return await prisma.pollVote.create({
      data: {
        userId,
        optionId
      }
    })
  }

  async hasVoted(userId: string, pollId: string) {
    const vote = await prisma.pollVote.findFirst({
      where: {
        userId,
        option: {
          pollId
        }
      }
    })
    return !!vote
  }
}

export const pollRepository = new PollRepository()

