"use client"

import React from "react"
import Image from "next/image"
import { Heart, Star } from "lucide-react"
import { useRouter } from "next/navigation"

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
}

interface ProductCardProps {
  product: Product
}

const CATEGORIES = {
  goldbar: { label: "선물용 골드바" },
  ring: { label: "반지" },
  bracelet: { label: "팔찌" },
  cutlery: { label: "수저" }
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()

  return (
    <div 
      className="bg-white rounded-[12px] shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => {
        router.push(`/market/${product.id}`)
      }}
    >
      <div className="relative h-[200px] bg-[#F8F9FA]">
        <Image 
          src={product.image} 
          alt={product.name} 
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
          <div className="w-[120px] h-[120px] bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center">
            <span className="text-[48px]">GOLD</span>
          </div>
        </div>
        
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isNew && (
            <span className="px-2 py-1 bg-[#ED1551] text-white text-[10px] rounded-full" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
              NEW
            </span>
          )}
          {product.isPopular && (
            <span className="px-2 py-1 bg-[#03856E] text-white text-[10px] rounded-full" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
              인기
            </span>
          )}
        </div>

        <button 
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            console.log('찜하기:', product.id)
          }}
        >
          <Heart className="w-4 h-4 text-[#666]" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span className="text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            {CATEGORIES[product.category].label}
          </span>
        </div>

        <h3 className="text-[16px] text-[#2D3541] mb-2 line-clamp-2" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
          {product.name}
        </h3>

        <p className="text-[13px] text-[#666] mb-3 line-clamp-2" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
          {product.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[#FFD700] fill-current" />
            <span className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              {product.rating}
            </span>
          </div>
          <span className="text-[12px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            ({product.reviewCount})
          </span>
        </div>
      </div>
    </div>
  )
}
