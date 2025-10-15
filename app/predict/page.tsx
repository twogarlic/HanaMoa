"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoadingOverlay from "../../components/LoadingOverlay"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"
import PredictionCard from "../../components/predict/PredictionCard"
import PriceChart from "../../components/predict/PriceChart"
import PortfolioAnalysis from "../../components/predict/PortfolioAnalysis"

interface PredictionResult {
  direction: string
  confidence: number
  probability: number
  nextDayPrediction: number
  basedOnDays: number
  lastUpdateDate: string
}

interface PriceHistory {
  date: string
  close: number
  diff: number
  ratio: number
}

interface PortfolioAnalysis {
  totalValue: number
  totalInvestment: number
  totalProfitLoss: number
  totalProfitLossRatio: number
  diversification: {
    score: number
    level: string
    description: string
  }
  riskAnalysis: {
    level: string
    score: number
    description: string
    concentrationRisk: number
  }
  assetBreakdown: Array<{
    asset: string
    assetName: string
    quantity: number
    currentValue: number
    percentage: number
    profitLoss: number
    profitLossRatio: number
  }>
  recommendations: Array<{
    type: string
    title: string
    description: string
    priority: string
  }>
}

interface SparkAnalysis {
  portfolio_summary: {
    total_value: number
    total_investment: number
    total_profit_loss: number
    portfolio_return: number
    asset_count: number
  }
  risk_metrics: {
    var_95: number
    sharpe_ratio: number
    beta: number
    max_drawdown: number
    risk_level: string
  }
  diversification: {
    score: number
    level: string
  }
  asset_allocation: Array<{
    asset: string
    value: number
    weight: number
  }>
}

export default function PredictPage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth()
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [isPriceHistoryLoading, setIsPriceHistoryLoading] = useState(true)
  
  
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)
  
  const [sparkAnalysis, setSparkAnalysis] = useState<SparkAnalysis | null>(null)
  const [isSparkLoading, setIsSparkLoading] = useState(false)
  const [sparkError, setSparkError] = useState<string | null>(null)
  const [showSparkAnalysis, setShowSparkAnalysis] = useState(false)

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
    if (isAuthenticated && userInfo) {
      fetchPrediction()
      fetchPortfolioAnalysis()
      fetchAllNotifications()
      fetchPriceHistory()
    }
  }, [isAuthenticated, userInfo])

  const fetchPrediction = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/predict/gold/latest')
      const data = await response.json()
      
      if (data.success) {
        setPrediction(data.prediction)
      } else {
        setError(data.error || '예측 데이터를 불러올 수 없습니다.')
      }
    } catch (error) {
      setError('예측 데이터를 불러올 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPortfolioAnalysis = async () => {
    if (!userInfo?.id) return
    
    setIsPortfolioLoading(true)
    setPortfolioError(null)
    
    try {
      const response = await fetch(`/api/portfolio/analysis?userId=${userInfo.id}`)
      const data = await response.json()
      
      if (data.success) {
        setPortfolioAnalysis(data.analysis)
      } else {
        setPortfolioError(data.error || '포트폴리오 분석 데이터를 불러올 수 없습니다.')
      }
    } catch (error) {
      setPortfolioError('포트폴리오 분석 데이터를 불러올 수 없습니다.')
    } finally {
      setIsPortfolioLoading(false)
    }
  }

  const fetchSparkAnalysis = async () => {
    if (!userInfo?.id) return
    
    setShowSparkAnalysis(true)
    setIsSparkLoading(true)
    setSparkError(null)
    
    try {
      const response = await fetch(`/api/spark/portfolio/${userInfo.id}`)
      const data = await response.json()
      
      if (data.success) {
        setSparkAnalysis(data.data)
      } else {
        setSparkError(data.error || 'Spark 분석 서비스를 사용할 수 없습니다.')
      }
    } catch (error) {
      setSparkError('Spark 분석 서비스를 사용할 수 없습니다.')
    } finally {
      setIsSparkLoading(false)
    }
  }
  
  const handleToggleSparkAnalysis = () => {
    if (!showSparkAnalysis && !sparkAnalysis) {
      fetchSparkAnalysis()
    } else {
      setShowSparkAnalysis(!showSparkAnalysis)
    }
  }


  const fetchPriceHistory = async () => {
    setIsPriceHistoryLoading(true)
    
    try {
      const response = await fetch('/api/market/gold?page=1')
      const data = await response.json()
      
      if (data.success && data.data) {
        setPriceHistory(data.data.slice(0, 7))
      }
    } catch (error) {
    } finally {
      setIsPriceHistoryLoading(false)
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

      <main className="pt-24 pb-32 bg-[#F5FBFA]">
        <div className="max-w-[1200px] mx-auto px-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <PredictionCard
                prediction={prediction}
                error={error}
                isLoading={isLoading}
                onRetry={fetchPrediction}
              />
              
              <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-8">
                <h3 className="text-[16px] font-bold text-[#333] mb-8" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                  최근 7일 가격 추이
                </h3>
                
                <PriceChart
                  priceHistory={priceHistory}
                  isLoading={isPriceHistoryLoading}
                />
          </div>
            </div>

            <div>
              <PortfolioAnalysis
                portfolioAnalysis={portfolioAnalysis}
                isPortfolioLoading={isPortfolioLoading}
                portfolioError={portfolioError}
                sparkAnalysis={sparkAnalysis}
                isSparkLoading={isSparkLoading}
                sparkError={sparkError}
                showSparkAnalysis={showSparkAnalysis}
                onRetry={fetchPortfolioAnalysis}
                onToggleSparkAnalysis={handleToggleSparkAnalysis}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
