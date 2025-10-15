"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"

export default function BannerSection() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const banners = [
    "/images/ic_banner3.svg",
    "/images/ic_banner4.svg"
  ]
  
  const extendedBanners = [...banners, banners[0]]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        if (nextIndex >= banners.length) {
          setTimeout(() => {
            setCurrentBannerIndex(0)
            setIsTransitioning(false)
          }, 500)
          setIsTransitioning(true)
          return banners.length
        }
        return nextIndex
      })
    }, 3000) 

    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <div className="bg-white rounded-[10px] mt-6 h-[280px] flex flex-col">
      <div className="flex-1 relative overflow-hidden rounded-[8px]">
        <div 
          className="flex h-full"
          style={{ 
            transform: `translateX(-${currentBannerIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
          }}
        >
          {extendedBanners.map((banner, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 flex justify-center items-center">
              <Image 
                src={banner} 
                alt={`상품교환 배너 ${index + 1}`} 
                width={400}
                height={200}
                className="w-full h-full object-cover rounded-[8px]"
              />
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentBannerIndex(index)
                setIsTransitioning(true)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
