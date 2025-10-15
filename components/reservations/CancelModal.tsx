"use client"

import Image from "next/image"

interface CancelModalProps {
  isOpen: boolean
  cancelReason: string
  onCancelReasonChange: (reason: string) => void
  onConfirm: () => void
  onClose: () => void
}

export default function CancelModal({ 
  isOpen, 
  cancelReason, 
  onCancelReasonChange, 
  onConfirm, 
  onClose 
}: CancelModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[20px] p-6 w-[400px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center mb-4">
          <Image
            src="/images/ic_danger.gif"
            alt="경고"
            width={80}
            height={80}
            className="mb-4"
          />
          <h3 
            className="text-[18px] font-bold text-[#2D3541] mb-2"
            style={{ fontFamily: "Hana2-Bold, sans-serif" }}
          >
            예약 취소
          </h3>
          <p 
            className="text-[14px] text-[#666666] text-center"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            예약을 취소하시겠습니까?
          </p>
        </div>

        <div className="mb-6">
          <label 
            className="block text-[14px] text-[#2D3541] mb-2"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            취소 사유 <span className="text-[#ED1551]">*</span>
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => onCancelReasonChange(e.target.value)}
            placeholder="취소 사유를 입력해주세요"
            rows={3}
            className="w-full px-4 py-3 text-[13px] border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent resize-none"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-[10px] bg-[#DC3545] text-white hover:bg-[#C82333] transition-colors"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            예
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  )
}
