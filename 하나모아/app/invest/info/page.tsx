"use client"

import { Search, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import NavigationBar from "../../../components/NavigationBar"
import { useAuth } from "../../../hooks/use-auth"

export default function InvestPage() {
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth({ redirectOnFail: false })
  const [currentSection, setCurrentSection] = useState(0)
  const [isImageHovered, setIsImageHovered] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  const fetchAllNotifications = async () => {
    try {
      if (!userInfo) return

      setIsLoadingRequests(true)

      const [friendReqRes, giftReqRes, notifRes] = await Promise.all([
        fetch(`/api/friends/request?userId=${userInfo.id}&type=received`),
        fetch(`/api/gifts?userId=${userInfo.id}&type=received`),
        fetch(`/api/notifications?userId=${userInfo.id}`)
      ])

      const friendReqData = await friendReqRes.json()
      const giftReqData = await giftReqRes.json()
      const notifData = await notifRes.json()

      if (friendReqData.success) {
        setFriendRequests(friendReqData.data || [])
      }
      if (giftReqData.success) {
        setGiftRequests(giftReqData.data || [])
      }
      if (notifData.success) {
        setNotifications(notifData.data || [])
        setUnreadNotificationCount(notifData.data?.filter((n: any) => !n.isRead).length || 0)
      }
    } catch (error) {
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline'): Promise<void> => {
    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.')
    
    const response = await fetch(`/api/friends/request/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId: userInfo.id })
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || '친구 신청 처리에 실패했습니다.')
    }

    setFriendRequests(prev => prev.filter(req => req.id !== requestId))
    fetchAllNotifications()
  }

  const handleGiftRequest = async (giftId: string, action: 'accept' | 'decline' | 'detail'): Promise<void> => {
    if (action === 'detail') return

    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.')
    
    const response = await fetch(`/api/gifts/${giftId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId: userInfo.id })
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || '선물 처리에 실패했습니다.')
    }

    setGiftRequests(prev => prev.filter(gift => gift.id !== giftId))
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
    }
  }

  useEffect(() => {
    if (userInfo) {
      fetchAllNotifications()
    }
  }, [userInfo])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const initialTimer = setTimeout(() => setIsInitialLoad(false), 100)

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      let newSection = 0
      if (scrollPosition > windowHeight * 1.5) {
        newSection = 2
      } else if (scrollPosition > windowHeight * 0.5) {
        newSection = 1
      }
      if (newSection !== currentSection) {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentSection(newSection)
          setIsTransitioning(false)
        }, 100)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener('resize', checkMobile)
      clearTimeout(initialTimer)
    }
  }, [currentSection])

  return (
    <div className="w-full bg-white" style={{ height: "300vh" }}>
      <NavigationBar 
        backgroundStyle="white"
        isAuthenticated={isAuthenticated}
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

      <div
        className={`fixed inset-0 transition-opacity duration-500 ${
          currentSection === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ paddingTop: "71px" }}
      >
        <main className="relative w-full h-full px-4 md:px-0">
          <div
            className={`absolute left-1/2 transform -translate-x-1/2 text-center transition-all duration-700 ease-out ${
              isInitialLoad || (isTransitioning && currentSection !== 0) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
            }`}
            style={{ 
              top: isMobile ? "50px" : "40px", 
              transitionDelay: "0.1s"
            }}
          >
            <h1 
              className="mb-1" 
              style={{ 
                fontFamily: "Hana2-Medium, sans-serif", 
                fontSize: isMobile ? "18px" : "25px", 
                lineHeight: isMobile ? "28px" : "41px", 
                color: "#666666" 
              }}
            >
              조금씩 모아가는 부자의 습관
            </h1>
            <p 
              style={{ 
                fontFamily: "Hana2-Medium, sans-serif", 
                fontSize: isMobile ? "24px" : "35px", 
                lineHeight: isMobile ? "36px" : "51px", 
                color: "#03856E" 
              }}
            >
              하나모아
            </p>
          </div>

          <div
            className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-out ${
              isInitialLoad || (isTransitioning && currentSection !== 0) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
            }`}
            style={{
              top: isMobile ? "120px" : "70px",
              width: isMobile ? "280px" : "633px",
              height: isMobile ? "280px" : "633px",
              backgroundImage: "url(/images/ic_phone.png)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
              transitionDelay: "0.3s"
            }}
          />
        </main>
      </div>

      <div
        className={`fixed inset-0 transition-opacity duration-500 ${
          currentSection === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ paddingTop: "71px" }}
      >
        <main className="relative w-full h-full px-4 md:px-0">
          {isMobile ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6" style={{ marginTop: "-60px" }}>
              <div
                className={`transition-all duration-700 ease-out ${
                  isInitialLoad || (isTransitioning && currentSection !== 1) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
                }`}
                style={{ transitionDelay: "0.2s" }}
              >
                <div style={{ width: "250px", height: "250px", position: "relative" }}>
                  <Image
                    src="/images/ic_moneybag.png"
                    alt=""
                    width={250}
                    height={250}
                    className="rounded-[30px] transition-opacity duration-300"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>

              <div
                className={`text-center transition-all duration-700 ease-out ${
                  isInitialLoad || (isTransitioning && currentSection !== 1) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
                }`}
                style={{ transitionDelay: "0.4s" }}
              >
                <h1
                  style={{
                    fontFamily: "Hana2-Bold, sans-serif",
                    fontSize: "20px",
                    lineHeight: "30px",
                    color: "#333D4B",
                    marginBottom: "20px"
                  }}
                >
                  매달 수백만 명이 금을 모아요.
                </h1>
                <p
                  style={{
                    fontFamily: "Hana2-CM, sans-serif",
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#6B7684",
                    maxWidth: "320px"
                  }}
                >
                  0.01g부터 시작할 수 있어요.<br />
                  지금도 매일 수많은 사람들이 금을 모으고 있어요.<br />
                  여러분도 오늘부터, 가볍게 시작해보세요.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`absolute cursor-pointer transition-all duration-700 ease-out ${
                  isInitialLoad || (isTransitioning && currentSection !== 1) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
                }`}
                style={{ left: "200px", top: "100px", width: "450px", height: "450px", transitionDelay: "0.2s" }}
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
              >
                <div style={{ width: "450px", height: "450px", position: "relative" }}>
                  <Image
                    src="/images/ic_moneybag.png"
                    alt=""
                    width={450}
                    height={450}
                    className="rounded-[49px] transition-opacity duration-300"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>

              <div
                className={`absolute right-[82px] flex flex-col justify-center transition-all duration-700 ease-out ${
                  isInitialLoad || (isTransitioning && currentSection !== 1) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
                }`}
                style={{ top: "50px", height: "500px", transitionDelay: "0.4s" }}
              >
                <h1
                  style={{
                    fontFamily: "Hana2-Bold, sans-serif",
                    fontSize: "25px",
                    lineHeight: "51px",
                    color: "#333D4B",
                    width: "494px",
                    height: "51px",
                    marginBottom: "30px"
                  }}
                >
                  매달 수백만 명이 금을 모아요.
                </h1>
                <p
                  style={{
                    fontFamily: "Hana2-CM, sans-serif",
                    fontSize: "22px",
                    lineHeight: "41px",
                    color: "#6B7684",
                    width: "590px",
                    height: "123px"
                  }}
                >
                  0.01g부터 시작할 수 있어요.<br />
                  지금도 매일 수많은 사람들이 금을 모으고 있어요.<br />
                  여러분도 오늘부터, 가볍게 시작해보세요.
                </p>
              </div>
            </>
          )}
        </main>
      </div>

      <div
        className={`fixed inset-0 transition-opacity duration-500 ${
          currentSection === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ paddingTop: "71px" }}
      >
        <main className="relative w-full h-full px-4 md:px-0">
          {isMobile ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6" style={{ marginTop: "-60px" }}>
              <div
                className={`transition-all duration-700 ease-out ${
                  isInitialLoad || (isTransitioning && currentSection !== 2) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
                }`}
                style={{ transitionDelay: "0.2s" }}
              >
                <div style={{ width: "250px", height: "250px", position: "relative" }}>
                  <Image
                    src="/images/ic_pig_money.png"
                    alt=""
                    width={250}
                    height={250}
                    className="rounded-[30px] transition-opacity duration-300"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>

              <div
                className={`text-center transition-all duration-700 ease-out ${
                  isInitialLoad || (isTransitioning && currentSection !== 2) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
                }`}
                style={{ transitionDelay: "0.4s" }}
              >
                <h1
                  style={{
                    fontFamily: "Hana2-Bold, sans-serif",
                    fontSize: "20px",
                    lineHeight: "30px",
                    color: "#333D4B",
                    marginBottom: "20px"
                  }}
                >
                  올해 안에 10g 모으기!
                </h1>
                <p
                  style={{
                    fontFamily: "Hana2-CM, sans-serif",
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#6B7684",
                    maxWidth: "320px"
                  }}
                >
                  목표를 세워보세요<br />
                  금 모으는 재미가 UP<br />
                  하나모아이 함께 응원해드릴게요.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`absolute cursor-pointer transition-all duration-700 ease-out ${
                  isInitialLoad || (isTransitioning && currentSection !== 2) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
                }`}
                style={{ left: "250px", top: "60px", width: "450px", height: "450px", transitionDelay: "0.2s" }}
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
              >
                <div style={{ width: "450px", height: "450px", position: "relative" }}>
                  <Image
                    src="/images/ic_pig_money.png"
                    alt=""
                    width={450}
                    height={450}
                    className="rounded-[49px] transition-opacity duration-300"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              <div
                className={`absolute right-[82px] flex flex-col justify-center transition-all duration-700 ease-out ${
                  isInitialLoad || (isTransitioning && currentSection !== 2) ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
                }`}
                style={{ top: "50px", height: "500px", transitionDelay: "0.4s" }}
              >
                <h1
                  style={{
                    fontFamily: "Hana2-Bold, sans-serif",
                    fontSize: "25px",
                    lineHeight: "51px",
                    color: "#333D4B",
                    width: "494px",
                    height: "51px",
                    marginBottom: "30px"
                  }}
                >
                  올해 안에 10g 모으기!
                </h1>
                <p
                  style={{
                    fontFamily: "Hana2-CM, sans-serif",
                    fontSize: "22px",
                    lineHeight: "41px",
                    color: "#6B7684",
                    width: "590px",
                    height: "123px"
                  }}
                >
                  목표를 세워보세요<br />
                  금 모으는 재미가 UP<br />
                  하나모아이 함께 응원해드릴게요.
                </p>
              </div>
            </>
          )}
        </main>
      </div>

      <div
        className={`fixed left-1/2 transform -translate-x-1/2 z-40 transition-all duration-700 ease-out ${
          isInitialLoad ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
        }`}
        style={{
          bottom: isMobile ? "100px" : "120px",
          width: isMobile ? "calc(100% - 32px)" : "600px",
          maxWidth: isMobile ? "350px" : "600px",
          height: isMobile ? "90px" : "110px",
          background: "rgba(243, 244, 245, 0.85)",
          borderRadius: isMobile ? "20px" : "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? "15px" : "20px",
          padding: isMobile ? "0 20px" : "0 30px",
          transitionDelay: "0.5s"
        }}
      >
        <p
          style={{
            fontFamily: "Hana2-Medium, sans-serif",
            fontSize: isMobile ? "16px" : "24px",
            lineHeight: isMobile ? "22px" : "31px",
            color: "#666666",
            textAlign: "center",
            margin: 0
          }}
        >
          투자가 고민된다면<br />챗봇과 상담하세요
        </p>

        <Link href="/chatbot">
          <div
            className="flex-shrink-0 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
            style={{ 
              width: isMobile ? "50px" : "60px", 
              height: isMobile ? "50px" : "60px", 
              background: "#03856E", 
              borderRadius: "10px" 
            }}
          >
            <Image 
              src="/images/ic_bot.svg" 
              alt="Chatbot" 
              width={isMobile ? 30 : 36} 
              height={isMobile ? 32 : 39} 
            />
          </div>
        </Link>
      </div>

      <Link
        href="/invest"
        className={`fixed left-1/2 transform -translate-x-1/2 flex items-center justify-center hover:scale-105 transition-transform duration-300 z-40 transition-all duration-700 ease-out ${
          isInitialLoad ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
        }`}
        style={{ 
          bottom: isMobile ? "30px" : "40px", 
          width: isMobile ? "180px" : "220px", 
          height: isMobile ? "55px" : "67px", 
          background: "#03856E", 
          borderRadius: isMobile ? "25px" : "30px", 
          transitionDelay: "0.6s" 
        }}
        aria-label="투자하기"
        prefetch={false}
      >
        <span
          style={{
            fontFamily: "Hana2-CM, sans-serif",
            fontSize: isMobile ? "18px" : "20px",
            lineHeight: isMobile ? "26px" : "31px",
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          투자하기
        </span>
      </Link>

      <div
        className={`fixed left-1/2 transform -translate-x-1/2 z-40 transition-all duration-700 ease-out ${
          isInitialLoad ? "translate-y-10 opacity-0" : "translate-y-0 opacity-100"
        }`}
        style={{
          bottom: "10px",
          width: "27px",
          height: "8px",
          backgroundImage: currentSection === 2 ? "url(/images/ic_top.svg)" : "url(/images/ic_bottom.svg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          transitionDelay: "0.7s"
        }}
      />
    </div>
  )
}

