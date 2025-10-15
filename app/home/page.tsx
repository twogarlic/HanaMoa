"use client"

import { X, ChevronRight, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"

function FeatureCard({
  sectionTitle,
  headline,
  description,
  iconSrc,
  iconW = 80,
  iconH = 80,
  href,
}: {
  sectionTitle: string
  headline: React.ReactNode
  description: React.ReactNode
  iconSrc: string
  iconW?: number
  iconH?: number
  href?: string
}) {
  const cardContent = (
    <div
      className={`relative bg-white rounded-[10px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 w-full max-w-[442px] h-[292px] overflow-hidden transition-all duration-300 ${
        href ? 'hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] hover:scale-[1.02] cursor-pointer' : ''
      }`}
    >

      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[20px] leading-[26px]"
          style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#222" }}
        >
          {sectionTitle}
        </h3>
        <ChevronRight className="w-[30px] h-[38px] text-gray-400" />
      </div>

      <div className="h-[1px] w-full bg-[#EEEEEE] rounded-[10px] mb-6" />

      <h4
        className="text-[24px] leading-[31px] text-[#222] max-w-[230px]"
        style={{ fontFamily: "Hana2-Bold, sans-serif" }}
      >
        {headline}
      </h4>

      <p
        className="absolute left-6 bottom-6 text-[17px] leading-[23px] text-[#656565] max-w-[247px]"
        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
      >
        {description}
      </p>

      <Image
        src={iconSrc}
        alt={sectionTitle}
        width={iconW}
        height={iconH}
        className="absolute right-6 bottom-6"
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        {cardContent}
      </Link>
    )
  }

  return cardContent
}


const slides = [
  {
    title: "0.01g부터 시작하는 똑똑한 금투자",
    subtitle: "지금부터 모아봐요!",
    image: "/images/ic_carousel1.svg",
    modalTitle: "",
    modalSubtitle: "",
    modalDescription: "/invest",
  },
  {
    title: "하나모아면 충분해요, ",
    subtitle: "하나 하나 모아봐요!",
    image: "/images/ic_carousel3.png",
    modalTitle: "",
    modalSubtitle: "",
    modalDescription: "/invest",
  },
  {
    title: "하나모아 출석하고",
    subtitle: "하나머니 받아가세요!",
    image: "/images/ic_carousel2.svg",
    modalTitle: "",
    modalSubtitle: "",
    modalDescription: "/event",
  },
  {
    title: "하나모아 저금통",
    subtitle: "개설해보세요!",
    image: "/images/ic_carousel4.svg",
    modalTitle: "",
    modalSubtitle: "",
    modalDescription: "/invest/coinbox",
  },
]

export default function HomePage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth({ redirectOnFail: false })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [goalProgress] = useState(40) 

  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  
  const [showGiftDetailModal, setShowGiftDetailModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<any>(null)

  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)

  const hanaNetworkItems = [
    { name: "하나금융티아이", url: "https://www.hanati.co.kr/#this" },
    { name: "하나금융그룹", url: "https://www.hanafn.com/main/index.do" },
    { name: "하나은행", url: "https://www.kebhana.com/" },
    { name: "하나증권", url: "https://www.hanaw.com/main/main/index.cmd" },
    { name: "하나카드", url: "https://www.hanacard.co.kr/" },
    { name: "하나캐피탈", url: "https://www.hanacapital.co.kr/" },
    { name: "하나생명", url: "https://www.hanalife.co.kr/" },
    { name: "하나손해보험", url: "https://www.hanainsure.co.kr/" }
  ]

  const messageCards = [
    { key: "card1", icon: "/images/ic_heart.png" },
    { key: "card2", icon: "/images/ic_diamond.png" },
    { key: "card3", icon: "/images/ic_clap.png" },
    { key: "card4", icon: "/images/ic_sunglass.png" },
    { key: "card5", icon: "/images/ic_good.png" },
    { key: "card6", icon: "/images/ic_happy.png" },
    { key: "card7", icon: "/images/ic_sad.png" },
    { key: "card8", icon: "/images/ic_cold.png" },
    { key: "card9", icon: "/images/ic_devil.png" },
  ]

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
      console.error('알림 목록 조회 오류:', error)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  useEffect(() => {
    if (userInfo) {
      fetchAllNotifications()
    }
  }, [userInfo])

  const handleCarouselClick = () => {
    const currentSlideData = slides[currentSlide]
    if (currentSlideData.modalDescription) {
      router.push(currentSlideData.modalDescription)
    }
  }

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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || '친구 신청 처리에 실패했습니다.')
    }
    
    fetchAllNotifications()
  }

  const handleGiftRequest = async (giftId: string, action: 'accept' | 'decline' | 'detail'): Promise<void> => {
    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.')
    
    if (action === 'detail') {
      const gift = giftRequests.find(g => g.id === giftId)
      if (gift) {
        setSelectedGift(gift)
        setShowGiftDetailModal(true)
      }
      return
    }
    
    if (action === 'accept' || action === 'decline') {
      await processGiftRequest(giftId, action)
    }
  }

  const handleGiftDetailRequest = async (giftId: string, action: 'accept' | 'decline') => {
    if (!userInfo) return
    
    if (action === 'accept') {
      const gift = giftRequests.find(g => g.id === giftId)
      if (gift) {
        setSelectedGift(gift)
        setShowGiftDetailModal(true)
        return
      }
    }
    
    await processGiftRequest(giftId, action)
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

  const processGiftRequest = async (giftId: string, action: 'accept' | 'decline'): Promise<void> => {
    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.')
    
    const response = await fetch(`/api/gifts/${giftId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        userId: userInfo.id
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || '선물 처리에 실패했습니다.')
    }

    setGiftRequests(prev => prev.filter(gift => gift.id !== giftId))
    
    fetchAllNotifications()
  }
  
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowModal(false)
      }
    }

    if (showModal) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden" 
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }
  }, [showModal])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const handleGridListClick = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleCardClick = (index: number) => {
    setCurrentSlide(index)
    setShowModal(false)
  }

  const getBubblePosition = (progress: number) => {
    if (progress <= 20) return { left: "20%", transform: "translateX(-20%)" }
    if (progress >= 80) return { left: "80%", transform: "translateX(-80%)" }
    return { left: `${progress}%`, transform: "translateX(-50%)" }
  }

  const bubblePosition = getBubblePosition(goalProgress)

  return (
    <div className="min-h-screen flex flex-col">
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
        backgroundStyle="linear-gradient(90deg, #005044 0%, #03856E 66.83%, #005044 100%)"
        isAuthenticated={isAuthenticated}
      />

      <section 
        className="relative w-full flex items-center justify-center"
        style={{ 
          height: "auto",
          minHeight: "624px",
          background: "linear-gradient(90deg, #005044 0%, #03856E 66.83%, #005044 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="hidden lg:flex items-center justify-between h-full min-h-[624px]">
            <div className="flex-1 max-w-md flex flex-col">
              <h1 
                className="text-white mb-6"
                style={{ 
                  fontFamily: "Hana2-Medium, sans-serif",
                  fontSize: "48px",
                  lineHeight: "61px",
                  fontWeight: "400"
                }}
              >
                {slides[currentSlide].title}<br />
                {slides[currentSlide].subtitle}
              </h1>
              
              <div 
                className="flex items-center justify-start"
                style={{ 
                  width: "154px",
                  height: "37.74px"
                }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="relative flex items-center justify-center rounded-full px-4 py-1"
                    style={{ backgroundColor: "#04473B" }}
                  >
                    <button onClick={handlePlayPause} className="mr-2">
                      <Image
                        src={
                          isPlaying
                            ? "/images/ic_stop.svg"
                            : "/images/ic_play.svg"
                        }
                        alt={isPlaying ? "Pause" : "Play"}
                        width={6}
                        height={8}
                      />
                    </button>

                    <button onClick={handlePrevSlide} className="mr-2">
                      <Image
                        src="/images/ic_left.svg"
                        alt="Previous"
                        width={7}
                        height={11}
                      />
                    </button>

                    <span className="text-white font-bold text-xs mx-2">
                      {currentSlide + 1}/{slides.length}
                    </span>

                    <button onClick={handleNextSlide} className="ml-2">
                      <Image
                        src="/images/ic_right.svg"
                        alt="Next"
                        width={7}
                        height={11}
                      />
                    </button>
                  </div>

                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="relative">
                <div 
                  className="relative cursor-pointer" 
                  style={{ width: "698px", height: "465px" }}
                  onClick={handleCarouselClick}
                >
                  <Image
                    src={slides[currentSlide].image || "/placeholder.svg"}
                    alt="투자 캐릭터"
                    fill
                    className="object-contain transition-all duration-500 ease-in-out hover:opacity-90"
                    sizes="698px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden flex flex-col pt-20 pb-8 space-y-8">
            <div className="text-center">
              <h1 
                className="text-white mb-6"
                style={{ 
                  fontFamily: "Hana2-Bold, sans-serif",
                  fontSize: "32px",
                  lineHeight: "42px",
                  fontWeight: "400"
                }}
              >
                {slides[currentSlide].title}<br />
                {slides[currentSlide].subtitle}
              </h1>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div 
                className="relative w-full max-w-md h-80 cursor-pointer"
                onClick={handleCarouselClick}
              >
                <Image
                  src={slides[currentSlide].image || "/placeholder.svg"}
                  alt="투자 캐릭터"
                  fill
                  className="object-contain transition-all duration-500 ease-in-out hover:opacity-90"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              
              <div 
                className="flex items-center justify-center"
                style={{ 
                  width: "154px",
                  height: "37.74px"
                }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="relative flex items-center justify-center rounded-full px-4 py-1"
                    style={{ backgroundColor: "#04473B" }}
                  >
                    <button onClick={handlePlayPause} className="mr-2">
                      <Image
                        src={
                          isPlaying
                            ? "/images/ic_stop.svg"
                            : "/images/ic_play.svg"
                        }
                        alt={isPlaying ? "Pause" : "Play"}
                        width={6}
                        height={8}
                      />
                    </button>

                    <button onClick={handlePrevSlide} className="mr-2">
                      <Image
                        src="/images/ic_left.svg"
                        alt="Previous"
                        width={7}
                        height={11}
                      />
                    </button>

                    <span className="text-white font-bold text-xs mx-2">
                      {currentSlide + 1}/{slides.length}
                    </span>

                    <button onClick={handleNextSlide} className="ml-2">
                      <Image
                        src="/images/ic_right.svg"
                        alt="Next"
                        width={7}
                        height={11}
                      />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block absolute inset-x-0 bottom-[-230px] z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <FeatureCard
                sectionTitle="투자하기"
                headline={<>함께 성장하며<br />행복을 나누는 투자</>}
                description={<>0.01g부터 구매/판매가 가능해요<br />손쉽게 투자를 해보세요</>}
                iconSrc="/images/ic_hanagroup.png"
                iconW={80}
                iconH={80}
                href="/invest"
              />
              <FeatureCard
                sectionTitle="선물하기"
                headline={<>어디서든 쉽게<br />선물 가능한 하나모아</>}
                description={<>비대면으로도 선물이 가능해요<br />선물로 마음을 전해보세요</>}
                iconSrc="/images/ic_gift.png"
                iconW={90}
                iconH={90}
                href="/gift"
              />
              <FeatureCard
                sectionTitle="오늘의 예측"
                headline={<>어디서든 쉽게<br />예측 가능한 하나모아</>}
                description={<>실시간 시세와 지표로<br />오늘의 등락을 예측해 보세요</>}
                iconSrc="/images/ic_predict.svg"
                iconW={109}
                iconH={109}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="lg:hidden bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6">
            <FeatureCard
              sectionTitle="투자하기"
              headline={<>함께 성장하며<br />행복을 나누는 투자</>}
              description={<>0.01g부터 구매/판매가 가능해요<br />손쉽게 투자를 해보세요</>}
              iconSrc="/images/ic_hanagroup.png"
              iconW={80}
              iconH={80}
              href="/invest"
            />
            <FeatureCard
              sectionTitle="선물하기"
              headline={<>어디서든 쉽게<br />선물 가능한 하나모아</>}
              description={<>비대면으로도 선물이 가능해요<br />선물로 마음을 전해보세요</>}
              iconSrc="/images/ic_gift.png"
              iconW={90}
              iconH={90}
              href="/gift"
            />
            <FeatureCard
              sectionTitle="오늘의 예측"
              headline={<>어디서든 쉽게<br />예측 가능한 하나모아</>}
              description={<>실시간 시세와 지표로<br />오늘의 등락을 예측해 보세요</>}
              iconSrc="/images/ic_predict.svg"
              iconW={109}
              iconH={109}
            />
          </div>
        </div>
      </div>

      <div aria-hidden className="h-[220px] sm:h-[240px] lg:h-[260px]" />
      
      <footer className="bg-[#0E1110] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ul
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] leading-[18px] text-white/80"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            <li><Link href="mailto:neury0126@gmail.com" className="hover:text-[#03856E] hover:text-[14px] transition-colors">Contact Us</Link></li>
            <li><Link href="/privacy" className="hover:text-[#03856E] hover:text-[14px] transition-colors">개인정보처리방침</Link></li>
            <li><Link href="/customer-info" className="hover:text-[#03856E] hover:text-[14px] transition-colors">고객정보취급방침</Link></li>
            <li><Link href="/" className="hover:text-[#03856E] hover:text-[14px] transition-colors">건강한 소리</Link></li>
          </ul>


          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="https://pf.kakao.com/_nwxlRj" target="_blank" aria-label="KakaoTalk"
              >
                <Image src="/images/ic_sns_kakao.svg" alt="KakaoTalk" width={38} height={38} />
              </Link>
              <Link
                href="https://www.linkedin.com/company/hana-ti" target="_blank" aria-label="LinkedIn"
              >
                <Image src="/images/ic_sns_linkedin.svg" alt="LinkedIn" width={38} height={38} />
              </Link>
              <Link
                href="https://www.youtube.com/channel/UCUqMORjaZEGif1XeSAlqq8Q/featured" target="_blank" aria-label="YouTube"
              >
                <Image src="/images/ic_sns_youtube.svg" alt="YouTube" width={38} height={38} />
              </Link>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[13px] leading-[18px]"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                Hana Network
                <ChevronDown className={`w-4 h-4 opacity-80 transition-transform duration-200 ${showNetworkDropdown ? '' : 'rotate-180'}`} />
              </button>

              {showNetworkDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNetworkDropdown(false)}
                  />
                  
                  <div 
                    className="absolute bottom-full mb-2 right-0 bg-black rounded-[10px] shadow-lg z-50 py-2"
                    style={{ width: "100%" }}
                  >
                    {hanaNetworkItems.map((item, index) => (
                      <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-[13px] hover:bg-white/10 transition-colors"
                        style={{ color: "#999999", fontFamily: "Hana2-Regular, sans-serif" }}
                        onClick={() => setShowNetworkDropdown(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[13px] leading-[18px] text-white/70" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              인천 서구 에코로 167 하나금융그룹 통합데이터센터 비전센터 5층 (22742)
            </p>
            <p className="text-[12px] leading-[16px] text-white/50" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              © Hana Moa. All rights reserved.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Image
              src="/images/ic_isms.png"
              alt="정보보호 관리체계 인증(ISMS)"
              width={42}
              height={42}
              className="shrink-0"
            />
            <p className="text-[12px] leading-[16px] text-white/70" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
              정보보호 관리체계 인증<br className="hidden sm:block" />
              통합데이터센터, 통합보안관제, 클라우드 및 공인전자문서 서비스 운영<br />
              2025.02.23. ~ 2028.02.22.
            </p>
          </div>
        </div>
      </div>
    </footer>




      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleCloseModal}></div>

          <div className="relative z-10 w-full max-w-7xl min-h-screen flex flex-col py-8">
            <div className="flex justify-end mb-6">
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-30 rounded-full p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 flex-1">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className="bg-white rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col"
                  style={{ minHeight: "350px" }}
                >
                  <div className="mb-3">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: "#F0F0F0", color: "#666666" }}
                    >
                      이벤트
                    </span>
                  </div>

                  <div className="relative w-full h-32 sm:h-40 mb-4 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={slide.image || "/placeholder.svg"}
                      alt={slide.modalTitle}
                      width={120}
                      height={120}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2" style={{ color: "#000000" }}>
                      {slide.modalTitle}
                    </h3>

                    <h4 className="text-sm sm:text-base font-medium mb-1 line-clamp-1" style={{ color: "#000000" }}>
                      {slide.modalSubtitle}
                    </h4>

                    <p className="text-xs sm:text-sm mb-4 flex-1 line-clamp-2" style={{ color: "#666666" }}>
                      {slide.modalDescription}
                    </p>

                    <button
                      className="w-full py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium text-white hover:opacity-90 transition-opacity mt-auto"
                      style={{ background: "#333333" }}
                    >
                      자세히보기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-8"></div>
          </div>
        </div>
      )}

      {showGiftDetailModal && selectedGift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-8 w-[500px] mx-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowGiftDetailModal(false)
                setSelectedGift(null)
              }}
              className="absolute top-6 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <p 
                className="text-[16px]"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#333333" }}
              >
                {selectedGift.sender.name}님이 선물을 보내셨어요!
              </p>
              <p 
                className="text-[14px]"
                style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#7E8285" }}
              >
                {selectedGift.asset.toUpperCase()} {selectedGift.quantity}g을 수락하나요?
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="rounded-[15px] p-6 text-center">
                <div className="mb-4">
                  <div className="relative w-40 h-40 mx-auto mb-3">
                    <Image 
                      src={selectedGift.messageCard ? messageCards.find(c => c.key === selectedGift.messageCard)?.icon || "/images/ic_heart.png" : "/images/ic_heart.png"} 
                      alt="메시지 카드" 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                </div>
                
                {selectedGift.message && (
                  <div className="bg-[#F8F9FA] rounded-[10px] p-4">
                    <p 
                      className="text-[16px] leading-relaxed"
                      style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#333333" }}
                    >
                      {selectedGift.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowGiftDetailModal(false)
                  setSelectedGift(null)
                  processGiftRequest(selectedGift.id, 'accept')
                }}
                className="flex-1 py-4 rounded-[15px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif", fontSize: "16px" }}
              >
                수락하기
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGiftDetailModal(false)
                  setSelectedGift(null)
                  processGiftRequest(selectedGift.id, 'decline')
                }}
                className="flex-1 py-4 rounded-[15px] border-2 border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif", fontSize: "16px" }}
              >
                거절하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 