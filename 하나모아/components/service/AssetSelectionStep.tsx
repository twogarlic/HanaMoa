"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronRight as RightChevron, Plus, Minus } from "lucide-react"

interface Asset {
  id: string
  type: 'gold' | 'silver' | 'forex'
  amount: number
  unit: string
  name: string
  currentPrice: number
  totalValue: number
}

interface AssetSelectionStepProps {
  userAssets: Asset[]
  selectedAssetType: string | null
  selectedAssetUnit: string | null
  selectedAmount: number
  selectedAmountInput: string
  isMobile: boolean
  onAssetTypeSelect: (type: string) => void
  onAssetUnitSelect: (unit: string) => void
  onAmountChange: (amount: number) => void
  onAmountInputChange: (value: string) => void
  onComplete: () => void
}

export default function AssetSelectionStep({
  userAssets,
  selectedAssetType,
  selectedAssetUnit,
  selectedAmount,
  selectedAmountInput,
  isMobile,
  onAssetTypeSelect,
  onAssetUnitSelect,
  onAmountChange,
  onAmountInputChange,
  onComplete
}: AssetSelectionStepProps) {
  const adjustAmount = (delta: number) => {
    const newValue = Math.max(0, selectedAmount + delta)
    onAmountChange(newValue)
    onAmountInputChange(newValue > 0 ? newValue.toLocaleString() : "")
  }

  const handleAmountInputChange = (value: string) => {
    const filteredValue = value.replace(/[^0-9]/g, '')
    onAmountInputChange(filteredValue)
    const numericValue = parseFloat(filteredValue) || 0
    onAmountChange(numericValue)
  }

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'gap-12'} h-full`}>
      <div className="flex-1 flex flex-col h-full">
        <div className={`${isMobile ? 'mt-0 mb-4' : 'mt-6 mb-4 ml-12'}`}>
          <span 
            className="text-[15px] text-[#333333]" 
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            수령하실 자산 유형을 선택해주세요.
          </span>
        </div>

        <div className={`flex gap-4 mb-6 overflow-x-auto pb-2 ${isMobile ? '' : 'ml-12'}`}>
          {['gold', 'silver', 'usd', 'eur', 'jpy', 'cny'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onAssetTypeSelect(type)}
              className={`p-4 rounded-[15px] border-2 transition-all flex-shrink-0 ${isMobile ? 'w-24' : 'w-32'} ${
                selectedAssetType === type
                  ? 'border-[#03856E]'
                  : 'border-[#E9ECEF] hover:border-[#03856E]'
              }`}
            >
              <div className="text-center">
                <div className={`relative ${isMobile ? 'w-8 h-8' : 'w-12 h-12'} mx-auto mb-2`}>
                  <Image 
                    src={type === 'gold' ? "/images/ic_market_gold.png" : 
                          type === 'silver' ? "/images/ic_market_silver.png" : 
                          "/images/ic_market_money.png"} 
                    alt={type.toUpperCase()} 
                    fill 
                    className="object-contain" 
                  />
                </div>
                <div 
                  className={`${isMobile ? 'text-[12px]' : 'text-[14px]'} font-medium`}
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                >
                  {type.toUpperCase()}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedAssetType && (
          <div className={`mb-6 ${isMobile ? '' : 'ml-12'}`}>
            <div className="mb-4">
              <span 
                className="text-[15px] text-[#333333]" 
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                보유 자산
              </span>
            </div>
            
            <div className={`flex gap-4 mb-6 overflow-x-auto pb-2`}>
              {userAssets
                .filter(asset => {
                  if (selectedAssetType === 'gold' || selectedAssetType === 'silver') {
                    return asset.type === selectedAssetType
                  } else if (['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType)) {
                    return asset.type === 'forex' && asset.unit.toLowerCase().includes(selectedAssetType)
                  }
                  return false
                })
                .map((asset) => {
                  let displayUnit = asset.unit
                  if (asset.unit.toLowerCase().includes('goldg')) {
                    displayUnit = asset.unit.replace(/goldg/gi, 'g')
                  } else if (asset.unit.toLowerCase().includes('silverg')) {
                    displayUnit = asset.unit.replace(/silverg/gi, 'g')
                  }
                  
                  return (
                    <div key={asset.id} className={`p-4 rounded-[15px] border-2 border-[#03856E] flex-shrink-0 ${isMobile ? 'w-24' : 'w-32'}`}>
                      <div className="text-center">
                        <div 
                          className={`${isMobile ? 'text-[12px]' : 'text-[14px]'} font-medium mb-1`}
                          style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                        >
                          {asset.amount}{displayUnit}
                        </div>
                      </div>
                    </div>
                  )
                })
              }
              
              {userAssets.filter(asset => {
                if (selectedAssetType === 'gold' || selectedAssetType === 'silver') {
                  return asset.type === selectedAssetType
                } else if (['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType)) {
                  return asset.type === 'forex' && asset.unit.toLowerCase().includes(selectedAssetType)
                }
                return false
              }).length === 0 && (
                <div className="p-4 bg-[#ED1551] rounded-[10px] text-center">
                  <div 
                    className="text-[14px] text-[#FFFFFF]"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    보유하신 {selectedAssetType === 'gold' ? '골드바' : selectedAssetType === 'silver' ? '실버바' : selectedAssetType.toUpperCase()}가 없습니다.
                  </div>
                </div>
              )}
            </div>

            <div className={`mb-4`}>
              <span 
                className="text-[15px] text-[#333333]" 
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                {['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType) 
                  ? `수령하실 ${selectedAssetType.toUpperCase()} 금액을 입력해주세요.`
                  : `수령하실 ${selectedAssetType === 'gold' ? '골드바' : '실버바'} 단위를 선택해주세요.`
                }
              </span>
            </div>
            
            {['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType) ? (
              <div className={`max-w-md`}>
                <div className={`${isMobile ? 'w-full' : 'w-[212px]'} h-[34px] border border-[#E6E6E6] rounded-[10px] flex items-center px-2 bg-white`}>
                  <div className="flex-1 flex items-center min-w-0">
                    <input
                      type="text"
                      value={selectedAmountInput ? `${selectedAmountInput}${selectedAssetType.toUpperCase()}` : ""}
                      placeholder={`0${selectedAssetType.toUpperCase()}`}
                      onChange={(e) => {
                        const value = e.target.value.replace(selectedAssetType.toUpperCase(), '')
                        handleAmountInputChange(value)
                      }}
                      className={`text-[13px] text-left focus:outline-none bg-transparent flex-1 ${
                        selectedAmountInput ? 'text-[#2D3541]' : 'text-[#999999]'
                      }`}
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => adjustAmount(-1)}
                      className="p-1 text-[#818898] hover:text-[#03856E] transition-colors"
                      aria-label="금액 줄이기"
                      title="금액 -1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustAmount(1)}
                      className="p-1 text-[#818898] hover:text-[#03856E] transition-colors"
                      aria-label="금액 늘리기"
                      title="금액 +1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex gap-4 overflow-x-auto pb-2`}>
                {(selectedAssetType === 'gold' 
                    ? ['1g', '3.75g', '5g', '37.5g', '100g', '1kg']
                    : ['100g', '1kg']
                ).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => onAssetUnitSelect(unit)}
                    className={`p-4 rounded-[15px] border-2 transition-all flex-shrink-0 ${isMobile ? 'w-24' : 'w-32'} ${
                      selectedAssetUnit === unit
                          ? 'border-[#03856E]'
                        : 'border-[#E9ECEF] hover:border-[#03856E]'
                    }`}
                  >
                    <div className="text-center">
                      <div 
                          className={`${isMobile ? 'text-[12px]' : 'text-[14px]'} font-medium`}
                        style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                      >
                        {unit}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedAssetType && (
          (['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType) ? selectedAmount > 0 : selectedAssetUnit)
        ) && (
          <div className="flex justify-end mt-auto">
            <button
              onClick={onComplete}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-[#03856E] text-white hover:bg-[#026B5A] hover:scale-105"
            >
              <RightChevron className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
