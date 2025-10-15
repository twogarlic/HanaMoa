"use client"

import Image from "next/image"

interface ErrorModalProps {
  isOpen: boolean
  message: string
  onClose: () => void
}

export default function ErrorModal({ isOpen, message, onClose }: ErrorModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-8 w-[400px] mx-4 relative">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/ic_danger.gif"
              alt="경고"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
               
          <div className="mb-6">
            <p 
              className="text-[16px]"
              style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#2D3541" }}
            >
              {message}
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
