"use client"

import { useState } from "react"
import { ChevronRight as RightChevron, ChevronLeft, ChevronRight } from "lucide-react"

interface DateTimeSelectionStepProps {
  selectedAssetType: string | null
  selectedDate: Date | null
  selectedTime: string | null
  availableTimes: string[]
  bookedTimes: string[]
  isLoadingTimes: boolean
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string) => void
  onComplete: () => void
  selectedBranch: string
  fetchAvailableTimes: (branchId: string, date: Date) => void
}

export default function DateTimeSelectionStep({
  selectedAssetType,
  selectedDate,
  selectedTime,
  availableTimes,
  bookedTimes,
  isLoadingTimes,
  onDateSelect,
  onTimeSelect,
  onComplete,
  selectedBranch,
  fetchAvailableTimes
}: DateTimeSelectionStepProps) {
  const [calendarDate, setCalendarDate] = useState(new Date())

  const getAvailableDates = () => {
    const today = new Date()
    const availableDates: Date[] = []
    
    const minBusinessDays = (selectedAssetType === 'gold' || selectedAssetType === 'silver') ? 4 : 0
    
    let startDate = new Date(today)
    
    if (minBusinessDays > 0) {
      let businessDaysAdded = 0
      while (businessDaysAdded < minBusinessDays) {
        startDate.setDate(startDate.getDate() + 1)
        const dayOfWeek = startDate.getDay()
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          businessDaysAdded++
        }
      }
    }

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(startDate)
      checkDate.setDate(startDate.getDate() + i)
      const dayOfWeek = checkDate.getDay()
      
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        availableDates.push(new Date(checkDate))
      }
    }
  
    return availableDates
  }

  const DatePickerCalendar = () => {
    const availableDates = getAvailableDates()
    
    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }
    
    const getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }
    
    const navigateMonth = (direction: 'prev' | 'next') => {
      setCalendarDate(prevDate => {
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
      const isAvailable = availableDates.some(availableDate => {
        const sameDate = availableDate.getFullYear() === date.getFullYear() &&
                        availableDate.getMonth() === date.getMonth() &&
                        availableDate.getDate() === date.getDate()
        return sameDate
      })
      return isAvailable
    }
    
    const isDateSelected = (date: Date) => {
      return selectedDate && selectedDate.getTime() === date.getTime()
    }
    
    const handleDateSelect = (date: Date) => {
      if (isDateAvailable(date)) {
        onDateSelect(date)
        if (selectedBranch) {
          fetchAvailableTimes(selectedBranch, date)
        }
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
      <div className="bg-white rounded-[10px] shadow-sm p-4">
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
                title={`${date.toLocaleDateString()} - ${isAvailable ? '선택 가능' : '선택 불가'}`}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${false ? 'flex-col' : 'gap-12'}`}>
      <div className="flex-1">
        <div className="mb-4">
          <span 
            className="text-[15px] text-[#333333]" 
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            수령 날짜와 시간을 선택해주세요.
          </span>
        </div>

        <div className="mb-6 p-4 rounded-[10px] border border-[#03856E]">
          <div 
            className="text-[14px] font-medium mb-2"
            style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#03856E" }}
          >
            수령 가능 안내
          </div>
          <div 
            className="text-[12px] text-[#666666]"
            style={{ fontFamily: "Hana2-Regular, sans-serif" }}
          >
            {selectedAssetType === 'gold' || selectedAssetType === 'silver' ? (
              <>골드/실버: 신청일로부터 D+4 영업일 이후부터 수령 가능</>
            ) : (
              <>외환: 당일 수령 가능</>
            )}
            <br />
            영업시간: 평일 09:00 ~ 16:00 (공휴일 제외)
          </div>
        </div>

        <div className={`flex ${false ? 'flex-col' : 'gap-6'}`}>
          <div className="flex-1">
            <div className="mb-4">
              <span 
                className="text-[14px] font-medium"
                style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
              >
                수령 날짜 선택
              </span>
            </div>
            <DatePickerCalendar />
          </div>

          <div className={`${false ? 'w-full mt-4' : 'w-80'}`}>
            {selectedDate ? (
              <>
                <div className="mb-4">
                  <span 
                    className="text-[14px] font-medium"
                    style={{ fontFamily: "Hana2-Medium, sans-serif", color: "#2D3541" }}
                  >
                    수령 시간 선택
                  </span>
                </div>
                
                <div className="bg-white shadow-sm rounded-[10px] p-6">
                  {isLoadingTimes ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[13px] text-[#666]" style={{ fontFamily: "Hana2-CM, sans-serif" }}>
                          예약 가능 시간을 확인하는 중...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map((time) => {
                        const isBooked = bookedTimes.includes(time)
                        const isAvailable = availableTimes.includes(time)
                        const isSelected = selectedTime === time
                        
                        const isPastTime = (() => {
                          if (!selectedDate) return false
                          
                          const now = new Date()

                          const todayYear = now.getFullYear()
                          const todayMonth = now.getMonth()
                          const todayDate = now.getDate()
                          
                          const selectedYear = selectedDate.getFullYear()
                          const selectedMonth = selectedDate.getMonth()
                          const selectedDay = selectedDate.getDate()
                          
                          if (todayYear !== selectedYear || todayMonth !== selectedMonth || todayDate !== selectedDay) {
                            return false
                          }
                          
                          const [timeHour] = time.split(':').map(Number)
                          const currentHour = now.getHours()
                          
                          return timeHour <= currentHour
                        })()
                        
                        const isDisabled = isBooked || isPastTime
                        
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              if (!isDisabled) {
                                onTimeSelect(time)
                              }
                            }}
                            disabled={isDisabled}
                            className={`p-3 rounded-[26px] border-2 transition-all text-center ${
                              isDisabled
                                ? 'border-[#E9ECEF] bg-[#F5F5F5] text-[#999] cursor-not-allowed'
                                : isSelected
                                ? 'border-[#03856E]'
                                : 'border-[#E9ECEF] hover:border-[#03856E] cursor-pointer'
                            }`}
                          >
                            <div 
                              className="text-[14px] font-medium"
                              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                            >
                              {time}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-[200px]"></div>
            )}
          </div>
        </div>

        {selectedDate && selectedTime && (
          <div className="flex justify-end items-end mt-auto">
            <button
              onClick={onComplete}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-[#03856E] text-white hover:bg-[#026B5A] hover:scale-105"
            >
              <RightChevron className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
