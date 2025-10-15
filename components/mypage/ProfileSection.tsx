"use client"

import React from "react"
import Image from "next/image"

interface ProfileSectionProps {
  userInfo: any
  selectedProfile: string
  onProfileClick: () => void
  onAccountClick: (accountId: string) => void
  hanaPointInfo: any
  isLoadingHanaPoint: boolean
  onHanaPointClick: () => void
}

const PROFILE_IMAGES = [
  { id: "rabbit", name: "토끼", src: "/images/ic_rabbit.png" },
  { id: "lion", name: "사자", src: "/images/ic_lion.png" },
  { id: "bear", name: "곰", src: "/images/ic_bear.png" },
  { id: "fox", name: "여우", src: "/images/ic_fox.png" },
  { id: "chick", name: "병아리", src: "/images/ic_chick.png" },
  { id: "otter", name: "수달", src: "/images/ic_ootter.png" },
  { id: "tiger", name: "호랑이", src: "/images/ic_tiger.png" },
  { id: "panda", name: "판다", src: "/images/ic_panda.png" },
  { id: "hedgehog", name: "고슴도치", src: "/images/ic_hedgehog.png" },
]

export default function ProfileSection({
  userInfo,
  selectedProfile,
  onProfileClick,
  onAccountClick,
  hanaPointInfo,
  isLoadingHanaPoint,
  onHanaPointClick
}: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-[10px] shadow-md p-6 mb-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onProfileClick}
          className="w-[60px] h-[60px] rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
        >
          <Image 
            src={PROFILE_IMAGES.find(img => img.id === selectedProfile)?.src || "/images/ic_fox.png"} 
            alt="프로필 이미지" 
            width={60} 
            height={60}
            className="w-full h-full object-cover rounded-full"
          />
        </button>
        <div>
          <h2 className="text-[18px] text-[#2D3541] mb-1" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            {userInfo?.name || "사용자"}
          </h2>
          <p className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            {userInfo?.phone || "전화번호 정보 없음"}
          </p>
        </div>
      </div>

      {userInfo?.accounts && userInfo.accounts.length > 0 && (
        <div className="border-t border-[#E6E6E6] pt-4">
          <div 
            className="w-full h-[58px] rounded-[10px] bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.25)] cursor-pointer hover:shadow-[2px_2px_15px_rgba(0,0,0,0.3)] transition-all"
            onClick={() => onAccountClick(userInfo.accounts[0].id.toString())}
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
                  {userInfo.accounts[0].accountName}
                </span>
              </div>
              <div className="ml-[26px]">
                <span
                  className="text-[11px] leading-[14px] text-[#666666]"
                  style={{ fontFamily: "Hana2-CM, sans-serif" }}
                >
                  {userInfo.accounts[0].accountNumber}
                </span>
              </div>
              <div className="absolute top-5 right-6 text-right">
                <div className="text-[12px] text-[#666666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                  {userInfo.accounts[0].balance?.toLocaleString("ko-KR") || 0}원
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4">
        {isLoadingHanaPoint ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                하나머니 정보를 불러오는 중...
              </span>
            </div>
          </div>
        ) : hanaPointInfo ? (
          <div 
            className="w-full h-[58px] rounded-[10px] bg-white shadow-[2px_2px_10px_rgba(0,0,0,0.25)] cursor-pointer hover:shadow-[2px_2px_15px_rgba(0,0,0,0.3)] transition-all"
            onClick={onHanaPointClick}
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
              <div className="ml-[26px]">
                <span
                  className="text-[11px] leading-[14px] text-[#666666]"
                  style={{ fontFamily: "Hana2-CM, sans-serif" }}
                >
                  {(() => {
                    const date = new Date(hanaPointInfo.createdAt)
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    return `${year}/${month}/${day}`
                  })()}
                </span>
              </div>
              <div className="absolute top-5 right-6 text-right">
                <div className="text-[12px] text-[#666666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                  {hanaPointInfo.balance?.toLocaleString("ko-KR") || 0}원
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="text-[13px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              하나머니 정보가 없습니다
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
