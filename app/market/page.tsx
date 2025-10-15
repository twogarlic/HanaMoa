"use client"

import { useState, useEffect } from "react"
import LoadingOverlay from "../../components/LoadingOverlay"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"
import BannerSection from "../../components/market/BannerSection"
import SearchFilters from "../../components/market/SearchFilters"
import ProductGrid from "../../components/market/ProductGrid"

type Product = {
  id: string
  name: string
  category: "goldbar" | "ring" | "bracelet" | "cutlery"
  price: number 
  image: string
  description: string
  material: string
  weight: number 
  goldContent: number 
  rating: number
  reviewCount: number
  isNew: boolean
  isPopular: boolean
}


export default function MarketPage() {
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth()
  const [userHoldings, setUserHoldings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"price" | "rating" | "popularity">("popularity")
  
  
  const goldHolding = userHoldings.find(h => h.asset === "gold")
  const availableGold = goldHolding?.quantity || 0

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
      console.error('알림 읽음 처리 오류:', error)
    }
  }

  useEffect(() => {
    const fetchUserHoldings = async () => {
      if (!userInfo) return
      
      try {
        const response = await fetch(`/api/holdings/user?userId=${userInfo.id}`)
        const result = await response.json()
        
        if (result.success) {
          setUserHoldings(result.holdings || [])
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }

    if (userInfo) {
      fetchUserHoldings()
      fetchAllNotifications()
    }
  }, [userInfo])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true)
        const params = new URLSearchParams()
        if (selectedCategory !== 'all') params.append('category', selectedCategory)
        if (searchQuery) params.append('search', searchQuery)
        params.append('sortBy', sortBy)

        const response = await fetch(`/api/products?${params.toString()}`)
        const result = await response.json()
        
        if (result.success) {
          setProducts(result.products || [])
          setFilteredProducts(result.products || [])
        }
      } catch (error) {
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, searchQuery, sortBy])




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
      <LoadingOverlay isVisible={isLoading} />
      
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
        <div className="max-w-[1200px] mx-auto px-4">
          <BannerSection />

          <SearchFilters
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            onSortChange={setSortBy}
          />

          <ProductGrid
            products={filteredProducts}
            isLoading={isLoadingProducts}
          />
        </div>
      </main>
    </div>
  )
}
