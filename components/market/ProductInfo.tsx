"use client"

import React from "react"
import { Star, ShoppingCart } from "lucide-react"

type Product = {
  id: string
  name: string
  category: "goldbar" | "ring" | "bracelet" | "cutlery"
  price: number 
  image: string
  description: string
  material: string
  weight: number
  goldContent: number 
  rating: number
  reviewCount: number
  isNew: boolean
  isPopular: boolean
  processingFee: number
}

interface ProductInfoProps {
  product: Product
  selectedAmount: number
  availableGold: number
  onAmountChange: (amount: number) => void
  onExchange: () => void
}

const CATEGORIES = {
  goldbar: { label: "선물용 골드바" },
  ring: { label: "반지" },
  bracelet: { label: "팔찌" },
  cutlery: { label: "수저" }
}

export default function ProductInfo({
  product,
  selectedAmount,
  availableGold,
  onAmountChange,
  onExchange
}: ProductInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
          {CATEGORIES[product.category].label}
        </span>
      </div>

      <h1 className="text-[28px] text-[#2D3541]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
        {product.name}
      </h1>

      <p className="text-[16px] text-[#666] leading-relaxed" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
        {product.description}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-[#FFD700] fill-current" />
          <span className="text-[18px] text-[#666]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            {product.rating}
          </span>
        </div>
        <span className="text-[14px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
          ({product.reviewCount}개 리뷰)
        </span>
      </div>

      <div className="bg-[#F8F9FA] rounded-[12px] p-6 space-y-4">
        <h3 className="text-[18px] text-[#2D3541]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
          상품 정보
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              재질
            </span>
            <p className="text-[16px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              {product.material}
            </p>
          </div>
          <div>
            <span className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              무게
            </span>
            <p className="text-[16px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              {product.weight}g
            </p>
          </div>
          <div>
            <span className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              순금 함량
            </span>
            <p className="text-[16px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              {product.goldContent}g
            </p>
          </div>
          <div>
            <span className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              필요 금량
            </span>
            <p className="text-[16px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              {product.price}g
            </p>
          </div>
          <div>
            <span className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              가공비
            </span>
            <p className="text-[16px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              {product.processingFee.toLocaleString()}원
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[18px] text-[#2D3541]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
          수량 선택
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => onAmountChange(1)}
            className={`px-6 py-3 rounded-[8px] border-2 transition-colors ${
              selectedAmount === 1 
                ? 'border-[#03856E] bg-[#03856E] text-white' 
                : 'border-[#E6E6E6] bg-white text-[#666] hover:border-[#03856E]'
            }`}
            style={{ fontFamily: "Hana2-Bold, sans-serif" }}
          >
            1돈
          </button>
          <button
            onClick={() => onAmountChange(2)}
            className={`px-6 py-3 rounded-[8px] border-2 transition-colors ${
              selectedAmount === 2 
                ? 'border-[#03856E] bg-[#03856E] text-white' 
                : 'border-[#E6E6E6] bg-white text-[#666] hover:border-[#03856E]'
            }`}
            style={{ fontFamily: "Hana2-Bold, sans-serif" }}
          >
            2돈
          </button>
        </div>
      </div>

      <div className="bg-[#F0F9FF] rounded-[12px] p-6 space-y-3">
        <h3 className="text-[18px] text-[#2D3541]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
          교환 정보
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-[16px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            선택 수량
          </span>
          <span className="text-[18px] text-[#2D3541]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            {selectedAmount}돈
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[16px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            필요 금량
          </span>
          <span className="text-[18px] text-[#2D3541]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            {product.price * selectedAmount}g
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[16px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            가공비
          </span>
          <span className="text-[18px] text-[#2D3541]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            {(product.processingFee * selectedAmount).toLocaleString()}원
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[16px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            보유 금량
          </span>
          <span className="text-[18px] text-[#2D3541]" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
            {availableGold}g
          </span>
        </div>
        {availableGold < product.price * selectedAmount && (
          <div className="text-[14px] text-[#ED1551]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            보유 금량이 부족합니다
          </div>
        )}
      </div>

      <button
        onClick={onExchange}
        disabled={availableGold < product.price * selectedAmount}
        className="w-full h-[56px] rounded-[12px] text-[18px] transition-colors bg-[#03856E] hover:bg-[#026B5A] disabled:bg-[#E6E6E6] disabled:text-[#999] text-white flex items-center justify-center gap-3"
        style={{ fontFamily: "Hana2-Bold, sans-serif" }}
      >
        <ShoppingCart className="w-6 h-6" />
        교환하기
      </button>
    </div>
  )
}
