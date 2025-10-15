"use client"

import React from "react"

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  passwordData: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
  passwordValidation: {
    currentPasswordValid: boolean
    newPasswordValid: boolean
    confirmPasswordValid: boolean
    currentPasswordMessage: string
    newPasswordMessage: string
    confirmPasswordMessage: string
  }
  isChangingPassword: boolean
  onPasswordInputChange: (field: string, value: string) => void
  onPasswordChange: () => void
}

export default function PasswordModal({
  isOpen,
  onClose,
  passwordData,
  passwordValidation,
  isChangingPassword,
  onPasswordInputChange,
  onPasswordChange
}: PasswordModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[10px] p-6 sm:p-8 w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h2
              className="text-[20px] leading-[26px] text-[#333333] mb-2"
              style={{ fontFamily: "Hana2-CM, sans-serif" }}
            >
              비밀번호 재설정
            </h2>
            <p
              className="text-[14px] leading-[20px] text-[#666666]"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              보안을 위해 현재 비밀번호를 입력하고<br />새 비밀번호를 설정해주세요.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="현재 비밀번호를 입력해주세요"
                value={passwordData.currentPassword}
                onChange={(e) => onPasswordInputChange('currentPassword', e.target.value)}
                className="w-full h-[48px] px-4 rounded-[8px] border border-[#DDDEE4] bg-white text-[14px] leading-[23px] placeholder-[#8F8F8F] focus:border-[#03856E] focus:outline-none"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              />
              {passwordValidation.currentPasswordMessage && (
                <p
                  className="text-[10px] leading-[13px] text-[#ED1651] text-left mt-1"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  {passwordValidation.currentPasswordMessage}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="새 비밀번호를 입력해주세요"
                value={passwordData.newPassword}
                onChange={(e) => onPasswordInputChange('newPassword', e.target.value)}
                className="w-full h-[48px] px-4 rounded-[8px] border border-[#DDDEE4] bg-white text-[14px] leading-[23px] placeholder-[#8F8F8F] focus:border-[#03856E] focus:outline-none"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              />
              {passwordValidation.newPasswordMessage && (
                <p
                  className="text-[10px] leading-[13px] text-[#ED1651] text-left mt-1"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  {passwordValidation.newPasswordMessage}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="새 비밀번호를 다시 입력해주세요"
                value={passwordData.confirmPassword}
                onChange={(e) => onPasswordInputChange('confirmPassword', e.target.value)}
                className="w-full h-[48px] px-4 rounded-[8px] border border-[#DDDEE4] bg-white text-[14px] leading-[23px] placeholder-[#8F8F8F] focus:border-[#03856E] focus:outline-none"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              />
              {passwordValidation.confirmPasswordMessage && (
                <p
                  className="text-[10px] leading-[13px] text-[#ED1651] text-left mt-1"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  {passwordValidation.confirmPasswordMessage}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 h-[48px] rounded-[8px] border border-[#DDDEE4] bg-white text-[#666666] text-[15px] leading-[23px] hover:bg-[#F5F5F5] transition-colors"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              취소
            </button>
            <button
              onClick={onPasswordChange}
              disabled={!passwordValidation.currentPasswordValid || !passwordValidation.newPasswordValid || !passwordValidation.confirmPasswordValid || isChangingPassword}
              className={`flex-1 h-[48px] rounded-[8px] text-white text-[15px] leading-[23px] transition-colors ${
                passwordValidation.currentPasswordValid && passwordValidation.newPasswordValid && passwordValidation.confirmPasswordValid && !isChangingPassword
                  ? 'bg-[#03856E] hover:bg-[#005044] cursor-pointer'
                  : 'bg-[#CDCDCD] cursor-not-allowed'
              }`}
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              변경
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
