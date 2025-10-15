"use client"

import React from "react"
import { Star } from "lucide-react"

interface ReviewSectionProps {
  reviews: any[]
  isLoadingReviews: boolean
  showReviewForm: boolean
  reviewRating: number
  reviewContent: string
  isSubmittingReview: boolean
  onToggleReviewForm: () => void
  onRatingChange: (rating: number) => void
  onContentChange: (content: string) => void
  onSubmitReview: () => void
}

export default function ReviewSection({
  reviews,
  isLoadingReviews,
  showReviewForm,
  reviewRating,
  reviewContent,
  isSubmittingReview,
  onToggleReviewForm,
  onRatingChange,
  onContentChange,
  onSubmitReview
}: ReviewSectionProps) {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] text-[#2D3541]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
          리뷰 ({reviews.length}개)
        </h2>
        <button
          onClick={onToggleReviewForm}
          className="px-4 py-2 bg-[#03856E] text-white rounded-[8px] hover:bg-[#026B5A] transition-colors text-[14px]"
          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
        >
          {showReviewForm ? '리뷰 작성 취소' : '리뷰 작성하기'}
        </button>
      </div>

      {showReviewForm && (
        <div className="bg-[#F8F9FA] rounded-[12px] p-6 mb-6">
          <h3 className="text-[18px] text-[#2D3541] mb-4" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            리뷰 작성
          </h3>
          
          <div className="mb-4">
            <label className="text-[14px] text-[#666] mb-2 block" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              평점
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onRatingChange(rating)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    rating <= reviewRating 
                      ? 'bg-[#FFD700] text-white' 
                      : 'bg-[#E6E6E6] text-[#999]'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
              <span className="text-[14px] text-[#666] ml-2" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                {reviewRating}점
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[14px] text-[#666] mb-2 block" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              리뷰 내용
            </label>
            <textarea
              value={reviewContent}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="상품에 대한 솔직한 리뷰를 작성해주세요..."
              className="w-full h-24 px-3 py-2 border border-[#E6E6E6] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#03856E]/30 resize-none text-[14px]"
              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onToggleReviewForm}
              className="px-4 py-2 border border-[#E6E6E6] text-[#666] rounded-[8px] hover:bg-[#F8F9FA] transition-colors text-[14px]"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              취소
            </button>
            <button
              onClick={onSubmitReview}
              disabled={isSubmittingReview || !reviewContent.trim()}
              className="px-4 py-2 bg-[#03856E] text-white rounded-[8px] hover:bg-[#026B5A] disabled:bg-[#E6E6E6] disabled:text-[#999] transition-colors text-[14px]"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              {isSubmittingReview ? '작성 중...' : '리뷰 작성'}
            </button>
          </div>
        </div>
      )}
      
      {isLoadingReviews ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-[#F8F9FA] rounded-[12px] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[#03856E] rounded-full flex items-center justify-center text-white text-[14px]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                  {review.user.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[14px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                    {review.user.name}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-[#FFD700] fill-current' : 'text-[#E6E6E6]'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              {review.content && (
                <p className="text-[14px] text-[#666] leading-relaxed" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  {review.content}
                </p>
              )}
              <div className="text-[12px] text-[#999] mt-2" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                {new Date(review.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-[16px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            아직 리뷰가 없습니다
          </p>
          <p className="text-[14px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            첫 번째 리뷰를 작성해보세요
          </p>
        </div>
      )}
    </div>
  )
}
