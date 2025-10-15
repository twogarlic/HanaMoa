"use client"

import React from "react"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  type: 'success' | 'error' | 'info'
}

export default function AlertModal({
  isOpen,
  onClose,
  message,
  type
}: AlertModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-[10px] p-6 sm:p-8 w-full max-w-[400px]">
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-[60px] h-[60px] mx-auto mb-4 flex items-center justify-center">
              <img 
                src={
                  type === 'success' ? "/images/ic_check.gif" :
                  type === 'error' ? "/images/ic_danger.gif" :
                  "/images/ic_login.png"
                } 
                alt={
                  type === 'success' ? "성공" :
                  type === 'error' ? "오류" :
                  "정보"
                } 
                className="w-[60px] h-[60px]" 
              />
            </div>
            <h2
              className="text-[18px] leading-[24px] text-[#333333] mb-2"
              style={{ fontFamily: "Hana2-CM, sans-serif" }}
            >
              {
                type === 'success' ? '완료' :
                type === 'error' ? '오류' :
                '알림'
              }
            </h2>
            <p
              className="text-[14px] leading-[20px] text-[#666666]"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full h-[48px] rounded-[8px] bg-[#03856E] text-white text-[16px] leading-[23px] hover:bg-[#005044] transition-colors"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
