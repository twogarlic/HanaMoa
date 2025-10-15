"use client"

import React from "react"
import { X } from "lucide-react"

interface HanaPointModalProps {
  isOpen: boolean
  onClose: () => void
  hanaPointHistory: any[]
  isLoadingHanaPointHistory: boolean
  onTransferClick: () => void
}

export default function HanaPointModal({
  isOpen,
  onClose,
  hanaPointHistory,
  isLoadingHanaPointHistory,
  onTransferClick
}: HanaPointModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] p-4 sm:p-6 w-full max-w-[600px] relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <h2 
            className="text-[20px] text-[#2D3541] mb-2"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            하나머니 내역
          </h2>
          <p 
            className="text-[14px] text-[#666]"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            최근 포인트 사용 내역을 확인하세요
          </p>
        </div>

        <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
          {isLoadingHanaPointHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  포인트 내역을 불러오는 중...
                </span>
              </div>
            </div>
          ) : hanaPointHistory.length > 0 ? (
            hanaPointHistory.map((history, index) => (
              <div key={history.id || index} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-[8px]">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span 
                      className="text-[14px] text-[#2D3541]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {history.type === 'EARN' ? '적립' : 
                       history.type === 'USE' ? '사용' : 
                       history.type === 'EXPIRE' ? '만료' :
                       history.type === 'REFUND' ? '환불' : 
                       history.type}
                    </span>
                  </div>
                  <div 
                    className="text-[12px] text-[#666]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    {history.description || '포인트 내역'}
                  </div>
                  <div 
                    className="text-[11px] text-[#999]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    {new Date(history.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className={`text-[16px] font-bold ${
                      history.type === 'EARN' || history.type === 'REFUND' ? 'text-[#03856E]' : 
                      history.type === 'USE' || history.type === 'EXPIRE' ? 'text-[#ED1551]' : 
                      'text-[#2D3541]'
                    }`}
                    style={{ fontFamily: "Hana2-Bold, sans-serif" }}
                  >
                    {history.type === 'EARN' || history.type === 'REFUND' ? '+' : '-'}
                    {Math.abs(history.amount).toLocaleString('ko-KR')}P
                  </div>
                  <div 
                    className="text-[12px] text-[#666]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    잔액: {history.balance?.toLocaleString('ko-KR')}P
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div 
                className="text-[14px] text-[#999]"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                포인트 내역이 없습니다
              </div>
              <div 
                className="text-[12px] text-[#CCC] mt-1"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                포인트를 사용해보세요
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onTransferClick}
            className="flex-1 py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            송금하기
          </button>
        </div>
      </div>
    </div>
  )
}
