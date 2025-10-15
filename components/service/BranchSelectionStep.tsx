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

interface BranchSelectionStepProps {
  branches: BankBranch[]
  selectedBranch: string
  selectedBranchInfo: BankBranch | null
  mapRef: React.RefObject<HTMLDivElement | null>
  mapLoaded: boolean
  userLocation: {lat: number, lng: number} | null
  isMobile: boolean
  onComplete: () => void
  onBranchSelect: (branchId: string, branchInfo: BankBranch) => void
}

export default function BranchSelectionStep({
  branches,
  selectedBranch,
  selectedBranchInfo,
  mapRef,
  mapLoaded,
  userLocation,
  isMobile,
  onComplete,
  onBranchSelect
}: BranchSelectionStepProps) {
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'gap-12'}`}>
      <div className="flex-1">
        <div className="mb-4">
          <span 
            className="text-[15px] text-[#333333]" 
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            지도에서 수령하실 지점을 선택해주세요.
          </span>
        </div>

        <div className={`flex ${isMobile ? 'flex-col' : 'gap-6'} ${isMobile ? 'h-auto' : 'h-96'}`}>
          <div className={`flex-1 relative bg-gray-100 rounded-[15px] overflow-hidden ${isMobile ? 'h-80' : ''}`} style={{ minHeight: isMobile ? '320px' : 'auto' }}>
            {mapLoaded && userLocation ? (
              <div ref={mapRef} className="w-full h-full rounded-[15px]" style={{ minHeight: isMobile ? '320px' : 'auto' }}></div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                <div className="text-center p-4">
                  {!mapLoaded || !userLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03856E] mx-auto mb-2"></div>
                      <div 
                        className={`${isMobile ? 'text-[12px]' : 'text-[14px]'} text-[#666666]`}
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        {!mapLoaded ? '지도 API를 불러오는 중...' : '위치 정보를 가져오는 중...'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div 
                        className={`${isMobile ? 'text-[14px]' : 'text-[16px]'} text-[#666666] mb-2`}
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        지도 로드 실패
                      </div>
                      <div 
                        className={`${isMobile ? 'text-[12px]' : 'text-[14px]'} text-[#999999]`}
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        API 키 또는 도메인 설정을 확인해주세요
                      </div>
                    </>
                  )}
                  <div 
                    className={`${isMobile ? 'text-[10px]' : 'text-[12px]'} text-[#999999] mt-2`}
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    API 키: {process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ? '설정됨' : '미설정'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`${isMobile ? 'w-full' : 'w-80'} bg-white rounded-[15px] ${isMobile ? 'mt-4' : ''}`}>             
            <div className={`${isMobile ? 'h-72' : 'h-[calc(100%)]'} overflow-y-auto space-y-3`}>
              {branches.map((branch, index) => (
                <div
                  key={branch.id}
                  onClick={() => onBranchSelect(branch.id, branch)}
                  className={`p-3 rounded-[10px] border-2 cursor-pointer transition-all duration-300 hover:shadow-sm ${
                    selectedBranch === branch.id
                      ? 'border-[#03856E]'
                      : 'border-[#E9ECEF] hover:border-[#03856E]'
                  }`}
                  style={{
                    animation: selectedBranch === branch.id && index === 0 
                      ? 'slideToTop 0.3s ease-out' 
                      : 'none'
                  }}
                >
                  <div 
                    className="text-[14px] font-medium mb-1"
                    style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                  >
                    {branch.name}
                  </div>
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
                      {branch.address}
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
                        {branch.phone}
                      </div>
                    </div>
                    <div 
                      className="text-[11px] text-[#03856E] font-medium"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {branch.distance}km
                    </div>
                  </div>
                </div>
              ))}
              
              {branches.length === 0 && (
                <div className="text-center py-8">
                  <div 
                    className="text-[14px] text-[#999999]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    지점을 불러오는 중...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedBranch && (
          <div className="flex justify-end items-end mt-12">
            <button
              onClick={onComplete}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-[#03856E] text-white hover:bg-[#026B5A] hover:scale-105"
            >
              <RightChevron className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
