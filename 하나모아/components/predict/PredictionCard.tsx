"use client"

import React from "react"
import Image from "next/image"

interface PredictionResult {
  direction: string
  confidence: number
  probability: number
  nextDayPrediction: number
  basedOnDays: number
  lastUpdateDate: string
}

interface PredictionCardProps {
  prediction: PredictionResult | null
  error: string | null
  isLoading: boolean
  onRetry: () => void
}

export default function PredictionCard({ prediction, error, isLoading, onRetry }: PredictionCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-8 mb-12">
        <div className="mb-6">
          <h2 className="text-[17px] font-bold text-[#333] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            금 가격 예측
          </h2>
          <p className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            하나모아의 AI가 예측한 내일의 금 가격
          </p>
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            예측 데이터를 불러오는 중...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-8 mb-12">
        <div className="mb-6">
          <h2 className="text-[17px] font-bold text-[#333] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            금 가격 예측
          </h2>
          <p className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            하나모아의 AI가 예측한 내일의 금 가격
          </p>
        </div>
        <div className="text-center py-8">
          <div className="text-[16px] text-red-600 mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            {error}
          </div>
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-[#03856E] text-white rounded text-[14px] hover:bg-[#026B5A] transition-colors"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-8 mb-12">
        <div className="mb-6">
          <h2 className="text-[17px] font-bold text-[#333] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            금 가격 예측
          </h2>
          <p className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            하나모아의 AI가 예측한 내일의 금 가격
          </p>
        </div>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#F2F3F5] rounded-full flex items-center justify-center">
            <Image 
              src="/images/ic_market_gold.png" 
              alt="금" 
              width={40} 
              height={40}
              className="opacity-50"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-8 mb-12">
      <div className="mb-6">
        <h2 className="text-[17px] font-bold text-[#333] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
          금 가격 예측
        </h2>
        <p className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
          하나모아의 AI가 예측한 내일의 금 가격
        </p>
      </div>
      
      <div className="text-center">
        <div className="mb-6">
          <div className="relative w-40 h-40 mx-auto mb-4 mt-8">
            <Image 
              src={prediction.direction === '상승' ? "/images/ic_sunny.png" : "/images/ic_night.png"} 
              alt={prediction.direction === '상승' ? '상승' : '하락'} 
              fill 
              className="object-contain" 
            />
          </div>
          
          <div className="text-[15px] font-bold mb-32 mt-8" style={{ 
            fontFamily: "Hana2-Regular, sans-serif",
            color: prediction.direction === '상승' ? '#888' : '#888'
          }}>
            {prediction.direction === '상승' ? '맑은 날씨가' : '흐린 날씨가'} 예상돼요
          </div>
        </div>
      </div>
    </div>
  )
}
