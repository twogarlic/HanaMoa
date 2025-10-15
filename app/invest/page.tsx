"use client"

import { X, ChevronLeft, ChevronRight, ChevronDown, Plus, Minus, Download } from "lucide-react"
import Image from "next/image"
import { useMemo, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import LoadingOverlay from "../../components/LoadingOverlay"
import { useAuth } from "../../hooks/use-auth"
import NavigationBar from "../../components/NavigationBar"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const fmtKRW = (n: number) => new Intl.NumberFormat("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.max(0, Math.round(n * 100) / 100)) + "원"
const fmtInt = (n: number) => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(Math.round(n * 100) / 100)))

type AssetKey = "gold" | "silver" | "usd" | "jpy" | "eur" | "cny"
const ASSETS: Record<AssetKey, { label: string; icon: string; unit: string; minUnit: number; unitLabel: string }> = {
  gold:   { label: "금 (GOLD)",        icon: "/images/ic_market_gold.png",  unit: "원/0.01g", minUnit: 0.01, unitLabel: "g" },
  silver: { label: "은 (SILVER)",      icon: "/images/ic_market_silver.png",  unit: "원/1g", minUnit: 1, unitLabel: "g" },
  usd:    { label: "미국 달러 (USD)",  icon: "/images/ic_market_money.png", unit: "원/$", minUnit: 1, unitLabel: "USD" },
  jpy:    { label: "일본 엔화 (JPY)",  icon: "/images/ic_market_money.png", unit: "원/¥", minUnit: 1, unitLabel: "JPY" },
  eur:    { label: "유로 (EUR)",       icon: "/images/ic_market_money.png", unit: "원/€", minUnit: 1, unitLabel: "EUR" },
  cny:    { label: "중국 위안 (CNY)",  icon: "/images/ic_market_money.png", unit: "원/¥", minUnit: 1, unitLabel: "CNY" },
}

const PROFILE_IMAGES = [
  { id: "rabbit", name: "토끼", src: "/images/ic_rabbit.png" },
  { id: "lion", name: "사자", src: "/images/ic_lion.png" },
  { id: "bear", name: "곰", src: "/images/ic_bear.png" },
  { id: "fox", name: "여우", src: "/images/ic_fox.png" },
  { id: "chick", name: "병아리", src: "/images/ic_chick.png" },
  { id: "otter", name: "수달", src: "/images/ic_ootter.png" },
  { id: "tiger", name: "호랑이", src: "/images/ic_tiger.png" },
  { id: "panda", name: "판다", src: "/images/ic_panda.png" },
  { id: "hedgehog", name: "고슴도치", src: "/images/ic_hedgehog.png" },
]

const getProfileImage = (profileImageId: string) => {
  const profile = PROFILE_IMAGES.find(img => img.id === profileImageId)
  return profile ? profile.src : "/images/ic_fox.png"  
}

export default function InvestPage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth, setUser: setUserInfo } = useAuth()
  const [isHelpOpen, setIsHelpOpen] = useState(true)
  const [isOrderProcessing, setIsOrderProcessing] = useState(false)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [recurringOrders, setRecurringOrders] = useState<any[]>([])
  
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState<string>('')
  const [cancelOrderType, setCancelOrderType] = useState<'pending' | 'recurring'>('pending')
  
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [userHoldings, setUserHoldings] = useState<any[]>([])

  const refreshUserInfo = async () => {
    try {
      if (!userInfo) return
      
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success && data.isAuthenticated) {
        setUserInfo(data.user)
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 오류:', error)
    }
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
      const response = await fetch(`/api/notifications?userId=${userInfo.id}&limit=10`)
      const result = await response.json()
      
      if (result.success) {
        setNotifications(result.data || [])
        setUnreadNotificationCount(result.unreadCount || 0)
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
        action: action,
        userId: userInfo.id
      })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || '선물 처리에 실패했습니다.')
    }

    setGiftRequests(prev => prev.filter(gift => gift.id !== giftId))
    
    await fetchUserHoldings()
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
        await fetchNotifications()
      }
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error)
    }
  }

  const handlePostNotificationClick = async (postId: string, authorId: string, assetType: string) => {
    setAsset(assetType as AssetKey)
    
    setCommunityPosts([])
    setCommunityPage(1)
    setHasMorePosts(true)
    setIsInitialCommunityLoad(true)
    setIsCommunityLoading(false)
    
    await fetchCommunityPostsWithPage(1, true, assetType)
    
    setTimeout(() => {
      const postElement = document.getElementById(`post-${postId}`)
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        postElement.style.backgroundColor = '#f0f9ff'
        setTimeout(() => {
          postElement.style.backgroundColor = ''
        }, 2000)
      }
    }, 500)
  }

  const fetchPendingOrders = async () => {
    if (!userInfo) return
    
    setIsLoadingOrders(true)
    try {
      const response = await fetch(`/api/orders?userId=${userInfo.id}&status=PENDING`)
      const result = await response.json()
      
      if (result.success) {
        setPendingOrders(result.orders || [])
      }
    } catch (error) {
      console.error('대기주문 조회 오류:', error)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const fetchRecurringOrders = async () => {
    if (!userInfo) return
    
    try {
      const response = await fetch('/api/recurring-orders/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userInfo.id })
      })
      
      const result = await response.json()
      if (result.success) {
        setRecurringOrders(result.orders || [])
      }
    } catch (error) {
      console.error('정기주문 조회 오류:', error)
    }
  }

  const fetchUserHoldings = async () => {
    if (!userInfo) return
    
    try {
      const response = await fetch(`/api/holdings/user?userId=${userInfo.id}`)
      const result = await response.json()
      
      if (result.success) {
        const roundedHoldings = (result.holdings || []).map((holding: any) => ({
          ...holding,
          quantity: roundToTwoDecimals(holding.quantity),
          averagePrice: roundToTwoDecimals(holding.averagePrice)
        }))
        setUserHoldings(roundedHoldings)
      }
    } catch (error) {
      console.error('보유 자산 조회 오류:', error)
    }
  }

  const openCancelModal = (orderId: string) => {
    setCancelOrderId(orderId)
    setCancelOrderType('pending')
    setShowCancelModal(true)
  }

  const openRecurringCancelModal = (orderId: string) => {
    setCancelOrderId(orderId)
    setCancelOrderType('recurring')
    setShowCancelModal(true)
  }

  const cancelOrder = async () => {
    if (!userInfo || !cancelOrderId) return
    
    setIsOrderProcessing(true)
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: cancelOrderId,
          userId: userInfo.id
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setPendingOrders(prev => prev.filter(order => order.id !== cancelOrderId))
        setShowCancelModal(false)
        setShowCancelSuccessModal(true)
        setCancelOrderId('')
      } else {
        showOrderErrorModal('주문 취소 실패', result.error)
      }
      
    } catch (error) {
      console.error('주문 취소 오류:', error)
      showOrderErrorModal('주문 취소 오류', '주문 취소 중 오류가 발생했습니다.')
    } finally {
      setIsOrderProcessing(false)
    }
  }

  const cancelRecurringOrder = async () => {
    if (!userInfo || !cancelOrderId) return
    
    setIsOrderProcessing(true)
    try {
      const response = await fetch('/api/recurring-orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: cancelOrderId,
          userId: userInfo.id
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setRecurringOrders(prev => prev.filter(order => order.id !== cancelOrderId))
        setShowCancelModal(false)
        setShowCancelSuccessModal(true)
        setCancelOrderId('')
      } else {
        showOrderErrorModal('정기주문 취소 실패', result.error)
      }
      
    } catch (error) {
      console.error('정기주문 취소 오류:', error)
      showOrderErrorModal('정기주문 취소 오류', '정기주문 취소 중 오류가 발생했습니다.')
    } finally {
      setIsOrderProcessing(false)
    }
  }

  const handleOrderSubmit = async () => {
    if (!userInfo) {
      showOrderErrorModal('로그인 필요', '로그인이 필요합니다.')
      return
    }

    if (orderType === "정기 주문") {
      if (!isRecurringOrderValid()) {
        showOrderErrorModal('정기주문 정보 오류', '정기 주문 정보를 확인해주세요.')
        return
      }

      setIsOrderProcessing(true)
      
      try {
        const recurringOrderData = {
          userId: userInfo.id,
          asset: asset,
          orderType: side,
          quantity: recurringQuantity,
          frequency: recurringFrequency,
          startDate: recurringStartDate,
          endDate: recurringEndDate
        }

        const response = await fetch('/api/recurring-orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recurringOrderData)
        })

        const result = await response.json()

        if (result.success) {
          showOrderSuccessModal('정기주문 등록 완료', `정기 주문이 성공적으로 등록되었습니다!\n\n자산: ${currentAsset.label}\n수량: ${recurringQuantity}${currentAsset.unitLabel}\n주기: ${recurringFrequency === "daily" ? "매일" : recurringFrequency === "weekly" ? "매주" : "매월"}\n시작일: ${recurringStartDate}\n종료일: ${recurringEndDate}`)
          
          setRecurringQuantity(0)
          setRecurringQuantityStr('')
          setRecurringStartDate('')
          setRecurringEndDate('')
          setOrderType("일반 주문")
          await fetchRecurringOrders()
        } else {
          showOrderErrorModal('정기주문 등록 실패', result.error)
        }
      } catch (error) {
        console.error('정기 주문 처리 오류:', error)
        showOrderErrorModal('정기주문 처리 오류', '정기 주문 처리 중 오류가 발생했습니다.')
      } finally {
        setIsOrderProcessing(false)
      }
      return
    }

    if (!isQtyValid || qtyGram <= 0) {
      showOrderErrorModal('주문 정보 오류', '주문 정보를 확인해주세요.')
      return
    }

    if (side === 'buy') {
      const effectiveUnit = priceType === "market" ? currentPricePerGram : Math.max(0, roundToTwoDecimals(limitPrice))
      const totalAmount = roundToTwoDecimals(qtyGram * effectiveUnit)
      if (totalAmount > availableBalance) {
        showOrderErrorModal('구매 가능 금액 초과', `구매 가능 금액을 초과했습니다.\n\n구매가능 금액: ${fmtKRW(availableBalance)}\n총 주문 금액: ${fmtKRW(totalAmount)}`)
        return
      }
    }

    if (side === 'sell') {
      const currentHolding = userHoldings.find(h => h.asset === asset)
      if (!currentHolding || currentHolding.quantity < qtyGram) {
        showOrderErrorModal('보유 자산 부족', `보유 자산이 부족합니다.\n\n보유량: ${currentHolding?.quantity || 0}${currentAsset.unitLabel}\n주문량: ${qtyGram}${currentAsset.unitLabel}`)
        return
      }
    }

    setIsOrderProcessing(true)
    
    try {
      const accountId = userInfo.accounts?.[0]?.id
      if (!accountId) {
        showOrderErrorModal('계좌 정보 오류', '계좌 정보를 찾을 수 없습니다.')
        return
      }

      const orderData = {
        userId: userInfo.id,
        accountId: accountId,
        asset: asset,
        orderType: side,
        priceType: priceType,
        limitPrice: priceType === 'limit' ? (asset === 'gold' ? roundToTwoDecimals(parseFloat(limitPriceStr.replace(/,/g, '')) / 100) : parseFloat(limitPriceStr.replace(/,/g, ''))) : null,
        quantity: qtyGram
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (result.success) {
        if (result.order.status === 'COMPLETED') {
          showOrderSuccessModal('주문 체결 완료', `${side === "buy" ? "구매" : side === "sell" ? "판매" : "대기"} 주문이 성공적으로 체결되었습니다!\n\n주문번호: ${result.order.orderNumber}\n체결가격: ${result.order.executions[0].executionPrice.toLocaleString()}원\n체결수량: ${result.order.quantity}${currentAsset.unitLabel}`)
          
          setQtyInput('')
          setQtyGram(0)
          setIsQtyValid(false)
          const currentPrice = currentPricePerGram
          setLimitPrice(currentPrice)
          setLimitPriceStr(currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
          await refreshUserInfo()
          await fetchUserHoldings() 
        } else if (result.order.status === 'PENDING') {
          showOrderSuccessModal('대기주문 등록 완료', `${side === "buy" ? "구매" : side === "sell" ? "판매" : "대기"} 대기주문이 등록되었습니다!\n\n주문번호: ${result.order.orderNumber}\n지정가격: ${result.order.limitPrice?.toLocaleString()}원\n주문수량: ${result.order.quantity}${currentAsset.unitLabel}\n\n지정가격에 도달하면 자동으로 체결됩니다.`)
          
          setQtyInput('')
          setQtyGram(0)
          setIsQtyValid(false)
          await fetchPendingOrders()
        }
      } else {
        showOrderErrorModal('주문 실패', result.error)
      }
    } catch (error) {
      console.error('주문 처리 오류:', error)
      showOrderErrorModal('주문 처리 오류', '주문 처리 중 오류가 발생했습니다.')
    } finally {
      setIsOrderProcessing(false)
    }
  }

  const [tab, setTab] = useState<"차트" | "뉴스" | "커뮤니티">("차트")
  const [timeframe, setTimeframe] = useState<"회차" | "일" | "주" | "월" | "년">("회차")
  const [side, setSide] = useState<"buy" | "sell" | "wait">("buy")
  const [orderType, setOrderType] = useState<"일반 주문" | "정기 주문">("일반 주문")
  const [priceType, setPriceType] = useState<"limit" | "market">("limit")
  
  const [recurringQuantity, setRecurringQuantity] = useState<number>(0) 
  const [recurringQuantityStr, setRecurringQuantityStr] = useState<string>("") 
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly">("daily")
  const [recurringStartDate, setRecurringStartDate] = useState<string>("")
  const [recurringEndDate, setRecurringEndDate] = useState<string>("")
  
  const [showStartDateCalendar, setShowStartDateCalendar] = useState(false)
  const [showEndDateCalendar, setShowEndDateCalendar] = useState(false)
  const [startCalendarDate, setStartCalendarDate] = useState(new Date())
  const [endCalendarDate, setEndCalendarDate] = useState(new Date())
 
  const [asset, setAsset] = useState<AssetKey>("gold")
  const [isAssetOpen, setIsAssetOpen] = useState(false)
  const assetCardRef = useRef<HTMLDivElement>(null)
  
  const [isOrderTypeOpen, setIsOrderTypeOpen] = useState(false)
  const orderTypeRef = useRef<HTMLDivElement>(null)
  
  const startDateRef = useRef<HTMLDivElement>(null)
  const endDateRef = useRef<HTMLDivElement>(null)
  const currentAsset = ASSETS[asset]

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (isAssetOpen && assetCardRef.current && !assetCardRef.current.contains(e.target as Node)) {
        setIsAssetOpen(false)
      }
      if (isOrderTypeOpen && orderTypeRef.current && !orderTypeRef.current.contains(e.target as Node)) {
        setIsOrderTypeOpen(false)
      }
      if (showStartDateCalendar && startDateRef.current && !startDateRef.current.contains(e.target as Node)) {
        setShowStartDateCalendar(false)
      }
      if (showEndDateCalendar && endDateRef.current && !endDateRef.current.contains(e.target as Node)) {
        setShowEndDateCalendar(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [isAssetOpen, isOrderTypeOpen, showStartDateCalendar, showEndDateCalendar])

  const [qtyGram, setQtyGram] = useState<number>(0)
  const [qtyInput, setQtyInput] = useState<string>("") 
  const [isQtyValid, setIsQtyValid] = useState<boolean>(true) 
  const [limitPrice, setLimitPrice] = useState<number>(1500.00)
  const [limitPriceStr, setLimitPriceStr] = useState<string>((1500.00).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  const availableBalance = userInfo?.accounts?.[0]?.balance || 0

  const [nowLabel, setNowLabel] = useState("")
  
  useEffect(() => {
    const d = new Date()
    const formattedTime = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    }).format(d)
    setNowLabel(formattedTime)
  }, [])


  useEffect(() => {
    if (userInfo) {
      fetchPendingOrders()
      fetchRecurringOrders()
      fetchUserHoldings()
      fetchAllNotifications() 
    }
  }, [userInfo])

  useEffect(() => {
    if (isAuthenticated && userInfo) {
      refreshUserInfo()
    }
  }, [isAuthenticated])


  const SIDE_HEX = {
    buy:  "#ED1551",
    sell: "#1B8FF0",
    wait: "#03856E",
  } as const

  const [metalPrices, setMetalPrices] = useState({
    gold: { currentPrice: 0, changeValue: 0, changeRatio: 0, isUp: 0, round: '', time: '' },
    silver: { depositPrice: 0, withdrawalPrice: 0, changeValue: 0, changeRatio: 0, isUp: 0, round: '', time: '' },
    usd: { currentPrice: 0, changeValue: 0, changeRatio: 0, isUp: 0, round: '', time: '' },
    jpy: { currentPrice: 0, changeValue: 0, changeRatio: 0, isUp: 0, round: '', time: '' },
    eur: { currentPrice: 0, changeValue: 0, changeRatio: 0, isUp: 0, round: '', time: '' },
    cny: { currentPrice: 0, changeValue: 0, changeRatio: 0, isUp: 0, round: '', time: '' }
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const [chartData, setChartData] = useState<any>(null)
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)
  
  const [chartZoom, setChartZoom] = useState(1) 
  const [chartPan, setChartPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, pan: { x: 0, y: 0 } })
  
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    data: any
  }>({ visible: false, x: 0, y: 0, data: null })

  const [dailyTableData, setDailyTableData] = useState<any[]>([])
  const [isDailyTableLoading, setIsDailyTableLoading] = useState(false)
  const [dailyTablePage, setDailyTablePage] = useState(1)
  const [hasMoreDailyData, setHasMoreDailyData] = useState(true)
  const dailyTableObserverRef = useRef<IntersectionObserver | null>(null)
  const dailyTableLoadingRef = useRef<HTMLDivElement>(null)

  const roundToTwoDecimals = (num: number): number => {
    return Math.round(num * 100) / 100
  }

  const getCurrentPrice = () => {
    if (asset === "gold" && metalPrices.gold.currentPrice > 0) {
      return roundToTwoDecimals(metalPrices.gold.currentPrice) 
    } else if (asset === "silver" && metalPrices.silver.depositPrice > 0) {
      return roundToTwoDecimals(metalPrices.silver.depositPrice) 
    } else if (asset === "usd" && metalPrices.usd.currentPrice > 0) {
      return roundToTwoDecimals(metalPrices.usd.currentPrice)
    }else if (asset === "jpy" && metalPrices.jpy.currentPrice > 0) {
      return roundToTwoDecimals(metalPrices.jpy.currentPrice) 
    }else if (asset === "eur" && metalPrices.eur.currentPrice > 0) {
      return roundToTwoDecimals(metalPrices.eur.currentPrice) 
    }else if (asset === "cny" && metalPrices.cny.currentPrice > 0) {
      return roundToTwoDecimals(metalPrices.cny.currentPrice) 
    }
    return asset === "gold" ? 1500 : asset === "silver" ? 1800 : 1320 
  }
  
  const currentPricePerGram = getCurrentPrice()
  
  const effectiveUnit = priceType === "market" ? currentPricePerGram : Math.max(0, roundToTwoDecimals(limitPrice))
  const totalAmount = roundToTwoDecimals(qtyGram * effectiveUnit)
  const maxBuyableGram = effectiveUnit > 0 ? roundToTwoDecimals(Math.floor(availableBalance / effectiveUnit / currentAsset.minUnit) * currentAsset.minUnit) : 0

  const validateQty = (qty: number) => {
    let isValid = false
    
    if (side === 'sell') {
      const currentHolding = userHoldings.find(h => h.asset === asset)
      const holdingQuantity = currentHolding?.quantity || 0
      isValid = qty <= holdingQuantity && qty >= 0
    } else {
      isValid = qty <= maxBuyableGram && qty >= 0
    }
    
    setIsQtyValid(isValid)
    return isValid
  }

  const handleQtyInputChange = (value: string) => {
    let filteredValue = value
    
    if (asset === "gold") {
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
    const roundedValue = roundToTwoDecimals(numValue) 
    setQtyGram(roundedValue)
    validateQty(roundedValue)
  }

  const handleQtyInputBlur = () => {
    const numValue = parseFloat(qtyInput) || 0
    const adjustedValue = Math.floor(numValue / currentAsset.minUnit) * currentAsset.minUnit
    const roundedValue = roundToTwoDecimals(adjustedValue) 
    setQtyGram(roundedValue)
    setQtyInput(formatQuantity(roundedValue, asset))
    validateQty(roundedValue)
  }


  const formatQuantity = (qty: number, asset: AssetKey): string => {
    if (asset === "gold") {
      return roundToTwoDecimals(qty).toFixed(2)
    }
    return Math.round(qty).toString()
  }

  const adjustQty = (delta: number) => {
    const newValue = qtyGram + delta
    const adjustedValue = Math.floor(newValue / currentAsset.minUnit) * currentAsset.minUnit
    const finalValue = Math.max(0, adjustedValue)
    const roundedValue = roundToTwoDecimals(finalValue) 
    setQtyGram(roundedValue)
    setQtyInput(formatQuantity(roundedValue, asset)) 
    validateQty(roundedValue)
  }
  const adjustPrice = (delta: number) => {
    const next = roundToTwoDecimals(Math.max(0, limitPrice + delta))
    setLimitPrice(next)
    setLimitPriceStr(next.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  }

 
  const handleRecurringQuantityChange = (value: string) => {
    let filteredValue = value
    
    if (asset === "gold") {
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
    
    setRecurringQuantityStr(filteredValue)
    const numValue = parseFloat(filteredValue) || 0
    const roundedValue = roundToTwoDecimals(numValue) 
    setRecurringQuantity(roundedValue)
  }

  const handleRecurringQuantityBlur = () => {
    const numValue = parseFloat(recurringQuantityStr) || 0
    const adjustedValue = Math.floor(numValue / currentAsset.minUnit) * currentAsset.minUnit
    const roundedValue = roundToTwoDecimals(adjustedValue)  
    setRecurringQuantity(roundedValue)
    setRecurringQuantityStr(formatQuantity(roundedValue, asset))
  }

  const isRecurringOrderValid = () => {
    if (orderType !== "정기 주문") return true
    
    const basicValidation = (
      recurringQuantity > 0 &&
      recurringStartDate !== "" &&
      recurringEndDate !== "" &&
      new Date(recurringStartDate) <= new Date(recurringEndDate)
    )
    
    if (side === 'sell') {
      const currentHolding = userHoldings.find(h => h.asset === asset)
      if (!currentHolding || currentHolding.quantity < recurringQuantity) {
        return false
      }
    }
    
    return basicValidation
  }

  useEffect(() => {
    if (orderType === "정기 주문" && !recurringStartDate) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const year = tomorrow.getFullYear()
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
      const day = String(tomorrow.getDate()).padStart(2, '0')
      const tomorrowStr = `${year}-${month}-${day}`
      setRecurringStartDate(tomorrowStr)
    }
  }, [orderType, recurringStartDate])

  const DatePickerCalendar = ({ 
    calendarDate, 
    setCalendarDate, 
    selectedDate, 
    onDateSelect, 
    minDate 
  }: {
    calendarDate: Date
    setCalendarDate: React.Dispatch<React.SetStateAction<Date>>
    selectedDate: string
    onDateSelect: (dateStr: string) => void
    minDate?: Date
  }) => {
    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }
    
    const getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }
    
    const navigateMonth = (direction: 'prev' | 'next') => {
      setCalendarDate((prevDate: Date) => {
        const newDate = new Date(prevDate)
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else {
          newDate.setMonth(newDate.getMonth() + 1)
        }
        return newDate
      })
    }
    
    const isDateAvailable = (date: Date) => {
      if (minDate && date < minDate) {
        return false
      }
      return true
    }
    
    const isDateSelected = (date: Date) => {
      if (!selectedDate) return false
      const selected = new Date(selectedDate)
      return selected.getFullYear() === date.getFullYear() &&
             selected.getMonth() === date.getMonth() &&
             selected.getDate() === date.getDate()
    }
    
    const handleDateSelect = (date: Date) => {
      if (isDateAvailable(date)) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        onDateSelect(dateStr)
      }
    }
    
    const daysInMonth = getDaysInMonth(calendarDate)
    const firstDay = getFirstDayOfMonth(calendarDate)
    const days = []
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day))
    }
    
    return (
      <div className="bg-white rounded-[10px] shadow-sm border border-[#E6E6E6] p-4 absolute top-full right-0 mt-1 z-50 w-[280px]">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-[#F2F3F5] rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#333333]" />
          </button>
          <span
            className="text-[14px] text-[#333333]"
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            {calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월
          </span>
          <button
            type="button"
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-[#F2F3F5] rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[#333333]" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={day}
              className={`text-center text-[10px] py-1 ${
                index === 0 ? 'text-[#ED1551]' : index === 6 ? 'text-[#1B8FF0]' : 'text-[#818898]'
              }`}
              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-8"></div>
            }
            
            const isAvailable = isDateAvailable(date)
            const isSelected = isDateSelected(date)
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDateSelect(date)}
                disabled={!isAvailable}
                className={`
                  h-8 text-[12px] rounded-full transition-colors border-2
                  ${isSelected 
                    ? 'border-[#03856E] text-[#333333] bg-white' 
                    : isAvailable
                      ? 'border-transparent text-[#333333] hover:bg-[#F8F9FA] cursor-pointer'
                      : 'border-transparent text-[#CCCCCC] cursor-not-allowed'
                  }
                `}
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (orderType === "정기 주문") {
      setRecurringQuantity(0)
      setRecurringQuantityStr("")
    }
  }, [asset, orderType])

  const exportToPDF = async () => {
    try {
      setIsLoading(true)
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      pdf.setFont('helvetica')
      
      const createTextImage = (text: string, fontSize: number = 20) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        
        canvas.width = 800
        canvas.height = 100
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#000000'
        ctx.font = `${fontSize}px "Hana2-Medium", "Noto Sans KR", sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 + fontSize / 3)
        
        return canvas.toDataURL('image/png')
      }
      
      const titleImage = createTextImage(`${currentAsset.label} 투자 리포트`, 24)
      if (titleImage) {
        pdf.addImage(titleImage, 'PNG', 20, 10, pageWidth - 40, 15)
      }
      
      let yPosition = 30
      
      const dateImage = createTextImage(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, 14)
      if (dateImage) {
        pdf.addImage(dateImage, 'PNG', 20, yPosition, pageWidth - 40, 10)
        yPosition += 15
      }
      
      const headerImage = createTextImage('현재 시세 정보', 18)
      if (headerImage) {
        pdf.addImage(headerImage, 'PNG', 20, yPosition, pageWidth - 40, 12)
        yPosition += 18
      }
      
      const currentPrice = getCurrentPrice()
      const priceText = asset === "gold" 
        ? `현재가: ${(currentPrice / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/0.01g`
        : asset === "silver" 
        ? `현재가: ${currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/1g`
        : `현재가: ${currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원`
      
      const priceImage = createTextImage(priceText, 14)
      if (priceImage) {
        pdf.addImage(priceImage, 'PNG', 20, yPosition, pageWidth - 40, 10)
        yPosition += 12
      }
      
      const priceData = metalPrices[asset]
      if (priceData && priceData.changeValue !== undefined) {
        const changeText = asset === "gold" 
          ? `전일대비: ${priceData.isUp === 1 ? '+' : ''}${(priceData.changeValue/100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원(${priceData.changeRatio.toFixed(2)}%)`
          : `전일대비: ${priceData.isUp === 1 ? '+' : ''}${priceData.changeValue.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원(${priceData.changeRatio.toFixed(2)}%)`
        
        const changeImage = createTextImage(changeText, 14)
        if (changeImage) {
          pdf.addImage(changeImage, 'PNG', 20, yPosition, pageWidth - 40, 10)
          yPosition += 12
        }
      }
      
      if (priceData && priceData.time && priceData.round) {
        const roundText = `${priceData.time} 고시회차 ${priceData.round}회`
        const roundImage = createTextImage(roundText, 12)
        if (roundImage) {
          pdf.addImage(roundImage, 'PNG', 20, yPosition, pageWidth - 40, 8)
          yPosition += 15
        }
      }
      
      const chartElement = document.querySelector('.chart-container') as HTMLElement
      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
          })
          
          const imgData = canvas.toDataURL('image/png')
          const imgWidth = pageWidth - 40
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          
          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage()
            yPosition = 20
          }
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight)
          yPosition += imgHeight + 15
        } catch (error) {
          console.error('차트 캡처 실패:', error)
          const errorImage = createTextImage('차트를 불러올 수 없습니다.', 14)
          if (errorImage) {
            pdf.addImage(errorImage, 'PNG', 20, yPosition, pageWidth - 40, 10)
            yPosition += 15
          }
        }
      }
      
      if (dailyTableData.length > 0) {
        pdf.addPage()
        yPosition = 20
        
        const tableHeaderImage = createTextImage('일별시세표', 18)
        if (tableHeaderImage) {
          pdf.addImage(tableHeaderImage, 'PNG', 20, yPosition, pageWidth - 40, 12)
          yPosition += 20
        }
        
        const createTableHeaderImage = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return null
          
          canvas.width = 600
          canvas.height = 40
          ctx.fillStyle = '#f8f9fa'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#000000'
          ctx.font = '14px "Hana2-Medium", "Noto Sans KR", sans-serif'
          
          const headers = ['날짜', '매매기준율', '전일대비', '등락률']
          const colWidths = [120, 160, 120, 120]
          let x = 10
          
          headers.forEach((header, index) => {
            ctx.fillText(header, x, 25)
            x += colWidths[index]
          })
          
          return canvas.toDataURL('image/png')
        }
        
        const headerImage = createTableHeaderImage()
        if (headerImage) {
          pdf.addImage(headerImage, 'PNG', 20, yPosition, pageWidth - 40, 8)
          yPosition += 10
        }
        
        const limitedData = dailyTableData
        
        const createTableRowImage = (rowData: any) => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return null
          
          canvas.width = 600
          canvas.height = 30
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#000000'
          ctx.font = '12px "Hana2-Regular", "Noto Sans KR", sans-serif'
          
          const colWidths = [120, 160, 120, 120]
          let x = 10
          
          const dateStr = rowData.date ? rowData.date.split('T')[0].replace(/(\d{4})-(\d{2})-(\d{2})/, '$1.$2.$3') : '-'
          ctx.fillText(dateStr, x, 20)
          x += colWidths[0]
          
          const priceStr = rowData.close ? 
            (asset === "gold" ? 
              (rowData.close / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
              rowData.close.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ) : '-'
          ctx.fillText(priceStr, x, 20)
          x += colWidths[1]
          
          const diffStr = rowData.diff !== undefined ? 
            `${rowData.diff > 0 ? '+' : ''}${asset === "gold" ? 
              (rowData.diff / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
              rowData.diff.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }` : '-'
          
          if (rowData.diff > 0) {
            ctx.fillStyle = '#ED1551'
          } else if (rowData.diff < 0) {
            ctx.fillStyle = '#1B8FF0'
          }
          ctx.fillText(diffStr, x, 20)
          x += colWidths[2]
          
          const ratioStr = rowData.ratio !== undefined ? 
            `${rowData.ratio > 0 ? '+' : ''}${rowData.ratio.toFixed(2)}%` : '-'
          ctx.fillText(ratioStr, x, 20)
          
          return canvas.toDataURL('image/png')
        }
        
        limitedData.forEach((row) => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage()
            yPosition = 20
          }
          
          const rowImage = createTableRowImage(row)
          if (rowImage) {
            pdf.addImage(rowImage, 'PNG', 20, yPosition, pageWidth - 40, 6)
            yPosition += 7
          }
        })
        
        if (dailyTableData.length > 0) {
          yPosition += 5
          const noteImage = createTextImage(`* 총 ${dailyTableData.length}개의 데이터가 포함되었습니다.`, 12)
          if (noteImage) {
            pdf.addImage(noteImage, 'PNG', 20, yPosition, pageWidth - 40, 8)
          }
        }
      }
      
      const fileName = `${currentAsset.label.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_투자리포트_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('PDF 생성 실패:', error)
      alert('PDF 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChartWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.8 : 1.2
    const newZoom = Math.max(0.5, Math.min(5, chartZoom * delta))
    setChartZoom(newZoom)
  }

  const handleChartMouseDown = (e: React.MouseEvent) => {
    if (chartZoom > 1) {
      setIsDragging(true)
      setDragStart({ 
        x: e.clientX, 
        y: e.clientY, 
        pan: { x: chartPan.x, y: chartPan.y } 
      })
    }
  }

  const handleChartMouseMove = (e: React.MouseEvent) => {
    if (isDragging && chartZoom > 1) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      const maxPan = (chartZoom - 1) * 200
      
      const newPanX = Math.max(-maxPan, Math.min(maxPan, dragStart.pan.x + deltaX))
      const newPanY = Math.max(-maxPan, Math.min(maxPan, dragStart.pan.y + deltaY))
      
      setChartPan({ x: newPanX, y: newPanY })
    }
  }

  const handleChartMouseUp = () => {
    setIsDragging(false)
  }

  const resetChartView = () => {
    setChartZoom(1)
    setChartPan({ x: 0, y: 0 })
  }

  const handlePointMouseEnter = (e: React.MouseEvent, data: any) => {
    const chartContainer = e.currentTarget.closest('.relative')
    if (!chartContainer) return
    
    const containerRect = chartContainer.getBoundingClientRect()
    
    const mouseX = e.clientX - containerRect.left
    const mouseY = e.clientY - containerRect.top
    
    setTooltip({
      visible: true,
      x: mouseX,
      y: mouseY - 40,
      data: data
    })
  }

  const handlePointMouseMove = (e: React.MouseEvent) => {
    if (tooltip.visible) {
      const chartContainer = e.currentTarget.closest('.relative')
      if (!chartContainer) return
      
      const containerRect = chartContainer.getBoundingClientRect()
      
      const mouseX = e.clientX - containerRect.left
      const mouseY = e.clientY - containerRect.top
      
      setTooltip(prev => ({
        ...prev,
        x: mouseX,
        y: mouseY - 40
      }))
    }
  }

  const handlePointMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, data: null })
  }

  const RealTimeInfo = ({ time, round }: { time: string; round: string }) => {
    return `${time} 고시회차 ${round}회`
  }

  const Segmented = ({
    items,
    value,
    onChange,
    className = "",
  }: {
    items: { key: string; label: string }[]
    value: string
    onChange: (k: string) => void
    className?: string
  }) => (
    <div
      className={`w-[260px] h-[34px] flex items-center gap-[8px] ${className}`}
      role="tablist"
      aria-label="보기 선택"
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
            className={`w-[81px] h-[34px] rounded-[16px] text-[13px] leading-[17px] transition-all
              ${selected ? "bg-[#F2F3F5] text-[#2D3541]" : "text-[#454F5C]"}
            `}
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )

  useEffect(() => {
    const fetchMetalPrices = async (isInitial = false) => {
      try {
        if (isInitial) {
          setIsLoading(true)
        }
        
        const [goldResponse, silverResponse, usdResponse, jpyResponse, eurResponse, cnyResponse] = await Promise.all([
          fetch('/api/market/gold'),
          fetch('/api/market/silver'),
          fetch('/api/market/usd'),
          fetch('/api/market/jpy'),
          fetch('/api/market/eur'),
          fetch('/api/market/cny')
        ])
        
        const goldData = await goldResponse.json()
        const silverData = await silverResponse.json()
        const usdData = await usdResponse.json()
        const jpyData = await jpyResponse.json()
        const eurData = await eurResponse.json()
        const cnyData = await cnyResponse.json()
        
        setMetalPrices({
          gold: {
            currentPrice: goldData.currentPrice || 0,
            changeValue: goldData.changeValue || 0,
            changeRatio: goldData.changeRatio || 0,
            isUp: goldData.isUp || 0,
            round: goldData.round || '',
            time: goldData.time || ''
          },
          silver: {
            depositPrice: silverData.depositPrice || 0,
            withdrawalPrice: silverData.withdrawalPrice || 0,
            changeValue: silverData.changeValue || 0,
            changeRatio: silverData.changeRatio || 0,
            isUp: silverData.isUp || 0,
            round: silverData.round || '',
            time: silverData.time || ''
          },
          usd: {
            currentPrice: usdData.currentPrice || 0,
            changeValue: usdData.changeValue || 0,
            changeRatio: usdData.changeRatio || 0,
            isUp: usdData.isUp || 0,
            round: usdData.round || '',
            time: usdData.time || ''
          },
          jpy: {
            currentPrice: jpyData.currentPrice || 0,
            changeValue: jpyData.changeValue || 0,
            changeRatio: jpyData.changeRatio || 0,
            isUp: jpyData.isUp || 0,
            round: jpyData.round || '',
            time: jpyData.time || ''
          },
          eur: {
            currentPrice: eurData.currentPrice || 0,
            changeValue: eurData.changeValue || 0,
            changeRatio: eurData.changeRatio || 0,
            isUp: eurData.isUp || 0,
            round: eurData.round || '',
            time: eurData.time || ''
          },
          cny: {
            currentPrice: cnyData.currentPrice || 0,
            changeValue: cnyData.changeValue || 0,
            changeRatio: cnyData.changeRatio || 0,
            isUp: cnyData.isUp || 0,
            round: cnyData.round || '',
            time: cnyData.time || ''
          }
        })
        
        if (isInitial) {
          setIsLoading(false)
          setIsInitialLoad(false)
        }
      } catch (error) {
        console.error('금속 가격 정보 가져오기 실패:', error)
        if (isInitial) {
          setIsLoading(false)
          setIsInitialLoad(false)
        }
      }
    }

    fetchMetalPrices(true)
    
    const interval = setInterval(() => fetchMetalPrices(false), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const newPrice = currentPricePerGram
    setLimitPrice(newPrice)
    setLimitPriceStr(newPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  }, [asset, metalPrices, currentPricePerGram])

  const fetchChartData = async () => {
    const supportedAssets = ["gold", "silver", "usd", "eur", "jpy", "cny"]
    if (!supportedAssets.includes(asset)) return
    
    setIsChartLoading(true)
    setChartError(null)
    
    try {
      if (timeframe === "회차") {
        const apiEndpoints = {
          gold: '/api/chart/gold-round',
          silver: '/api/chart/silver-round',
          usd: '/api/chart/usd-round', 
          eur: '/api/chart/eur-round',
          jpy: '/api/chart/jpy-round',
          cny: '/api/chart/cny-round'
        }
        
        const response = await fetch(apiEndpoints[asset as keyof typeof apiEndpoints])
        const data = await response.json()
        
        if (data.isSuccess && data.result) {
          const chartData = data.result
          const convertedData = {
            openPrice: chartData.openPrice,
            lastClosePrice: chartData.lastClosePrice,
            currentDate: chartData.tradeBaseAt,
            lastDate: chartData.lastTradeBaseAt,
            localDateTime: chartData.localDateTimeNow,
            prices: chartData.priceInfos.map((price: any) => ({
              time: price.localDateTime,
              price: price.currentPrice,
              degreeCount: parseInt(price.degreeCount)
            })),
            minPrice: Math.min(...chartData.priceInfos.map((p: any) => p.currentPrice)),
            maxPrice: Math.max(...chartData.priceInfos.map((p: any) => p.currentPrice))
          }
          setChartData(convertedData)
          setChartError(null)
        } else {
          console.log('오늘 회차 데이터가 없습니다. 최근 거래일의 회차 데이터를 조회합니다.')
          
          const recentDateResponse = await fetch(`/api/chart/recent-trading-date?asset=${asset}`)
          const recentDateData = await recentDateResponse.json()
          
          if (recentDateData.success && recentDateData.date) {
            const recentRoundResponse = await fetch(`${apiEndpoints[asset as keyof typeof apiEndpoints]}?date=${recentDateData.date}`)
            const recentRoundData = await recentRoundResponse.json()
            
            if (recentRoundData.isSuccess && recentRoundData.result) {
              const chartData = recentRoundData.result
              const convertedData = {
                openPrice: chartData.openPrice,
                lastClosePrice: chartData.lastClosePrice,
                currentDate: chartData.tradeBaseAt,
                lastDate: chartData.lastTradeBaseAt,
                localDateTime: chartData.localDateTimeNow,
                prices: chartData.priceInfos.map((price: any) => ({
                  time: price.localDateTime,
                  price: price.currentPrice,
                  degreeCount: parseInt(price.degreeCount)
                })),
                minPrice: Math.min(...chartData.priceInfos.map((p: any) => p.currentPrice)),
                maxPrice: Math.max(...chartData.priceInfos.map((p: any) => p.currentPrice)),
                isFallback: true, 
                fallbackDate: recentDateData.date
              }
              setChartData(convertedData)
              setChartError(null) 
            } else {
              const errorMsg = '최근 거래일 회차 데이터를 불러올 수 없습니다.'
          setChartError(errorMsg)
              console.error('최근 거래일 회차 데이터 로드 실패:', errorMsg)
            }
          } else {
            const errorMsg = '최근 거래일을 찾을 수 없습니다.'
            setChartError(errorMsg)
            console.error('최근 거래일 조회 실패:', errorMsg)
          }
        }
      } else {
        const response = await fetch(`/api/chart/daily-prices?asset=${asset}&timeframe=${timeframe}`)
        const data = await response.json()
        
        if (data.success && data.data && data.data.length > 0) {
          const prices = data.data.map((item: any, index: number) => ({
            time: item.date,
            price: item.price,
            degreeCount: index + 1 
          }))
          
          const minPrice = Math.min(...prices.map((p: any) => p.price))
          const maxPrice = Math.max(...prices.map((p: any) => p.price))
          
          const convertedData = {
            prices: prices,
            minPrice: minPrice,
            maxPrice: maxPrice,
            timeframe: timeframe,
            asset: asset
          }
          
          setChartData(convertedData)
          setChartError(null)
        } else {
          const errorMsg = data.message || '차트 데이터를 불러올 수 없습니다.'
          setChartError(errorMsg)
          console.error('차트 데이터 로드 실패:', errorMsg)
        }
      }
    } catch (error) {
      const errorMsg = '네트워크 오류로 차트를 불러올 수 없습니다.'
      setChartError(errorMsg)
      console.error('차트 API 호출 실패:', error)
    } finally {
      setIsChartLoading(false)
    }
  }

  const fetchInitialDailyTableData = async () => {
    const supportedAssets = ["gold", "silver", "usd", "eur", "jpy", "cny"]
    if (!supportedAssets.includes(asset)) return
    
    setIsDailyTableLoading(true)
    setDailyTablePage(1)
    setHasMoreDailyData(true)
    
    try {
      const response = await fetch(`/api/market/${asset}?page=1`)
      const result = await response.json()
      
      if (result.success && result.data && result.data.length > 0) {
        setDailyTableData(result.data)
        setDailyTablePage(2) 
        
        if (asset === "silver") {
          setHasMoreDailyData(true)
        } else if (result.data.length < 10) {
          setHasMoreDailyData(false)
        }
      } else {
        setDailyTableData([])
        setHasMoreDailyData(false)
      }
    } catch (error) {
      console.error('일별시세표 초기 데이터 로드 실패:', error)
      setDailyTableData([])
      setHasMoreDailyData(false)
    } finally {
      setIsDailyTableLoading(false)
    }
  }

  const fetchMoreDailyTableData = async () => {
    const supportedAssets = ["gold", "silver", "usd", "eur", "jpy", "cny"]
    if (!supportedAssets.includes(asset) || isDailyTableLoading || !hasMoreDailyData) return
    
    setIsDailyTableLoading(true)
    
    try {
      const response = await fetch(`/api/market/${asset}?page=${dailyTablePage}`)
      const result = await response.json()
      
      if (result.success && result.data && result.data.length > 0) {
        setDailyTableData(prev => [...prev, ...result.data])
        setDailyTablePage(prev => prev + 1)
        
        if (asset === "silver") {
          setHasMoreDailyData(true)
        } else if (result.data.length < 10) {
          setHasMoreDailyData(false)
        }
      } else {
        setHasMoreDailyData(false)
      }
    } catch (error) {
      console.error('일별시세표 추가 데이터 로드 실패:', error)
      setHasMoreDailyData(false)
    } finally {
      setIsDailyTableLoading(false)
    }
  }

  useEffect(() => {
    const supportedAssets = ["gold", "silver", "usd", "eur", "jpy", "cny"]
    if (supportedAssets.includes(asset) && tab === "차트") {
      fetchChartData()
      resetChartView()
      setTooltip({ visible: false, x: 0, y: 0, data: null })
    } else {
      setChartData(null)
    }
  }, [asset, timeframe, tab])

  const [commentText, setCommentText] = useState("")
  const [sortType, setSortType] = useState<"최신순" | "인기순">("최신순")
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [showPollModal, setShowPollModal] = useState(false)
  const [pollTitle, setPollTitle] = useState("")
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""])
  const [pollIsMultiple, setPollIsMultiple] = useState(false)
  const [pollEndDate, setPollEndDate] = useState("")
  const [selectedPoll, setSelectedPoll] = useState<any>(null)
  
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [replyText, setReplyText] = useState("")
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  
  const isCurrentAssetHeld = () => {
    if (!userHoldings || userHoldings.length === 0) {
      console.log('보유 자산이 없음:', { userHoldings, asset })
      return false
    }
    const currentHolding = userHoldings.find(h => h.asset === asset)
    const hasAsset = currentHolding && currentHolding.quantity > 0
    console.log('현재 자산 보유 여부:', { asset, currentHolding, hasAsset })
    return hasAsset
  }

  const [communityPosts, setCommunityPosts] = useState<any[]>([])
  const [isCommunityLoading, setIsCommunityLoading] = useState(false)
  const [isInitialCommunityLoad, setIsInitialCommunityLoad] = useState(true)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [communityPage, setCommunityPage] = useState(1)
  const communityObserverRef = useRef<IntersectionObserver | null>(null)
  const communityLoadingRef = useRef<HTMLDivElement>(null)

  const [showUserProfileModal, setShowUserProfileModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedUserName, setSelectedUserName] = useState<string>("")
  const [selectedUserImage, setSelectedUserImage] = useState<string>("")
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [isLoadingUserPosts, setIsLoadingUserPosts] = useState(false)
  
  const [showCommunityModal, setShowCommunityModal] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error' | 'confirm'>('success')
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [modalAction, setModalAction] = useState<(() => void) | null>(null)
  const [userPostsError, setUserPostsError] = useState<string>("")
  
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderModalType, setOrderModalType] = useState<'success' | 'error' | 'confirm'>('success')
  const [orderModalTitle, setOrderModalTitle] = useState('')
  const [orderModalMessage, setOrderModalMessage] = useState('')
  const [orderModalAction, setOrderModalAction] = useState<(() => void) | null>(null)

  const showSuccessModal = (title: string, message: string) => {
    setModalType('success')
    setModalTitle(title)
    setModalMessage(message)
    setModalAction(null)
    setShowCommunityModal(true)
  }

  const showErrorModal = (title: string, message: string) => {
    setModalType('error')
    setModalTitle(title)
    setModalMessage(message)
    setModalAction(null)
    setShowCommunityModal(true)
  }

  const showConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setModalType('confirm')
    setModalTitle(title)
    setModalMessage(message)
    setModalAction(() => onConfirm)
    setShowCommunityModal(true)
  }

  const handleModalConfirm = () => {
    if (modalAction) {
      modalAction()
    }
    setShowCommunityModal(false)
  }

  const handleModalCancel = () => {
    setShowCommunityModal(false)
  }

  const showOrderSuccessModal = (title: string, message: string) => {
    setOrderModalType('success')
    setOrderModalTitle(title)
    setOrderModalMessage(message)
    setOrderModalAction(null)
    setShowOrderModal(true)
  }

  const showOrderErrorModal = (title: string, message: string) => {
    setOrderModalType('error')
    setOrderModalTitle(title)
    setOrderModalMessage(message)
    setOrderModalAction(null)
    setShowOrderModal(true)
  }

  const showOrderConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setOrderModalType('confirm')
    setOrderModalTitle(title)
    setOrderModalMessage(message)
    setOrderModalAction(() => onConfirm)
    setShowOrderModal(true)
  }

  const handleOrderModalConfirm = () => {
    if (orderModalAction) {
      orderModalAction()
    }
    setShowOrderModal(false)
  }

  const handleOrderModalCancel = () => {
    setShowOrderModal(false)
  }

  const fetchCommunityPostsWithPage = async (page: number, isInitial = false, targetAsset?: string) => {
    if (isCommunityLoading || !userInfo) return

    console.log('커뮤니티 게시글 조회 시작:', { isInitial, page, sortType, asset, userInfo: userInfo.id })
    setIsCommunityLoading(true)
    
    try {
      const sortBy = sortType === "인기순" ? "popular" : "latest"
      const currentAsset = targetAsset || asset
      const response = await fetch(`/api/community/posts?page=${page}&limit=10&sortBy=${sortBy}&asset=${currentAsset}`)
      const result = await response.json()
      
      console.log('커뮤니티 API 응답:', result)
      
      if (result.success && result.data) {
        let postsWithUserStatus = result.data
        
        try {
          const postIds = result.data.map((post: any) => post.id)
          const userIds = [...new Set(result.data.map((post: any) => post.user.id))]
          const pollIds = result.data.filter((post: any) => post.poll).map((post: any) => post.poll.id)
          
          const batchPromises = [
            fetch(`/api/community/posts/batch-likes?userId=${userInfo.id}&postIds=${postIds.join(',')}`),
            fetch(`/api/community/follow/batch?followerId=${userInfo.id}&followingIds=${userIds.join(',')}`)
          ]
          
          if (pollIds.length > 0) {
            batchPromises.push(fetch(`/api/polls/batch-votes?userId=${userInfo.id}&pollIds=${pollIds.join(',')}`))
          }
          
          const responses = await Promise.all(batchPromises)
          const likesData = await responses[0].json()
          const followsData = await responses[1].json()
          const votesData = responses[2] ? await responses[2].json() : { success: true, data: {} }
          
          postsWithUserStatus = result.data.map((post: any) => ({
            ...post,
            isLiked: likesData.success ? (likesData.data[post.id] || false) : false,
            isFollowing: followsData.success ? (followsData.data[post.user.id] || false) : false,
            userVotes: votesData.success ? (votesData.data[post.poll?.id] || []) : []
          }))
        } catch (batchError) {
          console.warn('배치 API 실패, 기본값 사용:', batchError)
          postsWithUserStatus = result.data.map((post: any) => ({
            ...post,
            isLiked: false,
            isFollowing: false,
            userVotes: []
          }))
        }
        
        console.log('처리된 게시글:', postsWithUserStatus)
        
        if (isInitial) {
          setCommunityPosts(postsWithUserStatus)
          setCommunityPage(2)
        } else {
          setCommunityPosts(prev => [...prev, ...postsWithUserStatus])
          setCommunityPage(prev => prev + 1)
        }
        
        if (result.data.length < 10) {
          setHasMorePosts(false)
        }
      } else {
        console.error('커뮤니티 게시글 조회 실패:', result.error)
        if (isInitial) {
          setCommunityPosts([])
        }
        setHasMorePosts(false)
      }
    } catch (error) {
      console.error('커뮤니티 게시글 조회 오류:', error)
      if (isInitial) {
        setCommunityPosts([])
      }
      setHasMorePosts(false)
    } finally {
      setIsCommunityLoading(false)
      if (isInitial) {
        setIsInitialCommunityLoad(false)
      }
      console.log('커뮤니티 게시글 조회 완료')
    }
  }

  const fetchCommunityPosts = async (isInitial = false) => {
    return fetchCommunityPostsWithPage(communityPage, isInitial)
  }

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        const newWidth = img.width * ratio
        const newHeight = img.height * ratio
        
        canvas.width = newWidth
        canvas.height = newHeight
        
        ctx?.drawImage(img, 0, 0, newWidth, newHeight)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', quality)
      }
      
      img.onerror = () => {
        resolve(file) 
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 첨부할 수 있습니다.')
        return
      }
      
      try {
        const compressedFile = await compressImage(file, 600, 0.6)
        
        let finalFile = compressedFile
        if (compressedFile.size > 1 * 1024 * 1024) {
          finalFile = await compressImage(compressedFile, 400, 0.4)
        }
        
        if (finalFile.size > 1.5 * 1024 * 1024) { 
          alert('이미지가 너무 큽니다. 더 작은 이미지를 선택해주세요.')
          return
        }
        
        setSelectedImage(finalFile)
        
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(finalFile)
      } catch (error) {
        console.error('이미지 압축 오류:', error)
        alert('이미지 처리 중 오류가 발생했습니다.')
      }
    }
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const addPollOption = () => {
    if (pollOptions.length < 5) { 
      setPollOptions([...pollOptions, ""])
    }
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) { 
      const newOptions = pollOptions.filter((_, i) => i !== index)
      setPollOptions(newOptions)
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const handlePollCreate = () => {
    if (!pollTitle.trim()) {
      alert('투표 제목을 입력해주세요.')
      return
    }
    
    const validOptions = pollOptions.filter(option => option.trim())
    if (validOptions.length < 2) {
      alert('최소 2개의 선택지를 입력해주세요.')
      return
    }

    const pollData = {
      title: pollTitle.trim(),
      options: validOptions,
      isMultiple: pollIsMultiple,
      endDate: pollEndDate || null
    }

    setSelectedPoll(pollData)
    setShowPollModal(false)
  }

  const handlePollCancel = () => {
    setShowPollModal(false)
    setPollTitle("")
    setPollOptions(["", ""])
    setPollIsMultiple(false)
    setPollEndDate("")
  }

  const handlePollRemove = () => {
    setSelectedPoll(null)
  }

  const handleVote = async (pollId: string, optionId: string, isMultiple: boolean, currentUserVotes: any[]) => {
    if (!userInfo) {
      showErrorModal('로그인 필요', '로그인이 필요합니다.')
      return
    }

    try {
      const hasVotedForThisOption = currentUserVotes.some((vote: any) => vote.optionId === optionId)
      
      let optionIds: string[] = []
      
      if (hasVotedForThisOption) {
        if (isMultiple) {
          optionIds = currentUserVotes
            .filter((vote: any) => vote.optionId !== optionId)
            .map((vote: any) => vote.optionId)
        } else {
          optionIds = []
        }
      } else {
        if (isMultiple) {
          optionIds = [...currentUserVotes.map((vote: any) => vote.optionId), optionId]
        } else {
          optionIds = [optionId]
        }
      }
      
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id,
          optionIds: optionIds
        })
      })

      const result = await response.json()

      if (result.success) {
        setCommunityPosts([])
        setCommunityPage(1)
        setHasMorePosts(true)
        setIsInitialCommunityLoad(true)
        setIsCommunityLoading(false)
        await fetchCommunityPostsWithPage(1, true)
      } else {
        alert(`투표 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('투표 오류:', error)
      alert('투표 중 오류가 발생했습니다.')
    }
  }

  const handlePostSubmit = async () => {
    if ((!commentText.trim() && !selectedImage && !selectedPoll) || !userInfo) {
      alert('댓글 내용을 입력하거나 사진을 첨부하거나 투표를 생성해주세요.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('userId', userInfo.id.toString())
      formData.append('asset', asset)
      formData.append('content', commentText.trim() || '')
      
      if (selectedImage) {
        formData.append('image', selectedImage)
      }
      
      if (selectedPoll) {
        formData.append('pollData', JSON.stringify(selectedPoll))
      }

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setCommentText("")
        setSelectedImage(null)
        setImagePreview(null)
        setSelectedPoll(null)
        setCommunityPosts([])
        setCommunityPage(1)
        setHasMorePosts(true)
        setIsInitialCommunityLoad(true)
        setIsCommunityLoading(false)
        await fetchCommunityPostsWithPage(1, true)
        showSuccessModal('게시글 작성', '게시글이 작성되었습니다.')
      } else {
        showErrorModal('게시글 작성 실패', result.error)
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error)
      showErrorModal('게시글 작성 오류', '게시글 작성 중 오류가 발생했습니다.')
    }
  }

  const handleLikeToggle = async (postId: string, currentLikes: number) => {
    if (!userInfo) {
      showErrorModal('로그인 필요', '로그인이 필요합니다.')
      return
    }

    setCommunityPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newIsLiked = !post.isLiked
        const newLikes = newIsLiked ? post.likes + 1 : post.likes - 1
        return { ...post, isLiked: newIsLiked, likes: newLikes }
      }
      return post
    }))

    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        setCommunityPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const originalIsLiked = !post.isLiked
            const originalLikes = originalIsLiked ? post.likes - 1 : post.likes + 1
            return { ...post, isLiked: originalIsLiked, likes: originalLikes }
          }
          return post
        }))
        showErrorModal('좋아요 처리 실패', result.error)
      }
    } catch (error) {
      console.error('좋아요 토글 오류:', error)
      setCommunityPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const originalIsLiked = !post.isLiked
          const originalLikes = originalIsLiked ? post.likes - 1 : post.likes + 1
          return { ...post, isLiked: originalIsLiked, likes: originalLikes }
        }
        return post
      }))
      showErrorModal('좋아요 처리 오류', '좋아요 처리 중 오류가 발생했습니다.')
    }
  }

  const handleFollowToggle = async (targetUserId: string) => {
    if (!userInfo) {
      showErrorModal('로그인 필요', '로그인이 필요합니다.')
      return
    }

    setCommunityPosts(prev => prev.map(post => {
      if (post.user.id === targetUserId) {
        return { ...post, isFollowing: !post.isFollowing }
      }
      return post
    }))

    try {
      const response = await fetch('/api/community/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: userInfo.id,
          followingId: targetUserId
        })
      })

      const result = await response.json()

      if (!result.success) {
        setCommunityPosts(prev => prev.map(post => {
          if (post.user.id === targetUserId) {
            return { ...post, isFollowing: !post.isFollowing }
          }
          return post
        }))
        showErrorModal('팔로우 처리 실패', result.error)
      }
    } catch (error) {
      console.error('팔로우 토글 오류:', error)
      setCommunityPosts(prev => prev.map(post => {
        if (post.user.id === targetUserId) {
          return { ...post, isFollowing: !post.isFollowing }
        }
        return post
      }))
      showErrorModal('팔로우 처리 오류', '팔로우 처리 중 오류가 발생했습니다.')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!userInfo) {
      showErrorModal('로그인 필요', '로그인이 필요합니다.')
      return
    }

    showConfirmModal('게시글 삭제', '정말로 이 게시글을 삭제하시겠습니까?', async () => {
      await performDeletePost(postId)
    })
  }

  const performDeletePost = async (postId: string) => {
    if (!userInfo) return

    try {
      console.log('게시글 삭제 요청:', { postId, userId: userInfo.id })
      
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id
        })
      })

      console.log('삭제 응답 상태:', response.status)

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('API 응답이 JSON이 아닙니다:', text)
        alert('서버 오류가 발생했습니다. 페이지를 새로고침해주세요.')
        return
      }

      const result = await response.json()
      console.log('삭제 응답:', result)

      if (result.success) {
        setCommunityPosts(prev => prev.filter(post => post.id !== postId))
        showSuccessModal('게시글 삭제', '게시글이 삭제되었습니다.')
      } else {
        showErrorModal('게시글 삭제 실패', result.error)
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error)
      showErrorModal('게시글 삭제 오류', '게시글 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleReplyClick = async (post: any) => {
    setSelectedPost(post)
    setShowReplyModal(true)
    await fetchReplies(post.id)
  }

  const fetchReplies = async (postId: string) => {
    if (!userInfo) return
    
    setIsLoadingReplies(true)
    try {
      const response = await fetch(`/api/community/posts/${postId}/replies?userId=${userInfo.id}`)
      const result = await response.json()
      
      if (result.success) {
        setReplies(result.data || [])
      } else {
        console.error('대댓글 조회 실패:', result.error)
        setReplies([])
      }
    } catch (error) {
      console.error('대댓글 조회 오류:', error)
      setReplies([])
    } finally {
      setIsLoadingReplies(false)
    }
  }

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !userInfo || !selectedPost) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`/api/community/posts/${selectedPost.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id,
          content: replyText.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        setReplyText("")
        await fetchReplies(selectedPost.id)
        setCommunityPosts([])
        setCommunityPage(1)
        setHasMorePosts(true)
        setIsInitialCommunityLoad(true)
        setIsCommunityLoading(false)
        await fetchCommunityPostsWithPage(1, true)
      } else {
        alert(`댓글 작성 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    }
  }

  const handleReplyModalClose = () => {
    setShowReplyModal(false)
    setSelectedPost(null)
    setReplies([])
    setReplyText("")
  }

  const handleReplyDelete = async (commentId: string) => {
    if (!userInfo || !selectedPost) {
      showErrorModal('로그인 필요', '로그인이 필요합니다.')
      return
    }

    showConfirmModal('댓글 삭제', '정말로 이 댓글을 삭제하시겠습니까?', async () => {
      await performDeleteComment(commentId)
    })
  }

  const performDeleteComment = async (commentId: string) => {
    if (!userInfo || !selectedPost) return

    try {
      const response = await fetch(`/api/community/posts/${selectedPost.id}/replies?commentId=${commentId}&userId=${userInfo.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchReplies(selectedPost.id)
        setCommunityPosts([])
        setCommunityPage(1)
        setHasMorePosts(true)
        setIsInitialCommunityLoad(true)
        setIsCommunityLoading(false)
        await fetchCommunityPostsWithPage(1, true)
      } else {
        showErrorModal('댓글 삭제 실패', result.error)
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error)
      showErrorModal('댓글 삭제 오류', '댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleUserProfileClick = (userId: string, userName: string, userImage: string) => {
    if (userId === String(userInfo?.id)) {
      setSelectedUserId(userId)
      setSelectedUserName(userName)
      setSelectedUserImage(userImage)
      setShowUserProfileModal(true)
      fetchUserPosts(userId)
    } else {
      setSelectedUserId(userId)
      setSelectedUserName(userName)
      setSelectedUserImage(userImage)
      setShowUserProfileModal(true)
      fetchUserPosts(userId)
    }
  }

  const fetchUserPosts = async (userId: string) => {
    if (!userInfo) return

    setIsLoadingUserPosts(true)
    setUserPostsError("")
    try {
      const response = await fetch(`/api/posts/user/${userId}?requesterId=${userInfo.id}`)
      const result = await response.json()

      if (result.success) {
        setUserPosts(result.posts || [])
        setUserPostsError("")
      } else {
        setUserPosts([])
        if (result.error === '작성자가 글을 공개하지 않았습니다.') {
          setUserPostsError("이 사용자는 작성한 글을 공개하지 않았습니다.")
        } else {
          setUserPostsError("게시글을 불러올 수 없습니다.")
        }
      }
    } catch (error) {
      console.error('사용자 게시글 조회 오류:', error)
      setUserPosts([])
      setUserPostsError("게시글을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoadingUserPosts(false)
    }
  }

  const handleUserProfileModalClose = () => {
    setShowUserProfileModal(false)
    setSelectedUserId("")
    setSelectedUserName("")
    setSelectedUserImage("")
    setUserPosts([])
    setUserPostsError("")
  }

  useEffect(() => {
    if (tab === "커뮤니티" && userInfo) {
      setCommunityPosts([])
      setCommunityPage(1)
      setHasMorePosts(true)
      setIsInitialCommunityLoad(true)
      setIsCommunityLoading(false)
      
      fetchCommunityPostsWithPage(1, true)
    }
  }, [tab, sortType, asset, userInfo])

  useEffect(() => {
    if (tab !== "커뮤니티") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePosts && !isCommunityLoading && communityPosts.length > 0) {
          fetchCommunityPosts(false)
        }
      },
      { threshold: 0.1 }
    )

    if (communityLoadingRef.current) {
      observer.observe(communityLoadingRef.current)
    }

    communityObserverRef.current = observer

    return () => {
      if (communityObserverRef.current) {
        communityObserverRef.current.disconnect()
      }
    }
  }, [tab, hasMorePosts, isCommunityLoading, communityPosts.length])

  useEffect(() => {
    const supportedAssets = ["gold", "silver", "usd", "eur", "jpy", "cny"]
    if (supportedAssets.includes(asset) && tab === "차트") {
      fetchInitialDailyTableData()
    } else {
      setDailyTableData([])
      setDailyTablePage(1)
      setHasMoreDailyData(true)
    }
  }, [asset, tab])

  useEffect(() => {
    const supportedAssets = ["gold", "silver", "usd", "eur", "jpy", "cny"]
    if (!supportedAssets.includes(asset) || tab !== "차트") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreDailyData && !isDailyTableLoading && dailyTableData.length > 0) {
          fetchMoreDailyTableData()
        }
      },
      { threshold: 0.1 }
    )

    if (dailyTableLoadingRef.current) {
      observer.observe(dailyTableLoadingRef.current)
    }

    dailyTableObserverRef.current = observer

    return () => {
      if (dailyTableObserverRef.current) {
        dailyTableObserverRef.current.disconnect()
      }
    }
  }, [asset, tab, hasMoreDailyData, isDailyTableLoading, dailyTableData.length])


  const NewsSection = () => {
    const [newsItems, setNewsItems] = useState<any[]>([])
    const [isNewsLoading, setIsNewsLoading] = useState(false)
    const [isInitialNewsLoad, setIsInitialNewsLoad] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)
    const [sortOrder, setSortOrder] = useState<"relevant" | "latest">("latest")
    
    const [showNewsDetail, setShowNewsDetail] = useState(false)
    const [selectedNews, setSelectedNews] = useState<any>(null)
    const [newsDetail, setNewsDetail] = useState<any>(null)
    const [isLoadingNewsDetail, setIsLoadingNewsDetail] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadingRef = useRef<HTMLDivElement>(null)

    const cleanText = (text: string) => {
      return text
        .replace(/ETF/gi, '외환')
        .replace(/\\u003Cb>/g, '')
        .replace(/\\u003C\/b>/g, '') 
        .replace(/\\u003Cb/g, '') 
        .replace(/\\u003C\/b/g, '') 
        .replace(/\\u003C/g, '') 
        .replace(/\\u003E/g, '') 
        .replace(/<b>/g, '')
        .replace(/<\/b>/g, '') 
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '')
        .replace(/&gt;/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim()
    }

    const fetchNewsDetail = async (newsId: string) => {
      setIsLoadingNewsDetail(true)
      
      try {
        const response = await fetch(`/api/news?newsId=${newsId}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setNewsDetail(result.data)
        } else {
          setNewsDetail(null)
        }
      } catch (error) {
        setNewsDetail(null)
      } finally {
        setIsLoadingNewsDetail(false)
      }
    }

    const handleNewsClick = (news: any) => {
      setSelectedNews(news)
      setShowNewsDetail(true)
      fetchNewsDetail(news.id)
    }

    const fetchNews = async (isInitial = false) => {
      if (isNewsLoading) return

      setIsNewsLoading(true)
      
      try {
        const response = await fetch(`/api/news?asset=${asset}&size=200&orderBy=${sortOrder}`)
        const result = await response.json()
        
        console.log('뉴스 API 응답:', result)
        
        if (result.success && result.data) {
          if (isInitial) {
            setNewsItems(result.data)
            setPage(1)
          } else {
            setNewsItems(prev => [...prev, ...result.data])
            setPage(prev => prev + 1)
          }
          
          setHasMore(false)
        } else {
          if (result.data) {
            if (isInitial) {
              setNewsItems(result.data)
            } else {
              setNewsItems(prev => [...prev, ...result.data])
            }
          }
          setHasMore(false)
        }
        
        if (isInitial) {
          setIsInitialNewsLoad(false)
        }
      } catch (error) {
        console.error('뉴스 로드 실패:', error)
        if (isInitial) {
          setIsInitialNewsLoad(false)
        }
        setHasMore(false)
      } finally {
        setIsNewsLoading(false)
      }
    }

    useEffect(() => {
      setNewsItems([])
      setIsInitialNewsLoad(true)
      setHasMore(true)
      setPage(0)
      fetchNews(true)
    }, [asset, sortOrder]) 

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isNewsLoading && newsItems.length > 0) {
            loadMoreNews()
          }
        },
        { threshold: 0.1 }
      )

      if (loadingRef.current) {
        observer.observe(loadingRef.current)
      }

      observerRef.current = observer

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect()
        }
      }
    }, [hasMore, isNewsLoading, newsItems.length])

    const loadMoreNews = () => {
      if (isNewsLoading || !hasMore) return
    }

    return (
      <div className="relative h-full">
        <LoadingOverlay isVisible={isInitialNewsLoad && isNewsLoading} />
        
        <div className="flex justify-start mb-4">
          <div className="w-[160px]">
            <div
              className="w-[160px] h-[34px] flex items-center gap-[8px]"
              role="tablist"
              aria-label="정렬 선택"
            >
              <button
                type="button"
                role="tab"
                aria-selected={sortOrder === "latest"}
                onClick={() => setSortOrder("latest")}
                className={`w-[76px] h-[34px] rounded-[16px] text-[13px] leading-[17px] transition-all
                  ${sortOrder === "latest" ? "bg-[#F2F3F5] text-[#2D3541]" : "text-[#454F5C]"}
                `}
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                최신순
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sortOrder === "relevant"}
                onClick={() => setSortOrder("relevant")}
                className={`w-[76px] h-[34px] rounded-[16px] text-[13px] leading-[17px] transition-all
                  ${sortOrder === "relevant" ? "bg-[#F2F3F5] text-[#2D3541]" : "text-[#454F5C]"}
                `}
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                관련도순
              </button>
            </div>
          </div>
        </div>
        
        <div className="h-[calc(100%-50px)] overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="space-y-0">
            {!isInitialNewsLoad && newsItems.map((news, index) => (
              <div key={news.id} className="relative">
                <div 
                  className="flex items-start gap-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleNewsClick(news)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] leading-[19px] text-[#333333] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      {cleanText(news.title || '')}
                    </h3>
                    
                    <p className="text-[13px] leading-[17px] text-[#404048] mb-2 line-clamp-2" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                      {cleanText(news.content || news.summary || '내용 없음')}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] leading-[17px] text-[#929294]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                        {news.sourceName || news.source || '출처 미상'}
                      </span>
                      <span className="text-[13px] leading-[17px] text-[#929294]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                        {news.time}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-[97px] h-[69px] rounded-[5px] overflow-hidden bg-gray-200">
                      <Image 
                        src={news.image} 
                        alt="뉴스 이미지" 
                        width={97} 
                        height={69}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                {index < newsItems.length - 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#D9D9D9]" />
                )}
              </div>
            ))}
            
            {hasMore && !isInitialNewsLoad && (
              <div ref={loadingRef} className="py-4 text-center">
                {isNewsLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[13px] text-[#929294]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                      뉴스를 불러오는 중...
                    </span>
                  </div>
                ) : (
                  <div className="h-4" /> 
                )}
              </div>
            )}
            
            {!isInitialNewsLoad && !isNewsLoading && newsItems.length === 0 && (
              <div className="py-8 text-center">
                <span className="text-[13px] text-[#929294]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                  해당 자산의 뉴스가 없습니다.
                </span>
              </div>
            )}
            
            {!hasMore && !isInitialNewsLoad && newsItems.length > 0 && (
              <div className="py-4 text-center">
                <span className="text-[13px] text-[#929294]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                  모든 뉴스를 불러왔습니다.
                </span>
              </div>
            )}
          </div>
        </div>
        
        {showNewsDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[20px] p-6 w-[800px] mx-4 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowNewsDetail(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              {isLoadingNewsDetail ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      뉴스 상세를 불러오는 중...
                    </span>
                  </div>
                </div>
              ) : newsDetail ? (
                <div className="space-y-6">
                  <div className="border-b border-[#E6E6E6] pb-4">
                    <h2 
                      className="text-[20px] text-[#2D3541] mb-3"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {newsDetail.title}
                    </h2>
                    <div className="flex items-center gap-4 text-[14px] text-[#666]">
                      <span style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                        {new Date(newsDetail.createdAt).toLocaleString('ko-KR')}
                      </span>
                      <span style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                        {newsDetail.source?.name || '출처 미상'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {newsDetail.content?.map((item: any, index: number) => {
                      if (item.type === 'image') {
                        const isFirstImage = newsDetail.content?.findIndex((content: any) => content.type === 'image') === index
                        if (!isFirstImage) return null
                      }
                      
                      return (
                        <div key={index}>
                          {item.type === 'image' && (
                            <div className="my-4">
                              <img 
                                src={item.content} 
                                alt={item.caption || '뉴스 이미지'} 
                                className="w-full max-w-[600px] mx-auto rounded-[8px]"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                              {item.caption && (
                                <p 
                                  className="text-[12px] text-[#666] text-center mt-2"
                                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                                >
                                  {item.caption}
                                </p>
                              )}
                            </div>
                          )}
                          {item.type === 'text' && (
                            <p 
                              className="text-[15px] leading-[24px] text-[#2D3541]"
                              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                              dangerouslySetInnerHTML={{ __html: item.content }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>             
                </div>
              ) : (
                <div className="text-center py-8">
                  <div 
                    className="text-[14px] text-[#999]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    뉴스 상세를 불러올 수 없습니다
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
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
    <div className="w-full bg-[#FFFFFF] min-h-screen">
      <LoadingOverlay isVisible={isLoading || isOrderProcessing} />
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
        onPostNotificationClick={handlePostNotificationClick}
      />

      <main className="pt-24 pb-40">
        <div className="max-w-[1335px] mx-auto px-4">
<section
  ref={assetCardRef}
  className="relative bg-white rounded-[10px] shadow-md h-[78px] px-6 py-3 flex items-center justify-between"
>
  <div className="flex items-start gap-3">
    <div className="relative w-10 h-10 mt-[2px]">
      <Image src={currentAsset.icon} alt="상품 아이콘" fill className="object-contain" />
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-[12px] sm:text-[15px] text-[#333]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
        {currentAsset.label}
      </span>
      <div className="mt-[2px] flex items-center flex-wrap gap-x-3 gap-y-1">
        <span className="text-[11px] sm:text-[15px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
          {asset === "gold" && metalPrices.gold.currentPrice > 0
            ? `${(metalPrices.gold.currentPrice / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/0.01g`
            : asset === "silver" && metalPrices.silver.depositPrice > 0
            ? `${metalPrices.silver.depositPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/1g`
            : asset === "usd" && metalPrices.usd.currentPrice > 0
            ? `${metalPrices.usd.currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/$`
            : asset === "jpy" && metalPrices.jpy.currentPrice > 0
            ? `${metalPrices.jpy.currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/¥`
            : asset === "eur" && metalPrices.eur.currentPrice > 0
            ? `${metalPrices.eur.currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/€`
            : asset === "cny" && metalPrices.cny.currentPrice > 0
            ? `${metalPrices.cny.currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/¥`
            : `— ${currentAsset.unit}`}
        </span>
        <span className="text-[11px] sm:text-[15px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>전일대비</span>
        <span 
          className={`text-[11px] sm:text-[15px] ${
            asset === "gold" 
              ? (metalPrices.gold.isUp === 1 ? "text-[#ED1551]" : "text-[#1B8FF0]")
              : asset === "silver"
              ? (metalPrices.silver.isUp === 1 ? "text-[#ED1551]" : "text-[#1B8FF0]")
              : asset === "usd"
              ? (metalPrices.usd.isUp === 1 ? "text-[#ED1551]" : "text-[#1B8FF0]")
              : asset === "jpy"
              ? (metalPrices.jpy.isUp === 1 ? "text-[#ED1551]" : "text-[#1B8FF0]")
              : asset === "eur"
              ? (metalPrices.eur.isUp === 1 ? "text-[#ED1551]" : "text-[#1B8FF0]")
              : asset === "cny"
              ? (metalPrices.cny.isUp === 1 ? "text-[#ED1551]" : "text-[#1B8FF0]")
              : "text-[#ED1551]"
          }`} 
          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
        >
          {asset === "gold" && metalPrices.gold.changeValue !== undefined
            ? `${metalPrices.gold.isUp === 1 ? '+' : ''}${(metalPrices.gold.changeValue/100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원(${metalPrices.gold.changeRatio.toFixed(2)}%)`
            : asset === "silver" && metalPrices.silver.changeValue !== undefined
            ? `${metalPrices.silver.isUp === 1 ? '+' : ''}${metalPrices.silver.changeValue.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원(${metalPrices.silver.changeRatio.toFixed(2)}%)`
            : asset === "usd" && metalPrices.usd.changeValue !== undefined
            ? `${metalPrices.usd.isUp === 1 ? '+' : ''}${metalPrices.usd.changeValue.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원(${metalPrices.usd.changeRatio.toFixed(2)}%)`
            : asset === "jpy" && metalPrices.jpy.changeValue !== undefined
            ? `${metalPrices.jpy.isUp === 1 ? '+' : ''}${metalPrices.jpy.changeValue.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원(${metalPrices.jpy.changeRatio.toFixed(2)}%)`
            : asset === "eur" && metalPrices.eur.changeValue !== undefined
            ? `${metalPrices.eur.isUp === 1 ? '+' : ''}${metalPrices.eur.changeValue.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원(${metalPrices.eur.changeRatio.toFixed(2)}%)`
            : asset === "cny" && metalPrices.cny.changeValue !== undefined
            ? `${metalPrices.cny.isUp === 1 ? '+' : ''}${metalPrices.cny.changeValue.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원(${metalPrices.cny.changeRatio.toFixed(2)}%)`
            : "+0원(0.00%)"}
        </span>
        <span className="text-[11px] sm:text-[15px] text-[#808A96]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
          {asset === "gold" && metalPrices.gold.round ? (
            <RealTimeInfo 
              time={metalPrices.gold.time} 
              round={metalPrices.gold.round} 
            />
          ) : asset === "silver" && metalPrices.silver.round ? (
            <RealTimeInfo 
              time={metalPrices.gold.time} 
              round={metalPrices.gold.round} 
            />
          ) : asset === "usd" && metalPrices.usd.round ? (
            <RealTimeInfo 
              time={metalPrices.usd.time} 
              round={metalPrices.usd.round} 
            />
          ) : asset === "jpy" && metalPrices.jpy.round ? (
            <RealTimeInfo 
              time={metalPrices.jpy.time} 
              round={metalPrices.jpy.round} 
            />
          ) : asset === "eur" && metalPrices.eur.round ? (
            <RealTimeInfo 
              time={metalPrices.eur.time} 
              round={metalPrices.eur.round} 
            />
          ) : asset === "cny" && metalPrices.cny.round ? (
            <RealTimeInfo 
              time={metalPrices.cny.time} 
              round={metalPrices.cny.round} 
            />
          ) : (
            nowLabel && `${nowLabel} 고시회차 20회`
          )}
        </span>
      </div>
    </div>
  </div>

  <button
    type="button"
    aria-haspopup="listbox"
    aria-expanded={isAssetOpen}
    onClick={() => setIsAssetOpen((v) => !v)}
    className="p-1 rounded-md hover:bg-[#F2F3F5] focus:outline-none focus:ring-2 focus:ring-[#03846E]/30"
    title="종목 선택"
  >
    <ChevronDown className="w-5 h-5 text-[#666]" />
  </button>

  {isAssetOpen && (
    <div className="absolute left-0 right-0 top-full mt-2 z-20">
      <div className="mx-6 rounded-[10px] bg-white border border-[#E6E6E6] shadow-xl">
        <div
          role="listbox"
          aria-label="종목 선택"
          className="max-h-80 overflow-auto py-2"
        >
          {(
            ["gold","silver","usd","jpy","eur","cny"] as AssetKey[]
          ).map((k) => {
            const it = ASSETS[k]
            const selected = asset === k
            return (
              <button
                key={k}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setAsset(k)
                  setIsAssetOpen(false)
                }}
                className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[#F2F3F5] ${
                  selected ? "bg-[#F7F8FA]" : ""
                }`}
              >
                <div className="relative w-6 h-6">
                  <Image src={it.icon} alt="" fill className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                    {it.label}
                  </span>
                                    <div className="flex items-center gap-2">
                    {k === "gold" && metalPrices.gold.currentPrice > 0 ? (
                      <span className="text-[12px] text-[#818898] font-medium">
                        {(metalPrices.gold.currentPrice / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/0.01g
                      </span>
                    ) : k === "silver" && metalPrices.silver.depositPrice > 0 ? (
                      <span className="text-[12px] text-[#818898] font-medium">
                        {metalPrices.silver.depositPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/1g
                      </span>
                    ) : k === "usd" && metalPrices.usd.currentPrice > 0 ? (
                      <span className="text-[12px] text-[#818898] font-medium">
                        {metalPrices.usd.currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/$
                      </span>
                    ) : k === "jpy" && metalPrices.jpy.currentPrice > 0 ? (
                      <span className="text-[12px] text-[#818898] font-medium">
                        {metalPrices.jpy.currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/¥
                      </span>
                    ) : k === "eur" && metalPrices.eur.currentPrice > 0 ? (
                      <span className="text-[12px] text-[#818898] font-medium">
                        {metalPrices.eur.currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/€
                      </span>
                    ) : k === "cny" && metalPrices.cny.currentPrice > 0 ? (
                      <span className="text-[12px] text-[#818898] font-medium">
                        {metalPrices.cny.currentPrice.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/¥
                      </span>
                    ) : (
                  <span className="text-[12px] text-[#818898]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    {it.unit}
                  </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )}
</section>


          <section className="mt-6">
            <div className="w-[260px]">
              <Segmented
                items={[
                  { key: "차트", label: "차트" },
                  { key: "뉴스", label: "뉴스" },
                  { key: "커뮤니티", label: "커뮤니티" },
                ]}
                value={tab}
                onChange={(k) => setTab(k as any)}
              />
            </div>
          </section>

          {tab === "차트" ? (
            <section className="mt-6 grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_325px]">
              <div className="bg-white rounded-[10px] shadow-md p-6 min-h-[745px] chart-container">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {(["회차","일","주","월","년"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTimeframe(t)}
                        className={`min-w-[48px] h-6 text-xs rounded-md text-center ${timeframe === t ? "text-[#03846D]" : "text-[#838383]"}`}
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={exportToPDF}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-[13px] transition-colors ${
                      isLoading 
                        ? "text-[#B0B8C1] cursor-not-allowed" 
                        : "text-[#03856E] hover:bg-[#F0F8F7]"
                    }`}
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    title="자산 정보를 PDF로 내보내기"
                  >
                    <Download className={`w-4 h-4 ${isLoading ? "text-[#B0B8C1]" : "text-[#666666]"}`} />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-2">
                    <div className="text-[12px] text-[#838383]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      <div className="h-[200px] flex flex-col justify-between text-right pr-1">
                        {(() => {
                          const supportedAssets = ["gold", "silver", "usd", "eur", "jpy", "cny"]
                          if (supportedAssets.includes(asset) && chartData) {
                            const { minPrice, maxPrice } = chartData
                            const range = maxPrice - minPrice
                            const step = range / 4
                            
                            const divisor = asset === "gold" ? 100 : 1
                            
                            return [
                              Math.round(maxPrice / divisor),
                              Math.round((maxPrice - step) / divisor),
                              Math.round((maxPrice - step * 2) / divisor),
                              Math.round((maxPrice - step * 3) / divisor),
                              Math.round(minPrice / divisor)
                            ].map((v, index) => (
                              <div key={`y-label-${index}-${v}`}>{v.toLocaleString("ko-KR")}</div>
                            ))
                          } else {
                            return [11700, 11680, 11650, 11600, 11550].map((v, index) => (
                              <div key={`y-label-default-${index}-${v}`}>{v.toLocaleString("ko-KR")}</div>
                            ))
                          }
                        })()}
                      </div>
                    </div>
                    <div 
                      className="relative h-[200px] overflow-hidden"
                      onWheel={handleChartWheel}
                      onMouseDown={handleChartMouseDown}
                      onMouseMove={handleChartMouseMove}
                      onMouseUp={handleChartMouseUp}
                      onMouseLeave={handleChartMouseUp}
                      style={{ cursor: isDragging ? 'grabbing' : chartZoom > 1 ? 'grab' : 'default' }}
                    >

                      {isChartLoading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                              차트 로딩 중...
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {chartError && !isChartLoading && !(chartData && chartData.isFallback) && (
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="text-[14px] text-[#ED1551] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                              차트 로드 실패
                            </div>
                            <div className="text-[12px] text-[#666] mb-3" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                              {chartError}
                            </div>
                            <button
                              onClick={() => fetchChartData()}
                              className="px-3 py-1 bg-[#03856E] text-white rounded text-[12px]"
                              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                            >
                              다시 시도
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 pointer-events-none opacity-30">
                        <div className="h-full w-full border border-dashed border-[#03846E] rounded-[6px]" />
                        <div className="absolute inset-x-0 top-1/4 h-0 border-t border-dashed border-[#03846E]" />
                        <div className="absolute inset-x-0 top-2/4 h-0 border-t border-dashed border-[#03846E]" />
                        <div className="absolute inset-x-0 top-3/4 h-0 border-t border-dashed border-[#03846E]" />
                        <div className="absolute top-0 bottom-0 left-1/4 w-0 border-l border-dashed border-[#03846E]" />
                        <div className="absolute top-0 bottom-0 left-2/4 w-0 border-l border-dashed border-[#03846E]" />
                        <div className="absolute top-0 bottom-0 left-3/4 w-0 border-l border-dashed border-[#03846E]" />
                      </div>
                      
                      <div 
                        className="w-full h-full"
                        style={{
                          transform: `scale(${chartZoom}) translate(${chartPan.x}px, ${chartPan.y}px)`,
                          transformOrigin: 'center center',
                          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                      >
                        <svg viewBox="0 0 900 200" className="w-full h-full">
                          <defs>
                            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="rgba(3,132,110,0.68)" />
                              <stop offset="100%" stopColor="rgba(3,132,110,0)" />
                            </linearGradient>
                          </defs>
                          {(() => {
                            const supportedAssets = ["gold", "silver", "usd", "eur", "jpy", "cny"]
                            if (supportedAssets.includes(asset) && chartData && chartData.prices.length > 0) {
                              const prices = chartData.prices
                              const { minPrice, maxPrice } = chartData
                              const priceRange = maxPrice - minPrice || 1
                              
                              const basePoints = prices.length
                              let filteredPrices = prices
                              
                              if (chartZoom > 1) {
                                const targetPoints = Math.min(basePoints, Math.floor(basePoints * chartZoom))
                                const step = Math.max(1, Math.floor(basePoints / targetPoints))
                                filteredPrices = prices.filter((_: any, index: number) => index % step === 0)
                              } else if (chartZoom < 1) {
                                const targetPoints = Math.max(10, Math.floor(basePoints * chartZoom))
                                const step = Math.max(1, Math.floor(basePoints / targetPoints))
                                filteredPrices = prices.filter((_: any, index: number) => index % step === 0)
                              }
                              
                              const points = filteredPrices.map((price: any, index: number) => {
                                const x = (index / (filteredPrices.length - 1)) * 900
                                const y = 200 - ((price.price - minPrice) / priceRange) * 200
                                return [x, y]
                              })
                              
                              if (points.length < 2) return null
                              
                              const path = points.map((p: number[], i: number) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ")
                              const area = `${path} L900,200 L0,200 Z`
                              
                              return (
                                <g>
                                  <path d={area} fill="url(#area)" opacity={0.2} />
                                  <path d={path} fill="none" stroke="#005044" strokeWidth="2" />
                                  {points.map((point: number[], i: number) => {
                                    const shouldShow = points.length <= 50 || i % Math.ceil(points.length / 50) === 0
                                    if (!shouldShow) return null
                                    
                                    return (
                                      <circle
                                        key={i}
                                        cx={point[0]}
                                        cy={point[1]}
                                        r={chartZoom > 1 ? "4" : "3"}
                                        fill="#005044"
                                        opacity={chartZoom > 1 ? 0.8 : 0.6}
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={(e) => handlePointMouseEnter(e, filteredPrices[i])}
                                        onMouseMove={handlePointMouseMove}
                                        onMouseLeave={handlePointMouseLeave}
                                      />
                                    )
                                  })}
                                </g>
                              )
                            } else if (supportedAssets.includes(asset) && !isChartLoading && !chartError) {
                              return (
                                <text
                                  x="450"
                                  y="100"
                                  textAnchor="middle"
                                  className="text-[14px] fill-[#666]"
                                  style={{ fontFamily: "Hana2-CM, sans-serif" }}
                                >
                                  {timeframe === "회차" ? 
                                    "실시간 차트 데이터를 불러오는 중입니다..." :
                                    "차트 데이터를 불러오는 중입니다..."
                                  }
                                </text>
                              )
                            } else {
                              const points = [
                                [0, 165], [100, 130], [180, 120], [240, 135], [300, 170],
                                [360, 160], [420, 140], [500, 120], [580, 105],
                                [660, 125], [740, 110], [820, 115], [900, 125],
                              ]
                              const path = points.map((p: number[], i: number) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ")
                              const area = `${path} L900,200 L0,200 Z`
                              return (
                                <g>
                                  <path d={area} fill="url(#area)" opacity={0.2} />
                                  <path d={path} fill="none" stroke="#005044" strokeWidth="2" />
                                  <text
                                    x="450"
                                    y="100"
                                    textAnchor="middle"
                                    className="text-[12px] fill-[#999]"
                                    style={{ fontFamily: "Hana2-CM, sans-serif" }}
                                  >
                                    실시간 차트를 지원하는 자산을 선택해주세요
                                  </text>
                                </g>
                              )
                            }
                          })()}
                        </svg>
                      </div>
                      
                      {tooltip.visible && tooltip.data && (
                        <div
                          className="absolute z-30 bg-black/75 text-white text-xs px-2 py-1 rounded pointer-events-none"
                          style={{
                            left: tooltip.x,
                            top: tooltip.y
                          }}
                        >
                          <div className="text-center">
                            <div className="font-medium">
                              {(() => {
                                if (timeframe === "회차") {
                                  return `${tooltip.data.degreeCount}회차`
                                } else {
                                  const date = new Date(tooltip.data.time || tooltip.data.date)
                                  switch (timeframe) {
                                    case "일":
                                      return `${date.getMonth() + 1}월 ${date.getDate()}일`
                                    case "주":
                                      return `${date.getMonth() + 1}월 ${date.getDate()}일`
                                    case "월":
                                      return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
                                    case "년":
                                      return `${date.getFullYear()}년`
                                    default:
                                      return `${date.getMonth() + 1}월 ${date.getDate()}일`
                                  }
                                }
                              })()}
                            </div>
                            <div className="text-[#03856E]">
                              {(() => {
                                if (timeframe === "회차") {
                                  if (asset === "gold") {
                                    return `${(tooltip.data.price / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/0.01g`
                                  } else if (asset === "silver") {
                                    return `${tooltip.data.price.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원/1g`
                                  } else {
                                    return `${tooltip.data.price.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원`
                                  }
                                } else {
                                  return `${tooltip.data.price.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원`
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  
                  <div 
                    className="mt-2 grid text-[12px] text-[#838383]" 
                    style={{ 
                      fontFamily: "Hana2-Medium, sans-serif",
                      gridTemplateColumns: `repeat(${chartZoom > 1 ? Math.min(12, Math.floor(6 * chartZoom)) : 6}, 1fr)`
                    }}
                  >
                    {(() => {
                      const supportedAssets = ["gold", "silver", "usd", "eur", "jpy", "cny"]
                      if (supportedAssets.includes(asset) && chartData && chartData.prices.length > 0) {
                        const prices = chartData.prices
                        const labelCount = chartZoom > 1 ? Math.min(12, Math.floor(6 * chartZoom)) : 6
                        const step = Math.max(1, Math.floor(prices.length / labelCount))
                        
                        if (timeframe === "회차") {
                          return Array.from({ length: labelCount }).map((_, i) => {
                            const index = i * step
                            const price = prices[index] || prices[prices.length - 1]
                            return (
                              <div key={`x-label-${asset}-${i}-${price?.degreeCount || i + 1}`} className="text-center">
                                {price ? `${price.degreeCount}회차` : `${i + 1}회차`}
                              </div>
                            )
                          })
                        } else {
                          return Array.from({ length: labelCount }).map((_, i) => {
                            const index = i * step
                            const price = prices[index] || prices[prices.length - 1]
                            if (!price) return <div key={`x-label-default-${i}`} className="text-center">-</div>
                            
                            const date = new Date(price.time)
                            let label = ""
                            
                            switch (timeframe) {
                              case "일":
                                label = `${date.getMonth() + 1}월 ${date.getDate()}일`
                                break
                              case "주":
                                label = `${date.getMonth() + 1}월 ${date.getDate()}일`
                                break
                              case "월":
                                label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`
                                break
                              case "년":
                                label = `${date.getFullYear()}년`
                                break
                              default:
                                label = `${date.getMonth() + 1}월 ${date.getDate()}일`
                            }
                            
                            return (
                              <div key={`x-label-${asset}-${i}-${price.time}`} className="text-center">
                                {label}
                              </div>
                            )
                          })
                        }
                      } else {
                        return Array.from({ length: 6 }).map((_, i) => (
                          <div key={`x-label-default-${i}`} className="text-center">{i + 1}회차</div>
                        ))
                      }
                    })()}
                  </div>
                </div>

                <div className="mt-6 h-[344px]">
                  <div className="mb-4">
                    <h3 className="text-[16px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                      일별시세표
                    </h3>
                  </div>
                  
                  {(["gold", "silver", "usd", "eur", "jpy", "cny"] as AssetKey[]).includes(asset) ? (
                    <div className="h-[300px] rounded-[8px] border border-[#E6E6E6] bg-white overflow-hidden">
                      <div className="bg-[#F8F9FA] border-b border-[#E6E6E6] px-4 py-3">
                        <div className="grid grid-cols-4 gap-4 text-[13px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          <div className="text-center">날짜</div>
                          <div className="text-right">매매기준율</div>
                          <div className="text-right">전일대비</div>
                          <div className="text-right">등락률</div>
                        </div>
                      </div>
                      
                      <div className="h-[256px] overflow-y-auto">
                        {isDailyTableLoading && dailyTableData.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                                일별시세표를 불러오는 중...
                              </span>
                            </div>
                          </div>
                        ) : dailyTableData.length > 0 ? (
                          <div className="divide-y divide-[#F2F3F5]">
                            {dailyTableData.map((row: any, index: number) => (
                              <div key={`${row.date}-${index}`} className="px-4 py-3 hover:bg-[#F8F9FA] transition-colors">
                                <div className="grid grid-cols-4 gap-4 text-[13px]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                                  <div className="text-center text-[#2D3541]">
                                    {row.date ? (() => {
                                      const dateStr = row.date.split('T')[0] 
                                      return dateStr.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1.$2.$3')
                                    })() : '-'}
                                  </div>
                                  
                                  <div className="text-right text-[#2D3541]">
                                    {row.close ? (asset === "gold" ? (row.close / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.close.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : '-'}
                                  </div>
                                  
                                  <div className={`text-right ${row.diff > 0 ? 'text-[#ED1551]' : row.diff < 0 ? 'text-[#1B8FF0]' : 'text-[#666]'}`}>
                                    {row.diff !== undefined ? 
                                      `${row.diff > 0 ? '+' : ''}${asset === "gold" ? (row.diff / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.diff.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                      : '-'
                                    }
                                  </div>
                                  
                                  <div className={`text-right ${row.ratio > 0 ? 'text-[#ED1551]' : row.ratio < 0 ? 'text-[#1B8FF0]' : 'text-[#666]'}`}>
                                    {row.ratio !== undefined ? 
                                      `${row.ratio > 0 ? '+' : ''}${row.ratio.toFixed(2)}%` 
                                      : '-'
                                    }
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {hasMoreDailyData && (
                              <div ref={dailyTableLoadingRef} className="px-4 py-3 text-center">
                                {isDailyTableLoading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                                      더 많은 데이터를 불러오는 중...
                                    </span>
                                  </div>
                                ) : (
                                  <div className="h-4" /> 
                                )}
                              </div>
                            )}
                            
                            {!hasMoreDailyData && dailyTableData.length > 0 && (
                              <div className="px-4 py-3 text-center">
                                <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                                  모든 데이터를 불러왔습니다.
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                              일별시세표 데이터가 없습니다.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] rounded-[8px] bg-[#F8F9FA] border border-[#E6E6E6] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[14px] text-[#666] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          일별시세표
                        </div>
                        <div className="text-[12px] text-[#999]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                          금, 은, 달러, 유로, 엔화, 위안 선택 시 일별시세표를 확인할 수 있습니다
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative w-full xl:w-[325px] h-[720px] xl:h-[745px] bg-white rounded-[10px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] overflow-hidden">
                <div className="absolute inset-0 px-[15px] py-[20px] flex justify-center xl:justify-start">
                  <div className="flex flex-col w-full max-w-[295px]" style={{ rowGap: 0 }}>
                    <div className="h-[19px] flex items-center">
                      <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                        주문하기
                      </span>
                    </div>

                    <div className="h-[48px] mt-[12px]">
                      <div className="w-[295px] h-[48px] bg-[#F2F3F5] rounded-[16px] p-[4px] flex items-center">
                        {[{ k: "buy", t: "구매" }, { k: "sell", t: "판매" }, { k: "wait", t: "대기" }].map(({ k, t }) => {
                          const selected = side === (k as any)
                          return (
                            <button
                              key={k}
                              type="button"
                              onClick={() => setSide(k as any)}
                              className={`h-[40px] flex-1 rounded-[10px] text-[14px] leading-[18px] text-center ${
                                selected ? "bg-white shadow-sm" : "text-[#818898]"
                              }`}
                              style={{
                                fontFamily: selected ? "Hana2-Medium, sans-serif" : "Hana2-Regular, sans-serif",
                                color: selected ? SIDE_HEX[k as keyof typeof SIDE_HEX] : undefined,
                              }}
                            >
                              {t}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {side === "wait" ? (
                      <div className="mt-[16px] flex-1 overflow-hidden">
                      
                        <div className="h-[600px] overflow-y-auto space-y-4">
                          {isLoadingOrders ? (
                            <div className="flex items-center justify-center h-32">
                              <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                                로딩 중...
                              </div>
                            </div>
                          ) : pendingOrders.length === 0 && recurringOrders.filter(order => order.status === 'ACTIVE').length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                              <div className="text-center">
                                <div className="text-[14px] text-[#666] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                                  대기주문 및 정기주문이 없습니다
                                </div>
                                <div className="text-[12px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                                  지정가 주문이나 정기주문을 하면 여기에 표시됩니다
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {pendingOrders.length > 0 && (
                                <>
                                  <div className="text-[14px] text-[#2D3541] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                                    대기주문 ({pendingOrders.length}개)
                                  </div>
                                  {pendingOrders.map((order) => (
                                    <div key={`pending-${order.id}`} className="bg-[#F8F9FA] rounded-[8px] p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="text-[13px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                                          {order.orderType === 'buy' ? '구매' : '판매'} 주문
                                        </div>
                                        <button
                                          onClick={() => openCancelModal(order.id)}
                                          className="text-[11px] text-[#03856E] hover:text-[#005044] px-2 py-1 rounded"
                                          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                        >
                                          취소
                                        </button>
                                      </div>
                                      
                                      <div className="space-y-1 text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                                        <div className="flex justify-between">
                                          <span>자산:</span>
                                          <span>{ASSETS[order.asset as AssetKey]?.label || order.asset}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>수량:</span>
                                          <span>{order.quantity}{ASSETS[order.asset as AssetKey]?.unitLabel || ''}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>지정가:</span>
                                          <span>{order.limitPrice?.toLocaleString()}원</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>주문번호:</span>
                                          <span className="text-[10px]">{order.orderNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>주문시간:</span>
                                          <span className="text-[10px]">{new Date(order.createdAt).toLocaleString('ko-KR')}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}

                              {recurringOrders.filter(order => order.status === 'ACTIVE').length > 0 && (
                                <>
                                  <div className="text-[14px] text-[#2D3541] mb-2 mt-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                                    정기주문 ({recurringOrders.filter(order => order.status === 'ACTIVE').length}개)
                                  </div>
                                  {recurringOrders.filter(order => order.status === 'ACTIVE').map((order) => (
                                    <div key={`recurring-${order.id}`} className="bg-[#F8F9FA] rounded-[8px] p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="text-[13px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                                          정기 {order.orderType === 'BUY' ? '구매' : '판매'} 주문
                                        </div>
                                        {order.status === 'ACTIVE' && (
                                          <button
                                            onClick={() => openRecurringCancelModal(order.id)}
                                            className="text-[11px] text-[#ED1551] hover:text-[#D1002A] px-2 py-1 rounded"
                                            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                          >
                                            비활성
                                          </button>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-1 text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                                        <div className="flex justify-between">
                                          <span>자산:</span>
                                          <span>{ASSETS[order.asset as AssetKey]?.label || order.asset}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>수량:</span>
                                          <span>{order.quantity}{ASSETS[order.asset as AssetKey]?.unitLabel || ''}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>주기:</span>
                                          <span>
                                            {order.frequency === 'DAILY' ? '매일' :
                                             order.frequency === 'WEEKLY' ? '매주' : '매월'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>시작일:</span>
                                          <span>{new Date(order.startDate).toLocaleDateString('ko-KR')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>종료일:</span>
                                          <span>{new Date(order.endDate).toLocaleDateString('ko-KR')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>실행 횟수:</span>
                                          <span>{order.totalExecutions || 0}회</span>
                                        </div>
                                        {order.lastExecuted && (
                                          <div className="flex justify-between">
                                            <span>마지막 실행:</span>
                                            <span className="text-[10px]">{new Date(order.lastExecuted).toLocaleDateString('ko-KR')}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="h-[34px] flex items-center mt-[16px] justify-between">
                      <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                        주문 유형
                      </span>
                      <div className="relative w-[212px] h-[34px]" ref={orderTypeRef}>
                        <button
                          type="button"
                          onClick={() => setIsOrderTypeOpen(!isOrderTypeOpen)}
                          className="w-[212px] h-[34px] rounded-[10px] border border-[#E6E6E6] text-[13px] px-3 focus:outline-none bg-white text-[#2D3541] text-left flex items-center relative"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          <span>{orderType}</span>
                          <ChevronDown className={`w-[14px] h-[14px] text-[#818898] transition-transform absolute right-3 ${isOrderTypeOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isOrderTypeOpen && (
                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E6E6E6] rounded-[10px] shadow-lg z-50">
                            {["일반 주문", "정기 주문"].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  setOrderType(type as any)
                                  setIsOrderTypeOpen(false)
                                }}
                                className="w-full px-3 py-2 text-left text-[13px] text-[#2D3541] hover:bg-[#F8F9FA] first:rounded-t-[10px] last:rounded-b-[10px] transition-colors"
                                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {side === 'sell' && (
                      <div className="mt-[16px] bg-[#F8F9FA] rounded-[8px] p-3">
                        <div className="text-[13px] text-[#2D3541] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          보유 자산
                        </div>
                        {(() => {
                          const currentHolding = userHoldings.find(h => h.asset === asset)
                          if (!currentHolding || currentHolding.quantity === 0) {
                            return (
                              <div className="text-[12px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                                보유 자산이 없습니다.
                              </div>
                            )
                          }
                          return (
                            <div className="space-y-1 text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                              <div className="flex justify-between">
                                <span>보유량</span>
                                <span>{currentHolding.quantity}{currentAsset.unitLabel}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>평균단가</span>
                                <span>{currentHolding.averagePrice.toLocaleString()}원</span>
                              </div>
                              <div className="flex justify-between">
                                <span>총 투자금액</span>
                                <span>{currentHolding.totalAmount.toLocaleString()}원</span>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    {orderType !== "정기 주문" && (
                      <div className="h-[31.5px] flex items-center mt-[16px] justify-between">
                        <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          {side === "sell" ? "판매 가격" : "구매 가격"}
                        </span>
                        <div className="w-[212px] h-[31.38px] bg-[#F2F3F5] rounded-[16px] p-[3px] flex items-center">
                          {[{ k: "limit", t: "지정가" }, { k: "market", t: "시장가" }].map(({ k, t }) => {
                            const selected = priceType === (k as any)
                            return (
                              <button
                                key={k}
                                type="button"
                                onClick={() => setPriceType(k as any)}
                                className={`h-[26px] w-[97px] rounded-[10px] text-[13px] ${
                                  selected ? "bg-white text-[#2D3541] shadow-sm" : "text-[#818898]"
                                }`}
                                style={{ fontFamily: selected ? "Hana2-Medium, sans-serif" : "Hana2-Regular, sans-serif" }}
                              >
                                {t}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {orderType !== "정기 주문" && (
                      <div className="h-[34px] flex items-center justify-end mt-[8px]">
                        <div className="w-[212px] h-[34px] border border-[#E6E6E6] rounded-[10px] flex items-center px-2 bg-white">
                          <input
                            type="text"
                            disabled={priceType === "market"}
                            readOnly
                            value={`${asset === "gold" ? (parseFloat(limitPriceStr.replace(/,/g, '')) / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : limitPriceStr}원/${asset === "gold" ? "0.01g" : asset === "silver" ? "1g" : asset === "usd" ? "$" : asset === "jpy" ? "¥" : asset === "eur" ? "€" : "¥"}`}
                            className="min-w-0 flex-1 text-[13px] text-[#2D3541] text-left focus:outline-none bg-transparent disabled:text-[#999] pr-2 cursor-default"
                            aria-label={`가격(원/${asset === "gold" ? "0.01g" : asset === "silver" ? "1g" : asset === "usd" ? "$" : asset === "jpy" ? "¥" : asset === "eur" ? "€" : "¥"})`}
                            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                          />
                          <div className="ml-auto flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => adjustPrice(-100)}
                              disabled={priceType === "market"}
                              className={`p-1 text-[#818898] hover:text-[#03856E] transition-colors ${priceType === "market" ? "opacity-40 cursor-not-allowed" : "opacity-100"}`}
                              aria-label="가격 내리기"
                              title="가격 -100원"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustPrice(100)}
                              disabled={priceType === "market"}
                              className={`p-1 text-[#818898] hover:text-[#03856E] transition-colors ${priceType === "market" ? "opacity-40 cursor-not-allowed" : "opacity-100"}`}
                              aria-label="가격 올리기"
                              title="가격 +100원"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {orderType !== "정기 주문" && (
                      <div className="h-[34px] flex items-center mt-[16px] justify-between">
                        <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          수량
                        </span>
                        <div className="w-[212px] h-[34px] border border-[#E6E6E6] rounded-[10px] flex items-center px-2 bg-white">
                          <div className="flex-1 flex items-center min-w-0">
                            {qtyInput ? (
                              <input
                                type="text"
                                value={`${qtyInput}${currentAsset.unitLabel}`}
                                onChange={(e) => {
                                  const value = e.target.value.replace(currentAsset.unitLabel, '')
                                  handleQtyInputChange(value)
                                }}
                                onBlur={handleQtyInputBlur}
                                className={`text-[13px] text-left focus:outline-none bg-transparent flex-1 ${
                                  !isQtyValid ? 'text-[#ED1551]' : 'text-[#2D3541]'
                                }`}
                                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                              />
                            ) : (
                              <span className="text-[13px] text-[#818898] flex-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                                {side === 'sell' ? (
                                  (() => {
                                    const currentHolding = userHoldings.find(h => h.asset === asset)
                                    const holdingQuantity = currentHolding?.quantity || 0
                                    return `최대 ${holdingQuantity.toFixed(2)} ${currentAsset.unitLabel} 가능`
                                  })()
                                ) : (
                                  `최대 ${maxBuyableGram.toFixed(2)} ${currentAsset.unitLabel} 가능`
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                adjustQty(-currentAsset.minUnit)
                              }}
                              className="p-1 text-[#818898] hover:text-[#03856E] transition-colors"
                              aria-label="수량 줄이기"
                              title={`수량 -${asset === "gold" || asset === "silver" ? "0.01g" : "0.01"}`}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                adjustQty(currentAsset.minUnit)
                              }}
                              className="p-1 text-[#818898] hover:text-[#03856E] transition-colors"
                              aria-label="수량 늘리기"
                              title={`수량 +${asset === "gold" || asset === "silver" ? "0.01g" : "0.01"}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {orderType !== "정기 주문" && (
                      <div className="h-[34px] mt-[8px] flex justify-end items-center">
                        <div className="w-[212px] flex items-center justify-between">
                          {[10, 25, 50].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                let calculatedQty = 0
                                
                                if (side === 'sell') {
                                  const currentHolding = userHoldings.find(h => h.asset === asset)
                                  const holdingQuantity = currentHolding?.quantity || 0
                                  calculatedQty = Math.floor(holdingQuantity * (p / 100) / currentAsset.minUnit) * currentAsset.minUnit
                                } else {
                                  const percentageAmount = availableBalance * (p / 100)
                                  calculatedQty = Math.floor(percentageAmount / effectiveUnit / currentAsset.minUnit) * currentAsset.minUnit
                                }
                                
                                const roundedQty = roundToTwoDecimals(calculatedQty)
                                setQtyGram(roundedQty)
                                setQtyInput(formatQuantity(roundedQty, asset)) 
                                validateQty(roundedQty)
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
                              let maxQty = 0
                              
                              if (side === 'sell') {
                                const currentHolding = userHoldings.find(h => h.asset === asset)
                                const holdingQuantity = currentHolding?.quantity || 0
                                maxQty = Math.floor(holdingQuantity / currentAsset.minUnit) * currentAsset.minUnit
                              } else {
                                maxQty = Math.floor(maxBuyableGram / currentAsset.minUnit) * currentAsset.minUnit
                              }
                            
                              const roundedMaxQty = roundToTwoDecimals(maxQty)  
                              setQtyGram(roundedMaxQty)
                              setQtyInput(formatQuantity(roundedMaxQty, asset))
                              validateQty(roundedMaxQty)
                            }}
                            className="h-[34px] w-[51px] rounded-[8px] bg-[#F2F3F5] text-[13px] text-[#454F5C]"
                            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                            aria-label="최대 수량"
                          >
                            최대
                          </button>
                        </div>
                      </div>
                    )}

                    {orderType !== "정기 주문" && (
                      <div className="h-[29px] flex items-center justify-between mt-[36px]">
                        <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          {side === "sell" ? "판매가능 금액" : "구매가능 금액"}
                        </span>
                        <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          {fmtKRW(availableBalance)}
                        </span>
                      </div>
                    )}

                    {orderType !== "정기 주문" && (
                      <div className="h-[29px] flex items-center justify-between mt-[8px]">
                        <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          총 주문 금액
                        </span>
                        <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          {fmtKRW(totalAmount)}
                        </span>
                      </div>
                    )}

                    {orderType === "정기 주문" && (
                      <>
                        <div className="h-[34px] flex items-center mt-[16px] justify-between">
                          <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                            투자 수량
                          </span>
                          <div className="w-[212px] h-[34px] border border-[#E6E6E6] rounded-[10px] flex items-center px-2 bg-white">
                            <div className="flex-1 flex items-center min-w-0">
                              {recurringQuantityStr ? (
                                <input
                                  type="text"
                                  value={`${recurringQuantityStr}${currentAsset.unitLabel}`}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(currentAsset.unitLabel, '')
                                    handleRecurringQuantityChange(value)
                                  }}
                                  onBlur={handleRecurringQuantityBlur}
                                  className="text-[13px] text-[#2D3541] text-left focus:outline-none bg-transparent flex-1"
                                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                                />
                              ) : (
                                <span className="text-[13px] text-[#818898] flex-1" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                                  수량을 입력하세요
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const newValue = recurringQuantity - currentAsset.minUnit
                                  const adjustedValue = Math.floor(newValue / currentAsset.minUnit) * currentAsset.minUnit
                                  const finalValue = Math.max(0, adjustedValue)
                                  const roundedValue = roundToTwoDecimals(finalValue)
                                  setRecurringQuantity(roundedValue)
                                  setRecurringQuantityStr(formatQuantity(roundedValue, asset))
                                }}
                                className="p-1 text-[#818898] hover:text-[#03856E] transition-colors"
                                aria-label="수량 줄이기"
                                title={`수량 -${asset === "gold" || asset === "silver" ? "0.01g" : "0.01"}`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newValue = recurringQuantity + currentAsset.minUnit
                                  const adjustedValue = Math.floor(newValue / currentAsset.minUnit) * currentAsset.minUnit
                                  const roundedValue = roundToTwoDecimals(adjustedValue)
                                  setRecurringQuantity(roundedValue)
                                  setRecurringQuantityStr(formatQuantity(roundedValue, asset))
                                }}
                                className="p-1 text-[#818898] hover:text-[#03856E] transition-colors"
                                aria-label="수량 늘리기"
                                title={`수량 +${asset === "gold" || asset === "silver" ? "0.01g" : "0.01"}`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="h-[34px] flex items-center mt-[16px] justify-between">
                          <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                            주문 주기
                          </span>
                          <div className="w-[212px] h-[34px] bg-[#F2F3F5] rounded-[16px] p-[3px] flex items-center">
                            {[
                              { k: "daily", t: "매일" },
                              { k: "weekly", t: "매주" },
                              { k: "monthly", t: "매월" }
                            ].map(({ k, t }) => {
                              const selected = recurringFrequency === (k as any)
                              return (
                                <button
                                  key={k}
                                  type="button"
                                  onClick={() => setRecurringFrequency(k as any)}
                                  className={`h-[26px] flex-1 rounded-[10px] text-[13px] ${
                                    selected ? "bg-white text-[#2D3541] shadow-sm" : "text-[#818898]"
                                  }`}
                                  style={{ fontFamily: selected ? "Hana2-Medium, sans-serif" : "Hana2-Regular, sans-serif" }}
                                >
                                  {t}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="h-[34px] flex items-center mt-[16px] justify-between">
                          <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                            시작일
                          </span>
                          <div className="relative w-[212px] h-[34px]" ref={startDateRef}>
                            <button
                              type="button"
                              onClick={() => {
                                setShowStartDateCalendar(!showStartDateCalendar)
                                setShowEndDateCalendar(false)
                              }}
                              className="w-[212px] h-[34px] border border-[#E6E6E6] rounded-[10px] flex items-center px-3 bg-white text-left"
                            >
                              <span 
                                className={`flex-1 text-[13px] ${recurringStartDate ? 'text-[#2D3541]' : 'text-[#999999]'}`}
                                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                              >
                                {recurringStartDate ? new Date(recurringStartDate).toLocaleDateString('ko-KR') : '날짜를 선택하세요'}
                              </span>
                              <ChevronDown className="w-4 h-4 text-[#818898]" />
                            </button>
                            {showStartDateCalendar && (
                              <DatePickerCalendar
                                calendarDate={startCalendarDate}
                                setCalendarDate={setStartCalendarDate}
                                selectedDate={recurringStartDate}
                                onDateSelect={(dateStr) => {
                                  setRecurringStartDate(dateStr)
                                  setShowStartDateCalendar(false)
                                }}
                                minDate={new Date()}
                              />
                            )}
                          </div>
                        </div>

                        <div className="h-[34px] flex items-center mt-[16px] justify-between">
                          <span className="text-[15px] leading-[19px] text-[#2D3541]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                            종료일
                          </span>
                          <div className="relative w-[212px] h-[34px]" ref={endDateRef}>
                            <button
                              type="button"
                              onClick={() => {
                                setShowEndDateCalendar(!showEndDateCalendar)
                                setShowStartDateCalendar(false)
                              }}
                              className="w-[212px] h-[34px] border border-[#E6E6E6] rounded-[10px] flex items-center px-3 bg-white text-left"
                            >
                              <span 
                                className={`flex-1 text-[13px] ${recurringEndDate ? 'text-[#2D3541]' : 'text-[#999999]'}`}
                                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                              >
                                {recurringEndDate ? new Date(recurringEndDate).toLocaleDateString('ko-KR') : '날짜를 선택하세요'}
                              </span>
                              <ChevronDown className="w-4 h-4 text-[#818898]" />
                            </button>
                            {showEndDateCalendar && (
                              <DatePickerCalendar
                                calendarDate={endCalendarDate}
                                setCalendarDate={setEndCalendarDate}
                                selectedDate={recurringEndDate}
                                onDateSelect={(dateStr) => {
                                  setRecurringEndDate(dateStr)
                                  setShowEndDateCalendar(false)
                                }}
                                minDate={recurringStartDate ? new Date(recurringStartDate) : new Date()}
                              />
                            )}
                          </div>
                        </div>

                        <div className="mt-[20px] bg-[#FFFFFF] rounded-[8px]">
                          <div className="text-[15px] text-[#2D3541] mb-2" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                            정기 주문 정보
                          </div>
                          <div className="space-y-1 text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                            <div className="flex justify-between">
                              <span>주문 수량</span>
                              <span>{recurringQuantity}{currentAsset.unitLabel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>주문 주기</span>
                              <span>
                                {recurringFrequency === "daily" ? "매일" : 
                                 recurringFrequency === "weekly" ? "매주" : "매월"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>시작일</span>
                              <span>{recurringStartDate || "미설정"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>종료일</span>
                              <span>{recurringEndDate || "미설정"}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}


                    <div className="h-[50px] mt-[30px] flex">
                    <button
                      type="button"
                      className={`mx-auto w-[282px] h-[50px] rounded-[10px] text-white text-[16px] transition-colors ${
                        (orderType === "정기 주문" ? !isRecurringOrderValid() : (!isQtyValid || qtyGram <= 0 || (side === 'buy' && totalAmount > availableBalance))) || isOrderProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                      }`}
                      style={{ 
                        backgroundColor: (orderType === "정기 주문" ? !isRecurringOrderValid() : (!isQtyValid || qtyGram <= 0 || (side === 'buy' && totalAmount > availableBalance))) || isOrderProcessing ? '#B0B8C1' : SIDE_HEX[side], 
                        fontFamily: "Hana2-Medium, sans-serif" 
                      }}
                      disabled={(orderType === "정기 주문" ? !isRecurringOrderValid() : (!isQtyValid || qtyGram <= 0 || (side === 'buy' && totalAmount > availableBalance))) || isOrderProcessing}
                      onClick={handleOrderSubmit}
                    >
                      {
                        orderType === "정기 주문" ? "등록하기" :
                        side === "buy" ? "구매하기" :
                        side === "sell" ? "판매하기" : 
                        side === "wait" ? "대기주문" : "주문하기"}
                    </button>
                    </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : tab === "뉴스" ? (
            <section className="mt-6">
              <div className="bg-white rounded-[10px] shadow-md p-6 h-[745px] overflow-hidden">
                <NewsSection />
              </div>
            </section>
          ) : (
            <section className="mt-6">
              <div className="bg-white rounded-[10px] shadow-md p-6 h-[1000px] overflow-hidden">
                <div className="relative w-full h-[106px] mb-6">
                  <div className="absolute left-0 top-0 flex flex-col items-center gap-1">
                    <div className="w-[35px] h-[35px] rounded-full flex items-center justify-center">
                      <Image 
                        src={getProfileImage(userInfo?.profileImage || "fox")} 
                        alt="프로필 이미지" 
                        width={35} 
                        height={35}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          console.error('프로필 이미지 로드 실패:', userInfo?.profileImage, e)
                        }}
                        onLoad={() => {
                          console.log('프로필 이미지 로드 성공:', userInfo?.profileImage)
                        }}
                      />
                    </div>
                    
                    <span 
                      className="text-[13px] leading-[17px] text-[#666666] text-center whitespace-nowrap"
                      style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                    >
                      내 프로필
                    </span>
                  </div>
                  
                  <div className="absolute left-[68px] top-0 w-[calc(100%-68px)] h-[106px]">
                    <div className="relative w-full h-[106px] bg-[#F2F3F5] rounded-[8px] p-4">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="무슨 생각을 하고 있나요?"
                        className="w-full h-[calc(100%-44px)] bg-transparent resize-none focus:outline-none text-[13px] leading-[17px] text-[#2D3541] placeholder-[#808A96]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      />
                      
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <label 
                          className="w-[20px] h-[20px] rounded hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer"
                          title="사진 첨부"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <Image 
                            src="/images/ic_picture.svg" 
                            alt="사진 첨부" 
                            width={20} 
                            height={20}
                            className="object-contain"
                          />
                        </label>
                        
                        <button 
                          type="button"
                          className="w-[20px] h-[20px] rounded hover:opacity-80 transition-opacity flex items-center justify-center"
                          title="투표 기능"
                          onClick={() => setShowPollModal(true)}
                        >
                          <div className="w-[20px] h-[20px] bg-[#B0B8C1] rounded flex items-center justify-center">
                            <Image 
                              src="/images/ic_graph.svg" 
                              alt="투표 기능" 
                              width={12} 
                              height={12}
                              className="object-contain"
                              style={{ filter: 'brightness(0) invert(1)' }}
                            />
                          </div>
                        </button>
                      </div>
                      
                      <div className="absolute bottom-4 right-4">
                        <button 
                          type="button"
                          onClick={handlePostSubmit}
                          className={`w-[66px] h-[36px] rounded-[10px] flex items-center justify-center transition-colors ${
                            commentText.trim() || selectedImage || selectedPoll ? "bg-[#03856E] hover:bg-[#026B5A]" : "bg-[#B0B8C1] cursor-not-allowed"
                          }`}
                        >
                          <span 
                            className="text-[13px] leading-[17px] text-white text-center"
                            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                          >
                            남기기
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {imagePreview && (
                  <div className="mb-4 relative ml-[68px]">
                    <div className="relative w-[200px] h-[150px] rounded-[8px] overflow-hidden bg-gray-100">
                      <img 
                        src={imagePreview} 
                        alt="첨부된 이미지" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {selectedPoll && (
                  <div className="mb-4 relative ml-[68px]">
                    <div className="relative p-4 bg-[#F8F9FA] rounded-[8px] border border-[#E6E6E6]">
                      <button
                        type="button"
                        onClick={handlePollRemove}
                        className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div className="pr-8">                      
                        <div className="space-y-2">
                          {selectedPoll.options.map((option: string, index: number) => (
                            <div 
                              key={index}
                              className="flex items-center gap-2 text-[13px] text-[#666]"
                              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                            >
                              <div className="w-4 h-4 border border-[#CCC] rounded flex items-center justify-center">
                                <span className="text-[10px]">{index + 1}</span>
                              </div>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                        
                        {selectedPoll.isMultiple && (
                          <div className="mt-2 text-[11px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                            복수 선택 가능
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setSortType(sortType === "최신순" ? "인기순" : "최신순")}
                    className="relative w-[71px] h-[35px] bg-[#F2F3F5] rounded-[8px] flex items-center justify-center gap-1 hover:bg-[#E8E9EB] transition-colors"
                  >
                    <span 
                      className="text-[13px] leading-[17px] text-[#323D48] text-center"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {sortType}
                    </span>
                    <Image 
                      src="/images/ic_array.svg" 
                      alt="정렬" 
                      width={14} 
                      height={14}
                      className="object-contain"
                      style={{ color: '#323D48' }}
                    />
                  </button>
                </div>
                
                <div className="h-[calc(100%-190px)] overflow-y-auto scrollbar-hide">
                  {isInitialCommunityLoad && isCommunityLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                          게시글을 불러오는 중...
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {!isInitialCommunityLoad && communityPosts.map((post, index) => (
                      <div key={post.id} id={`post-${post.id}`} className="relative w-full min-h-[85px] pb-4">
                        <div className="absolute left-0 top-0 flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleUserProfileClick(post.user.id, post.user.name, post.user.profileImage || "fox")}
                            className="w-[35px] h-[35px] rounded-full flex items-center justify-center hover:ring-2 hover:ring-[#03856E] hover:ring-opacity-50 transition-all cursor-pointer"
                          >
                            <Image 
                              src={getProfileImage(post.user.profileImage || "fox")} 
                              alt="프로필 이미지" 
                              width={35} 
                              height={35}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </button>
                          
                          {post.user.id === userInfo?.id ? (
                            <span 
                              className="text-[13px] leading-[17px] text-[#666666] text-center whitespace-nowrap"
                              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                            >
                              나
                            </span>
                          ) : (
                            (() => {
                              const hasCurrentAsset = post.user.holdings && post.user.holdings.some((holding: any) => 
                                holding.asset === asset && holding.quantity > 0
                              )
                              console.log('다른 사용자 보유 자산 확인:', { 
                                userName: post.user.name, 
                                asset, 
                                holdings: post.user.holdings, 
                                hasCurrentAsset 
                              })
                              return hasCurrentAsset ? (
                                <span 
                                  className="text-[13px] leading-[17px] text-[#666666] text-center whitespace-nowrap"
                                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                >
                                  투자자
                                </span>
                              ) : null
                            })()
                          )}
                        </div>

                        <div className="ml-[60px] mr-[80px]">
                          <div className="flex items-center gap-2 mb-2">
                            <span 
                              className="text-[13px] leading-[17px] text-[#2D3541]"
                              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                            >
                              {post.user.name}
                            </span>
                            <span 
                              className="text-[13px] leading-[17px] text-[#666666]"
                              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                            >
                              {new Date(post.createdAt).toLocaleString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="mb-3">
                            <p 
                              className="text-[13px] leading-[17px] text-[#4D5764] whitespace-pre-line"
                              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                            >
                              {post.content}
                            </p>
                            
                            {post.imageUrl && (
                              <div className="mt-3">
                                <img 
                                  src={post.imageUrl} 
                                  alt="첨부 이미지" 
                                  className="max-w-full h-auto rounded-[8px] border border-[#E6E6E6]"
                                  style={{ maxHeight: '300px' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                            
                            {post.poll && (
                              <div className="mt-3 p-4 bg-[#F8F9FA] rounded-[8px] border border-[#E6E6E6]">
                                <h4 
                                  className="text-[14px] text-[#2D3541] mb-3 flex items-center gap-2"
                                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                >
                                  <span>{post.poll.title}</span>
                                </h4>
                                
                                <div className="space-y-2">
                                  {post.poll.options.map((option: any) => {
                                    const totalVotes = post.poll._count.votes
                                    const optionVotes = option._count.votes
                                    const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
                                    
                                    const userVoted = post.userVotes && post.userVotes.some((vote: any) => vote.optionId === option.id)
                                    
                                    return (
                                      <div key={option.id} className="relative">
                                        <div 
                                          className={`flex items-center justify-between p-3 bg-white rounded-[6px] border transition-colors cursor-pointer ${
                                            userVoted 
                                              ? "border-[#03856E] bg-[#F0F8F7]" 
                                              : "border-[#E6E6E6] hover:border-[#03856E]"
                                          }`}
                                          onClick={() => handleVote(post.poll.id, option.id, post.poll.isMultiple, post.userVotes || [])}
                                        >
                                          <div className="flex items-center gap-2">
                                            {userVoted && (
                                              <span className="text-[#03856E]">✓</span>
                                            )}
                                            <span 
                                              className={`text-[13px] ${userVoted ? "text-[#03856E]" : "text-[#2D3541]"}`}
                                              style={{ fontFamily: userVoted ? "Hana2-Medium, sans-serif" : "Hana2-Regular, sans-serif" }}
                                            >
                                              {option.text}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span 
                                              className={`text-[12px] ${userVoted ? "text-[#03856E]" : "text-[#666]"}`}
                                              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                            >
                                              {percentage}%
                                            </span>
                                            <span 
                                              className="text-[11px] text-[#999]"
                                              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                                            >
                                              ({optionVotes}표)
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <div 
                                          className={`absolute left-0 top-0 h-full rounded-[6px] transition-all pointer-events-none ${
                                            userVoted ? "bg-[#03856E] bg-opacity-20" : "bg-[#03856E] bg-opacity-10"
                                          }`}
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    )
                                  })}
                                </div>
                                
                                <div className="mt-3 flex items-center justify-between text-[11px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                                  <span>총 {post.poll._count.votes}표</span>
                                  {post.poll.isMultiple && <span>복수 선택 가능</span>}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <button 
                              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                              onClick={() => handleLikeToggle(post.id, post.likes)}
                            >
                              <Image 
                                src={post.isLiked ? "/images/ic_like.svg" : "/images/ic_like_no.svg"}
                                alt="좋아요" 
                                width={16} 
                                height={14}
                                className="object-contain"
                              />
                              {post.likes > 0 && (
                                <span 
                                  className="text-[13px] leading-[17px] text-[#ED1651]"
                                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                >
                                  {post.likes}
                                </span>
                              )}
                            </button>

                            <button 
                              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                              onClick={() => handleReplyClick(post)}
                            >
                              <Image 
                                src="/images/ic_reply.svg" 
                                alt="댓글" 
                                width={15} 
                                height={15}
                                className="object-contain"
                              />
                              {post._count.commentList > 0 && (
                                <span 
                                  className="text-[13px] leading-[17px] text-[#B0B8C1]"
                                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                >
                                  {post._count.commentList}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="absolute right-0 top-0">
                          {post.user.id === userInfo?.id ? (
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              className="w-[50px] h-[28px] transition-colors flex items-center justify-center"
                              title="게시글 삭제"
                            >
                              <span 
                                className="text-[11px] leading-[14px] text-[#ED1551] text-center"
                                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                              >
                                삭제
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleFollowToggle(post.user.id)}
                              className={`w-[66px] h-[36px] rounded-[10px] flex items-center justify-center transition-colors ${
                                post.isFollowing 
                                  ? "bg-[#F2F3F5]" 
                                  : "bg-[#F5FBFA] hover:bg-[#E8F5F3]"
                              }`}
                            >
                              <span 
                                className={`text-[13px] leading-[17px] text-center ${
                                  post.isFollowing ? "text-[#323D48]" : "text-[#03856E]"
                                }`}
                                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                              >
                                {post.isFollowing ? "팔로잉" : "팔로우"}
                              </span>
                            </button>
                          )}
                        </div>

                        {index < communityPosts.length - 1 && (
                          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#F2F3F5]" />
                        )}
                      </div>
                    ))}
                    
                    {hasMorePosts && !isInitialCommunityLoad && (
                      <div ref={communityLoadingRef} className="py-4 text-center">
                        {isCommunityLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                              더 많은 게시글을 불러오는 중...
                            </span>
                  </div>
                        ) : (
                          <div className="h-4" />  
                        )}
                      </div>
                    )}
                    
                    {!isInitialCommunityLoad && !isCommunityLoading && communityPosts.length === 0 && (
                      <div className="py-8 text-center">
                        <span className="text-[13px] text-[#929294]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                          아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!
                        </span>
                      </div>
                    )}
                    
                    {!hasMorePosts && !isInitialCommunityLoad && communityPosts.length > 0 && (
                      <div className="py-4 text-center">
                        <span className="text-[13px] text-[#929294]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                          모든 게시글을 불러왔습니다.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {showPollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-6 w-[500px] mx-4 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={handlePollCancel}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="text-center">
                <h2 
                  className="text-[20px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  투표 만들기
                </h2>
                <p 
                  className="text-[14px] text-[#666]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  투표 제목과 선택지를 입력해주세요
                </p>
              </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  투표 제목
                </label>
                <input
                  type="text"
                  value={pollTitle}
                  onChange={(e) => setPollTitle(e.target.value)}
                  placeholder="투표 제목을 입력하세요"
                  className="w-full p-3 border border-[#E6E6E6] rounded-[8px] text-[14px] focus:outline-none focus:border-[#03856E]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                />
              </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  선택지
                </label>
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                          placeholder={`선택지 ${index + 1}`}
                          className="w-full p-3 border border-[#E6E6E6] rounded-[8px] text-[14px] focus:outline-none focus:border-[#03856E]"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        />
                      </div>
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          className="p-2 text-[#ED1551] hover:bg-[#FFF5F5] rounded-full"
                          title="선택지 삭제"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="mt-2 flex items-center gap-2 text-[#03856E] hover:bg-[#F0F8F7] px-3 py-2 rounded-[8px] transition-colors"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[14px]">선택지 추가</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="pollMultiple"
                    checked={pollIsMultiple}
                    onChange={(e) => setPollIsMultiple(e.target.checked)}
                    className="w-4 h-4 text-[#03856E] border-[#E6E6E6] rounded focus:ring-[#03856E]"
                  />
                  <label 
                    htmlFor="pollMultiple"
                    className="text-[14px] text-[#2D3541]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    복수 선택 허용
                  </label>
                </div>

                <div>
                  <label 
                    className="block text-[14px] text-[#2D3541] mb-2"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    투표 종료일 (선택사항)
                  </label>
                  <input
                    type="datetime-local"
                    value={pollEndDate}
                    onChange={(e) => setPollEndDate(e.target.value)}
                    className="w-full p-3 border border-[#E6E6E6] rounded-[8px] text-[14px] focus:outline-none focus:border-[#03856E]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePollCancel}
                  className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666] hover:bg-[#F8F9FA] transition-colors"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handlePollCreate}
                  className="flex-1 py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  투표 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-6 w-[600px] mx-4 relative max-h-[80vh] overflow-hidden flex flex-col">
            <button
              onClick={handleReplyModalClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 
                className="text-[18px] text-[#2D3541] mb-2"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                댓글
              </h2>
              
              <div className="p-4 bg-[#F8F9FA] rounded-[8px] border border-[#E6E6E6]">
                <div className="flex items-start gap-3">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center">
                    <Image 
                      src={getProfileImage(selectedPost.user.profileImage || "fox")} 
                      alt="프로필 이미지" 
                      width={30} 
                      height={30}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="text-[12px] text-[#2D3541]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        {selectedPost.user.name}
                      </span>
                      <span 
                        className="text-[11px] text-[#666]"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        {new Date(selectedPost.createdAt).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p 
                      className="text-[12px] text-[#4D5764] line-clamp-2"
                      style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                    >
                      {selectedPost.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4">
              {isLoadingReplies ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      댓글을 불러오는 중...
                    </span>
                  </div>
                </div>
              ) : replies.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-[13px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    첫 번째 댓글을 작성해보세요!
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {replies.map((reply, index) => (
                    <div key={reply.id} className="flex items-start gap-3 relative">
                      <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center">
                        <Image 
                          src={getProfileImage(reply.user.profileImage || "fox")} 
                          alt="프로필 이미지" 
                          width={30} 
                          height={30}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="flex-1 pr-12">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="text-[12px] text-[#2D3541]"
                            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                          >
                            {reply.user.name}
                          </span>
                          <span 
                            className="text-[11px] text-[#666]"
                            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                          >
                            {new Date(reply.createdAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p 
                          className="text-[13px] text-[#4D5764] whitespace-pre-line"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          {reply.content}
                        </p>
                      </div>
                      {reply.user.id === userInfo?.id && (
                        <button
                          onClick={() => handleReplyDelete(reply.id)}
                          className="absolute top-0 right-0 text-[11px] text-[#999] hover:text-[#666] transition-colors"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#E6E6E6] pt-4">
              <div className="flex items-start gap-3">
                <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center">
                  <Image 
                    src={getProfileImage(userInfo?.profileImage || "fox")} 
                    alt="프로필 이미지" 
                    width={30} 
                    height={30}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="w-full h-[80px] p-3 border border-[#E6E6E6] rounded-[8px] resize-none focus:outline-none focus:border-[#03856E] text-[13px]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleReplySubmit}
                      className={`px-4 py-2 rounded-[8px] text-[13px] transition-colors ${
                        replyText.trim() 
                          ? "bg-[#03856E] text-white hover:bg-[#026B5A]" 
                          : "bg-[#B0B8C1] text-white cursor-not-allowed"
                      }`}
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      disabled={!replyText.trim()}
                    >
                      댓글 작성
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isHelpOpen && (
        <div className="fixed -right-10 -bottom-10 w-[300px] h-[300px] flex items-center justify-center">
          <div role="button" tabIndex={-1} onClick={() => router.push("/chatbot")} className="relative w-[250px] h-[250px] hover:brightness-105 transition-all focus:outline-none select-none" style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }} aria-label="상담하기로 이동" title="상담하기">
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsHelpOpen(false) }} className="absolute top-10 right-14 inline-flex items-center justify-center w-[28px] h-[28px] rounded-full bg-black/20 hover:bg-black/30 focus:outline-none" aria-label="닫기" title="닫기">
              <X className="w-4 h-4" />
            </button>
            <Image 
              src="/images/ic_chat.gif" 
              alt="상담하기" 
              width={800} 
              height={800}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {showUserProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] p-6 w-[700px] mx-4 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={handleUserProfileModalClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center">
                  <Image 
                    src={getProfileImage(selectedUserImage)} 
                    alt="프로필 이미지" 
                    width={60} 
                    height={60}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h2 
                    className="text-[20px] text-[#2D3541] mb-1"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    {selectedUserName}님의 글
                  </h2>
                  <p 
                    className="text-[14px] text-[#666]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    작성한 글을 확인하세요
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {isLoadingUserPosts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      게시글을 불러오는 중...
                    </span>
                  </div>
                </div>
              ) : userPostsError ? (
                <div className="text-center py-8">
                  <span className="text-[14px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    {userPostsError}
                  </span>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-[14px] text-[#999]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                    {selectedUserId === userInfo?.id.toString() ? "작성한 글이 없습니다." : "공개된 글이 없습니다."}
                  </span>
                </div>
              ) : (
                userPosts.map((post) => (
                  <div key={post.id} className="border border-[#E6E6E6] rounded-[12px] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center">
                        <Image 
                          src={getProfileImage(post.user.profileImage || "fox")} 
                          alt="프로필 이미지" 
                          width={30} 
                          height={30}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-[14px] text-[#2D3541]"
                            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                          >
                            {post.user.name}
                          </span>
                          <span 
                            className="text-[12px] text-[#666]"
                            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                          >
                            {new Date(post.createdAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p 
                        className="text-[14px] text-[#2D3541] whitespace-pre-line"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        {post.content}
                      </p>
                    </div>

                    {post.imageUrl && (
                      <div className="mb-3">
                        <Image
                          src={post.imageUrl}
                          alt="첨부 이미지"
                          width={400}
                          height={300}
                          className="w-full max-h-[300px] object-contain rounded-[8px] border border-[#E6E6E6]"
                        />
                      </div>
                    )}

                    {post.poll && (
                      <div className="mb-3 p-4 bg-[#F8F9FA] rounded-[8px] border border-[#E6E6E6]">
                        <h4 
                          className="text-[14px] text-[#2D3541] mb-3"
                          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                        >
                          {post.poll.title}
                        </h4>
                        <div className="space-y-2">
                          {post.poll.options.map((option: any) => {
                            const voteCount = option.votes?.length || 0
                            const totalVotes = post.poll.options.reduce((sum: number, opt: any) => sum + (opt.votes?.length || 0), 0)
                            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
                            const hasVoted = post.userVotes?.some((vote: any) => vote.optionId === option.id) || false

                            return (
                              <div key={option.id} className="relative">
                                <div className={`w-full p-3 rounded-[8px] border text-left transition-all ${
                                  hasVoted 
                                    ? 'border-[#03856E] bg-[#F0F8F7]' 
                                    : 'border-[#E6E6E6] bg-white'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span 
                                      className="text-[13px] text-[#2D3541]"
                                      style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                                    >
                                      {option.text}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span 
                                        className="text-[12px] text-[#666]"
                                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                                      >
                                        {percentage.toFixed(1)}%
                                      </span>
                                      <span 
                                        className="text-[11px] text-[#999]"
                                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                                      >
                                        ({voteCount}표)
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 w-full bg-[#F0F0F0] rounded-full h-2">
                                    <div 
                                      className="bg-[#03856E] h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-3 text-[11px] text-[#999] text-center" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                          총 {post.poll.options.reduce((sum: number, opt: any) => sum + (opt.votes?.length || 0), 0)}표
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[12px] text-[#666]" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                      <span>좋아요 {post.likes}개</span>
                      <span>댓글 {post.comments}개</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleUserProfileModalClose}
                className="w-full py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] p-6 w-full max-w-[400px]">
            <div className="text-center">
              <div className="text-[18px] text-[#2D3541] mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                주문 취소
              </div>
              <div className="text-[14px] text-[#666] mb-6" style={{ fontFamily: "Hana2-Regular, sans-serif" }}>
                정말로 취소하시겠습니까?
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false)
                    setCancelOrderId('')
                    setCancelOrderType('pending')
                  }}
                  className="flex-1 py-3 rounded-[10px] bg-[#F2F3F5] text-[#666] hover:bg-[#E6E6E6] transition-colors"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  아니요
                </button>
                <button
                  onClick={cancelOrderType === 'pending' ? cancelOrder : cancelRecurringOrder}
                  className="flex-1 py-3 rounded-[10px] bg-[#ED1551] text-white hover:bg-[#D1134A] transition-colors"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  취소하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] p-6 w-full max-w-[400px]">
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src="/images/ic_check.gif" 
                  alt="성공" 
                  className="w-16 h-16 mx-auto"
                />
              </div>
              <div className="text-[18px] text-[#2D3541] mb-4" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                주문이 취소되었습니다
              </div>
              <button
                onClick={() => setShowCancelSuccessModal(false)}
                className="w-full py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showCommunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[400px] mx-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Image 
                  src={modalType === 'success' ? "/images/ic_check.gif" : "/images/ic_danger.gif"} 
                  alt={modalType === 'success' ? '성공' : '경고'} 
                  width={60} 
                  height={60}
                  className="object-contain"
                />
              </div>
              
              <h2 
                className="text-[18px] mb-3"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                {modalTitle}
              </h2>
              
              <p 
                className="text-[14px] mb-6"
                style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
              >
                {modalMessage}
              </p>

              <div className="flex gap-3">
                {modalType === 'confirm' && (
                  <button
                    onClick={handleModalCancel}
                    className="flex-1 py-3 rounded-[10px] bg-[#EDEDED] text-[#666] hover:bg-[#E6E6E6] transition-colors"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    취소
                  </button>
                )}
                <button
                  onClick={modalType === 'confirm' ? handleModalConfirm : () => setShowCommunityModal(false)}
                  className={`flex-1 py-3 rounded-[10px] transition-colors ${
                    modalType === 'success' 
                      ? 'bg-[#03856E] text-white hover:bg-[#026B5A]' 
                      : modalType === 'error'
                      ? 'bg-[#ED1551] text-white hover:bg-[#D1002A]'
                      : 'bg-[#03856E] text-white hover:bg-[#026B5A]'
                  }`}
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  {modalType === 'confirm' ? '확인' : '확인'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[400px] mx-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Image 
                  src={orderModalType === 'success' ? "/images/ic_check.gif" : "/images/ic_danger.gif"} 
                  alt={orderModalType === 'success' ? '성공' : '경고'} 
                  width={60} 
                  height={60}
                  className="object-contain"
                />
              </div>
              
              <h2 
                className="text-[18px] mb-3"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                {orderModalTitle}
              </h2>
              
              <p 
                className="text-[14px] mb-6 whitespace-pre-line"
                style={{ fontFamily: "Hana2-Regular, sans-serif", color: "#666666" }}
              >
                {orderModalMessage}
              </p>

              <div className="flex gap-3">
                {orderModalType === 'confirm' && (
                  <button
                    onClick={handleOrderModalCancel}
                    className="flex-1 py-3 rounded-[10px] bg-[#F2F3F5] text-[#666] hover:bg-[#E6E6E6] transition-colors"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    취소
                  </button>
                )}
                <button
                  onClick={orderModalType === 'confirm' ? handleOrderModalConfirm : () => setShowOrderModal(false)}
                  className={`flex-1 py-3 rounded-[10px] transition-colors ${
                    orderModalType === 'success' 
                      ? 'bg-[#03856E] text-white hover:bg-[#026B5A]' 
                      : orderModalType === 'error'
                      ? 'bg-[#ED1551] text-white hover:bg-[#D1002A]'
                      : 'bg-[#03856E] text-white hover:bg-[#026B5A]'
                  }`}
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  {orderModalType === 'confirm' ? '확인' : '확인'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
