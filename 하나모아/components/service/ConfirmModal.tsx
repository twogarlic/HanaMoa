"use client"

import Image from "next/image"

interface ConfirmModalProps {
  isOpen: boolean
  reservationNumber: string
  onClose: () => void
}

export default function ConfirmModal({ isOpen, reservationNumber, onClose }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-8 w-[400px] mx-4 relative">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/ic_check.gif"
              alt="완료"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <div className="space-y-2 mb-6">
            <p 
              className="text-[15px]"
              style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#222222" }}
            >
              예약이 완료되었습니다.
            </p>
            {reservationNumber && (
              <div className="p-3 rounded-[8px] border border-[#E6E6E6]">
                <div 
                  className="text-[12px] text-[#666666] mb-1"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  예약번호
                </div>
                <div 
                  className="text-[16px] font-bold text-[#03856E]"
                  style={{ fontFamily: "Hana2-Bold, sans-serif" }}
                >
                  {reservationNumber}
                </div>
              </div>
            )}
            <p 
              className="text-[14px]"
              style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
            >
              예약 현황은 예약 정보에서 확인 가능합니다.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-[#03856E] text-white rounded-[10px] text-[16px] hover:bg-[#026B5A] transition-colors"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
