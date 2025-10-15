"use client"

import { ChevronDown, X } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"

export default function GiftPage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth()
  
  
  const [isFriendOpen, setIsFriendOpen] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; name: string; phone: string; profileImage?: string } | null>(null)
  const [friends, setFriends] = useState<any[]>([])
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const friendCardRef = useRef<HTMLDivElement>(null)

  const [qtyGram, setQtyGram] = useState<number>(0)
  const [qtyInput, setQtyInput] = useState<string>("")
  const [selectedMessageCard, setSelectedMessageCard] = useState<string | null>(null)
  const [messageText, setMessageText] = useState<string>("")
  const [showModal, setShowModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [userHoldings, setUserHoldings] = useState<any[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  
  const [showSearchFriendModal, setShowSearchFriendModal] = useState(false)
  const [friendPhone, setFriendPhone] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [selectedSearchUser, setSelectedSearchUser] = useState<any>(null)
  const [friendRequestSent, setFriendRequestSent] = useState(false)
  
  const [showUnregisteredGiftModal, setShowUnregisteredGiftModal] = useState(false)
  const [unregisteredPhone, setUnregisteredPhone] = useState('')
  const [unregisteredName, setUnregisteredName] = useState('')
  const [isSendingUnregisteredGift, setIsSendingUnregisteredGift] = useState(false)
  
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  
  const [showGiftDetailModal, setShowGiftDetailModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<any>(null)
  
  const [showGiftSuccessModal, setShowGiftSuccessModal] = useState(false)

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


  const fetchFriends = async () => {
    if (!userInfo) return
    
    try {
      const response = await fetch(`/api/friends?userId=${userInfo.id}`)
      const result = await response.json()
      
      if (result.success) {
        setFriends(result.data || [])
      }
    } catch (error) {
      console.error('친구 목록 조회 오류:', error)
    }
  }

  const fetchUserHoldings = async () => {
    if (!userInfo) return
    
    try {
      const response = await fetch(`/api/holdings/user?userId=${userInfo.id}`)
      const result = await response.json()
      
      if (result.success) {
        setUserHoldings(result.holdings || [])
      }
    } catch (error) {
      console.error('보유 자산 조회 오류:', error)
    }
  }

  const fetchCurrentPrice = async (asset: string) => {
    try {
      const response = await fetch(`/api/market/${asset}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        if (asset === 'gold') {
          setCurrentPrice(result.data.currentPrice || 0)
        } else if (asset === 'silver') {
          setCurrentPrice(result.data.depositPrice || 0)
        } else {
          setCurrentPrice(result.data.currentPrice || 0)
        }
      }
    } catch (error) {
      console.error('가격 조회 오류:', error)
    }
  }

  useEffect(() => {
    if (userInfo) {
      fetchFriends()
      fetchUserHoldings()
      fetchAllNotifications() 
    }
  }, [userInfo])

  useEffect(() => {
    if (selectedAsset) {
      fetchCurrentPrice(selectedAsset)
      setQtyGram(0)
      setQtyInput("")
    }
  }, [selectedAsset])

  const roundToTwoDecimals = (num: number): number => {
    return Math.round(num * 100) / 100
  }

  const formatQuantity = (qty: number, asset: string): string => {
    if (asset === "gold") {
      return roundToTwoDecimals(qty).toFixed(2)
    }
    return Math.round(qty).toString()
  }

  const handleQtyInputChange = (value: string) => {
    if (!selectedAsset || !currentAsset) return

    let filteredValue = value
    
    if (selectedAsset === "gold") {
      filteredValue = value.replace(/[^0-9.]/g, '') 
      const parts = filteredValue.split('.')
      if (parts.length > 2) {
        filteredValue = parts[0] + '.' + parts.slice(1).join('')
      }
      if (parts[1] && parts[1].length > 2) {
        filteredValue = parts[0] + '.' + parts[1].substring(0, 2)
      }
    } else {
      filteredValue = value.replace(/[^0-9]/g, '')
    }
    
    setQtyInput(filteredValue)
    const numValue = parseFloat(filteredValue) || 0
    const maxQty = getMaxBuyableQuantity()
    
    const limitedValue = Math.min(numValue, maxQty)
    const roundedValue = roundToTwoDecimals(limitedValue)
    setQtyGram(roundedValue)
  }

  const handleQtyInputBlur = () => {
    if (!selectedAsset || !currentAsset) return
    
    const numValue = parseFloat(qtyInput) || 0
    const maxQty = getMaxBuyableQuantity()
    const adjustedValue = Math.floor(numValue / currentAsset.minUnit) * currentAsset.minUnit
    const limitedValue = Math.min(adjustedValue, maxQty)
    const roundedValue = roundToTwoDecimals(limitedValue)
    setQtyGram(roundedValue)
    setQtyInput(formatQuantity(roundedValue, selectedAsset))
  }

  const adjustQty = (delta: number) => {
    if (!selectedAsset || !currentAsset) return
    
    const maxQty = getMaxBuyableQuantity()
    const newValue = qtyGram + delta
    const adjustedValue = Math.floor(newValue / currentAsset.minUnit) * currentAsset.minUnit
    const roundedValue = roundToTwoDecimals(Math.max(0, Math.min(adjustedValue, maxQty)))
    setQtyGram(roundedValue)
    setQtyInput(formatQuantity(roundedValue, selectedAsset))
  }

  const getMaxBuyableQuantity = () => {
    if (!selectedAsset || !userHoldings.length) return 0
    
    const holding = userHoldings.find(h => h.asset === selectedAsset)
    return holding ? holding.quantity : 0
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
        if (result.error === '해당 전화번호로 가입된 사용자를 찾을 수 없습니다.') {
          setUnregisteredPhone(friendPhone)
          setShowSearchFriendModal(false)
          setShowUnregisteredGiftModal(true)
          setFriendPhone('')
          setSearchResult(null)
        } else {
          alert(`친구 검색 실패: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('친구 검색 오류:', error)
      alert('친구 검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleUserCardClick = (user: any) => {
    setSelectedSearchUser(user)
  }
  
  const sendFriendRequest = async (userId: string) => {
    if (!userInfo) return
    
    setIsSendingRequest(true)
    
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: userInfo.id,
          receiverId: userId,
          message: requestMessage || '친구 신청합니다.'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFriendRequestSent(true)
      } else {
        alert(`친구 신청 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('친구 신청 오류:', error)
      alert('친구 신청 중 오류가 발생했습니다.')
    } finally {
      setIsSendingRequest(false)
    }
  }

  const selectFriendFromSearch = () => {
    if (!selectedSearchUser) return
    
    setSelectedFriend({
      id: selectedSearchUser.id,
      name: selectedSearchUser.name,
      phone: selectedSearchUser.phone,
      profileImage: selectedSearchUser.profileImage
    })
    
    setShowSearchFriendModal(false)
    setFriendPhone('')
    setSearchResult(null)
    setRequestMessage('')
    setSelectedSearchUser(null)
  }

  const fetchFriendRequests = async () => {
    if (!userInfo) return
    
    try {
      const response = await fetch(`/api/friends/request?userId=${userInfo.id}&type=received`)
      const result = await response.json()
      
      if (result.success) {
        setFriendRequests(result.data || [])
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
        fetchFriendRequests(),
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

    setFriendRequests(prev => prev.filter(request => request.id !== requestId))
    
    await fetchFriends()
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

  const sendUnregisteredGift = async () => {
    if (!userInfo || !unregisteredPhone.trim() || !selectedAsset || qtyGram <= 0) {
      alert('선물 정보를 확인해주세요.')
      return
    }

    const actualPhone = selectedFriend?.id === 'temp' ? selectedFriend.phone : unregisteredPhone

    setIsSendingUnregisteredGift(true)
    
    try {
      const response = await fetch('/api/gifts/pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: userInfo.id,
          receiverPhone: actualPhone,
          receiverName: unregisteredName.trim() || null,
          asset: selectedAsset,
          quantity: qtyGram,
          messageCard: selectedMessageCard,
          message: messageText
        })
      })

      const result = await response.json()

      if (result.success) {
        setShowUnregisteredGiftModal(false)
        setShowGiftSuccessModal(true)
        
        setUnregisteredPhone('')
        setUnregisteredName('')
        setSelectedFriend(null) 
        setSelectedAsset(null)
        setQtyGram(0)
        setQtyInput("")
        setSelectedMessageCard(null)
        setMessageText('')
        
        await fetchUserHoldings()
      } else {
        alert(`선물 전송 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('미가입자 선물 전송 오류:', error)
      alert('선물 전송 중 오류가 발생했습니다.')
    } finally {
      setIsSendingUnregisteredGift(false)
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
    
    await fetchUserHoldings() 
  }

  const assets = [
    { 
      key: "gold", 
      label: "GOLD", 
      icon: "/images/ic_market_gold.png",
      iconStop: "/images/ic_market_gold_stop.png",
      minUnit: 0.01,
      unitLabel: "g"
    },
    { 
      key: "silver", 
      label: "SILVER", 
      icon: "/images/ic_market_silver.png",
      iconStop: "/images/ic_market_silver_stop.png",
      minUnit: 1,
      unitLabel: "g"
    },
    { 
      key: "usd", 
      label: "USD", 
      icon: "/images/ic_market_money.png",
      iconStop: "/images/ic_market_money_stop.png",
      minUnit: 1,
      unitLabel: "USD"
    },
    { 
      key: "eur", 
      label: "EUR", 
      icon: "/images/ic_market_money.png",
      iconStop: "/images/ic_market_money_stop.png",
      minUnit: 1,
      unitLabel: "EUR"
    },
    { 
      key: "jpy", 
      label: "JPY", 
      icon: "/images/ic_market_money.png",
      iconStop: "/images/ic_market_money_stop.png",
      minUnit: 1,
      unitLabel: "JPY"
    },
    { 
      key: "cny", 
      label: "CNY", 
      icon: "/images/ic_market_money.png",
      iconStop: "/images/ic_market_money_stop.png",
      minUnit: 1,
      unitLabel: "CNY"
    },
  ]

  const currentAsset = selectedAsset ? assets.find(a => a.key === selectedAsset) : null

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

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!isFriendOpen) return
      if (friendCardRef.current && !friendCardRef.current.contains(e.target as Node)) {
        setIsFriendOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [isFriendOpen])

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
    <div className="w-full bg-[#FFFFFF] min-h-screen">
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

      <main className="pt-24 pb-20">
        <div className="max-w-[1335px] mx-auto px-4">
          <section
            ref={friendCardRef}
            className="relative bg-white rounded-[10px] shadow-md h-[78px] px-6 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                {selectedFriend ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                    {selectedFriend.profileImage ? (
                <Image 
                        src={`/images/ic_${selectedFriend.profileImage}.png`}
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
                                <span class="text-white text-[16px]" style="font-family: Hana2-Medium, sans-serif;">
                                  ${selectedFriend.name.charAt(0)}
                                </span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#03856E] rounded-full flex items-center justify-center">
                        <span className="text-white text-[16px]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          {selectedFriend.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Image 
                    src="/images/ic_loading.png" 
                  alt="선물 아이콘" 
                  fill 
                  className="object-contain" 
                />
                )}
              </div>
              <div className="flex flex-col justify-center">
                {selectedFriend ? (
                  <>
                    <span className="text-[15px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      {selectedFriend.name}
                    </span>
                    <span className="text-[15px] text-[#818898]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      {selectedFriend.phone}
                    </span>
                  </>
                ) : (
                  <span className="text-[15px] text-[#808A96]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    선물받을 친구를 선택해주세요.
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isFriendOpen}
              onClick={() => setIsFriendOpen((v) => !v)}
              className="p-1 rounded-md hover:bg-[#F2F3F5] focus:outline-none focus:ring-2 focus:ring-[#03846E]/30"
              title="친구 선택"
            >
              <ChevronDown className="w-5 h-5 text-[#666]" />
            </button>

            {isFriendOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-20">
                <div className="mx-6 rounded-[10px] bg-white border border-[#E6E6E6] shadow-xl">
                  <div
                    role="listbox"
                    aria-label="친구 선택"
                    className="max-h-80 overflow-auto py-2"
                  >
                    {friends.length > 0 && friends.map((friend) => (
                      <button
                        key={friend.id}
                        type="button"
                        role="option"
                        onClick={() => {
                            setSelectedFriend({
                              id: friend.friendId,
                              name: friend.friendName,
                              phone: friend.friendPhone,
                              profileImage: friend.profileImage
                            })
                          setIsFriendOpen(false)
                        }}
                        className="w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[#F2F3F5]"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                          {friend.profileImage ? (
                            <Image
                              src={`/images/ic_${friend.profileImage}.png`}
                              alt=""
                              width={32}
                              height={32}
                              className="object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-8 h-8 bg-[#03856E] rounded-full flex items-center justify-center">
                                      <span class="text-white text-[12px]" style="font-family: Hana2-Medium, sans-serif;">
                                        ${friend.friendName.charAt(0)}
                                      </span>
                                    </div>
                                  `
                                }
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-[#03856E] rounded-full flex items-center justify-center">
                              <span className="text-white text-[12px]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                                {friend.friendName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                              {friend.friendName}
                          </span>
                          <span className="text-[12px] text-[#818898]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                              {friend.friendPhone}
                          </span>
                        </div>
                      </button>
                    ))}
                    
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSearchFriendModal(true)
                          setIsFriendOpen(false)
                        }}
                        className="w-full px-3 py-3 flex items-center gap-3 text-left hover:bg-[#F2F3F5]"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#03856E] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[12px]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                            +
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] text-[#03856E]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                            친구 검색하기
                          </span>
                          <span className="text-[12px] text-[#818898]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                            새로운 친구를 추가하세요
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {selectedFriend && (
            <section className="mt-6">
              <div className="mb-4">
                <span 
                  className="text-[15px] text-[#333333]" 
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  선물하실 자산을 선택해주세요.
                </span>
              </div>

              <div className="flex gap-7">
                {assets.map((asset) => (
                  <button
                    key={asset.key}
                    type="button"
                    onClick={() => setSelectedAsset(asset.key)}
                    className={`flex-1 h-[115px] bg-white rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-2 transition-all ${
                      selectedAsset === asset.key 
                        ? 'ring-2 ring-[#03856E] ring-offset-2' 
                        : 'hover:shadow-[0px_6px_8px_rgba(0,0,0,0.15)]'
                    }`}
                  >
                    <div className="relative w-12 h-12">
                      <Image 
                        src={qtyGram > 0 ? asset.iconStop : asset.icon} 
                        alt={asset.label} 
                        fill 
                        className="object-contain" 
                      />
                    </div>
                    
                    <span 
                      className="text-[12px] text-[#2D3541] text-center"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {asset.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedAsset && (
            <section className="mt-6">
              <div className="mb-4">
                <span 
                  className="text-[15px] text-[#333333]" 
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  선물하실 수량을 선택해주세요.
                </span>
              </div>

              <div className="w-[212px] h-[34px] border border-[#E6E6E6] rounded-[10px] flex items-center px-2 bg-white">
                {qtyInput === "" ? (
                <span className="text-[13px] text-[#818898]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    최대 {getMaxBuyableQuantity().toFixed(selectedAsset === 'gold' ? 2 : 0)}{currentAsset?.unitLabel} 가능
                </span>
                ) : (
                  <input
                    type="text"
                    value={qtyInput}
                    onChange={(e) => handleQtyInputChange(e.target.value)}
                    onBlur={handleQtyInputBlur}
                    className="flex-1 text-[13px] text-[#2D3541] bg-transparent border-none outline-none"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                    placeholder="0"
                  />
                )}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustQty(-(currentAsset?.minUnit || 1))}
                    className="p-1 text-[#818898]"
                    aria-label="수량 줄이기"
                    title={`수량 -${currentAsset?.minUnit || 1}${currentAsset?.unitLabel}`}
                  >
                    <Image src="/images/ic_minus.svg" alt="수량 줄이기" width={12} height={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustQty(currentAsset?.minUnit || 1)}
                    className="p-1 text-[#818898]"
                    aria-label="수량 늘리기"
                    title={`수량 +${currentAsset?.minUnit || 1}${currentAsset?.unitLabel}`}
                  >
                    <Image src="/images/ic_plus.svg" alt="수량 늘리기" width={12} height={12} />
                  </button>
                </div>
              </div>

              <div className="h-[34px] mt-[8px] flex justify-start items-center">
                <div className="w-[212px] flex items-center justify-between">
                  {[10, 25, 50].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        if (!selectedAsset || !currentAsset) return
                        const maxQty = getMaxBuyableQuantity()
                        const calculatedQty = maxQty * (p / 100)
                        const adjustedValue = Math.floor(calculatedQty / currentAsset.minUnit) * currentAsset.minUnit
                        const roundedValue = roundToTwoDecimals(adjustedValue)
                        setQtyGram(roundedValue)
                        setQtyInput(formatQuantity(roundedValue, selectedAsset))
                      }}
                      className="h-[34px] w-[51px] rounded-[8px] bg-[#F2F3F5] text-[13px] text-[#454F5C]"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      aria-label={`${p}%로 설정`}
                    >
                      {p}%
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedAsset || !currentAsset) return
                      const maxQty = getMaxBuyableQuantity()
                      const adjustedValue = Math.floor(maxQty / currentAsset.minUnit) * currentAsset.minUnit
                      const roundedValue = roundToTwoDecimals(adjustedValue)
                      setQtyGram(roundedValue)
                      setQtyInput(formatQuantity(roundedValue, selectedAsset))
                    }}
                    className="h-[34px] w-[51px] rounded-[8px] bg-[#F2F3F5] text-[13px] text-[#454F5C]"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    aria-label="최대 수량"
                  >
                    최대
                  </button>
                </div>
              </div>
            </section>
          )}

          {qtyGram > 0 && (
            <section className="mt-6">
              <div className="mb-4">
                <span 
                  className="text-[15px] text-[#333333]" 
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  메세지 카드를 선택해주세요.
                </span>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-7 py-1 px-1" style={{ width: 'max-content' }}>
                  {messageCards.map((card) => (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => setSelectedMessageCard(card.key)}
                      className={`w-[195px] h-[115px] bg-white rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all flex-shrink-0 ${
                        selectedMessageCard === card.key 
                          ? 'ring-2 ring-[#03856E]' 
                          : 'hover:shadow-[0px_6px_8px_rgba(0,0,0,0.15)]'
                      }`}
                    >
                      <div className="relative w-16 h-16">
                        <Image 
                          src={card.icon} 
                          alt="메시지 카드" 
                          fill 
                          className="object-contain" 
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {selectedMessageCard && (
            <section className="mt-6">
              <div className="mb-4">
                <span 
                  className="text-[15px] text-[#333333]" 
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  전달하실 메세지를 입력해주세요.
                </span>
              </div>

              <div className="bg-white rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-4">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="메세지 내용은 선택사항입니다."
                  className="w-full h-24 resize-none focus:outline-none text-[14px] text-[#2D3541] placeholder-[#999999]"
                  style={{ fontFamily: "Hana2-CM, sans-serif" }}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(true)
                  }}
                  className="bg-[#03856E] text-white px-8 py-3 rounded-[10px] shadow-lg hover:bg-[#026B5A] transition-colors"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  다음
                </button>
              </div>
            </section>
          )}

        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h2 
                className="text-[18px] text-[#2D3541] mb-2"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                {selectedFriend?.id === 'temp' ? '이 번호로 선물하시겠습니까?' : '이렇게 선물할까요?'}
              </h2>
              {selectedFriend?.id === 'temp' && (
                <p 
                  className="text-[14px] text-[#666666]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  선물을 보내면 SMS로 알림이 발송되며,<br/>
                  해당 번호로 가입 시 선물이 알림으로 전달됩니다.
                </p>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-[8px]">
                <div className="relative w-8 h-8">
                  <Image 
                    src="/images/ic_loading.png" 
                    alt="친구 아이콘" 
                    fill 
                    className="object-contain" 
                  />
                </div>
                <div>
                  <div 
                    className="text-[14px] text-[#2D3541]"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    {selectedFriend?.name}
                  </div>
                  <div 
                    className="text-[12px] text-[#818898]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    {selectedFriend?.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-[8px]">
                <div className="relative w-8 h-8">
                  <Image 
                    src={selectedAsset ? assets.find(a => a.key === selectedAsset)?.icon || "" : ""} 
                    alt="자산 아이콘" 
                    fill 
                    className="object-contain" 
                  />
                </div>
                <div>
                  <div 
                    className="text-[14px] text-[#2D3541]"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    {selectedAsset ? assets.find(a => a.key === selectedAsset)?.label : ""}
                  </div>
                  <div 
                    className="text-[12px] text-[#818898]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    {qtyGram.toFixed(2)}g
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-[8px]">
                <div className="relative w-8 h-8">
                  <Image 
                    src={selectedMessageCard ? messageCards.find(c => c.key === selectedMessageCard)?.icon || "" : ""} 
                    alt="메시지 카드" 
                    fill 
                    className="object-contain" 
                  />
                </div>
                <div>
                  <div 
                    className="text-[14px] text-[#2D3541]"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    메시지 카드
                  </div>
                  {messageText && (
                    <div 
                      className="text-[12px] text-[#818898]"
                      style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                    >
                      "{messageText}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                아니오
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!userInfo || !selectedFriend || !selectedAsset || qtyGram <= 0) {
                    alert('선물 정보를 확인해주세요.')
                    return
                  }

                  setIsLoading(true)
                  
                  try {
                    if (selectedFriend.id === 'temp') {
                      const response = await fetch('/api/gifts/pending', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          senderId: userInfo.id,
                          receiverPhone: selectedFriend.phone,
                          receiverName: selectedFriend.name === '미가입자' ? null : selectedFriend.name,
                          asset: selectedAsset,
                          quantity: qtyGram,
                          messageCard: selectedMessageCard,
                          message: messageText
                        })
                      })

                      const result = await response.json()

                      if (result.success) {
                        setShowModal(false)
                        setShowGiftSuccessModal(true)
                        
                        setSelectedFriend(null)
                        setSelectedAsset(null)
                        setQtyGram(0)
                        setQtyInput("")
                        setSelectedMessageCard(null)
                        setMessageText('')
                        
                        await fetchUserHoldings()
                      } else {
                        alert(`선물 전송 실패: ${result.error}`)
                      }
                    } else {
                      const response = await fetch('/api/gifts', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          senderId: userInfo.id,
                          receiverId: selectedFriend.id,
                          asset: selectedAsset,
                          quantity: qtyGram,
                          messageCard: selectedMessageCard,
                          message: messageText
                        })
                      })

                      const result = await response.json()

                      if (result.success) {
                        setShowModal(false)
                        setShowGiftSuccessModal(true)
                        
                        setSelectedFriend(null)
                        setSelectedAsset(null)
                        setQtyGram(0)
                        setQtyInput("")
                        setSelectedMessageCard(null)
                        setMessageText('')
                        
                        await fetchUserHoldings()
                      } else {
                        alert(`선물 전송 실패: ${result.error}`)
                      }
                    }
                  } catch (error) {
                    console.error('선물 전송 오류:', error)
                    alert('선물 전송 중 오류가 발생했습니다.')
                  } finally {
                    setIsLoading(false)
                  }
                }}
                disabled={isLoading}
                className="flex-1 py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors disabled:opacity-50"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                {isLoading ? '전송 중...' : '예'}
              </button>
            </div>
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
                setSelectedSearchUser(null)
                setFriendRequestSent(false)
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
              <div 
                className={`bg-[#F8F9FA] rounded-[10px] p-4 mb-4 cursor-pointer transition-all ${
                  selectedSearchUser?.id === searchResult.user.id 
                    ? 'ring-2 ring-[#03856E] bg-[#F0F9F7]' 
                    : 'hover:bg-[#F0F9F7]'
                }`}
                onClick={() => handleUserCardClick(searchResult.user)}
              >
                <div className="flex items-center justify-between">
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
                  
                  {!searchResult.isAlreadyFriend && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        sendFriendRequest(searchResult.user.id)
                      }}
                      disabled={isSendingRequest || searchResult.hasPendingRequest || searchResult.requestStatus === 'PENDING' || friendRequestSent}
                      className={`px-4 py-2 rounded-[8px] transition-colors ${
                        friendRequestSent || searchResult.hasPendingRequest || searchResult.requestStatus === 'PENDING'
                          ? 'bg-[#E9ECEF] text-[#999999] cursor-not-allowed'
                          : 'bg-[#03856E] text-[#FFFFFF] hover:bg-[#005044]'
                      }`}
                      style={{ fontFamily: "Hana2-Medium, sans-serif", fontSize: "14px" }}
                    >
                      {isSendingRequest ? '전송 중...' : (friendRequestSent || searchResult.hasPendingRequest || searchResult.requestStatus === 'PENDING') ? '신청 완료' : '친구신청'}
                    </button>
                  )}
                </div>
              </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={selectFriendFromSearch}
                    disabled={!selectedSearchUser}
                    className={`w-full py-3 rounded-[10px] transition-colors ${
                      selectedSearchUser
                        ? 'bg-[#03856E] hover:bg-[#026B5A] text-white' 
                        : 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
                    }`}
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    선택
                  </button>
                </div>
              </div>
            )}
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
                {assets.find(a => a.key === selectedGift.asset)?.label || selectedGift.asset.toUpperCase()} {selectedGift.quantity}g을 수락하나요?
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

      {showGiftSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-8 w-[400px] mx-4 relative">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/ic_check.gif"
                  alt="완료"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              
              <div className="mb-6">
                <p 
                  className="text-[16px] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                >
                  선물이 성공적으로 전송되었습니다!
                </p>
                <p 
                  className="text-[14px]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
                >
                  상대방에게 선물이 전달되었습니다.
                </p>
              </div>

              <button
                onClick={() => setShowGiftSuccessModal(false)}
                className="w-full py-3 px-4 bg-[#03856E] text-white rounded-[10px] text-[16px] hover:bg-[#026B5A] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnregisteredGiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-8 w-[500px] mx-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowUnregisteredGiftModal(false)
                setUnregisteredPhone('')
                setUnregisteredName('')
                if (selectedFriend?.id === 'temp') {
                  setSelectedFriend(null)
                  setSelectedAsset(null)
                  setQtyGram(0)
                  setQtyInput("")
                  setSelectedMessageCard(null)
                  setMessageText('')
                }
              }}
              className="absolute top-6 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h2 
                className="text-[18px] mb-4"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                해당 전화번호로 가입된 사용자를 찾을 수 없습니다.
              </h2>
              <p 
                className="text-[16px] mb-2"
                style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
              >
                이 번호로 선물하시겠습니까?
              </p>
              <p 
                className="text-[14px]"
                style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#999999" }}
              >
                선물을 보내면 SMS로 알림이 발송되며,<br/>
                해당 번호로 가입 시 선물이 자동으로 전달됩니다.
              </p>
            </div>

            <div className="mb-6">
              <label 
                className="block text-[14px] mb-2"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                전화번호
              </label>
              <div className="px-4 py-3 bg-[#F8F9FA] border border-[#E6E6E6] rounded-[10px]">
                <span 
                  className="text-[16px]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#2D3541" }}
                >
                  {unregisteredPhone}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label 
                className="block text-[14px] mb-2"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                받는 사람 이름 (선택사항)
              </label>
              <input
                type="text"
                value={unregisteredName}
                onChange={(e) => setUnregisteredName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className="w-full px-4 py-3 border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              />
            </div>

            {selectedAsset && qtyGram > 0 && selectedMessageCard ? (
              <div className="mb-6">
                <label 
                  className="block text-[14px] mb-3"
                  style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                >
                  선물 정보
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-[8px]">
                    <div className="relative w-8 h-8">
                      <Image 
                        src={assets.find(a => a.key === selectedAsset)?.icon || ""} 
                        alt="자산 아이콘" 
                        fill 
                        className="object-contain" 
                      />
                    </div>
                    <div>
                      <div 
                        className="text-[14px] text-[#2D3541]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        {assets.find(a => a.key === selectedAsset)?.label || ""}
                      </div>
                      <div 
                        className="text-[12px] text-[#818898]"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        {formatQuantity(qtyGram, selectedAsset)}{currentAsset?.unitLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-[8px]">
                    <div className="relative w-8 h-8">
                      <Image 
                        src={messageCards.find(c => c.key === selectedMessageCard)?.icon || ""} 
                        alt="메시지 카드" 
                        fill 
                        className="object-contain" 
                      />
                    </div>
                    <div>
                      <div 
                        className="text-[14px] text-[#2D3541]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        메시지 카드
                      </div>
                      {messageText && (
                        <div 
                          className="text-[12px] text-[#818898]"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          "{messageText}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
              </div>
            )}

            <div className="bg-[#FFF3CD] border border-[#FFEAA7] rounded-[10px] p-4 mb-6">
              <p 
                className="text-[12px] leading-relaxed"
                style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#856404" }}
              >
                • 선물은 30일간 보관되며, 기간 내 가입하지 않으면 자동으로 반환됩니다.<br/>
                • SMS로 선물 알림이 발송됩니다.<br/>
                • 해당 번호로 가입 시 선물이 자동으로 계정에 도착합니다.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowUnregisteredGiftModal(false)
                  setUnregisteredPhone('')
                  setUnregisteredName('')
                  if (selectedFriend?.id === 'temp') {
                    setSelectedFriend(null)
                    setSelectedAsset(null)
                    setQtyGram(0)
                    setQtyInput("")
                    setSelectedMessageCard(null)
                    setMessageText('')
                  }
                }}
                className="flex-1 py-4 rounded-[15px] border-2 border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif", fontSize: "16px" }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedAsset || qtyGram <= 0 || !selectedMessageCard) {
                      setShowUnregisteredGiftModal(false)
                      setSelectedFriend({
                        id: 'temp',
                        name: unregisteredName.trim() || '미가입자',
                        phone: unregisteredPhone
                      })
                    return
                  }
                  sendUnregisteredGift()
                }}
                disabled={isSendingUnregisteredGift}
                className={`flex-1 py-4 rounded-[15px] text-white transition-colors ${
                  !isSendingUnregisteredGift
                    ? 'bg-[#03856E] hover:bg-[#026B5A]' 
                    : 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
                }`}
                style={{ fontFamily: "Hana2-Medium, sans-serif", fontSize: "16px" }}
              >
                {isSendingUnregisteredGift ? '전송 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
