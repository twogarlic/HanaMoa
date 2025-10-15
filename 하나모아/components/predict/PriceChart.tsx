"use client"

import React, { useState } from "react"

interface PriceHistory {
  date: string
  close: number
  diff: number
  ratio: number
}

interface Tooltip {
  visible: boolean
  x: number
  y: number
  data: any
}

interface PriceChartProps {
  priceHistory: PriceHistory[]
  isLoading: boolean
}

export default function PriceChart({ priceHistory, isLoading }: PriceChartProps) {
  const [tooltip, setTooltip] = useState<Tooltip>({
    visible: false,
    x: 0,
    y: 0,
    data: null
  })

  const handlePointMouseEnter = (e: React.MouseEvent<SVGCircleElement>, data: PriceHistory) => {
    const chartContainer = e.currentTarget.closest('.relative')
    if (!chartContainer) return
    
    const containerRect = chartContainer.getBoundingClientRect()
    const mouseX = e.clientX - containerRect.left
    const mouseY = e.clientY - containerRect.top
    
    setTooltip({
      visible: true,
      x: mouseX,
      y: mouseY - 40,
      data: data
    })
  }

  const handlePointMouseMove = (e: React.MouseEvent<SVGCircleElement>) => {
    if (tooltip.visible) {
      const chartContainer = e.currentTarget.closest('.relative')
      if (!chartContainer) return
      
      const containerRect = chartContainer.getBoundingClientRect()
      const mouseX = e.clientX - containerRect.left
      const mouseY = e.clientY - containerRect.top
      
      setTooltip(prev => ({
        ...prev,
        x: mouseX,
        y: mouseY - 40
      }))
    }
  }

  const handlePointMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, data: null })
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-6 h-6 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    )
  }

  if (priceHistory.length === 0) {
    return (
      <div className="text-center py-8 text-[#999] text-[13px]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
        가격 이력을 불러올 수 없습니다
      </div>
    )
  }

  return (
    <div>
      <div className="relative w-full h-[200px] mb-4">
        <svg viewBox="0 0 900 200" className="w-full h-full">
          <defs>
            <linearGradient id="priceArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(3,133,110,0.3)" />
              <stop offset="100%" stopColor="rgba(3,133,110,0)" />
            </linearGradient>
          </defs>
          {(() => {
            const prices = [...priceHistory].reverse() 
            const minPrice = Math.min(...prices.map(p => p.close))
            const maxPrice = Math.max(...prices.map(p => p.close))
            const priceRange = maxPrice - minPrice || 1
            
            const points = prices.map((price: PriceHistory, index: number) => {
              const x = (index / (prices.length - 1)) * 900
              const y = 200 - ((price.close - minPrice) / priceRange) * 180 - 10
              return [x, y]
            })
            
            if (points.length < 2) return null
            
            const path = points.map((p: number[], i: number) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ")
            const area = `${path} L900,200 L0,200 Z`
            
            return (
              <g>
                <path d={area} fill="url(#priceArea)" opacity={0.5} />
                <path d={path} fill="none" stroke="#03856E" strokeWidth="2.5" />
                {points.map((point: number[], index: number) => (
                  <g key={index}>
                    <circle
                      cx={point[0]}
                      cy={point[1]}
                      r="8"
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e: React.MouseEvent<SVGCircleElement>) => handlePointMouseEnter(e, prices[index])}
                      onMouseMove={(e: React.MouseEvent<SVGCircleElement>) => handlePointMouseMove(e)}
                      onMouseLeave={handlePointMouseLeave}
                    />
                    <circle
                      cx={point[0]}
                      cy={point[1]}
                      r="4"
                      fill="#005044"
                      stroke="#005044"
                      strokeWidth="2"
                      style={{ pointerEvents: 'none' }}
                    />
                  </g>
                ))}
              </g>
            )
          })()}
        </svg>
        
        {tooltip.visible && tooltip.data && (
          <div
            className="absolute pointer-events-none z-30"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-black/75 text-white px-2 py-1 rounded text-xs"
                 style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              <div className="text-center">
                <div className="font-medium">
                  {(() => {
                    const date = new Date(tooltip.data.date)
                    const year = date.getFullYear().toString().slice(-2)
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    return `${year}/${month}/${day}`
                  })()}
                </div>
                <div className="text-[#03856E]">
                  {(tooltip.data.close / 100).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between px-2 mb-4">
        {priceHistory.slice().reverse().map((price, index) => {
          const date = new Date(price.date)
          const year = date.getFullYear().toString().slice(-2)
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return (
            <div key={index} className="text-[11px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              {`${year}/${month}/${day}`}
            </div>
          )
        })}
      </div>
      
      {priceHistory.length >= 2 && (
        <div className="pt-4 border-t border-[#F2F3F5] mt-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] text-[#666] mb-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                7일 전
              </div>
              <div className="text-[14px] font-bold text-[#333]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                {(priceHistory[priceHistory.length - 1].close / 100).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#666] mb-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                현재 ({(() => {
                  const date = new Date(priceHistory[0].date)
                  const year = date.getFullYear().toString().slice(-2)
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  return `${year}/${month}/${day}`
                })()})
              </div>
              <div className="text-[14px] font-bold text-[#333]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                {(priceHistory[0].close / 100).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F2F3F5] flex items-center justify-between">
            <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              7일간 변동률
            </span>
            {(() => {
              const weekChange = ((priceHistory[0].close - priceHistory[priceHistory.length - 1].close) / priceHistory[priceHistory.length - 1].close) * 100
              return (
                <span className={`text-[14px] font-bold ${weekChange >= 0 ? 'text-[#ED1551]' : 'text-[#1B8FF0]'}`}
                      style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                  {weekChange >= 0 ? '+' : ''}{weekChange.toFixed(2)}%
                </span>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
