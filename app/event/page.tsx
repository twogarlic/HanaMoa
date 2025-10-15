"use client"

import { ChevronLeft, ChevronRight, Gift, Calendar as CalendarIcon } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"

export default function EventPage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth()
  
  
  const [attendances, setAttendances] = useState<any[]>([])
  const [todayAttended, setTodayAttended] = useState(false)
  const [todayPoints, setTodayPoints] = useState(0)
  const [totalAttendance, setTotalAttendance] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 100)
    return () => clearTimeout(timer)
  }, [])


  const fetchAttendances = async () => {
    if (!userInfo) return
    
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const response = await fetch(`/api/attendance?userId=${userInfo.id}&year=${year}&month=${month}`)
      const result = await response.json()
      
      if (result.success) {
        setAttendances(result.data.attendances || [])
        const today = new Date()
        if (year === today.getFullYear() && month === today.getMonth() + 1) {
          setTodayAttended(result.data.todayAttended || false)
          setTodayPoints(result.data.todayPoints || 0)
        }
        setTotalAttendance(result.data.totalAttendance || 0)
        setTotalPoints(result.data.totalPoints || 0)
      }
    } catch (error) {
      console.error('출석 기록 조회 오류:', error)
    }
  }

  useEffect(() => {
    if (userInfo) {
      fetchAttendances()
      fetchAllNotifications()
    }
  }, [userInfo, currentDate])

  const fetchAllNotifications = async () => {
    if (!userInfo) return
    
    setIsLoadingRequests(true)
    
    try {
      const [friendResponse, giftResponse] = await Promise.all([
        fetch(`/api/friends/request?userId=${userInfo.id}&type=received`),
        fetch(`/api/gifts?userId=${userInfo.id}&type=received`)
      ])
      
      const [friendResult, giftResult] = await Promise.all([
        friendResponse.json(),
        giftResponse.json()
      ])
      
      if (friendResult.success) {
        setFriendRequests(friendResult.data || [])
      }
      
      if (giftResult.success) {
        setGiftRequests(giftResult.data || [])
      }
    } catch (error) {
      console.error('알림 목록 조회 오류:', error)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const handleAttendanceCheck = async () => {
    if (!userInfo || todayAttended || isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/attendance/check', {
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
        setEarnedPoints(result.data.points)
        setShowSuccessModal(true)
        
        await fetchAttendances()
        
        setTimeout(() => {
          setShowSuccessModal(false)
        }, 2000)
      } else {
        alert(result.error || '출석체크에 실패했습니다.')
      }
    } catch (error) {
      console.error('출석체크 오류:', error)
      alert('출석체크 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    const koreaTime = new Date(date.getTime() + (9 * 60 * 60 * 1000))
    const year = koreaTime.getFullYear()
    const month = String(koreaTime.getMonth() + 1).padStart(2, '0')
    const day = String(koreaTime.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const hasAttendanceOnDate = (date: Date) => {
    const dateStr = formatDate(date)
    return attendances.some(att => att.date === dateStr)
  }

  const getAttendanceOnDate = (date: Date) => {
    const dateStr = formatDate(date)
    return attendances.find(att => att.date === dateStr)
  }

  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            {isCheckingAuth ? "인증 확인 중..." : "로그인이 필요합니다."}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#F8F9FA] min-h-screen">
      <NavigationBar
        friendRequestsCount={friendRequests.length}
        giftRequestsCount={giftRequests.length}
        friendRequests={friendRequests}
        giftRequests={giftRequests}
        isLoadingRequests={isLoadingRequests}
        onFriendRequest={() => {}}
        onGiftRequest={() => {}}
        onNotificationClick={fetchAllNotifications}
      />

      <main className="pt-2 pb-20">
        <div className="w-full h-[200px] bg-gradient-to-r from-[#03856E] to-[#005044]">
          <div className="max-w-[1335px] h-full mx-auto px-4 flex flex-col justify-center items-center text-center">
          </div>
        </div>
        
        <div className="max-w-[1335px] mx-auto px-4 -mt-32 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6">
            <section 
              className={`flex-[2] h-[400px] lg:h-[610px] transition-all duration-700 ease-out ${
                isInitialLoad ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] p-6 h-full flex flex-col">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-[#F2F3F5] rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#333333]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1 text-[16px] text-[#333333] hover:bg-[#F0F9F7] rounded-[6px] transition-colors"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-[#F2F3F5] rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-[#333333]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 flex-1">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div
                      key={day}
                      className={`h-10 flex items-center justify-center text-[12px] ${
                        index === 0 ? 'text-[#ED1551]' : index === 6 ? 'text-[#1B8FF0]' : 'text-[#999999]'
                      }`}
                      style={{ fontFamily: "Hana2-CM, sans-serif" }}
                    >
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-16 lg:h-24"></div>
                  ))}

                  {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                    const day = index + 1
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const dayOfWeek = date.getDay()
                    const isToday = formatDate(date) === formatDate(new Date())
                    const hasAttendance = hasAttendanceOnDate(date)
                    const attendance = getAttendanceOnDate(date)
                    
                    const getDayColor = () => {
                      if (isToday) return 'text-white'
                      if (dayOfWeek === 0) return 'text-[#ED1551]'
                      if (dayOfWeek === 6) return 'text-[#1B8FF0]'
                      return 'text-[#999999]'
                    }
                    
                    return (
                      <div
                        key={day}
                        className="h-16 lg:h-24 hover:bg-[#F8F9FA] transition-colors relative"
                      >
                        <div className="h-full flex flex-col">
                          <div className="p-1 flex items-start justify-start w-full">
                            {isToday ? (
                              <div className="w-6 h-6 bg-[#005044] rounded-full flex items-center justify-center">
                                <span 
                                  className="text-[12px] text-white"
                                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                >
                                  {day}
                                </span>
                              </div>
                            ) : (
                              <span 
                                className={`text-[12px] ${getDayColor()}`}
                                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                              >
                                {day}
                              </span>
                            )}
                          </div>
                          
                          {hasAttendance && (
                            <div className="flex-1 flex flex-col items-center justify-center">
                              <div className="relative w-14 h-14">
                                <Image 
                                  src="/images/ic_today.png" 
                                  alt="출석" 
                                  fill 
                                  className="object-contain opacity-80" 
                                />
                              </div>
                              {attendance && (
                                <span 
                                  className="text-[10px] text-[#ED1551] font-bold"
                                  style={{ fontFamily: "Hana2-Bold, sans-serif" }}
                                >
                                  +{attendance.points}원
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            <section 
              className={`flex-[1] h-[400px] lg:h-[610px] transition-all duration-700 ease-out ${
                isInitialLoad ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
              }`}
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] p-6 h-full flex flex-col">
                <div className="mb-6 ml-6">
                  <p 
                    className="text-[14px] text-[#555555]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    매일 출석하고 더 많은 하나머니를 받아보세요!
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10">
                          <Image 
                            src="/images/ic_star.png" 
                            alt="별돌이" 
                            fill 
                            className="object-contain" 
                          />
                        </div>
                        <span 
                          className="text-[14px] text-[#666666]"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          찾은 별돌이 수
                        </span>
                      </div>
                      <span 
                        className="text-[18px] text-[#03856E]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        {totalAttendance}마리
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10">
                          <Image 
                            src="/images/ic_hanamoney.png" 
                            alt="하나머니" 
                            fill 
                            className="object-contain" 
                          />
                        </div>
                        <span 
                          className="text-[14px] text-[#666666]"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          발견한 하나머니
                        </span>
                      </div>
                      <span 
                        className="text-[18px] text-[#ED1551]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        {totalPoints.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  {todayAttended ? (
                    <div className="p-6 text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <Image 
                          src="/images/ic_star.png" 
                          alt="완료" 
                          fill 
                          className="object-contain" 
                        />
                      </div>
                      <h3 
                        className="text-[18px] text-[#2D3541] mb-2"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        오늘 출석 완료!
                      </h3>
                      <p 
                        className="text-[14px] text-[#818898] mb-2"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        {todayPoints}원의 하나머니를 받았습니다
                      </p>
                      <p 
                        className="text-[12px] text-[#999999]"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        내일 또 만나요!
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAttendanceCheck}
                      disabled={isLoading}
                      className="w-full py-4 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span 
                          className="text-[16px]"
                          style={{ fontFamily: "Hana2-Bold, sans-serif" }}
                        >
                          출석체크 하기
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-8 w-full max-w-[400px] text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Image 
                src="/images/ic_today.png" 
                alt="출석 완료" 
                fill 
                className="object-contain" 
              />
            </div>
            <h3 
              className="text-[24px] text-[#2D3541] mb-2"
              style={{ fontFamily: "Hana2-Bold, sans-serif" }}
            >
              출석 완료!
            </h3>
            <p 
              className="text-[32px] text-[#03856E] mb-2"
              style={{ fontFamily: "Hana2-Bold, sans-serif" }}
            >
              +{earnedPoints}
            </p>
            <p 
              className="text-[14px] text-[#818898]"
              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
            >
              하나머니를 받았습니다!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}