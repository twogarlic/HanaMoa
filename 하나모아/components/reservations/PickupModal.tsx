"use client"

import Image from "next/image"

interface PickupModalProps {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function PickupModal({ isOpen, onConfirm, onClose }: PickupModalProps) {
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
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/images/ic_check.gif"
            alt="확인"
            width={80}
            height={80}
            className="mb-4"
          />
          <h3 
            className="text-[18px] font-bold text-[#2D3541] mb-2"
            style={{ fontFamily: "Hana2-Bold, sans-serif" }}
          >
            자산 수령 확인
          </h3>
          <p 
            className="text-[14px] text-[#666666] text-center"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            자산을 수령하시겠습니까?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B58] transition-colors"
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
