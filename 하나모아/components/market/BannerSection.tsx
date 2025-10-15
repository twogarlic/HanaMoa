"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"

export default function BannerSection() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const banners = ["/images/ic_banner.svg", "/images/ic_banner2.svg"]
  
  const extendedBanners = [...banners, banners[0]]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentBannerIndex((prevIndex) => {
          const nextIndex = prevIndex + 1
          if (nextIndex >= banners.length) {
            setTimeout(() => {
              setCurrentBannerIndex(0)
              setIsTransitioning(false)
            }, 500) 
            return banners.length 
          }
          setIsTransitioning(false)
          return nextIndex
        })
      }, 50)
    }, 3000) 

    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <div className="mb-8">
      <div className="relative w-full h-[200px] sm:h-[250px] lg:h-[300px] rounded-[12px] overflow-hidden">
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
                width={1200}
                height={300}
                className="w-full h-full object-contain sm:object-cover"
              />
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setCurrentBannerIndex(index)
                  setIsTransitioning(false)
                }, 50)
              }}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-300 ${
                index === (currentBannerIndex % banners.length) ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`배너 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
