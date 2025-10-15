import Image from "next/image"

interface LoadingOverlayProps {
  isVisible: boolean
}

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center">
        {/* 회전하는 원 애니메이션 */}
        <div className="relative">
          <div className="w-32 h-32 border-4 border-gray-200 border-t-[#03856E] rounded-full animate-spin"></div>
          
          {/* 중앙의 로딩 이미지 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 relative">
              <Image 
                src="/images/ic_loading.png" 
                alt="Loading" 
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
