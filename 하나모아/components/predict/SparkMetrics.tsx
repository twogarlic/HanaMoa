"use client"

import React, { useState } from "react"

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

interface SparkMetricsProps {
  sparkAnalysis: SparkAnalysis | null
  isSparkLoading: boolean
  sparkError: string | null
  showSparkAnalysis: boolean
  onToggleSparkAnalysis: () => void
}

export default function SparkMetrics({ 
  sparkAnalysis, 
  isSparkLoading, 
  sparkError, 
  showSparkAnalysis, 
  onToggleSparkAnalysis 
}: SparkMetricsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const handleTooltipToggle = (metric: string) => {
    setActiveTooltip(activeTooltip === metric ? null : metric)
  }

  const metricDescriptions = {
    var: "VaR (Value at Risk)은 투자/자본 손실 위험을 측정하는 지표입니다. VaR은 정상적인 시장 상황에서 특정 기간(예: 하루) 동안 특정 투자 상품이 얼마나 손실될 수 있는지(주어진 확률로) 추정합니다. VaR은 일반적으로 금융 업계의 기업과 규제 기관에서 발생 가능한 손실을 충당하는 데 필요한 자산 규모를 측정하는 데 사용됩니다.",
    sharpe: "샤프 비율(또는 샤프 지수 등)은 금융에서 투자성과를 평가함에 있어 해당 투자의 위험을 조정해 반영하는 방식이며, 윌리엄 F. 샤프(William F. Sharpe)의 이름을 따 명명되었습니다. 샤프 비율은 투자 자산 또는 매매 전략에서, 일반적으로 위험이라 불리는 편차 한 단위당 초과수익(또는 위험 프리미엄)을 측정합니다.",
    beta: "베타란 금융에서 개별 주식이나 포트폴리오의 위험을 나타내는 상대적인 지표입니다. 시장포트폴리오의 위험과 같은 기준이 되는 지표와의 상대적인 변동성비율등을 의미하며, CAPM등에 의해 개별자산과 포트폴리오의 위험을 측정하는 데 사용됩니다.",
    mdd: "'최대 손실률(Maximum Drawdown, MDD)' 또는 '최대 낙폭', '최대 손실폭', '최대 하락폭'은 주식 투자에서 손실 가능한 최대 수준을 말합니다. 주식 투자 및 기타 형태의 투자에서 중요한 위험 지표입니다. 최대 하락폭은 특정 기간 동안 투자 또는 포트폴리오 가치의 최고점에서 최저점까지의 최대 하락폭을 측정하며 일반적으로 백분율로 표시됩니다. 특정 기간 동안 투자에서 발생할 수 있는 잠재적 손실에 대한 대책을 세울때 필수적입니다."
  }

  return (
    <div className="mb-6">
      <button
        onClick={onToggleSparkAnalysis}
        className="w-full py-3 px-4 bg-gradient-to-r from-[#03856E] to-[#026B5A] text-white rounded-lg font-medium text-[14px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
      >
        <span>{showSparkAnalysis ? '고급 분석 숨기기' : '고급 분석 더보기'}</span>
      </button>

      {showSparkAnalysis && sparkAnalysis && !sparkError && (
        <div className="mb-6 p-4 bg-gradient-to-br from-[#F8FFFE] to-[#E8F5F3] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-bold text-[#03856E]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
              고급 금융 지표
            </h3>
            <span className="text-[10px] px-2 py-1 bg-[#03856E] text-white rounded-full" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              AI 분석
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg relative">
              <div className="flex items-center gap-1 mb-1">
                <div className="text-[11px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  VaR (95%)
                </div>
                <button
                  onClick={() => handleTooltipToggle('var')}
                  className="w-4 h-4 rounded-full bg-[#03856E] text-white flex items-center justify-center text-[10px] hover:bg-[#026B5A] transition-colors"
                  style={{ fontFamily: "Hana2-Bold, sans-serif" }}
                >
                  ?
                </button>
              </div>
              <div className="text-[16px] font-bold text-[#333]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                {sparkAnalysis.risk_metrics.var_95.toFixed(2)}%
              </div>
              {activeTooltip === 'var' && (
                <div className="absolute z-10 top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-[#03856E]/20">
                  <p className="text-[11px] text-[#333] leading-relaxed" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    {metricDescriptions.var}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-lg relative">
              <div className="flex items-center gap-1 mb-1">
                <div className="text-[11px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  Sharpe Ratio
                </div>
                <button
                  onClick={() => handleTooltipToggle('sharpe')}
                  className="w-4 h-4 rounded-full bg-[#03856E] text-white flex items-center justify-center text-[10px] hover:bg-[#026B5A] transition-colors"
                  style={{ fontFamily: "Hana2-Bold, sans-serif" }}
                >
                  ?
                </button>
              </div>
              <div className={`text-[16px] font-bold ${
                sparkAnalysis.risk_metrics.sharpe_ratio >= 1.0 ? 'text-[#03856E]' : 'text-[#FFA500]'
              }`} style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                {sparkAnalysis.risk_metrics.sharpe_ratio.toFixed(2)}
              </div>
              {activeTooltip === 'sharpe' && (
                <div className="absolute z-10 top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-[#03856E]/20">
                  <p className="text-[11px] text-[#333] leading-relaxed" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    {metricDescriptions.sharpe}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-lg relative">
              <div className="flex items-center gap-1 mb-1">
                <div className="text-[11px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  Beta
                </div>
                <button
                  onClick={() => handleTooltipToggle('beta')}
                  className="w-4 h-4 rounded-full bg-[#03856E] text-white flex items-center justify-center text-[10px] hover:bg-[#026B5A] transition-colors"
                  style={{ fontFamily: "Hana2-Bold, sans-serif" }}
                >
                  ?
                </button>
              </div>
              <div className={`text-[16px] font-bold ${
                sparkAnalysis.risk_metrics.beta < 1.0 ? 'text-[#03856E]' : 'text-[#ED1551]'
              }`} style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                {sparkAnalysis.risk_metrics.beta.toFixed(2)}
              </div>
              {activeTooltip === 'beta' && (
                <div className="absolute z-10 top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-[#03856E]/20">
                  <p className="text-[11px] text-[#333] leading-relaxed" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    {metricDescriptions.beta}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-lg relative">
              <div className="flex items-center gap-1 mb-1">
                <div className="text-[11px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  Max Drawdown
                </div>
                <button
                  onClick={() => handleTooltipToggle('mdd')}
                  className="w-4 h-4 rounded-full bg-[#03856E] text-white flex items-center justify-center text-[10px] hover:bg-[#026B5A] transition-colors"
                  style={{ fontFamily: "Hana2-Bold, sans-serif" }}
                >
                  ?
                </button>
              </div>
              <div className="text-[16px] font-bold text-[#ED1551]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                {sparkAnalysis.risk_metrics.max_drawdown.toFixed(2)}%
              </div>
              {activeTooltip === 'mdd' && (
                <div className="absolute z-10 top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-[#03856E]/20">
                  <p className="text-[11px] text-[#333] leading-relaxed" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    {metricDescriptions.mdd}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#03856E]/10">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                종합 리스크 레벨
              </span>
              <span className={`font-bold ${
                sparkAnalysis.risk_metrics.risk_level === '낮음' ? 'text-[#03856E]' :
                sparkAnalysis.risk_metrics.risk_level === '보통' ? 'text-[#FFA500]' :
                'text-[#ED1551]'
              }`} style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                {sparkAnalysis.risk_metrics.risk_level}
              </span>
            </div>
          </div>
        </div>
      )}

      {showSparkAnalysis && isSparkLoading && (
        <div className="mb-6 p-4 bg-[#F8FFFE] rounded-lg border border-[#03856E]/20">
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              분석 중...
            </span>
          </div>
        </div>
      )}

      {showSparkAnalysis && sparkError && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[14px] font-bold text-red-600" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
              분석 실패
            </span>
          </div>
          <p className="text-[11px] text-[#999] mt-2" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            일시적으로 사용할 수 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}
