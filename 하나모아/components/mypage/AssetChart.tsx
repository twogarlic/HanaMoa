"use client"

import React, { useState } from "react"

interface AssetChartProps {
  holdings: any[]
  isLoadingHoldings: boolean
}

export default function AssetChart({ holdings, isLoadingHoldings }: AssetChartProps) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    data: any
  }>({ visible: false, x: 0, y: 0, data: null })

  const calculateAssetRatios = () => {
    if (!holdings || holdings.length === 0) {
      return []
    }
    
    const totalValue = holdings.reduce((sum, holding) => {
      const value = holding.currentValue || 0
      return sum + value
    }, 0)
        
    const filteredHoldings = holdings.filter(holding => {
      const value = holding.currentValue || 0
      return value > 0
    })
        
    return filteredHoldings
      .map(holding => ({
        ...holding,
        assetType: holding.asset, 
        percentage: (holding.currentValue / totalValue) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage)
  }

  const getAssetTypeText = (type: string) => {
    switch (type) {
      case 'gold': return 'GOLD'
      case 'silver': return 'SILVER'
      case 'usd': return 'USD'
      case 'eur': return 'EUR'
      case 'jpy': return 'JPY'
      case 'cny': return 'CNY'
      default: return type
    }
  }

  const getAssetColor = (type: string, index: number) => {
    const assetColors: { [key: string]: string } = {
      'gold': '#FC7056',    
      'silver': '#FED562',  
      'usd': '#4DD6B2',     
      'eur': '#5E9EF3',     
      'cny': '#26445E',     
      'jpy': '#AF9FE1'   
    }
    return assetColors[type] || '#03856E' 
  }

  const formatQuantity = (asset: any) => {
    const quantity = asset.quantity || 0
    const unit = asset.asset === 'gold' || asset.asset === 'silver' ? 'g' : 
                 asset.asset === 'usd' ? 'USD' :
                 asset.asset === 'eur' ? 'EUR' :
                 asset.asset === 'jpy' ? 'JPY' :
                 asset.asset === 'cny' ? 'CNY' : ''
    
    return `${quantity.toLocaleString()}${unit}`
  }

  const handleAssetMouseEnter = (e: React.MouseEvent, data: any) => {
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

  const handleAssetMouseMove = (e: React.MouseEvent) => {
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

  const handleAssetMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, data: null })
  }

  const DonutChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) return null

    const outerRadius = 80
    const innerRadius = 50
    const centerX = 100
    const centerY = 100
    let cumulativePercentage = 0

    return (
      <div 
        className="relative w-[200px] h-[200px] mx-auto"
        onMouseLeave={handleAssetMouseLeave}
      >
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 200 200"
        >
          {data.map((item, index) => {
            const percentage = item.percentage
            const startAngle = (cumulativePercentage / 100) * 360 - 90
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360 - 90
            
            const startAngleRad = (startAngle * Math.PI) / 180
            const endAngleRad = (endAngle * Math.PI) / 180
            
            const x1 = centerX + outerRadius * Math.cos(startAngleRad)
            const y1 = centerY + outerRadius * Math.sin(startAngleRad)
            const x2 = centerX + outerRadius * Math.cos(endAngleRad)
            const y2 = centerY + outerRadius * Math.sin(endAngleRad)
            
            const x3 = centerX + innerRadius * Math.cos(endAngleRad)
            const y3 = centerY + innerRadius * Math.sin(endAngleRad)
            const x4 = centerX + innerRadius * Math.cos(startAngleRad)
            const y4 = centerY + innerRadius * Math.sin(startAngleRad)
            
            const largeArcFlag = percentage > 50 ? 1 : 0
            
            const pathData = [
              `M ${x1} ${y1}`,
              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `L ${x3} ${y3}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
              'Z'
            ].join(' ')
            
            cumulativePercentage += percentage
            
            return (
              <path
                key={item.assetType}
                d={pathData}
                fill={getAssetColor(item.assetType, index)}
                stroke="white"
                strokeWidth="2"
                onMouseEnter={(e) => handleAssetMouseEnter(e, item)}
                onMouseMove={handleAssetMouseMove}
                onMouseLeave={handleAssetMouseLeave}
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                style={{
                  filter: tooltip.data?.assetType === item.assetType ? 'brightness(1.1)' : 'none'
                }}
              />
            )
          })}
        </svg>
        
        {tooltip.visible && tooltip.data && (
          <div
            className="absolute z-30 bg-black/75 text-white text-xs px-2 py-1 rounded pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y
            }}
          >
            <div className="text-center">
              <div 
                className="text-[12px] font-medium mb-1"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                {getAssetTypeText(tooltip.data.assetType)}
              </div>
              <div 
                className="text-[11px]"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                {formatQuantity(tooltip.data)}
              </div>
              <div 
                className="text-[10px] text-gray-300"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                {tooltip.data.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoadingHoldings) {
    return (
      <div className="bg-white rounded-[10px] shadow-md p-6 mb-6 min-h-[500px] flex flex-col">
        <h3 className="text-[18px] text-[#2D3541] mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
          보유 자산 비율
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
              자산 정보를 불러오는 중...
            </span>
          </div>
        </div>
      </div>
    )
  }

  const assetRatios = calculateAssetRatios()

  return (
    <div className="bg-white rounded-[10px] shadow-md p-6 mb-6 min-h-[500px] flex flex-col">
      <h3 className="text-[18px] text-[#2D3541] mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
        보유 자산 비율
      </h3>
      
      {assetRatios.length > 0 ? (
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <DonutChart data={assetRatios} />
          </div>
          
          <div className="flex-1 w-full">
            <div className="space-y-3">
              {assetRatios.map((asset, index) => (
                <div key={asset.assetType} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getAssetColor(asset.assetType, index) }}
                    ></div>
                    <div className="flex flex-col">
                      <span 
                        className="text-[14px] text-[#2D3541]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        {getAssetTypeText(asset.assetType)}
                      </span>
                      <span 
                        className="text-[12px] text-[#999]"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        {formatQuantity(asset)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-[14px] text-[#2D3541]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {asset.percentage.toFixed(1)}%
                    </div>
                    <div 
                      className="text-[12px] text-[#666]"
                      style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                    >
                      {(Math.round((asset.currentValue || 0) * 100) / 100).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div 
              className="text-[14px] text-[#999]"
              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
            >
              보유한 자산이 없습니다
            </div>
            <div 
              className="text-[12px] text-[#CCC] mt-1"
              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
            >
              투자를 통해 자산을 쌓아보세요
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
