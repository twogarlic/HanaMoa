"use client"

import Image from "next/image"
import { ChevronRight as RightChevron } from "lucide-react"

interface BankBranch {
  id: string
  name: string
  address: string
  distance: number
  phone: string
  operatingHours: string
  isAvailable: boolean
  lat?: number
  lng?: number
}

interface ConfirmationStepProps {
  selectedAssetType: string | null
  selectedAssetUnit: string | null
  selectedAmount: number
  selectedBranchInfo: BankBranch | null
  selectedDate: Date | null
  selectedTime: string | null
  isSubmitting: boolean
  onSubmit: () => void
}

export default function ConfirmationStep({
  selectedAssetType,
  selectedAssetUnit,
  selectedAmount,
  selectedBranchInfo,
  selectedDate,
  selectedTime,
  isSubmitting,
  onSubmit
}: ConfirmationStepProps) {
  return (
    <div className={`flex ${false ? 'flex-col' : 'gap-12'}`}>
      <div className="flex-1">
        <div className="mb-6">
          <h3 
            className="text-[15px] mb-4 mt-4"
            style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
          >
            수령할 자산
          </h3>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-[#03856E] rounded-[30px] flex items-center gap-3">
              <div 
                className="text-[12px] font-medium text-white"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                {selectedAssetType === 'gold' && '골드바'}
                {selectedAssetType === 'silver' && '실버바'}
                {selectedAssetType && ['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType) && `${selectedAssetType.toUpperCase()} 외환`}
              </div>
            </div>
            
            <div className="px-4 py-2 bg-[#03856E] rounded-[30px] flex items-center">
              <div 
                className="text-[12px] font-medium text-white"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                {['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType || '') 
                  ? `${selectedAmount.toLocaleString()} ${selectedAssetType?.toUpperCase()}`
                  : selectedAssetUnit
                }
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 
            className="text-[15px] mb-4"
            style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
          >
            수령 지점
          </h3>
          {selectedBranchInfo && (
            <div className="p-4 border-2 border-[#03856E] rounded-[8px]">
              <div>
                <h4 
                  className="text-[14px] font-medium mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                >
                  {selectedBranchInfo.name}
                </h4>
                <div className="flex items-center gap-2 mb-1">
                  <Image
                    src="/images/ic_place.svg"
                    alt="위치"
                    width={12}
                    height={12}
                    className="object-contain flex-shrink-0"
                  />
                  <div 
                    className="text-[12px] text-[#666666]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    {selectedBranchInfo.address}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/ic_phone.svg"
                      alt="전화번호"
                      width={12}
                      height={12}
                      className="object-contain flex-shrink-0"
                    />
                    <div 
                      className="text-[11px] text-[#666666]"
                      style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                    >
                      {selectedBranchInfo.phone}
                    </div>
                  </div>
                  <div 
                    className="text-[11px] text-[#03856E] font-medium"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    {selectedBranchInfo.distance}km
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 
            className="text-[15px] mb-4"
            style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
          >
            수령 날짜/시간
          </h3>
          {selectedDate && selectedTime && (
            <div className="flex gap-2">
              <div className="px-4 py-2 bg-[#03856E] rounded-[30px] flex items-center gap-3">
                <div 
                  className="text-[12px] font-medium text-white"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  {selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </div>
              </div>
              <div className="px-4 py-2 bg-[#03856E] rounded-[30px] flex items-center">
                <div 
                  className="text-[12px] font-medium text-white"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  {selectedTime}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end items-end mt-32">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isSubmitting
                ? 'bg-[#03856E] text-white hover:bg-[#026B5A] hover:scale-105'
                : 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RightChevron className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
