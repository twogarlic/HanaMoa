"use client"

import Image from "next/image"

interface ResultMessage {
  type: string
  title: string
  message: string
}

interface ResultModalProps {
  isOpen: boolean
  resultMessage: ResultMessage
  onClose: () => void
}

export default function ResultModal({ isOpen, resultMessage, onClose }: ResultModalProps) {
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
            src={resultMessage.type === 'success' ? '/images/ic_check.gif' : '/images/ic_danger.gif'}
            alt={resultMessage.type === 'success' ? '성공' : '실패'}
            width={80}
            height={80}
            className="mb-4"
          />
          <h3 
            className="text-[18px] font-bold text-[#2D3541] mb-2"
            style={{ fontFamily: "Hana2-Bold, sans-serif" }}
          >
            {resultMessage.title}
          </h3>
          <p 
            className="text-[14px] text-[#666666] text-center"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            {resultMessage.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B58] transition-colors"
          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
        >
          확인
        </button>
      </div>
    </div>
  )
}
