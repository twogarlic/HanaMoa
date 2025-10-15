"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import LoadingOverlay from "../../../components/LoadingOverlay"
import NavigationBar from "../../../components/NavigationBar"
import { useAuth } from "../../../hooks/use-auth"
import ProductImage from "../../../components/market/ProductImage"
import ProductInfo from "../../../components/market/ProductInfo"
import ReviewSection from "../../../components/market/ReviewSection"

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
  processingFee: number
}


export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth()
  const [userHoldings, setUserHoldings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedAmount, setSelectedAmount] = useState<number>(1) 
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewContent, setReviewContent] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  const goldHolding = userHoldings.find(h => h.asset === "gold")
  const availableGold = goldHolding?.quantity || 0

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
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/products/${productId}`)
        const result = await response.json()
        
        if (result.success) {
          setProduct(result.product)
        } else {
          setProduct(null)
        }
      } catch (error) {
        setProduct(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return
      
      try {
        setIsLoadingReviews(true)
        const response = await fetch(`/api/products/${productId}/reviews`)
        const result = await response.json()
        
        if (result.success) {
          setReviews(result.reviews || [])
        }
      } catch (error) {
      } finally {
        setIsLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [productId])

  const handleSubmitReview = async () => {
    if (!userInfo || !product) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!reviewContent.trim()) {
      alert('리뷰 내용을 입력해주세요.')
      return
    }

    try {
      setIsSubmittingReview(true)
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.id,
          rating: reviewRating,
          content: reviewContent
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('리뷰가 작성되었습니다.')
        setReviewContent('')
        setReviewRating(5)
        setShowReviewForm(false)
        
        const reviewsResponse = await fetch(`/api/products/${productId}/reviews`)
        const reviewsResult = await reviewsResponse.json()
        if (reviewsResult.success) {
          setReviews(reviewsResult.reviews || [])
        }
      } else {
      }
    } catch (error) {
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleExchange = async () => {
    if (!userInfo || !product) {
      alert('로그인이 필요합니다.')
      return
    }

    const totalPrice = product.price * selectedAmount
    const totalCost = product.processingFee * selectedAmount

    if (availableGold < totalPrice) {
      alert(`보유 금량이 부족합니다.\n필요: ${totalPrice}g\n보유: ${availableGold}g`)
      return
    }

    if (!confirm(`${product.name} ${selectedAmount}돈을(를) 교환하시겠습니까?\n필요 금량: ${totalPrice}g\n가공비: ${totalCost.toLocaleString()}원`)) {
      return
    }

    try {
      const response = await fetch('/api/products/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.id,
          productId: product.id,
          quantity: selectedAmount
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(`${product.name} ${selectedAmount}돈 교환이 완료되었습니다!\n사용된 금량: ${totalPrice}g\n가공비: ${totalCost.toLocaleString()}원`)
        
        const holdingsResponse = await fetch(`/api/holdings/user?userId=${userInfo.id}`)
        const holdingsResult = await holdingsResponse.json()
        if (holdingsResult.success) {
          setUserHoldings(holdingsResult.holdings || [])
        }
      } else {
        alert(result.error || '상품 교환에 실패했습니다.')
      }
    } catch (error) {
      alert('상품 교환 중 오류가 발생했습니다.')
    }
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

  if (isLoading) {
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
        <LoadingOverlay isVisible={true} />
      </div>
    )
  }

  if (!product) {
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
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="text-center py-12">
            </div>
          </div>
        </main>
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
        <div className="max-w-[1200px] mx-auto px-4">
          <button
            onClick={() => router.push('/market')}
            className="flex items-center gap-2 mb-6 text-[#666] hover:text-[#03856E] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[14px]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
              상품 목록으로 돌아가기
            </span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProductImage product={product} />
            
            <ProductInfo
              product={product}
              selectedAmount={selectedAmount}
              availableGold={availableGold}
              onAmountChange={setSelectedAmount}
              onExchange={handleExchange}
            />
          </div>

          <ReviewSection
            reviews={reviews}
            isLoadingReviews={isLoadingReviews}
            showReviewForm={showReviewForm}
            reviewRating={reviewRating}
            reviewContent={reviewContent}
            isSubmittingReview={isSubmittingReview}
            onToggleReviewForm={() => setShowReviewForm(!showReviewForm)}
            onRatingChange={setReviewRating}
            onContentChange={setReviewContent}
            onSubmitReview={handleSubmitReview}
          />
        </div>
      </main>
    </div>
  )
}
