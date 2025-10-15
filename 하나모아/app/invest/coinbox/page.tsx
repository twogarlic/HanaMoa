"use client"

import { ChevronRight, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "../../../components/NavigationBar"
import { useAuth } from "../../../hooks/use-auth"

export default function CoinboxPage() { 
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth: isAuthChecking } = useAuth()
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const [pdfConfirmed, setPdfConfirmed] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isCheckingCoinbox, setIsCheckingCoinbox] = useState(true)
  const [checks, setChecks] = useState({
    illegalTrade: false,
    depositProtection: false
  })

  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  const images = [
    { src: "/images/ic_coinbox.png", alt: "코인박스" },
    { src: "/images/ic_money_wing.png", alt: "돈" },
    { src: "/images/ic_diamond.png", alt: "다이아몬드" }
  ]

  useEffect(() => {
    const t = setTimeout(() => setIsInitialLoad(false), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const checkAuthAndCoinbox = async () => {
      try {
        if (!userInfo) {
          setIsCheckingCoinbox(false)
          return
        }
        
        const response = await fetch(`/api/coinbox?userId=${userInfo.id}`)
        const result = await response.json()
        
        if (result.success) {
          router.push('/invest/coinbox/manage')
        } else {
          setIsCheckingCoinbox(false)
        }
      } catch (error) {
        console.error('저금통 확인 오류:', error)
        setIsCheckingCoinbox(false)
      }
    }

    checkAuthAndCoinbox()
  }, [userInfo, router])

  const fetchAllNotifications = async () => {
    if (!userInfo) return
    
    setIsLoadingRequests(true)
    
    try {
      const [friendResponse, giftResponse, notifResponse] = await Promise.all([
        fetch(`/api/friends/request?userId=${userInfo.id}&type=received`),
        fetch(`/api/gifts?userId=${userInfo.id}&type=received`),
        fetch(`/api/notifications?userId=${userInfo.id}`)
      ])
      
      const [friendResult, giftResult, notifResult] = await Promise.all([
        friendResponse.json(),
        giftResponse.json(),
        notifResponse.json()
      ])
      
      if (friendResult.success) {
        setFriendRequests(friendResult.data || [])
      }
      
      if (giftResult.success) {
        setGiftRequests(giftResult.data || [])
      }

      if (notifResult.success) {
        setNotifications(notifResult.data || [])
        setUnreadNotificationCount(notifResult.data?.filter((n: any) => !n.isRead).length || 0)
      }
    } catch (error) {
    } finally {
      setIsLoadingRequests(false)
    }
  }

  useEffect(() => {
    if (userInfo) {
      fetchAllNotifications()
    }
  }, [userInfo])

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline'): Promise<void> => {
    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.')
    
    const response = await fetch(`/api/friends/request/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        userId: userInfo.id
      })
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || '친구 신청 처리에 실패했습니다.')
    }
    
    fetchAllNotifications()
  }

  const handleGiftRequest = async (giftId: string, action: 'accept' | 'decline' | 'detail'): Promise<void> => {
    if (action === 'detail') return

    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.')
    
    const response = await fetch(`/api/gifts/${giftId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        userId: userInfo.id
      })
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || '선물 처리에 실패했습니다.')
    }
    
    fetchAllNotifications()
  }

  const handleNotificationRead = async (notificationId: string) => {
    if (!userInfo) return
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: notificationId,
          userId: userInfo.id
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchAllNotifications()
      }
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length
        setTimeout(() => {
          setCurrentImageIndex(nextIndex)
        }, 1500)
        return -1 
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const fadeUp = isInitialLoad ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
  const commonEnter = `transition-all duration-700 ease-out ${fadeUp}`
  if (isCheckingCoinbox) {
    return (
      <div className="w-full bg-[#F5FBFA] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            저금통 상태를 확인하는 중...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#F5FBFA] min-h-screen">
      <NavigationBar
        friendRequestsCount={friendRequests.length}
        giftRequestsCount={giftRequests.length}
        friendRequests={friendRequests}
        giftRequests={giftRequests}
        notifications={notifications}
        unreadNotificationCount={unreadNotificationCount}
        isLoadingRequests={isLoadingRequests}
        onFriendRequest={handleFriendRequest}
        onGiftRequest={handleGiftRequest}
        onNotificationClick={fetchAllNotifications}
        onNotificationRead={handleNotificationRead}
      />

      <section className="pt-16">
        <div className="w-full h-[382px] bg-gradient-to-r from-[#03856E] to-[#005044]">
          <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-start pt-4">
            <div className={`text-white/90 text-sm mb-12 ${commonEnter}`} style={{ transitionDelay: "0.1s" }}>홈 &gt; 투자하기 &gt; 잔돈투자</div>
            <div className="flex flex-col items-center text-center">
            <div className={`text-white text-[28px] mb-1 ${commonEnter}`} style={{ fontFamily: "Hana2-Regular, sans-serif", transitionDelay: "0.2s" }}>
              조금씩 매일매일 쌓이는
            </div>
            <div className={`text-[38px] ${commonEnter}`} style={{ fontFamily: "Hana2-Medium, sans-serif", transitionDelay: "0.3s" }}>
              <span className="text-white">저</span>
              <span className="text-[#F7D753]">금</span>
              <span className="text-white">통</span>
            </div>
            </div>
            <div className={`relative -mb-16 z-10 flex justify-center ${commonEnter}`} style={{ transitionDelay: "0.4s" }}>
              <div className="relative w-[350px] h-[350px]">
                {images.map((image, index) => {
                  const isDiamond = image.src.includes('ic_diamond')
                  const imageSize = isDiamond ? 250 : 350
                  return (
                    <Image 
                      key={index}
                      src={image.src} 
                      alt={image.alt} 
                      width={imageSize} 
                      height={imageSize}
                      className={`object-contain transition-opacity duration-500 absolute top-0 left-0 ${
                        currentImageIndex === index ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transform: isDiamond ? 'translate(50px, 50px)' : 'translate(0, 0)'
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mt-40 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className={`flex items-center justify-center mt-8 ${commonEnter}`} style={{ transitionDelay: "0.5s" }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: "600px",
                height: "110px",
                background: "rgba(239, 239, 239, 0.9)",
                borderRadius: "30px",
              }}
            >
              <p
                style={{
                  fontFamily: "Hana2-Medium, sans-serif",
                  fontSize: "22px",
                  lineHeight: "31px",
                  color: "#666666",
                  textAlign: "center"
                }}
              >
                저금통은 천원 미만의 동전들을 금으로 모아줘요.<br />저금통을 만들어보세요.
              </p>
            </div>
          </div>

          <div className={`flex items-center justify-center ${commonEnter}`} style={{ transitionDelay: "0.6s" }}>
            <div
              className="flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{ width: "220px", height: "67px", background: "#03856E", borderRadius: "30px" }}
              onClick={() => setShowModal(true)}
            >
              <span
                style={{
                  fontFamily: "Hana2-CM, sans-serif",
                  fontSize: "20px",
                  lineHeight: "31px",
                  color: "#FFFFFF",
                  width: "79px",
                  height: "31px",
                  textAlign: "center",
                }}
              >
                시작하기
              </span>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-[95vw] sm:max-w-[500px] mx-2 sm:mx-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4 sm:mb-6">
              <h2 
                className="text-[18px] sm:text-[20px] mb-3 sm:mb-4"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                상품 개설을 위해
              </h2>
              <p 
                className="text-[14px] sm:text-[16px] mb-4 sm:mb-6"
                style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
              >
                약관 및 상품설명서를 꼭 확인해 주세요.
              </p>
            </div>

            <div 
              className={`flex items-center justify-between p-3 sm:p-4 rounded-[10px] cursor-pointer transition-colors mb-4 ${
                pdfConfirmed 
                  ? 'bg-[#03856E] hover:bg-[#026B5A]' 
                  : 'bg-[#F8F9FA] hover:bg-[#E9ECEF]'
              }`}
              onClick={() => setShowPdf(true)}
            >
              <span 
                className="text-[14px] sm:text-[16px]"
                style={{ 
                  fontFamily: "Hana2-Medium, sans-serif", 
                  color: pdfConfirmed ? "#FFFFFF" : "#2D3541" 
                }}
              >
                하나모아 저금통 상품설명서
              </span>
              <ChevronRight 
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  pdfConfirmed ? "text-white" : "text-[#666666]"
                }`} 
              />
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="mt-1 flex-shrink-0">
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        checks.illegalTrade 
                          ? 'bg-[#03856E] border-[#03856E]' 
                          : 'bg-white border-gray-300'
                      }`}
                      onClick={() => setChecks(prev => ({ ...prev, illegalTrade: !prev.illegalTrade }))}
                    >
                      {checks.illegalTrade && (
                        <svg 
                          className="w-3 h-3" 
                          fill="none" 
                          stroke="white" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={3} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span 
                      className="text-[13px] sm:text-[14px]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                    >
                      불법•탈법 차명거래 금지 설명 확인
                    </span>
                    <p 
                      className="text-[10px] sm:text-[12px] mt-1 leading-tight"
                      style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                    >
                      「금융실명거래 및 비밀보장에 관한 법률」 제3조 제3항에 따라 누구든지 불법재산의 은닉, 자금세탁행위, 공중협박자금 조달행위 및 강제집행의 면탈, 그 밖의 탈법행위를 목적으로 타인의 실명으로 금융거래를 하여서는 안되며, 이를 위반 시 5년 이하의 징역 또는 5천만원 이하의 벌금에 처해질 수 있습니다. 본인은 위 내용을 안내 받고, 충분히 이해하였음을 확인합니다.
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="mt-1 flex-shrink-0">
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        checks.depositProtection 
                          ? 'bg-[#03856E] border-[#03856E]' 
                          : 'bg-white border-gray-300'
                      }`}
                      onClick={() => setChecks(prev => ({ ...prev, depositProtection: !prev.depositProtection }))}
                    >
                      {checks.depositProtection && (
                        <svg 
                          className="w-3 h-3" 
                          fill="none" 
                          stroke="white" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={3} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span 
                      className="text-[13px] sm:text-[14px]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                    >
                      예금자보호법 설명 확인
                    </span>
                    <p 
                      className="text-[10px] sm:text-[12px] mt-1 leading-tight"
                      style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                    >
                      본인이 가입하는 금융상품은 예금자보호법에 따라 보호됨과 보호한도에 대하여 설명듣고 이해하였음을 확인합니다.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={async () => {
                if (pdfConfirmed && checks.illegalTrade && checks.depositProtection) {
                  try {
                    if (!userInfo) {
                      alert('로그인이 필요합니다.')
                      return
                    }
                    
                    const response = await fetch('/api/coinbox/create', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: userInfo.id
                      })
                    })

                    const result = await response.json()

                    if (result.success) {
                      setShowModal(false)
                      setShowSuccessModal(true)
                    } else {
                      alert(`저금통 개설 실패: ${result.error}`)
                    }
                  } catch (error) {
                    console.error('저금통 개설 오류:', error)
                    alert('저금통 개설 중 오류가 발생했습니다.')
                  }
                }
              }}
              disabled={!(pdfConfirmed && checks.illegalTrade && checks.depositProtection)}
              className={`w-full py-3 px-4 rounded-[10px] text-[14px] sm:text-[16px] transition-colors ${
                (pdfConfirmed && checks.illegalTrade && checks.depositProtection)
                  ? 'bg-[#03856E] text-white cursor-pointer hover:bg-[#026B5A]' 
                  : 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
              }`}
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              {(pdfConfirmed && checks.illegalTrade && checks.depositProtection) 
                ? '개설하기' 
                : '모든 항목을 확인해주세요'
              }
            </button>
          </div>
        </div>
      )}

      {showPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[95vw] sm:max-w-[600px] h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h3 
                className="text-[16px] sm:text-[18px]"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                하나모아 저금통 상품설명서
              </h3>
              <button
                onClick={() => setShowPdf(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex-1 p-3 sm:p-4">
              <iframe
                src="/pdf/잔돈투자서비스 이용약관.pdf#toolbar=0&navpanes=0&scrollbar=1&page=1&view=FitV"
                className="w-full h-full border-0 rounded-[10px]"
                title="하나모아 저금통 상품설명서"
              />
            </div>

            <div className="p-3 sm:p-4 border-t bg-white">
              <button
                onClick={() => {
                  setPdfConfirmed(true)
                  setShowPdf(false)
                }}
                className="w-full py-3 px-4 bg-[#03856E] text-white rounded-[10px] text-[14px] sm:text-[16px]"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-[20px] p-4 sm:p-6 lg:p-8 w-full max-w-[95vw] sm:max-w-[400px] mx-2 sm:mx-4 relative max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Image 
                  src="/images/ic_check.gif" 
                  alt="완료" 
                  width={60} 
                  height={60}
                  className="object-contain"
                />
              </div>
              
              <h2 
                className="text-[20px] sm:text-[24px] mb-3 sm:mb-4"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                저금통 개설 완료
              </h2>
              
              <div className="space-y-2 mb-4 sm:mb-6">
                <p 
                  className="text-[13px] sm:text-[14px]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                >
                  이제 동전 모으기 규칙이 켜집니다.
                </p>
                <p 
                  className="text-[13px] sm:text-[14px]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                >
                  규칙은 언제든지 끄거나 켤 수 있습니다.
                </p>
              </div>

              <div className="bg-[#F8F9FA] rounded-[10px] p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-[13px] sm:text-[14px]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                    >
                      최대 저축 한도
                    </span>
                    <span 
                      className="text-[13px] sm:text-[14px]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                    >
                      100,000원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-[13px] sm:text-[14px]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                    >
                      개설일
                    </span>
                    <span 
                      className="text-[13px] sm:text-[14px]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                    >
                      {new Date().toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  router.push('/invest/coinbox/manage')
                }}
                className="w-full py-3 px-4 bg-[#03856E] text-white rounded-[10px] text-[14px] sm:text-[16px] hover:bg-[#026B5A] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
