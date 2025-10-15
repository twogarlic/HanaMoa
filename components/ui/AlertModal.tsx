"use client"

import { Modal } from "./Modal"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  buttonText?: string
}

export function AlertModal({ 
  isOpen, 
  onClose, 
  title = "알림", 
  message, 
  buttonText = "확인" 
}: AlertModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="text-center">
          <h2
            className="text-[20px] leading-[26px] text-[#333333] mb-2"
            style={{ fontFamily: "Hana2-CM, sans-serif" }}
          >
            {title}
          </h2>
          <p
            className="text-[16px] leading-[24px] text-[#666666]"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full h-[48px] rounded-[8px] bg-[#03856E] text-white text-[16px] leading-[23px] hover:bg-[#005044] transition-colors"
          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  )
}
