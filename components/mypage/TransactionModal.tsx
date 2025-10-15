"use client"

import React from "react"
import { X } from "lucide-react"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: any[]
  isLoadingTransactions: boolean
}

export default function TransactionModal({
  isOpen,
  onClose,
  transactions,
  isLoadingTransactions
}: TransactionModalProps) {
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
            거래 내역
          </h2>
          <p 
            className="text-[14px] text-[#666]"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            최근 거래 내역을 확인하세요
          </p>
        </div>

        <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  거래 내역을 불러오는 중...
                </span>
              </div>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <div key={transaction.id || index} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-[8px]">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span 
                      className="text-[14px] text-[#2D3541]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {transaction.type === 'DEPOSIT' ? '입금' : 
                       transaction.type === 'WITHDRAWAL' ? '출금' : 
                       transaction.type === 'ORDER_BUY' ? '매수' :
                       transaction.type === 'ORDER_SELL' ? '매도' : 
                       transaction.type === 'COINBOX_SAVE' ? '저금통' :
                       transaction.type === 'COINBOX_INTEREST' ? '저금통' : 
                       transaction.type}
                    </span>
                  </div>
                  <div 
                    className="text-[12px] text-[#666]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    {transaction.description || '거래 내역'}
                  </div>
                  <div 
                    className="text-[11px] text-[#999]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    {new Date(transaction.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className={`text-[16px] font-bold ${
                      transaction.type === 'DEPOSIT' || transaction.type === 'ORDER_SELL' || transaction.type === 'COINBOX_INTEREST' ? 'text-[#03856E]' : 
                      transaction.type === 'WITHDRAWAL' || transaction.type === 'ORDER_BUY' || transaction.type === 'COINBOX_SAVE' ? 'text-[#ED1551]' : 
                      'text-[#2D3541]'
                    }`}
                    style={{ fontFamily: "Hana2-Bold, sans-serif" }}
                  >
                    {transaction.type === 'DEPOSIT' || transaction.type === 'ORDER_SELL' || transaction.type === 'COINBOX_INTEREST' ? '+' : '-'}
                    {Math.abs(transaction.amount).toLocaleString('ko-KR')}원
                  </div>
                  <div 
                    className="text-[12px] text-[#666]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    잔액: {transaction.balance?.toLocaleString('ko-KR')}원
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
                거래 내역이 없습니다
              </div>
              <div 
                className="text-[12px] text-[#CCC] mt-1"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                투자를 통해 거래 내역을 쌓아보세요
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
