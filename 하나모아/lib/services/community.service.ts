import { postRepository } from '@/lib/repositories/post.repository'
import { commentRepository } from '@/lib/repositories/comment.repository'
import { followRepository } from '@/lib/repositories/follow.repository'
import { ValidationError, NotFoundError } from '@/lib/api/utils/errors'
import type { CreatePostInput, CreateCommentInput, FollowUserInput } from '@/lib/api/validators/community.schema'

export class CommunityService {
  async getPosts(page: number = 1, limit: number = 10, sortBy?: string, asset?: string) {
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      postRepository.findMany({ asset, sortBy, skip, take: limit }),
      postRepository.count(asset)
    ])

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getPost(postId: string) {
    const post = await postRepository.findById(postId)

    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다')
    }

    return post
  }

  async createPost(data: CreatePostInput) {
    if (!data.content && !data.pollData) {
      throw new ValidationError('내용을 입력하거나 투표를 생성해주세요')
    }

    return await postRepository.create({
      user: { connect: { id: data.userId } },
      asset: data.asset,
      content: data.content || '',
      imageUrl: null
    })
  }

  async deletePost(postId: string, userId: string) {
    const post = await postRepository.findById(postId)

    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다')
    }

    if (post.userId !== userId) {
      throw new ValidationError('권한이 없습니다')
    }

    return await postRepository.delete(postId)
  }

  async likePost(postId: string, userId: string) {
    const post = await postRepository.findById(postId)

    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다')
    }

    const isLiked = await postRepository.isLiked(postId, userId)

    if (isLiked) {
      await postRepository.unlikePost(postId, userId)
      return { liked: false, message: '좋아요를 취소했습니다' }
    } else {
      await postRepository.likePost(postId, userId)
      return { liked: true, message: '좋아요를 눌렀습니다' }
    }
  }

  async getComments(postId: string) {
    const post = await postRepository.findById(postId)

    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다')
    }

    return await commentRepository.findByPostId(postId)
  }

  async createComment(postId: string, data: CreateCommentInput) {
    const post = await postRepository.findById(postId)

    if (!post) {
      throw new NotFoundError('게시글을 찾을 수 없습니다')
    }

    return await commentRepository.create({
      post: { connect: { id: postId } },
      user: { connect: { id: data.userId } },
      content: data.content,
      parentComment: data.parentCommentId ? { connect: { id: data.parentCommentId } } : undefined
    })
  }

  async followUser(data: FollowUserInput) {
    if (data.followerId === data.followingId) {
      throw new ValidationError('자기 자신을 팔로우할 수 없습니다')
    }

    const isFollowing = await followRepository.isFollowing(data.followerId, data.followingId)

    if (isFollowing) {
      await followRepository.unfollow(data.followerId, data.followingId)
      return { following: false, message: '팔로우를 취소했습니다' }
    } else {
      await followRepository.follow(data.followerId, data.followingId)
      return { following: true, message: '팔로우했습니다' }
    }
  }
}

export const communityService = new CommunityService()

