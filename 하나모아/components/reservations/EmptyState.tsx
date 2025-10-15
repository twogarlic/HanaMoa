"use client"

interface EmptyStateProps {
  selectedStatus: string
}

export default function EmptyState({ selectedStatus }: EmptyStateProps) {
  const getEmptyMessage = () => {
    switch (selectedStatus) {
      case 'ALL':
        return {
          title: '예약 내역이 없습니다',
          subtitle: '자산 수령 예약을 신청해보세요.'
        }
      case 'PENDING':
        return {
          title: '진행중인 예약이 없습니다',
          subtitle: '새로운 예약을 신청해보세요.'
        }
      case 'COMPLETED':
        return {
          title: '완료된 예약이 없습니다',
          subtitle: '완료된 예약이 없습니다.'
        }
      case 'CANCELLED':
        return {
          title: '취소된 예약이 없습니다',
          subtitle: '취소된 예약이 없습니다.'
        }
      default:
        return {
          title: '예약 내역이 없습니다',
          subtitle: '자산 수령 예약을 신청해보세요.'
        }
    }
  }

  const { title, subtitle } = getEmptyMessage()

  return (
    <div className="bg-white rounded-[10px] shadow-sm p-8">
      <div className="text-center">
        <div 
          className="text-[16px] text-[#999999] mb-2"
          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
        >
          {title}
        </div>
        <div 
          className="text-[14px] text-[#CCCCCC]"
          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  )
}
