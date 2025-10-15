"use client"

import Image from "next/image"

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

interface ReservationCardProps {
  reservation: Reservation
  onCancel: (reservationId: string) => void
  onPickup: (reservationId: string) => void
}

export default function ReservationCard({ reservation, onCancel, onPickup }: ReservationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-[#FFA500] bg-[#FFF4E6]'
      case 'APPROVED': return 'text-[#03856E] bg-[#E6F7F3]'
      case 'REJECTED': return 'text-[#DC3545] bg-[#FDEBEC]'
      case 'COMPLETED': return 'text-[#6C757D] bg-[#F8F9FA]'
      case 'CANCELLED': return 'text-[#6C757D] bg-[#F8F9FA]'
      default: return 'text-[#6C757D] bg-[#F8F9FA]'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return '진행중'
      case 'COMPLETED': return '완료'
      case 'CANCELLED': return '취소'
      default: return status
    }
  }

  const getAssetTypeText = (type: string) => {
    switch (type) {
      case 'gold': return '골드바'
      case 'silver': return '실버바'
      case 'usd': return 'USD'
      case 'eur': return 'EUR'
      case 'jpy': return 'JPY'
      case 'cny': return 'CNY'
      default: return type
    }
  }

  const getAssetDisplayText = (reservation: Reservation) => {
    if (['usd', 'eur', 'jpy', 'cny'].includes(reservation.assetType)) {
      return `${reservation.assetAmount.toLocaleString()} ${reservation.assetType.toUpperCase()}`
    } else {
      return reservation.assetUnit
    }
  }

  const canCancel = (reservationDate: string) => {
    const today = new Date()
    const reservationDateObj = new Date(reservationDate)
    const todayStr = today.toISOString().split('T')[0]
    const reservationDateStr = reservationDateObj.toISOString().split('T')[0]
    
    return reservationDateStr !== todayStr
  }

  const canPickup = (reservationDate: string, reservationTime: string) => {
    const now = new Date()
    const reservationDateTime = new Date(reservationDate)
    
    const [hours, minutes] = reservationTime.split(':').map(Number)
    reservationDateTime.setHours(hours, minutes, 0, 0)
    
    return now >= reservationDateTime
  }

  return (
    <div className="bg-white rounded-[20px] shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span 
              className="text-[14px] font-bold text-[#2D3541]"
              style={{ fontFamily: "Hana2-Bold, sans-serif" }}
            >
              {reservation.reservationNumber}
            </span>
            <span 
              className={`px-3 py-1 rounded-[12px] text-[12px] font-medium ${getStatusColor(reservation.status)} ${
                reservation.status === 'PENDING' || reservation.status === 'APPROVED' ? 'animate-pulse' : ''
              }`}
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              {getStatusText(reservation.status)}
            </span>
          </div>
        </div>
        
        {reservation.status === 'APPROVED' && (
          <div className="flex gap-2">
            {canPickup(reservation.reservationDate, reservation.reservationTime) ? (
              <button
                onClick={() => onPickup(reservation.id)}
                className="px-4 py-2 bg-[#03856E] text-white text-[13px] font-medium hover:bg-[#026B58] transition-all rounded-[10px]"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                수령
              </button>
            ) : (
              canCancel(reservation.reservationDate) && (
                <button
                  onClick={() => onCancel(reservation.id)}
                  className="px-4 py-2 text-[#DC3545] text-[13px] font-medium hover:text-[#C82333] transition-all"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  취소
                </button>
              )
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 
          className="text-[15px] mb-4"
          style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
        >
          수령할 자산
        </h3>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-[#03856E] rounded-[30px] flex items-center gap-3">
            <div 
              className="text-[12px] font-medium text-white"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              {getAssetTypeText(reservation.assetType)}
            </div>
          </div>
          
          <div className="px-4 py-2 bg-[#03856E] rounded-[30px] flex items-center">
            <div 
              className="text-[12px] font-medium text-white"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              {getAssetDisplayText(reservation)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 
          className="text-[15px] mb-4"
          style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
        >
          수령 지점
        </h3>
        <div className="p-4 border-2 border-[#03856E] rounded-[8px]">
          <div>
            <h4 
              className="text-[14px] font-medium mb-2"
              style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
            >
              {reservation.branchName}
            </h4>
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/images/ic_place.svg"
                alt="위치"
                width={12}
                height={12}
                className="object-contain flex-shrink-0"
              />
              <div 
                className="text-[12px] text-[#666666]"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                {reservation.branchAddress}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/images/ic_phone.svg"
                alt="전화번호"
                width={12}
                height={12}
                className="object-contain flex-shrink-0"
              />
              <div 
                className="text-[11px] text-[#666666]"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                {reservation.branchPhone}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 
          className="text-[15px] mb-4"
          style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
        >
          수령 날짜/시간
        </h3>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-[#03856E] rounded-[30px] flex items-center gap-3">
            <div 
              className="text-[12px] font-medium text-white"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              {new Date(reservation.reservationDate).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>
          <div className="px-4 py-2 bg-[#03856E] rounded-[30px] flex items-center">
            <div 
              className="text-[12px] font-medium text-white"
              style={{ fontFamily: "Hana2-Medium, sans-serif" }}
            >
              {reservation.reservationTime}
            </div>
          </div>
        </div>
      </div>

      {reservation.status === 'CANCELLED' && reservation.cancelReason && (
        <div className="mt-4 p-3 bg-[#F8F9FA] rounded-[8px]">
          <div 
            className="text-[12px] text-[#999999] mb-1"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            취소 사유
          </div>
          <div 
            className="text-[13px] text-[#666666]"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            {reservation.cancelReason}
          </div>
        </div>
      )}
    </div>
  )
}
