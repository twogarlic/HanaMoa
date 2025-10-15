"use client"

interface StatusFilterProps {
  selectedStatus: string
  onStatusChange: (status: string) => void
}

export default function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  const filters = [
    { value: 'ALL', label: '전체' },
    { value: 'APPROVED', label: '진행중' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'CANCELLED', label: '취소' }
  ]

  return (
    <div className="flex gap-3">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onStatusChange(filter.value)}
          className={`px-4 py-2 rounded-[20px] text-[13px] font-medium transition-all ${
            selectedStatus === filter.value
              ? 'bg-[#03856E] text-white'
              : 'bg-[#F8F9FA] text-[#666666] hover:bg-[#E9ECEF]'
          }`}
          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
