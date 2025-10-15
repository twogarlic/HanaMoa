"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X } from "lucide-react"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"

export default function FriendsPage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth()
  const [tab, setTab] = useState<"친구 목록" | "받은 신청" | "보낸 신청">("친구 목록")
  
  
  const [friends, setFriends] = useState<any[]>([])
  const [receivedRequests, setReceivedRequests] = useState<any[]>([])
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const [friendRequestsForNav, setFriendRequestsForNav] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  
  const [showFriendModal, setShowFriendModal] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [friendInfo, setFriendInfo] = useState<any>(null)
  const [isLoadingFriendInfo, setIsLoadingFriendInfo] = useState(false)
  
  const [showSearchFriendModal, setShowSearchFriendModal] = useState(false)
  const [friendPhone, setFriendPhone] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'confirm'>('success')
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null)

  const showSuccessAlert = (message: string) => {
    setAlertMessage(message)
    setAlertType('success')
    setShowAlertModal(true)
  }

  const showErrorAlert = (message: string) => {
    setAlertMessage(message)
    setAlertType('error')
    setShowAlertModal(true)
  }

  const showConfirmAlert = (message: string, callback: () => void) => {
    setAlertMessage(message)
    setAlertType('confirm')
    setConfirmCallback(() => callback)
    setShowAlertModal(true)
  }

  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback()
    }
    setShowAlertModal(false)
    setConfirmCallback(null)
  }

  const handleCancel = () => {
    setShowAlertModal(false)
    setConfirmCallback(null)
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '')
    
    const limitedNumbers = numbers.slice(0, 11)
    
    if (limitedNumbers.length >= 3 && !limitedNumbers.startsWith('010') && !limitedNumbers.startsWith('011')) {
      return ''
    }
    
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFriendPhone(formatted)
  }

  const searchFriend = async () => {
    if (!userInfo || !friendPhone.trim()) return
    
    setIsSearching(true)
    setSearchResult(null)
    
    try {
      const phoneNumbers = friendPhone.replace(/[^0-9]/g, '')
      
      const response = await fetch(`/api/friends/search?phone=${phoneNumbers}&userId=${userInfo.id}`)
      const result = await response.json()

      if (result.success) {
        setSearchResult(result.data)
      } else {
        showErrorAlert(`친구 검색 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('친구 검색 오류:', error)
      showErrorAlert('친구 검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const sendFriendRequest = async () => {
    if (!userInfo || !searchResult) return
    
    setIsSendingRequest(true)
    
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: userInfo.id,
          receiverId: searchResult.user.id,
          message: requestMessage.trim() || null
        })
      })

      const result = await response.json()

      if (result.success) {
        showSuccessAlert('친구 신청이 전송되었습니다!')
        setShowSearchFriendModal(false)
        setFriendPhone('')
        setSearchResult(null)
        setRequestMessage('')
        await fetchSentRequests() 
      } else {
        showErrorAlert(`친구 신청 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('친구 신청 오류:', error)
      showErrorAlert('친구 신청 중 오류가 발생했습니다.')
    } finally {
      setIsSendingRequest(false)
    }
  }


  const fetchFriends = async () => {
    if (!userInfo) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/friends?userId=${userInfo.id}`)
      const result = await response.json()
      if (result.success) {
        setFriends(result.data || [])
      }
    } catch (error) {
      console.error('친구 목록 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReceivedRequests = async () => {
    if (!userInfo) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/friends/request?userId=${userInfo.id}&type=received`)
      const result = await response.json()
      if (result.success) {
        setReceivedRequests(result.data || [])
      }
    } catch (error) {
      console.error('받은 친구 신청 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSentRequests = async () => {
    if (!userInfo) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/friends/request?userId=${userInfo.id}&type=sent`)
      const result = await response.json()
      if (result.success) {
        setSentRequests(result.data || [])
      }
    } catch (error) {
      console.error('보낸 친구 신청 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFriendRequestsForNav = async () => {
    if (!userInfo) return
    
    try {
      const response = await fetch(`/api/friends/request?userId=${userInfo.id}&type=received`)
      const result = await response.json()
      
      if (result.success) {
        setFriendRequestsForNav(result.data || [])
      }
    } catch (error) {
      console.error('친구 신청 목록 조회 오류:', error)
    }
  }

  const fetchGiftRequests = async () => {
    if (!userInfo) return
    
    try {
      const response = await fetch(`/api/gifts?userId=${userInfo.id}&type=received`)
      const result = await response.json()
      
      if (result.success) {
        setGiftRequests(result.data || [])
      }
    } catch (error) {
      console.error('선물 목록 조회 오류:', error)
    }
  }

  const fetchNotifications = async () => {
    if (!userInfo) return
    
    try {
      const response = await fetch(`/api/notifications?userId=${userInfo.id}`)
      const result = await response.json()
      
      if (result.success) {
        setNotifications(result.data || [])
        setUnreadNotificationCount(result.data?.filter((n: any) => !n.isRead).length || 0)
      }
    } catch (error) {
      console.error('알림 목록 조회 오류:', error)
    }
  }

  const fetchAllNotifications = async () => {
    if (!userInfo) return
    
    setIsLoadingRequests(true)
    
    try {
      await Promise.all([
        fetchFriendRequestsForNav(),
        fetchGiftRequests(),
        fetchNotifications()
      ])
    } catch (error) {
      console.error('알림 목록 조회 오류:', error)
    } finally {
      setIsLoadingRequests(false)
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
        action: action,
        userId: userInfo.id
      })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || '친구 신청 처리에 실패했습니다.')
    }

    setFriendRequestsForNav(prev => prev.filter(request => request.id !== requestId))
    
    if (tab === "받은 신청") {
      setReceivedRequests(prev => prev.filter(request => request.id !== requestId))
    }
    
    await fetchFriends()
  }

  const handleGiftRequest = async (giftId: string, action: 'accept' | 'decline' | 'detail'): Promise<void> => {
    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.')
    
    if (action === 'detail') {
      return
    }
    
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

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || '선물 처리에 실패했습니다.')
    }

    setGiftRequests(prev => prev.filter(gift => gift.id !== giftId))
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

  const handleCancelFriendRequest = async (requestId: string) => {
    if (!userInfo) return
    
    showConfirmAlert('정말로 친구 신청을 취소하시겠습니까?', async () => {
      try {
        const response = await fetch(`/api/friends/request/${requestId}?userId=${userInfo.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const result = await response.json()

        if (result.success) {
          setSentRequests(prev => prev.filter(request => request.id !== requestId))
          showSuccessAlert('친구 신청이 취소되었습니다.')
        } else {
          showErrorAlert(`친구 신청 취소 실패: ${result.error}`)
        }
      } catch (error) {
        console.error('친구 신청 취소 오류:', error)
        showErrorAlert('친구 신청 취소 중 오류가 발생했습니다.')
      }
    })
  }

  const fetchFriendInfo = async (friendId: string) => {
    if (!userInfo) return
    
    setIsLoadingFriendInfo(true)
    try {
      const response = await fetch(`/api/friends/info?userId=${userInfo.id}&friendId=${friendId}`)
      const result = await response.json()
      
      if (result.success) {
        setFriendInfo(result.data)
      } else {
        setFriendInfo({ 
          error: true, 
          errorMessage: result.error 
        })
      }
    } catch (error) {
      console.error('친구 정보 조회 오류:', error)
      setFriendInfo({ 
        error: true, 
        errorMessage: '친구 정보 조회 중 오류가 발생했습니다.' 
      })
    } finally {
      setIsLoadingFriendInfo(false)
    }
  }

  const handleFriendClick = (friend: any) => {
    setSelectedFriend(friend)
    setShowFriendModal(true)
    fetchFriendInfo(friend.friendId)
  }

  const getAssetTypeText = (type: string) => {
    switch (type) {
      case 'gold': return 'GOLD'
      case 'silver': return 'SILVER'
      case 'usd': return 'USD'
      case 'eur': return 'EUR'
      case 'jpy': return 'JPY'
      case 'cny': return 'CNY'
      default: return type
    }
  }

  const getAssetColor = (type: string, index: number) => {
    const colors = [
      '#03856E', '#1B8FF0', '#ED1551', '#FFA500', '#9C27B0', '#FF5722'
    ]
    return colors[index % colors.length]
  }

  useEffect(() => {
    if (userInfo) {
      fetchFriends()
      fetchAllNotifications()
    }
  }, [userInfo])

  useEffect(() => {
    if (userInfo) {
      if (tab === "친구 목록") {
        fetchFriends()
      } else if (tab === "받은 신청") {
        fetchReceivedRequests()
      } else if (tab === "보낸 신청") {
        fetchSentRequests()
      }
    }
  }, [tab, userInfo])

  const TabSelector = ({
    items,
    value,
    onChange,
    className,
  }: {
    items: { key: string; label: string }[]
    value: string
    onChange: (k: string) => void
    className?: string
  }) => (
    <div
      className={`w-[300px] h-[34px] flex items-center gap-[8px] ${className}`}
      role="tablist"
      aria-label="친구 탭 선택"
    >
      {items.map((it) => {
        const selected = it.key === value
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(it.key)}
            className={`flex-1 h-[34px] rounded-[16px] text-[13px] leading-[17px] transition-all
              ${selected ? "bg-[#F2F3F5] text-[#2D3541]" : "text-[#454F5C]"}
            `}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )

  const FriendsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[16px] font-medium text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
          친구 목록 ({friends.length}명)
        </div>
        <button
          onClick={() => setShowSearchFriendModal(true)}
          className="w-8 h-8 bg-[#03856E] rounded-full flex items-center justify-center hover:bg-[#026B5A] transition-colors"
          title="친구 추가"
        >
          <span className="text-white text-[16px]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            +
          </span>
        </button>
      </div>
      <div className="bg-white rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] p-6 min-h-[400px]">
        {isLoading ? (
          <div className="text-center text-[#8B95A1] py-20" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            로딩 중
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center text-[#8B95A1] py-20" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            친구가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => handleFriendClick(friend)}
                className="w-full flex items-center justify-between p-3 border-b border-[#E5E8EB] last:border-b-0 hover:bg-[#F8F9FA] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    {friend.profileImage ? (
                      <Image
                        src={`/images/ic_${friend.profileImage}.png`}
                        alt=""
                        width={40}
                        height={40}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-10 h-10 rounded-full flex items-center justify-center">
                                <span class="text-white text-sm" style="font-family: Hana2-Medium, sans-serif;">
                                  ${friend.friendName.charAt(0)}
                                </span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <span className="text-white text-sm" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                        {friend.friendName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-[#2D3541] font-medium" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      {friend.friendName}
                    </div>
                    <div className="text-[#8B95A1] text-sm" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      {friend.friendPhone}
                    </div>
                  </div>
                </div>
                <div className="text-[#8B95A1] text-sm" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  {new Date(friend.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const ReceivedRequests = () => (
    <div className="space-y-4">
      <div className="text-[16px] font-medium text-[#2D3541] mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
        받은 신청 ({receivedRequests.length}건)
      </div>
      <div className="bg-white rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] p-6 min-h-[400px]">
        {isLoading ? (
          <div className="text-center text-[#8B95A1] py-20" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            로딩 중
          </div>
        ) : receivedRequests.length === 0 ? (
          <div className="text-center text-[#8B95A1] py-20" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            받은 신청이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {receivedRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border-b border-[#E5E8EB] last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    {request.sender.profileImage ? (
                      <Image
                        src={`/images/ic_${request.sender.profileImage}.png`}
                        alt=""
                        width={40}
                        height={40}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-10 h-10 bg-[#03856E] rounded-full flex items-center justify-center">
                                <span class="text-white text-sm" style="font-family: Hana2-Medium, sans-serif;">
                                  ${request.sender.name.charAt(0)}
                                </span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <span className="text-white text-sm" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                        {request.sender.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-[#2D3541] font-medium" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      {request.sender.name}
                    </div>
                    <div className="text-[#8B95A1] text-sm" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      {request.sender.phone}
                    </div>
                    {request.message && (
                      <div className="text-[#8B95A1] text-sm mt-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                        "{request.message}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleFriendRequest(request.id, 'accept')}
                    className="px-4 py-2 bg-[#03856E] text-white text-sm rounded-[8px] hover:bg-[#026B5A] transition-colors"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    수락
                  </button>
                  <button 
                    onClick={() => handleFriendRequest(request.id, 'decline')}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-[8px] hover:bg--red-700 transition-colors"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const SentRequests = () => (
    <div className="space-y-4">
      <div className="text-[16px] font-medium text-[#2D3541] mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
        보낸 신청 ({sentRequests.length}건)
      </div>
      <div className="bg-white rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] p-6 min-h-[400px]">
        {isLoading ? (
          <div className="text-center text-[#8B95A1] py-20" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            로딩 중
          </div>
        ) : sentRequests.length === 0 ? (
          <div className="text-center text-[#8B95A1] py-20" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
            보낸 친구 신청이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border-b border-[#E5E8EB] last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    {request.receiver.profileImage ? (
                      <Image
                        src={`/images/ic_${request.receiver.profileImage}.png`}
                        alt=""
                        width={40}
                        height={40}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-10 h-10 bg-[#03856E] rounded-full flex items-center justify-center">
                                <span class="text-white text-sm" style="font-family: Hana2-Medium, sans-serif;">
                                  ${request.receiver.name.charAt(0)}
                                </span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <span className="text-white text-sm" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                        {request.receiver.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-[#2D3541] font-medium" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      {request.receiver.name}
                    </div>
                    <div className="text-[#8B95A1] text-sm" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      {request.receiver.phone}
                    </div>
                    {request.message && (
                      <div className="text-[#8B95A1] text-sm mt-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                        "{request.message}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {request.status === 'PENDING' && (
                    <button 
                      onClick={() => handleCancelFriendRequest(request.id)}
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded-[8px] hover:bg-red-700 transition-colors"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            {isCheckingAuth ? "인증 확인 중" : "로그인이 필요합니다."}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#FFFFFF] min-h-screen">
      <NavigationBar
        friendRequestsCount={friendRequestsForNav.length}
        giftRequestsCount={giftRequests.length}
        friendRequests={friendRequestsForNav}
        giftRequests={giftRequests}
        notifications={notifications}
        unreadNotificationCount={unreadNotificationCount}
        isLoadingRequests={isLoadingRequests}
        onFriendRequest={handleFriendRequest}
        onGiftRequest={handleGiftRequest}
        onNotificationClick={fetchAllNotifications}
        onNotificationRead={handleNotificationRead}
      />

      <main className="pt-24 pb-20">
        <div className="max-w-[1335px] mx-auto px-4">
          <section className="mb-6">
            <div className="flex justify-start">
              <TabSelector
                items={[
                  { key: "친구 목록", label: "친구 목록" },
                  { key: "받은 신청", label: "받은 신청" },
                  { key: "보낸 신청", label: "보낸 신청" },
                ]}
                value={tab}
                onChange={(k) => setTab(k as any)}
              />
            </div>
          </section>

          <section>
            {tab === "친구 목록" && <FriendsList />}
            {tab === "받은 신청" && <ReceivedRequests />}
            {tab === "보낸 신청" && <SentRequests />}
        </section>
      </div>
    </main>

    {showFriendModal && selectedFriend && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-[20px] p-8 w-[600px] mx-4 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => {
              setShowFriendModal(false)
              setSelectedFriend(null)
              setFriendInfo(null)
            }}
            className="absolute top-6 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h2 
              className="text-[20px] text-[#2D3541] mb-2"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              {selectedFriend.friendName}님의 투자 정보
            </h2>
            <p 
              className="text-[14px] text-[#666]"
              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
            >
              친구의 투자 성과를 확인해보세요
            </p>
          </div>

          {isLoadingFriendInfo ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  정보를 불러오는 중
                </span>
              </div>
            </div>
          ) : friendInfo ? (
            friendInfo.error ? (
              <div className="text-center py-1">
                <div className="text-[14px] text-[#8B95A1]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  앗 ! 친구가 비공개로 설정했습니다
                </div>
                <div className="text-[14px] text-[#8B95A1]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                  설정을 변경하면 투자 정보를 확인할 수 있습니다
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-[10px]">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center">
                    {selectedFriend.profileImage ? (
                      <Image
                        src={`/images/ic_${selectedFriend.profileImage}.png`}
                        alt=""
                        width={64}
                        height={64}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-16 h-16 bg-[#03856E] rounded-full flex items-center justify-center">
                                <span class="text-white text-lg" style="font-family: Hana2-Medium, sans-serif;">
                                  ${selectedFriend.friendName.charAt(0)}
                                </span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#03856E] rounded-full flex items-center justify-center">
                        <span className="text-white text-lg" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          {selectedFriend.friendName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[18px] text-[#2D3541] font-medium" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      {selectedFriend.friendName}
                    </div>
                    <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      투자 시작: {friendInfo.joinedAt ? new Date(friendInfo.joinedAt).toLocaleDateString() : '정보 없음'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-[#E5E8EB] rounded-[10px] p-4">
                    <div className="text-[12px] text-[#8B95A1] mb-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      총 투자 금액
                    </div>
                    <div className="text-[20px] text-[#2D3541] font-bold" style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                      {friendInfo.totalInvestment?.toLocaleString() || 0}원
                    </div>
                  </div>
                  <div className="bg-white border border-[#E5E8EB] rounded-[10px] p-4">
                    <div className="text-[12px] text-[#8B95A1] mb-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      수익률
                    </div>
                    <div className={`text-[20px] font-bold ${(friendInfo.returnRate || 0) >= 0 ? 'text-[#03856E]' : 'text-[#ED1551]'}`} style={{ fontFamily: "Hana2-Bold, sans-serif" }}>
                      {friendInfo.returnRate ? `${friendInfo.returnRate > 0 ? '+' : ''}${friendInfo.returnRate.toFixed(2)}%` : '0.00%'}
                    </div>
                  </div>
                </div>

                {friendInfo.assetRatios && friendInfo.assetRatios.length > 0 ? (
                  <div className="bg-white border border-[#E5E8EB] rounded-[10px] p-4">
                    <div className="text-[16px] text-[#2D3541] mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      자산 구성
                    </div>
                    <div className="space-y-2">
                      {friendInfo.assetRatios.map((asset: any, index: number) => (
                        <div key={asset.asset} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getAssetColor(asset.asset, index) }}
                            ></div>
                            <span className="text-[14px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                              {getAssetTypeText(asset.asset)}
                            </span>
                          </div>
                          <div className="text-[14px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                            {asset.percentage.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-[#E5E8EB] rounded-[10px] p-4 text-center">
                    <div className="text-[14px] text-[#8B95A1]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      아직 투자 정보가 없습니다
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <div className="text-[14px] text-[#8B95A1]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                친구 정보를 불러올 수 없습니다
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {showSearchFriendModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-[20px] p-8 w-[400px] mx-4 relative">
          <button
            onClick={() => {
              setShowSearchFriendModal(false)
              setFriendPhone('')
              setSearchResult(null)
              setRequestMessage('')
            }}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h2 
              className="text-[16px] mb-2"
              style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
            >
              친구 검색하기
            </h2>
            <p 
              className="text-[15px] mb-2"
              style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
            >
              친구의 전화번호를 입력해주세요.
            </p>
          </div>

          <div className="mb-6">
            <label 
              className="block text-[14px] mb-2"
              style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
            >
              전화번호 <span className="text-[#ED1551]">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={friendPhone}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                maxLength={13}
                className="flex-1 px-4 py-3 border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              />
              <button
                type="button"
                onClick={searchFriend}
                disabled={!friendPhone.trim() || friendPhone.replace(/[^0-9]/g, '').length !== 11 || isSearching}
                className={`px-4 py-3 rounded-[10px] text-white transition-colors ${
                  friendPhone.trim() && friendPhone.replace(/[^0-9]/g, '').length === 11 && !isSearching
                    ? 'bg-[#03856E] hover:bg-[#026B5A]' 
                    : 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
                }`}
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                {isSearching ? '검색 중...' : '검색'}
              </button>
            </div>
          </div>

          {searchResult && (
            <div className="mb-6">
              <div className="bg-[#F8F9FA] rounded-[10px] p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                    {searchResult.user.profileImage ? (
                      <Image
                        src={`/images/ic_${searchResult.user.profileImage}.png`}
                        alt=""
                        width={48}
                        height={48}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-12 h-12 bg-[#03856E] rounded-full flex items-center justify-center">
                                <span class="text-white text-[16px]" style="font-family: Hana2-Medium, sans-serif;">
                                  ${searchResult.user.name.charAt(0)}
                                </span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#03856E] rounded-full flex items-center justify-center">
                        <span className="text-white text-[16px]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          {searchResult.user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[16px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      {searchResult.user.name}
                    </div>
                    <div className="text-[14px] text-[#666666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      {searchResult.user.phone}
                    </div>
                  </div>
                </div>
              </div>

              {searchResult.isAlreadyFriend ? (
                <div className="text-center py-4">
                  <p className="text-[14px] text-[#03856E]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                    이미 친구입니다.
                  </p>
                </div>
              ) : searchResult.hasPendingRequest ? (
                <div className="text-center py-4">
                  <p className="text-[14px] text-[#666666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                    이미 친구 신청을 보냈습니다.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <label 
                      className="block text-[14px] mb-2"
                      style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                    >
                      친구 신청 메시지 (선택사항)
                    </label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="안녕하세요! 친구 신청합니다."
                      className="w-full px-4 py-3 border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent resize-none"
                      style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      rows={3}
                    />
                  </div>

                  <div className="bg-[#F8F9FA] rounded-[10px] p-4 mb-6">
                    <p 
                      className="text-[12px] leading-relaxed"
                      style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                    >
                      • 010, 011로 시작하는 휴대폰 번호만 입력 가능합니다.<br/>
                      • 전화번호로 가입된 사용자를 찾아 친구 신청을 보냅니다.<br/>
                      • 친구가 수락하면 선물을 보낼 수 있습니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={sendFriendRequest}
                    disabled={isSendingRequest}
                    className={`w-full py-3 rounded-[10px] text-white transition-colors ${
                      !isSendingRequest
                        ? 'bg-[#03856E] hover:bg-[#026B5A]' 
                        : 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
                    }`}
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    친구 신청 보내기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}

    {showAlertModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-[16px] p-6 w-full max-w-[400px] mx-4 relative">
          <div className="text-center">
            <div className="mb-4">
              {alertType === 'success' && (
                <div className="w-16 h-16 mx-auto mb-4">
                  <Image 
                    src="/images/ic_check.gif" 
                    alt="성공" 
                    width={64} 
                    height={64} 
                    className="object-contain" 
                  />
                </div>
              )}
              {alertType === 'error' && (
                <div className="w-16 h-16 mx-auto mb-4">
                  <Image 
                    src="/images/ic_danger.gif" 
                    alt="오류" 
                    width={64} 
                    height={64} 
                    className="object-contain" 
                  />
                </div>
              )}
              {alertType === 'confirm' && (
                <div className="w-16 h-16 mx-auto mb-4">
                  <Image 
                    src="/images/ic_danger.gif" 
                    alt="확인" 
                    width={64} 
                    height={64} 
                    className="object-contain" 
                  />
                </div>
              )}
            </div>

            <div className="mb-6">
              <p 
                className="text-[16px] text-[#2D3541]"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                {alertMessage}
              </p>
            </div>

            <div className="flex gap-3">
              {alertType === 'confirm' ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    아니요
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    예
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="w-full py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)
}
