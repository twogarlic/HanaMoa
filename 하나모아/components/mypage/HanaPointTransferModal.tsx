"use client"

import React from "react"
import { X } from "lucide-react"

interface HanaPointTransferModalProps {
  isOpen: boolean
  onClose: () => void
  transferAmount: string
  transferValidation: {
    isValid: boolean
    message: string
  }
  hanaPointInfo: any
  userInfo: any
  isTransferring: boolean
  onTransferAmountChange: (value: string) => void
  onTransfer: () => void
}

export default function HanaPointTransferModal({
  isOpen,
  onClose,
  transferAmount,
  transferValidation,
  hanaPointInfo,
  userInfo,
  isTransferring,
  onTransferAmountChange,
  onTransfer
}: HanaPointTransferModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] p-4 sm:p-6 w-full max-w-[500px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <h2 
            className="text-[18px] text-[#2D3541] mb-2"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            하나머니 송금
          </h2>
        </div>

        {userInfo?.accounts && userInfo.accounts.length > 0 && (
          <div className="mb-6 p-4 bg-[#F8F9FA] rounded-[10px]">
            <div className="flex items-center gap-3">
              <div className="w-[18px] h-[16px]">
                <img src="/images/ic_small_logo.svg" alt="logo" className="w-full h-full" />
              </div>
              <div>
                <div 
                  className="text-[14px] text-[#2D3541]"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  {userInfo.accounts[0].accountName}
                </div>
                <div 
                  className="text-[12px] text-[#666]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  {userInfo.accounts[0].accountNumber}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => onTransferAmountChange(e.target.value)}
              placeholder="100원 단위로 입력해주세요"
              className={`w-full h-[48px] px-4 rounded-[8px] border bg-white text-[16px] leading-[23px] placeholder-[#8F8F8F] focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                transferValidation.message 
                  ? 'border-[#ED1551] focus:border-[#ED1551]' 
                  : 'border-[#DDDEE4] focus:border-[#03856E]'
              }`}
              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              min="100"
            />
            <span 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[14px] text-[#666]"
              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
            >
              원
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-[12px] text-[#ED1551]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              {transferValidation.message || ''}
            </div>
            <div className="text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              보유 포인트: {hanaPointInfo?.balance?.toLocaleString() || 0}원
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onTransfer}
            disabled={!transferValidation.isValid || isTransferring}
            className={`flex-1 py-3 rounded-[10px] text-white transition-colors ${
              transferValidation.isValid && !isTransferring
                ? 'bg-[#03856E] hover:bg-[#026B5A]'
                : 'bg-[#CDCDCD] cursor-not-allowed'
            }`}
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            {isTransferring ? '송금 중...' : '송금하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
