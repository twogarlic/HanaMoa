"use client"

import { ChevronRight, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "../../../../components/NavigationBar"
import { useAuth } from "../../../../hooks/use-auth"

export default function CoinboxManagePage() { 
  const router = useRouter()
  const { user: userInfo } = useAuth()
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [coinboxData, setCoinboxData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [isEmptying, setIsEmptying] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [userAccounts, setUserAccounts] = useState<any[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [interestInfo, setInterestInfo] = useState<any>(null)

  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsInitialLoad(false), 100)
    return () => clearTimeout(t)
  }, [])

  const fetchInterestInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/coinbox/interest?userId=${userId}`)
      const result = await response.json()
      
      if (result.success) {
        setInterestInfo(result.data.interestInfo)
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    const fetchCoinboxData = async () => {
      try {
        if (!userInfo) {
          return
        }

        const userId = userInfo.id || userInfo.userId
        if (!userId) {
          router.push('/')
          return
        }
        
        const response = await fetch(`/api/coinbox?userId=${userId}`)
        const result = await response.json()
        
        if (result.success) {
          setCoinboxData(result.data)
          await fetchInterestInfo(userId.toString())
        } else {
          router.push('/invest/coinbox')
        }
      } catch (error) {
        console.error('저금통 정보 조회 오류:', error)
        router.push('/invest/coinbox')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoinboxData()
  }, [userInfo, router])

  const fetchAllNotifications = async () => {
    if (!userInfo) return
    
    setIsLoadingRequests(true)
    
    try {
      const userId = userInfo.id || userInfo.userId
      if (!userId) return
      
      const [friendResponse, giftResponse, notifResponse] = await Promise.all([
        fetch(`/api/friends/request?userId=${userId}&type=received`),
        fetch(`/api/gifts?userId=${userId}&type=received`),
        fetch(`/api/notifications?userId=${userId}`)
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

  const handleToggleRule = async () => {
    if (isToggling) return

    setIsToggling(true)
    try {
      if (!userInfo) return
      
      const userId = userInfo.id || userInfo.userId
      if (!userId) return
      
      const response = await fetch('/api/coinbox/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          isActive: !coinboxData.isActive
        })
      })

      const result = await response.json()

      if (result.success) {
        setCoinboxData(result.data)
      } else {
        alert(`규칙 상태 변경 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('규칙 상태 변경 오류:', error)
      alert('규칙 상태 변경 중 오류가 발생했습니다.')
    } finally {
      setIsToggling(false)
    }
  }

  const fetchUserAccounts = async () => {
    try {
      if (!userInfo) return []      
      const userId = userInfo.id || userInfo.userId
      if (!userId) {
        return []
      }
      
      const response = await fetch(`/api/accounts?userId=${userId}`)
      const result = await response.json()
            
      if (result.success) {
        return result.accounts || []
      }
      return []
    } catch (error) {
      return []
    }
  }

  const handleEmptyCoinboxStart = async () => {
    if (isEmptying || !coinboxData || coinboxData.balance === 0) return

    const accounts = await fetchUserAccounts()
    
    if (accounts.length === 0) {
      alert('사용 가능한 계좌가 없습니다.')
      return
    }

    setUserAccounts(accounts)

    if (accounts.length === 1) {
      setSelectedAccountId(accounts[0].id)
      handleEmptyCoinbox(accounts[0].id)
      return
    }

    setShowAccountModal(true)
  }

  const handleEmptyCoinbox = async (accountId?: string) => {
    const targetAccountId = accountId || selectedAccountId
    if (!targetAccountId) return

    const confirmMessage = `저금통의 ${coinboxData.balance.toLocaleString()}원을 선택한 계좌로 이동하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    if (!confirm(confirmMessage)) return

    setIsEmptying(true)
    setShowAccountModal(false)
    
    try {
      if (!userInfo) return
      
      const userId = userInfo.id || userInfo.userId
      if (!userId) return
      
      const response = await fetch('/api/coinbox/empty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          accountId: targetAccountId
        })
      })

      const result = await response.json()

      if (result.success) {
        setCoinboxData(result.data.coinbox)
        alert(`저금통 비우기 완료!\n${result.data.transferAmount.toLocaleString()}원이 선택한 계좌로 이동되었습니다.`)
      } else {
        alert(`저금통 비우기 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('저금통 비우기 오류:', error)
      alert('저금통 비우기 중 오류가 발생했습니다.')
    } finally {
      setIsEmptying(false)
    }
  }

  const fadeUp = isInitialLoad ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
  const commonEnter = `transition-all duration-700 ease-out ${fadeUp}`

  if (isLoading) {
    return (
      <div className="w-full bg-[#F5FBFA] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            저금통 정보를 불러오는 중...
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
            <div className={`text-white/90 text-sm mb-12 ${commonEnter}`} style={{ fontFamily: "Hana2-Regular, sans-serif", transitionDelay: "0.1s" }}>홈 &gt; 투자하기 &gt; 잔돈투자</div>
            <div className="flex flex-col items-center text-center">
              <div className={`text-white text-[28px] mb-1 ${commonEnter}`} style={{ fontFamily: "Hana2-Regular, sans-serif", transitionDelay: "0.2s" }}>
                저금통 관리
              </div>
              <div className={`text-[34px] ${commonEnter}`} style={{ fontFamily: "Hana2-Regular, sans-serif", transitionDelay: "0.3s" }}>
                <span className="text-white" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>하나모아</span>
                <span className="text-[#F7D753]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}> 저금통</span>
              </div>
            </div>
            <div className={`relative -mb-16 z-10 flex justify-center ${commonEnter}`} style={{ transitionDelay: "0.4s" }}>
              <div className="relative w-[350px] h-[350px]">
                <Image 
                  src="/images/ic_coinbox.png" 
                  alt="코인박스" 
                  width={350} 
                  height={350}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mt-40 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className={`bg-white rounded-[20px] shadow-lg p-8 ${commonEnter}`} style={{ transitionDelay: "0.5s" }}>
            <div className="text-center mb-8">
              <h2 
                className="text-[20px] mb-2"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                나의 저금통
              </h2>
            </div>

            <div className="bg-[#F8F9FA] rounded-[15px] p-6 mb-6">
              <div className="text-center">
                <div 
                  className="text-[16px]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                >
                  현재 잔액
                </div>
                <div 
                  className="text-[20px]"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#03856E" }}
                >
                  {coinboxData?.balance?.toLocaleString()}원
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#F8F9FA] rounded-[10px] p-4">
                <div 
                  className="text-[14px] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                >
                  최대 저축 한도
                </div>
                <div 
                  className="text-[18px]"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#03856E" }}
                >
                  {coinboxData?.maxLimit?.toLocaleString()}원
                </div>
              </div>
              <div className="bg-[#F8F9FA] rounded-[10px] p-4">
                <div 
                  className="text-[14px] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                >
                  개설일
                </div>
                <div 
                  className="text-[18px]"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                >
                  {new Date(coinboxData?.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="bg-[#F8F9FA] rounded-[10px] p-4">
                <div 
                  className="text-[14px] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                >
                  연 이자율
                </div>
                <div 
                  className="text-[18px]"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#03856E" }}
                >
                  {interestInfo?.interestRate || 4.00}%
                </div>
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-[15px] p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div 
                    className="text-[16px]"
                    style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                  >
                    동전 모으기 규칙
                  </div>
                  <div 
                    className="text-[14px]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                  >
                    매일 밤 12시에 1000원 미만 동전을 자동으로 모아줍니다
                  </div>
                </div>
                <button
                  onClick={handleToggleRule}
                  disabled={isToggling}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                    coinboxData?.isActive ? 'bg-[#03856E]' : 'bg-gray-300'
                  } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      coinboxData?.isActive ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div 
                className="text-[12px] mt-3"
                style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#999999" }}
              >
                현재 상태: {coinboxData?.isActive ? '활성화' : '비활성화'}
              </div>
            </div>

            {coinboxData?.balance > 0 && (
              <div className="bg-[#F8F9FA] rounded-[15px] p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div 
                      className="text-[18px] mb-2"
                      style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                    >
                      저금통 비우기
                    </div>
                    <div 
                      className="text-[14px]"
                      style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                    >
                      모은 돈을 계좌로 이동합니다.
                    </div>
                  </div>
                  <button
                    onClick={handleEmptyCoinboxStart}
                    disabled={isEmptying}
                    className={`px-6 py-3 rounded-[10px] text-white text-[14px] transition-colors ${
                      isEmptying 
                        ? 'bg-[#B0B8C1] cursor-not-allowed' 
                        : 'bg-[#ED1551] hover:bg-[#C4124A]'
                    }`}
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    비우기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-6 w-[400px] max-w-[90vw]">
            <div className="text-center mb-6">
              <h3 
                className="text-[20px] mb-2"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                계좌 선택
              </h3>
              <p 
                className="text-[14px]"
                style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
              >
                저금통의 돈을 이동할 계좌를 선택해주세요
              </p>
            </div>

            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
              {userAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`w-full p-4 rounded-[10px] border-2 text-left transition-colors ${
                    selectedAccountId === account.id
                      ? 'border-[#03856E] bg-[#F0F9F7]'
                      : 'border-[#E6E6E6] bg-white hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div 
                        className="text-[16px] mb-1"
                        style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                      >
                        {account.accountName}
                      </div>
                      <div 
                        className="text-[14px]"
                        style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                      >
                        {account.accountNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-[16px]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#03856E" }}
                      >
                        {account.balance.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAccountModal(false)}
                className="flex-1 h-[50px] rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                취소
              </button>
              <button
                onClick={() => handleEmptyCoinbox()}
                disabled={!selectedAccountId}
                className={`flex-1 h-[50px] rounded-[10px] text-white transition-colors ${
                  selectedAccountId
                    ? 'bg-[#ED1551] hover:bg-[#C4124A]'
                    : 'bg-[#B0B8C1] cursor-not-allowed'
                }`}
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
