"use client"

import React from "react"
import Image from "next/image"
import SparkMetrics from "./SparkMetrics"

interface PortfolioAnalysis {
  totalValue: number
  totalInvestment: number
  totalProfitLoss: number
  totalProfitLossRatio: number
  diversification: {
    score: number
    level: string
    description: string
  }
  riskAnalysis: {
    level: string
    score: number
    description: string
    concentrationRisk: number
  }
  assetBreakdown: Array<{
    asset: string
    assetName: string
    quantity: number
    currentValue: number
    percentage: number
    profitLoss: number
    profitLossRatio: number
  }>
  recommendations: Array<{
    type: string
    title: string
    description: string
    priority: string
  }>
}

interface SparkAnalysis {
  portfolio_summary: {
    total_value: number
    total_investment: number
    total_profit_loss: number
    portfolio_return: number
    asset_count: number
  }
  risk_metrics: {
    var_95: number
    sharpe_ratio: number
    beta: number
    max_drawdown: number
    risk_level: string
  }
  diversification: {
    score: number
    level: string
  }
  asset_allocation: Array<{
    asset: string
    value: number
    weight: number
  }>
}

interface PortfolioAnalysisProps {
  portfolioAnalysis: PortfolioAnalysis | null
  isPortfolioLoading: boolean
  portfolioError: string | null
  sparkAnalysis: SparkAnalysis | null
  isSparkLoading: boolean
  sparkError: string | null
  showSparkAnalysis: boolean
  onRetry: () => void
  onToggleSparkAnalysis: () => void
}

export default function PortfolioAnalysis({
  portfolioAnalysis,
  isPortfolioLoading,
  portfolioError,
  sparkAnalysis,
  isSparkLoading,
  sparkError,
  showSparkAnalysis,
  onRetry,
  onToggleSparkAnalysis
}: PortfolioAnalysisProps) {
  if (isPortfolioLoading) {
    return (
      <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-[17px] font-bold text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            포트폴리오
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            포트폴리오 분석 중...
          </div>
        </div>
      </div>
    )
  }

  if (portfolioError) {
    return (
      <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-[17px] font-bold text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            포트폴리오
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-[16px] text-red-600 mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            {portfolioError}
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

  if (!portfolioAnalysis) {
    return (
      <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-[17px] font-bold text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            포트폴리오
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#F2F3F5] rounded-full flex items-center justify-center">
            <Image 
              src="/images/ic_market_gold.png" 
              alt="포트폴리오" 
              width={40} 
              height={40}
              className="opacity-50"
            />
          </div>
          <div className="text-[16px] text-[#666] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            포트폴리오 분석 준비 중...
          </div>
          <div className="text-[14px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            잠시만 기다려주세요
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-[17px] font-bold text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
          포트폴리오
        </h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-[#F8FFFE] rounded-lg">
          <div className="text-[12px] text-[#666] mb-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            총 자산가치
          </div>
          <div className="text-[18px] font-bold text-[#333]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            {portfolioAnalysis.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원
          </div>
        </div>
        <div className="text-center p-4 bg-[#F8FFFE] rounded-lg">
          <div className="text-[12px] text-[#666] mb-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            총 수익률
          </div>
          <div className={`text-[18px] font-bold ${portfolioAnalysis.totalProfitLossRatio >= 0 ? 'text-[#ED1551]' : 'text-[#1B8FF0]'}`} 
               style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            {portfolioAnalysis.totalProfitLossRatio >= 0 ? '+' : ''}{portfolioAnalysis.totalProfitLossRatio.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] font-medium text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            분산투자 점수
          </span>
          <span className="text-[14px] font-bold text-[#03856E]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            {portfolioAnalysis.diversification.score}점 ({portfolioAnalysis.diversification.level})
          </span>
        </div>
        <div className="w-full bg-[#F2F3F5] rounded-full h-2 mb-2">
          <div 
            className="bg-[#03856E] h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(portfolioAnalysis.diversification.score, 100)}%` }}
          ></div>
        </div>
        <p className="text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
          {portfolioAnalysis.diversification.description}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] font-medium text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            리스크 수준
          </span>
          <span className={`text-[14px] font-bold ${
            portfolioAnalysis.riskAnalysis.level === '낮음' ? 'text-[#03856E]' :
            portfolioAnalysis.riskAnalysis.level === '보통' ? 'text-[#FFA500]' :
            'text-[#ED1551]'
          }`} style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            {portfolioAnalysis.riskAnalysis.level}
          </span>
        </div>
        <p className="text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
          {portfolioAnalysis.riskAnalysis.description}
        </p>
      </div>

      <SparkMetrics
        sparkAnalysis={sparkAnalysis}
        isSparkLoading={isSparkLoading}
        sparkError={sparkError}
        showSparkAnalysis={showSparkAnalysis}
        onToggleSparkAnalysis={onToggleSparkAnalysis}
      />

      {portfolioAnalysis.assetBreakdown.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[14px] font-medium text-[#333] mb-3" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            자산 구성
          </h3>
          <div className="space-y-2">
            {portfolioAnalysis.assetBreakdown.map((asset, index) => (
              <div key={asset.asset} className="flex items-center justify-between p-3 bg-[#F8FFFE] rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ 
                      backgroundColor: ['#FC7056', '#FED562', '#4DD6B2', '#5E9EF3', '#26445E', '#AF9FE1'][index % 6]
                    }}
                  ></div>
                  <div>
                    <div className="text-[14px] font-medium text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      {asset.assetName}
                    </div>
                    <div className="text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      {asset.quantity.toLocaleString()}{asset.asset === 'gold' || asset.asset === 'silver' ? 'g' : asset.asset}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-medium text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                    {asset.percentage.toFixed(1)}%
                  </div>
                  <div className={`text-[12px] ${asset.profitLossRatio >= 0 ? 'text-[#ED1551]' : 'text-[#1B8FF0]'}`} 
                       style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    {asset.profitLossRatio >= 0 ? '+' : ''}{asset.profitLossRatio.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {portfolioAnalysis.recommendations.length > 0 && (
        <div>
          <h3 className="text-[14px] font-medium text-[#333] mb-3" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            AI 개선 제안
          </h3>
          <div className="space-y-3">
            {portfolioAnalysis.recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-[#F8FFFE] rounded-lg border-l-4 border-[#03856E]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[14px] font-medium text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                    {rec.title}
                  </h4>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${
                    rec.priority === 'high' ? 'bg-[#ED1551] text-white' :
                    rec.priority === 'medium' ? 'bg-[#FFA500] text-white' :
                    'bg-[#03856E] text-white'
                  }`} style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    {rec.priority === 'high' ? '높음' : rec.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
                <p className="text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
