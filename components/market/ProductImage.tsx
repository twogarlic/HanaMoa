"use client"

import React from "react"
import Image from "next/image"
import { Heart } from "lucide-react"

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

interface ProductImageProps {
  product: Product
}

export default function ProductImage({ product }: ProductImageProps) {
  return (
    <div className="space-y-4">
      <div className="relative h-[400px] bg-[#F8F9FA] rounded-[12px] overflow-hidden">
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
          <div className="w-[200px] h-[200px] bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center">
            <span className="text-[80px]">GOLD</span>
          </div>
        </div>
        
        <div className="absolute top-4 left-4 flex gap-2">
          {product.isNew && (
            <span className="px-3 py-1 bg-[#ED1551] text-white text-[12px] rounded-full" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
              NEW
            </span>
          )}
          {product.isPopular && (
            <span className="px-3 py-1 bg-[#03856E] text-white text-[12px] rounded-full" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
              인기
            </span>
          )}
        </div>

        <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Heart className="w-5 h-5 text-[#666]" />
        </button>
      </div>
    </div>
  )
}
