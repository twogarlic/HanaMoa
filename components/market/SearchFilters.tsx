"use client"

import React, { useState, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"

interface SearchFiltersProps {
  searchQuery: string
  selectedCategory: string
  sortBy: "price" | "rating" | "popularity"
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string) => void
  onSortChange: (sort: "price" | "rating" | "popularity") => void
}

const CATEGORIES = {
  goldbar: { label: "선물용 골드바" },
  ring: { label: "반지" },
  bracelet: { label: "팔찌" },
  cutlery: { label: "수저" }
}

export default function SearchFilters({
  searchQuery,
  selectedCategory,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onSortChange
}: SearchFiltersProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.category-dropdown') && !target.closest('.sort-dropdown')) {
        setIsCategoryOpen(false)
        setIsSortOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#999] w-5 h-5" />
          <input
            type="text"
            placeholder="상품명 또는 설명으로 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-[48px] pl-10 pr-4 border border-[#E6E6E6] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#03856E]/30 text-[14px]"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          />
        </div>

        <div className="sm:w-[180px] relative category-dropdown">
          <button
            type="button"
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen)
              setIsSortOpen(false)
            }}
            className="w-full h-[48px] px-3 border border-[#E6E6E6] rounded-[12px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#03856E]/30 flex items-center justify-between bg-white"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            <span className="text-[#2D3541]">
              {selectedCategory === "all" ? "전체 카테고리" : CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.label}
            </span>
            <ChevronDown className={`w-4 h-4 text-[#818898] transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isCategoryOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E6E6E6] rounded-[10px] shadow-lg z-50">
              <button
                type="button"
                onClick={() => {
                  onCategoryChange("all")
                  setIsCategoryOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-[13px] text-[#2D3541] hover:bg-[#F8F9FA] first:rounded-t-[10px] last:rounded-b-[10px] transition-colors"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                전체 카테고리
              </button>
              {Object.entries(CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onCategoryChange(key)
                    setIsCategoryOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-[13px] text-[#2D3541] hover:bg-[#F8F9FA] first:rounded-t-[10px] last:rounded-b-[10px] transition-colors"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sm:w-[120px] relative sort-dropdown">
          <button
            type="button"
            onClick={() => {
              setIsSortOpen(!isSortOpen)
              setIsCategoryOpen(false)
            }}
            className="w-full h-[48px] px-3 border border-[#E6E6E6] rounded-[12px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#03856E]/30 flex items-center justify-between bg-white"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            <span className="text-[#2D3541]">
              {sortBy === "popularity" ? "인기순" : sortBy === "rating" ? "평점순" : "가격순"}
            </span>
            <ChevronDown className={`w-4 h-4 text-[#818898] transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSortOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E6E6E6] rounded-[10px] shadow-lg z-50">
              {[
                { value: "popularity", label: "인기순" },
                { value: "rating", label: "평점순" },
                { value: "price", label: "가격순" }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSortChange(option.value as any)
                    setIsSortOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-[13px] text-[#2D3541] hover:bg-[#F8F9FA] first:rounded-t-[10px] last:rounded-b-[10px] transition-colors"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
