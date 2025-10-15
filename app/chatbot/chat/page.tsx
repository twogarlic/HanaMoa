"use client"

import { Search, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import NavigationBar from "../../../components/NavigationBar"
import { useAuth } from "../../../hooks/use-auth"

interface Message {
  type: 'user' | 'bot'
  content: string
  isTyping?: boolean
  displayedContent?: string
}

type HistoryTurn = { role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const searchParams = useSearchParams()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth({ redirectOnFail: false })
  const [currentTime, setCurrentTime] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const initRef = useRef(false)
  const [isComposing, setIsComposing] = useState(false)

  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  const toHistory = (msgs: Message[]): HistoryTurn[] =>
    msgs
      .filter(m => (m.content || '').trim().length > 0)
      .map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }))

  const RECENT_TURNS = 12

  const getBotResponse = useCallback(
    async (userMessage: string, history: HistoryTurn[]) => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, history }),
        })

        if (!response.ok) throw new Error('API 호출에 실패했습니다.')

        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('text/event-stream')) {
          console.log('스트리밍 응답 수신 중...')
          
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let accumulatedText = ''
          let botMessageAdded = false
          let messageIndex = -1

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    
                    if (data.content) {
                      accumulatedText += data.content
                      
                      if (!botMessageAdded) {
                        setMessages(prev => {
                          messageIndex = prev.length
                          return [...prev, {
                            type: 'bot',
                            content: accumulatedText,
                            isTyping: false,
                            displayedContent: accumulatedText
                          }]
                        })
                        botMessageAdded = true
                      } else {
                        setMessages(prev => {
                          const updated = [...prev]
                          if (messageIndex >= 0 && messageIndex < updated.length) {
                            updated[messageIndex] = {
                              type: 'bot',
                              content: accumulatedText,
                              isTyping: false,
                              displayedContent: accumulatedText
                            }
                          }
                          return updated
                        })
                      }
                    }

                    if (data.done) {
                      console.log('스트리밍 완료:', accumulatedText.length, '글자')
                      const finalContent = data.reply || accumulatedText
                      setMessages(prev => {
                        const updated = [...prev]
                        if (messageIndex >= 0 && messageIndex < updated.length) {
                          updated[messageIndex] = {
                            type: 'bot',
                            content: finalContent,
                            isTyping: false,
                            displayedContent: finalContent
                          }
                        }
                        return updated
                      })
                    }
                  } catch (e) {
                    console.error('JSON 파싱 실패:', e)
                  }
                }
              }
            }
          }
        } else {
          const data = await response.json()
          const botMessage: Message = {
            type: 'bot',
            content: data.reply,
            isTyping: true,
            displayedContent: ''
          }
          setMessages(prev => [...prev, botMessage])
        }
      } catch (error) {
        console.error('Error:', error)
        const errorMessage: Message = {
          type: 'bot',
          content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          isTyping: true,
          displayedContent: ''
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [messages.length]
  )

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
    const now = new Date()
    const timeString = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
    setCurrentTime(timeString)
    fetchAllNotifications()
  }, [])

  useEffect(() => {
    if (!isInitialized && !initRef.current) {
      initRef.current = true
      const question = searchParams.get('question')
      const initial = question ?? '하나모아이 무엇인지 궁금해!'
      const userMessage: Message = { type: 'user', content: initial, displayedContent: initial }
      setMessages([userMessage])
      const history: HistoryTurn[] = [{ role: 'user', content: initial }]
      getBotResponse(initial, history)
      setIsInitialized(true)
    }
  }, [searchParams, isInitialized, getBotResponse])

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue.trim()
      setInputValue("") 

      setMessages(prev => {
        const completed = prev.map(m => m.isTyping ? { ...m, isTyping: false, displayedContent: m.content } : m)
        return [...completed, { type: 'user', content: userMessage, displayedContent: userMessage }]
      })

      const draftMessages: Message[] = [
        ...messages.map(m => (m.isTyping ? { ...m, isTyping: false, displayedContent: m.content } : m)),
        { type: 'user', content: userMessage }
      ]
      const history: HistoryTurn[] = toHistory(draftMessages).slice(-RECENT_TURNS)
      await getBotResponse(userMessage, history)
    }
  }

  useEffect(() => {
    const typingInterval = setInterval(() => {
      setMessages(prev => {
        let hasTyping = false
        const updated = prev.map(message => {
          const shown = message.displayedContent || ''
          if (message.isTyping && shown.length < message.content.length) {
            hasTyping = true
            return {
              ...message,
              displayedContent: shown + message.content[shown.length]
            }
          } else if (message.isTyping && shown.length >= message.content.length) {
            return { ...message, isTyping: false }
          }
          return message
        })
        if (!hasTyping) clearInterval(typingInterval)
        return updated
      })
    }, 50)
    return () => clearInterval(typingInterval)
  }, [messages])

  const lastIsBot = messages.length > 0 && messages[messages.length - 1].type === 'bot'

  return (
    <div className="w-full bg-white min-h-screen relative">
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

      <main className="pt-16 w-full bg-white relative">
        <div className="max-w-[1440px] mx-auto px-2 sm:px-4 relative pb-[160px]">
          <div className="flex flex-col items-center mt-6 sm:mt-10">
            <Image 
              src="/images/ic_chat.gif" 
              alt="Chat Help" 
              width={250} 
              height={250} 
              className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] object-contain"
            />
            <div
              className="mt-3"
              style={{
                fontFamily: 'Hana2-CM, sans-serif',
                fontSize: '15px',
                lineHeight: '19px',
                color: '#999999',
                textAlign: 'center'
              }}>
              {currentTime}
            </div>
          </div>

          <ul className="flex flex-col gap-4 sm:gap-8 mt-10">
            {messages.map((message, index) => {
              const isUser = message.type === 'user'
              return (
                <li key={index} className={`flex ${isUser ? 'justify-end pr-4 sm:pr-[100px]' : 'justify-start pl-4 sm:pl-[100px]'}`}>
                  <div className="max-w-[90vw] sm:max-w-[925px]">
                    {!isUser && (
                      <div
                        className="mb-1"
                        style={{
                          fontFamily: 'Hana2-CM, sans-serif',
                          fontSize: '15px',
                          lineHeight: '19px',
                          color: '#999999'
                        }}>
                        하이챗봇
                      </div>
                    )}
                    <div
                      className="px-4 sm:px-6 py-3 sm:py-4 rounded-[10px]"
                      style={{
                        background: isUser ? '#EDF6F3' : '#F2F4F6'
                      }}>
                      <div
                        style={{
                          fontFamily: 'Hana2-CM, sans-serif',
                          fontSize: '15px',
                          lineHeight: '22px',
                          color: '#303B49',
                          wordWrap: 'break-word'
                        }}>
                        {message.isTyping ? (message.displayedContent || '') : message.content}
                        {message.isTyping && <span className="animate-pulse">|</span>}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {lastIsBot && <div className="h-24" />}

        </div>

        <div className="fixed bottom-[30px] left-1/2 transform -translate-x-1/2 z-40 w-full max-w-[915px] px-4">
          <div
            className="relative flex items-center w-full"
            style={{
              height: '64px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #E6E8EA',
              borderRadius: '10px',
              padding: '0 16px'
            }}>
            <input
              type="text"
              placeholder="궁금한 점을 질문해보세요."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent outline-none placeholder-gray-400"
              style={{ fontFamily: 'Hana2-CM, sans-serif', fontSize: '14px', lineHeight: '22px', color: '#191F28' }}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isComposing) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <div
              className={`ml-2 sm:ml-4 flex-shrink-0 ${inputValue.trim() && !isLoading ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={handleSendMessage}>
              {isLoading ? (
                <div className="w-[20px] h-[24px] sm:w-[23px] sm:h-[27px] flex items-center justify-center">
                  <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                </div>
              ) : (
                <Image
                  src="/images/ic_send.svg"
                  alt="Send"
                  width={20}
                  height={24}
                  className="sm:w-[23px] sm:h-[27px]"
                  style={{
                    filter: inputValue.trim()
                      ? 'none'
                      : 'brightness(0) saturate(100%) invert(80%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(80%) contrast(80%)'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
