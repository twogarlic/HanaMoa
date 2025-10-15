'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavigationBar from '@/components/NavigationBar'
import { useAuth } from '@/hooks/use-auth'
import ReservationCard from '@/components/reservations/ReservationCard'
import StatusFilter from '@/components/reservations/StatusFilter'
import CancelModal from '@/components/reservations/CancelModal'
import PickupModal from '@/components/reservations/PickupModal'
import ResultModal from '@/components/reservations/ResultModal'
import EmptyState from '@/components/reservations/EmptyState'

interface Reservation {
  id: string
  reservationNumber: string
  branchId: string
  branchName: string
  branchAddress: string
  branchPhone: string
  assetType: string
  assetUnit: string
  assetAmount: number
  reservationDate: string
  reservationTime: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  cancelReason?: string
  cancelledAt?: string
}

export default function ReservationsPage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showPickupModal, setShowPickupModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultMessage, setResultMessage] = useState({ type: '', title: '', message: '' })
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

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

  const fetchReservations = async () => {
    if (!userInfo) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/service/request?userId=${userInfo.id}`)
      const result = await response.json()
      
      if (result.success) {
        setReservations(result.data || [])
      } else {
        setReservations([])
      }
    } catch (error) {
      setReservations([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && userInfo) {
      fetchReservations()
      fetchAllNotifications()
    }
  }, [isAuthenticated, userInfo])

  const openCancelModal = (reservationId: string) => {
    setSelectedReservationId(reservationId)
    setCancelReason('')
    setShowCancelModal(true)
  }

  const handleCancelReservation = async () => {
    if (!userInfo || !selectedReservationId) return
    
    if (!cancelReason.trim()) {
      setResultMessage({
        type: 'error',
        title: '입력 오류',
        message: '취소 사유를 입력해주세요.'
      })
      setShowResultModal(true)
      return
    }
    
    setShowCancelModal(false)
    
    try {
      const response = await fetch('/api/service/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: selectedReservationId,
          userId: userInfo.id,
          cancelReason: cancelReason.trim()
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setResultMessage({
          type: 'success',
          title: '예약 취소 완료',
          message: '예약이 취소되었습니다.'
        })
        setShowResultModal(true)
        fetchReservations()
      } else {
        setResultMessage({
          type: 'error',
          title: '예약 취소 실패',
          message: result.error || '예약 취소 중 오류가 발생했습니다.'
        })
        setShowResultModal(true)
      }
    } catch (error) {
      console.error('예약 취소 오류:', error)
      setResultMessage({
        type: 'error',
        title: '예약 취소 실패',
        message: '예약 취소 중 오류가 발생했습니다.'
      })
      setShowResultModal(true)
    } finally {
      setSelectedReservationId(null)
      setCancelReason('')
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    if (selectedStatus === 'ALL') return true
    return reservation.status === selectedStatus
  })


  const openPickupModal = (reservationId: string) => {
    setSelectedReservationId(reservationId)
    setShowPickupModal(true)
  }

  const handlePickupReservation = async () => {
    if (!userInfo || !selectedReservationId) return
    
    setShowPickupModal(false)
    
    try {
      const response = await fetch('/api/service/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: selectedReservationId,
          userId: userInfo.id
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setResultMessage({
          type: 'success',
          title: '수령 완료',
          message: '자산 수령이 완료되었습니다.'
        })
        setShowResultModal(true)
        fetchReservations()
      } else {
        setResultMessage({
          type: 'error',
          title: '수령 실패',
          message: result.error || '수령 처리 중 오류가 발생했습니다.'
        })
        setShowResultModal(true)
      }
    } catch (error) {
      console.error('수령 처리 오류:', error)
      setResultMessage({
        type: 'error',
        title: '수령 실패',
        message: '수령 처리 중 오류가 발생했습니다.'
      })
      setShowResultModal(true)
    } finally {
      setSelectedReservationId(null)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
            인증 확인 중...
          </span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[16px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            로그인이 필요합니다.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
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
      
      <div className="max-w-6xl mx-auto px-4 py-6 mt-20">
        <StatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="bg-white rounded-[10px] shadow-sm p-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                    예약 목록을 불러오는 중...
                  </span>
                </div>
              </div>
            </div>
          ) : filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={openCancelModal}
                onPickup={openPickupModal}
              />
            ))
          ) : (
            <EmptyState selectedStatus={selectedStatus} />
          )}
        </div>
      </div>

      <CancelModal
        isOpen={showCancelModal}
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
        onConfirm={handleCancelReservation}
        onClose={() => {
          setShowCancelModal(false)
          setSelectedReservationId(null)
          setCancelReason('')
        }}
      />

      <PickupModal
        isOpen={showPickupModal}
        onConfirm={handlePickupReservation}
        onClose={() => {
          setShowPickupModal(false)
          setSelectedReservationId(null)
        }}
      />

      <ResultModal
        isOpen={showResultModal}
        resultMessage={resultMessage}
        onClose={() => setShowResultModal(false)}
      />
    </div>
  )
}
