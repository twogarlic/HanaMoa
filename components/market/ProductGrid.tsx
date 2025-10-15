"use client"

import React from "react"
import ProductCard from "./ProductCard"

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

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            상품을 불러오는 중...
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-[18px] text-[#666] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
          검색 결과가 없습니다
        </h3>
        <p className="text-[14px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
          다른 검색어나 필터를 시도해보세요
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
