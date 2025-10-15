"use client"

import { ChevronRight as RightChevron } from "lucide-react"

interface PaymentStepProps {
  currentPrice: number
  serviceFee: number
  selectedAssetType: string | null
  paymentMethod: 'account' | 'point' | null
  accountBalance: number
  accountNumber: string
  pointBalance: number
  pointCreatedAt: string
  isPaying: boolean
  onPaymentMethodSelect: (method: 'account' | 'point') => void
  onPayFee: () => void
}

export default function PaymentStep({
  currentPrice,
  serviceFee,
  selectedAssetType,
  paymentMethod,
  accountBalance,
  accountNumber,
  pointBalance,
  pointCreatedAt,
  isPaying,
  onPaymentMethodSelect,
  onPayFee
}: PaymentStepProps) {
  return (
    <div className={`flex ${false ? 'flex-col' : 'gap-12'}`}>
      <div className="flex-1">
        <div className="mb-4">
          <span 
            className="text-[15px] text-[#333333]" 
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            수수료 결제 방법을 선택해주세요.
          </span>
        </div>

        <div className="mb-6 p-4 rounded-[10px] border-2 border-[#03856E]">
          <div 
            className="text-[14px] font-medium mb-2"
            style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#222222" }}
          >
            수수료 안내
          </div>
          <div 
            className="text-[12px] text-[#666666]"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            현재 시세: {currentPrice.toLocaleString()}원
          </div>
          <div 
            className="text-[12px] text-[#666666]"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            수수료: {serviceFee.toLocaleString()}원
          </div>
          <div 
            className="text-[11px] text-[#999999] mt-1"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            {selectedAssetType === 'gold' || selectedAssetType === 'silver' 
              ? '(시세 × 수량 × 10%)'
              : '(시세 × 수량 × 1.75%)'
            }
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          <button
            type="button"
            onClick={() => onPaymentMethodSelect('account')}
            className={`w-full h-[58px] rounded-[10px] bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.25)] transition-all border-2 ${
              paymentMethod === 'account' ? 'border-[#03856E]' : 'border-transparent'
            }`}
          >
            <div className="relative h-full px-4 py-3">
              <div className="flex items-center">
                <div className="w-[18px] h-[16px] mr-2">
                  <img src="/images/ic_small_logo.svg" alt="logo" className="w-full h-full" />
                </div>
                <span
                  className="text-[13px] leading-[17px] text-[#333333]"
                  style={{ fontFamily: "Hana2-CM, sans-serif" }}
                >
                  하나모아
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-[18px] h-[16px] mr-2 invisible">
                  <img src="/images/ic_small_logo.svg" alt="logo" className="w-full h-full" />
                </div>
                <span
                  className="text-[11px] leading-[14px] text-[#666666]"
                  style={{ fontFamily: "Hana2-CM, sans-serif" }}
                >
                  {accountNumber}
                </span>
              </div>
              <div className="absolute top-5 right-6 text-right">
                <div className="text-[12px] text-[#666666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                  {accountBalance.toLocaleString("ko-KR")}원
                </div>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => onPaymentMethodSelect('point')}
            className={`w-full h-[58px] rounded-[10px] bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.25)] transition-all border-2 ${
              paymentMethod === 'point' ? 'border-[#03856E]' : 'border-transparent'
            }`}
          >
            <div className="relative h-full px-4 py-3">
              <div className="flex items-center">
                <div className="w-[18px] h-[16px] mr-2">
                  <img src="/images/ic_hanamoney.png" alt="하나머니" className="w-full h-full object-contain" />
                </div>
                <span
                  className="text-[13px] leading-[17px] text-[#333333]"
                  style={{ fontFamily: "Hana2-CM, sans-serif" }}
                >
                  하나머니
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-[18px] h-[16px] mr-2 invisible">
                  <img src="/images/ic_hanamoney.png" alt="하나머니" className="w-full h-full object-contain" />
                </div>
                <span
                  className="text-[11px] leading-[14px] text-[#666666]"
                  style={{ fontFamily: "Hana2-CM, sans-serif" }}
                >
                  {pointCreatedAt}
                </span>
              </div>
              <div className="absolute top-5 right-6 text-right">
                <div className="text-[12px] text-[#666666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                  {pointBalance.toLocaleString("ko-KR")}원
                </div>
              </div>
            </div>
          </button>
        </div>
        
        {paymentMethod && (
          <div className="flex justify-end items-end mt-auto">
            <button
              onClick={onPayFee}
              disabled={isPaying}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                !isPaying
                  ? 'bg-[#03856E] text-white hover:bg-[#026B5A] hover:scale-105'
                  : 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
              }`}
            >
              {isPaying ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RightChevron className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
