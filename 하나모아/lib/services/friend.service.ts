import { friendRepository } from '@/lib/repositories/friend.repository'
import { userRepository } from '@/lib/repositories/user.repository'
import { ValidationError, NotFoundError, ConflictError } from '@/lib/api/utils/errors'
import type { AddFriendInput, FriendRequestActionInput } from '@/lib/api/validators/friend.schema'

export class FriendService {
  async getFriends(userId: string) {
    const friends = await friendRepository.findAcceptedFriends(userId)

    return friends.map(friend => ({
      id: friend.id,
      friendId: friend.friendId,
      friendName: friend.friendName,
      friendPhone: friend.friendPhone,
      createdAt: friend.createdAt,
      profileImage: friend.friendUser?.profileImage || null
    }))
  }

  async addFriend(data: AddFriendInput) {
    const existingUser = await userRepository.findByPhone(data.friendPhone)

    if (!existingUser) {
      throw new NotFoundError('해당 전화번호로 가입된 사용자를 찾을 수 없습니다')
    }

    const existingFriend = await friendRepository.findByUserIdAndFriendId(data.userId, existingUser.id)

    if (existingFriend) {
      throw new ConflictError('이미 친구로 등록된 사용자입니다')
    }

    const friend = await friendRepository.create({
      user: { connect: { id: data.userId } },
      friendUser: { connect: { id: existingUser.id } },
      friendName: data.friendName,
      friendPhone: data.friendPhone,
      isAccepted: true
    })

    return friend
  }

  async getFriendRequests(userId: string, type: 'sent' | 'received') {
    return await friendRepository.findPendingRequests(userId, type)
  }

  async handleFriendRequest(requestId: string, data: FriendRequestActionInput) {
    const request = await friendRepository.findRequestById(requestId)

    if (!request) {
      throw new NotFoundError('친구 신청을 찾을 수 없습니다')
    }

    if (data.action === 'accept') {
      await friendRepository.acceptRequest(requestId)

      await friendRepository.create({
        user: { connect: { id: request.receiverId } },
        friendUser: { connect: { id: request.requesterId } },
        friendName: request.requester.name,
        friendPhone: request.requester.phone || '',
        isAccepted: true
      })

      await friendRepository.create({
        user: { connect: { id: request.requesterId } },
        friendUser: { connect: { id: request.receiverId } },
        friendName: request.receiver.name,
        friendPhone: request.receiver.phone || '',
        isAccepted: true
      })

      return { message: '친구 신청이 수락되었습니다' }
    } else {
      await friendRepository.deleteRequest(requestId)
      return { message: '친구 신청이 거절되었습니다' }
    }
  }

  async removeFriend(userId: string, friendId: string) {
    const friend = await friendRepository.findByUserIdAndFriendId(userId, friendId)

    if (!friend) {
      throw new NotFoundError('친구를 찾을 수 없습니다')
    }

    await friendRepository.delete(userId, friendId)
    await friendRepository.delete(friendId, userId)

    return { message: '친구가 삭제되었습니다' }
  }
}

export const friendService = new FriendService()

