"use client"

import { Search, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"

export default function ChatbotPage() {
  const [inputValue, setInputValue] = useState("")
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth({ redirectOnFail: false })

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
      console.error('알림 로드 오류:', error)
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
      console.error('알림 읽음 처리 오류:', error)
    }
  }

  useEffect(() => {
    fetchAllNotifications()
  }, [])

  const handleSendClick = () => {
    if (inputValue.trim()) {
      router.push(`/chatbot/chat?question=${encodeURIComponent(inputValue.trim())}`)
    }
  }

  const handleQuestionClick = (question: string) => {
    router.push(`/chatbot/chat?question=${encodeURIComponent(question)}`)
  }
  return (
    <div className="w-full bg-white min-h-screen">
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

      <main className="pt-16 w-full min-h-screen bg-white">
        <div className="max-w-[920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full flex justify-center mt-24 sm:mt-32">
            <Image 
              src="/images/ic_chat.gif" 
              alt="Chat Help" 
              width={250} 
              height={250}
            />
          </div>

          <div className="w-full flex justify-center mt-0">
            <h1 
              className="text-center"
              style={{ 
                fontFamily: 'Hana2-CM, sans-serif',
                fontSize: '34px',
                lineHeight: '69px',
                color: '#191F28',
                width: '445px'
              }}
            >
              무엇을 도와드릴까요?
            </h1>
          </div>

          <div 
            className="mx-auto mt-6 sm:mt-8 flex items-center"
            style={{
              width: '100%',
              maxWidth: '915px',
              height: '55px',
              background: '#FFFFFF',
              border: '1px solid #E6E8EA',
              borderRadius: '10px',
              padding: '0 20px'
            }}
          >
            <div className="mr-4">
              <Image 
                src="/images/ic_search.svg" 
                alt="Search" 
                width={20} 
                height={20}
              />
            </div>

            <input 
              type="text"
              placeholder="궁금한 점을 질문해보세요."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent outline-none placeholder-gray-400"
              style={{
                fontFamily: 'Hana2-CM, sans-serif',
                fontSize: '16px',
                lineHeight: '26px',
                color: '#191F28'
              }}
            />

            <div 
              className={`ml-4 ${inputValue.trim() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              onClick={handleSendClick}
            >
              <Image 
                src="/images/ic_send.svg" 
                alt="Send" 
                width={23} 
                height={27}
                style={{
                  filter: inputValue.trim() ? 'none' : 'brightness(0) saturate(100%) invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(80%) contrast(80%)'
                }}
              />
            </div>
          </div>

          <div className="mt-1 sm:mt-3 flex flex-wrap justify-start gap-2 sm:gap-3">
            <button 
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
              onClick={() => handleQuestionClick('하나모아란?')}
              style={{
                width: '122px',
                height: '43px',
                background: '#F2F4F6',
                borderRadius: '30px'
              }}
            >
              <span 
                style={{
                  fontFamily: 'Hana2-CM, sans-serif',
                  fontSize: '16px',
                  lineHeight: '20px',
                  color: '#4E5968'
                }}
              >
                하나모아란?
              </span>
            </button>

            <button 
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
              onClick={() => handleQuestionClick('골드뱅킹이 뭐에요?')}
              style={{
                width: '122px',
                height: '43px',
                background: '#F2F4F6',
                borderRadius: '30px'
              }}
            >
              <span 
                style={{
                  fontFamily: 'Hana2-CM, sans-serif',
                  fontSize: '16px',
                  lineHeight: '20px',
                  color: '#4E5968'
                }}
              >
                골드뱅킹이란?
              </span>
            </button>

            <button 
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
              onClick={() => handleQuestionClick('이용하는 방법이 궁금해요!')}
              style={{
                width: '193px',
                height: '43px',
                background: '#F2F4F6',
                borderRadius: '30px'
              }}
            >
              <span 
                style={{
                  fontFamily: 'Hana2-CM, sans-serif',
                  fontSize: '16px',
                  lineHeight: '20px',
                  color: '#4E5968'
                }}
              >
                이용하는 방법이 궁금해요!
              </span>
            </button>
          </div>

          <div className="h-16 sm:h-24" />
        </div>
      </main>
    </div>
  )
}
