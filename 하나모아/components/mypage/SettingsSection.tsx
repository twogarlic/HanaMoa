"use client"

import React from "react"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface SettingsSectionProps {
  isPublicProfile: boolean
  isPostsPublic: boolean
  notificationsEnabled: boolean
  isSaving: boolean
  userInfo: any
  selectedProfile: string
  onTogglePublicProfile: () => void
  onTogglePostsPublic: () => void
  onToggleNotifications: () => void
  onPasswordModalOpen: () => void
}

export default function SettingsSection({
  isPublicProfile,
  isPostsPublic,
  notificationsEnabled,
  isSaving,
  userInfo,
  selectedProfile,
  onTogglePublicProfile,
  onTogglePostsPublic,
  onToggleNotifications,
  onPasswordModalOpen
}: SettingsSectionProps) {
  const router = useRouter()

  const ToggleButton = ({ 
    isOn, 
    onToggle, 
    label, 
    description 
  }: { 
    isOn: boolean
    onToggle: () => void
    label: string
    description: string
  }) => (
    <div className="flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition-colors">
      <div className="flex-1">
        <div className="text-[14px] text-[#2D3541] mb-1" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
          {label}
        </div>
        <div className="text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
          {description}
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#03856E]/30 ${
          isOn ? 'bg-[#03856E]' : 'bg-[#E5E8EB]'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
            isOn ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )

  return (
    <div className="bg-white rounded-[10px] shadow-md p-6 min-h-[500px] flex flex-col">
      <h3 className="text-[18px] text-[#2D3541] mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
        설정
      </h3>
      
      <div className="space-y-4 flex-1">
        <ToggleButton
          isOn={isPublicProfile}
          onToggle={onTogglePublicProfile}
          label="친구에게 내 정보 공개"
          description="친구들이 내 투자 정보를 볼 수 있습니다"
        />
        
        <ToggleButton
          isOn={isPostsPublic}
          onToggle={onTogglePostsPublic}
          label="내가 작성한 글 공개"
          description="다른 사람이 내가 작성한 글을 볼 수 있습니다"
        />
        
        <ToggleButton
          isOn={notificationsEnabled}
          onToggle={onToggleNotifications}
          label="알림 수신"
          description="친구 신청, 선물 등의 알림을 받습니다"
        />
        
        <button
          type="button"
          onClick={onPasswordModalOpen}
          className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition-colors"
        >
          <span className="text-[14px] text-[#2D3541]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            비밀번호 재설정
          </span>
          <ChevronLeft className="w-4 h-4 text-[#666] rotate-180" />
        </button>
        
        <button
          type="button"
          onClick={() => {
            if (confirm("정말 로그아웃하시겠습니까?")) {
              localStorage.removeItem('user_info')
              router.push('/')
            }
          }}
          className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] transition-colors"
        >
          <span className="text-[14px] text-[#ED1551]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            로그아웃
          </span>
          <ChevronLeft className="w-4 h-4 text-[#ED1551] rotate-180" />
        </button>
      </div>
    </div>
  )
}
