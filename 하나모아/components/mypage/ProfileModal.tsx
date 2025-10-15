"use client"

import React from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProfile: string
  onProfileSelect: (profileId: string) => void
  onSave: () => void
  isSaving: boolean
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

export default function ProfileModal({
  isOpen,
  onClose,
  selectedProfile,
  onProfileSelect,
  onSave,
  isSaving
}: ProfileModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] p-6 sm:p-8 w-full max-w-[500px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 
            className="text-[20px] text-[#2D3541] mb-2"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            프로필 이미지 선택
          </h2>
          <p 
            className="text-[14px] text-[#666]"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            커뮤니티에서 사용할 프로필 이미지를 선택해주세요
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {PROFILE_IMAGES.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => onProfileSelect(profile.id)}
              className={`relative p-4 rounded-[10px] border-2 transition-all hover:scale-105 ${
                selectedProfile === profile.id 
                  ? "border-[#03856E] bg-[#F5FBFA]" 
                  : "border-[#E6E6E6] bg-white hover:border-[#03856E]/50"
              }`}
            >
              <div className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] mx-auto mb-2">
                <Image 
                  src={profile.src} 
                  alt={profile.name} 
                  width={60} 
                  height={60}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[12px] text-center text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                {profile.name}
              </p>
              {selectedProfile === profile.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#03856E] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          ))}
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
            onClick={onSave}
            disabled={isSaving}
            className={`flex-1 py-3 rounded-[10px] text-white transition-colors ${
              isSaving 
                ? "bg-[#B0B8C1] cursor-not-allowed" 
                : "bg-[#03856E] hover:bg-[#026B5A]"
            }`}
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  )
}
