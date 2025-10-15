"use client"

import { Plus, Target, TrendingUp, Calendar, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"

export default function GoalPage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth()
  
  
  const [goals, setGoals] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [createStep, setCreateStep] = useState(1)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  const [editStep, setEditStep] = useState(1)
  const [showEditSuccessMessage, setShowEditSuccessMessage] = useState(false)
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    startDate: '',
    targetDate: '',
    asset: '',
    description: '',
    color: '#008D70'
  })
  
  const [editGoal, setEditGoal] = useState({
    id: '',
    title: '',
    targetAmount: '',
    startDate: '',
    targetDate: '',
    asset: '',
    description: '',
    color: '#008D70'
  })
  
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDateModal, setShowDateModal] = useState(false)

  const [swipedGoalId, setSwipedGoalId] = useState<string | null>(null)
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null)
  const [swipeCurrentX, setSwipeCurrentX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null)
  const [calendarDate, setCalendarDate] = useState(new Date())
  
  const [goalTab, setGoalTab] = useState<"진행 중" | "성공" | "실패">("진행 중")

  const colorOptions = [
    { value: '#008D70', label: '100%' },
    { value: '#008D70CC', label: '80%' },
    { value: '#008D7099', label: '60%' },
    { value: '#008D7066', label: '40%' },
    { value: '#008D7033', label: '20%' }
  ]

  const assets = [
    { 
      key: "gold", 
      label: "GOLD", 
      icon: "/images/ic_market_gold.png",
      minUnit: 0.01,
      unitLabel: "g"
    },
    { 
      key: "silver", 
      label: "SILVER", 
      icon: "/images/ic_market_silver.png",
      minUnit: 1,
      unitLabel: "g"
    },
    { 
      key: "usd", 
      label: "USD", 
      icon: "/images/ic_market_money.png",
      minUnit: 1,
      unitLabel: "USD"
    },
    { 
      key: "eur", 
      label: "EUR", 
      icon: "/images/ic_market_money.png",
      minUnit: 1,
      unitLabel: "EUR"
    },
    { 
      key: "jpy", 
      label: "JPY", 
      icon: "/images/ic_market_money.png",
      minUnit: 1,
      unitLabel: "JPY"
    },
    { 
      key: "cny", 
      label: "CNY", 
      icon: "/images/ic_market_money.png",
      minUnit: 1,
      unitLabel: "CNY"
    },
  ]


  const fetchGoals = async () => {
    if (!userInfo) return
    
    try {
      const response = await fetch(`/api/goals/progress?userId=${userInfo.id}`)
      const result = await response.json()
      
      if (result.success) {
        setGoals(result.data || [])
      }
    } catch (error) {
      console.error('목표 목록 조회 오류:', error)
    }
  }

  useEffect(() => {
    if (userInfo) {
      fetchGoals()
      fetchAllNotifications()
    }
  }, [userInfo])

  const fetchAllNotifications = async () => {
    if (!userInfo) return
    
    setIsLoadingRequests(true)
    
    try {
      const [friendResponse, giftResponse, notifResponse] = await Promise.all([
        fetch(`/api/friends/request?userId=${userInfo.id}&type=received`),
        fetch(`/api/gifts?userId=${userInfo.id}&type=received`),
        fetch(`/api/notifications?userId=${userInfo.id}`)
      ])
      
      const [friendResult, giftResult, notifResult] = await Promise.all([
        friendResponse.json(),
        giftResponse.json(),
        notifResponse.json()
      ])
      
      if (friendResult.success) {
        setFriendRequests(friendResult.data || [])
      }
      
      if (giftResult.success) {
        setGiftRequests(giftResult.data || [])
      }

      if (notifResult.success) {
        setNotifications(notifResult.data || [])
        setUnreadNotificationCount(notifResult.data?.filter((n: any) => !n.isRead).length || 0)
      }
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId: userInfo.id })
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || '친구 신청 처리에 실패했습니다.')
    }

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

  const createGoal = async () => {
    if (!userInfo || !newGoal.title || !newGoal.targetAmount || !newGoal.startDate || !newGoal.targetDate || !newGoal.asset) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id,
          title: newGoal.title,
          targetAmount: parseFloat(newGoal.targetAmount),
          startDate: newGoal.startDate,
          targetDate: newGoal.targetDate,
          asset: newGoal.asset,
          description: newGoal.description,
          color: newGoal.color
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchGoals()
        
        setTimeout(() => {
          setCreateStep(1)
        setShowCreateModal(false)
        setNewGoal({
          title: '',
          targetAmount: '',
          startDate: '',
          targetDate: '',
          asset: '',
          description: '',
          color: '#008D70'
        })
          setTempStartDate(null)
          setTempEndDate(null)
        }, 2000)
      } else {
        alert(`목표 생성 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('목표 생성 오류:', error)
      alert('목표 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('정말로 이 목표를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo?.id
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchGoals()
        alert('목표가 삭제되었습니다.')
      } else {
        alert(`목표 삭제 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('목표 삭제 오류:', error)
      alert('목표 삭제 중 오류가 발생했습니다.')
    }
  }

  const openEditModal = (goal: any) => {
    setSelectedGoal(goal)
    setEditGoal({
      id: goal.id,
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      asset: goal.asset,
      description: goal.description || '',
      color: goal.color || '#03856E'
    })
    setEditStep(1)
    setShowEditSuccessMessage(false)
    setTempStartDate(null)
    setTempEndDate(null)
    setShowEditModal(true)
  }

  const updateGoal = async () => {
    if (!userInfo || !selectedGoal || !editGoal.title || !editGoal.targetAmount || !editGoal.startDate || !editGoal.targetDate || !editGoal.asset) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id,
          title: editGoal.title,
          targetAmount: parseFloat(editGoal.targetAmount),
          startDate: editGoal.startDate,
          targetDate: editGoal.targetDate,
          asset: editGoal.asset,
          description: editGoal.description,
          color: editGoal.color
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchGoals()
        
        setTimeout(() => {
          setEditStep(1)
        setShowEditModal(false)
        setSelectedGoal(null)
          setEditGoal({
            id: '',
          title: '',
          targetAmount: '',
          startDate: '',
          targetDate: '',
          asset: '',
          description: '',
          color: '#008D70'
        })
          setTempStartDate(null)
          setTempEndDate(null)
        }, 2000)
      } else {
        alert(`목표 수정 실패: ${result.error}`)
      }
    } catch (error) {
      console.error('목표 수정 오류:', error)
      alert('목표 수정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProgress = (goal: any) => {
    return goal.progress || 0
  }

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDayName = (dayIndex: number) => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return days[dayIndex]
  }

  const isDateInRange = (date: Date, startDate: string, endDate: string) => {
    const dateStr = formatDate(date)
    const startDateStr = startDate.split('T')[0]
    const endDateStr = endDate.split('T')[0]
    return dateStr >= startDateStr && dateStr <= endDateStr
  }

  const getGlobalGoalOrder = () => {
    return goals.sort((a, b) => {
      const aStartDate = new Date(a.startDate)
      const bStartDate = new Date(b.startDate)
      return aStartDate.getTime() - bStartDate.getTime()
    })
  }

  const getGoalAtSlot = (date: Date, slotIndex: number) => {
    const globalOrder = getGlobalGoalOrder()
    const activeGoals = globalOrder.filter(goal => 
      isDateInRange(date, goal.startDate, goal.targetDate)
    )
    return activeGoals[slotIndex] || null
  }

  const getGoalsForDate = (date: Date) => {
    const globalOrder = getGlobalGoalOrder()
    return globalOrder.filter(goal => 
      isDateInRange(date, goal.startDate, goal.targetDate)
    )
  }

  const globalGoalOrder = getGlobalGoalOrder()

  const getFilteredGoals = () => {
    switch (goalTab) {
      case "진행 중":
        return goals.filter(goal => goal.status === 'ACTIVE' && calculateProgress(goal) < 100)
      case "성공":
        return goals.filter(goal => goal.status === 'COMPLETED' || calculateProgress(goal) >= 100)
      case "실패":
        return goals.filter(goal => goal.status === 'FAILED')
      default:
        return goals
    }
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
              ${selected ? "bg-[#F2F3F5] text-[#666666]" : "text-[#666666]"}
            `}
            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleSwipeStart = (e: React.TouchEvent, goalId: string) => {
    setSwipeStartX(e.touches[0].clientX)
    setSwipeCurrentX(e.touches[0].clientX)
    setIsDragging(false)
  }

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (swipeStartX !== null) {
      setSwipeCurrentX(e.touches[0].clientX)
      const diff = Math.abs(swipeStartX - e.touches[0].clientX)
      if (diff > 5) {
        setIsDragging(true)
      }
    }
  }

  const handleSwipeEnd = (goalId: string) => {
    if (swipeStartX !== null && swipeCurrentX !== null) {
      const diff = swipeStartX - swipeCurrentX
      if (diff > 50 && isDragging) {
        setSwipedGoalId(goalId)
      } else {
        setSwipedGoalId(null)
      }
    }
    setSwipeStartX(null)
    setSwipeCurrentX(null)
    setIsDragging(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setSwipeStartX(e.clientX)
    setSwipeCurrentX(e.clientX)
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (swipeStartX !== null) {
      setSwipeCurrentX(e.clientX)
      const diff = Math.abs(swipeStartX - e.clientX)
      if (diff > 5) {
        setIsDragging(true)
      }
    }
  }

  const handleMouseUp = (goalId: string) => {
    if (swipeStartX !== null && swipeCurrentX !== null) {
      const diff = swipeStartX - swipeCurrentX
      if (diff > 50 && isDragging) {
        setSwipedGoalId(goalId)
      } else {
        setSwipedGoalId(null)
      }
    }
    setSwipeStartX(null)
    setSwipeCurrentX(null)
    setIsDragging(false)
  }

  const handleDeleteClick = (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteGoal(goalId)
    setSwipedGoalId(null)
  }

  const handleCardClick = (goal: any, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isDragging && swipedGoalId !== goal.id) {
      openEditModal(goal)
    }
  }

  const handleDateSelect = (date: Date) => {
    if (!tempStartDate) {
      setTempStartDate(date)
    } else if (!tempEndDate) {
      if (date < tempStartDate) {
        setTempEndDate(tempStartDate)
        setTempStartDate(date)
      } else {
        setTempEndDate(date)
      }
      
      if (showCreateModal) {
        setNewGoal({
          ...newGoal,
          startDate: date < tempStartDate ? formatDate(date) : formatDate(tempStartDate),
          targetDate: date < tempStartDate ? formatDate(tempStartDate) : formatDate(date)
        })
      } else if (showEditModal) {
        setEditGoal({
          ...editGoal,
          startDate: date < tempStartDate ? formatDate(date) : formatDate(tempStartDate),
          targetDate: date < tempStartDate ? formatDate(tempStartDate) : formatDate(date)
        })
      }
    } else {
      setTempStartDate(date)
      setTempEndDate(null)
      
      if (showCreateModal) {
        setNewGoal({
          ...newGoal,
          startDate: formatDate(date),
          targetDate: ''
        })
      } else if (showEditModal) {
        setEditGoal({
          ...editGoal,
          startDate: formatDate(date),
          targetDate: ''
        })
      }
    }
  }


  const DatePickerCalendar = () => {
    const today = new Date()
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
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
    
    const isDateSelected = (date: Date) => {
      if (tempStartDate && tempEndDate) {
        return date.getTime() === tempStartDate.getTime() || date.getTime() === tempEndDate.getTime()
      }
      if (tempStartDate) {
        return date.getTime() === tempStartDate.getTime()
      }
      return false
    }
    
    const isDateInRange = (date: Date) => {
      if (tempStartDate && tempEndDate) {
        return date > tempStartDate && date < tempEndDate
      }
      return false
    }
    
    const getCurrentSelectedDates = () => {
      if (showCreateModal && newGoal.startDate && newGoal.targetDate) {
        return {
          startDate: newGoal.startDate,
          endDate: newGoal.targetDate
        }
      } else if (showEditModal && editGoal.startDate && editGoal.targetDate) {
        const startDate = editGoal.startDate.includes('T') ? editGoal.startDate.split('T')[0] : editGoal.startDate
        const endDate = editGoal.targetDate.includes('T') ? editGoal.targetDate.split('T')[0] : editGoal.targetDate
        return {
          startDate,
          endDate
        }
      }
      return null
    }
    
    const currentSelected = getCurrentSelectedDates()
    
    const isDateSelectedFromForm = (date: Date) => {
      if (currentSelected) {
        const dateStr = formatDate(date)
        return dateStr === currentSelected.startDate || dateStr === currentSelected.endDate
      }
      return false
    }
    
    const isDateInRangeFromForm = (date: Date) => {
      if (currentSelected) {
        const dateStr = formatDate(date)
        return dateStr > currentSelected.startDate && dateStr < currentSelected.endDate
      }
      return false
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
      <div className="bg-white rounded-[10px] border border-[#E6E6E6] p-4">
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
            
            const isSelected = isDateSelected(date) || isDateSelectedFromForm(date)
            const isInRange = isDateInRange(date) || isDateInRangeFromForm(date)
            const dayOfWeek = date.getDay() 
            
            const getDayColor = () => {
              if (isSelected) return 'text-white' 
              if (dayOfWeek === 0) return 'text-[#ED1551]' 
              if (dayOfWeek === 6) return 'text-[#1B8FF0]'
              return 'text-[#333333]' 
            }
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDateSelect(date)}
                className={`
                  h-8 text-[12px] rounded-full transition-colors
                  ${isSelected 
                    ? 'bg-[#03856E] text-white' 
                    : isInRange 
                      ? 'bg-[#008D7033] text-[#03856E]' 
                      : `${getDayColor()} hover:bg-[#F8F9FA]`
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
    const handleGlobalClick = (e: MouseEvent) => {
      if (swipedGoalId) {
        const target = e.target as HTMLElement
        const isGoalCard = target.closest('[data-goal-card]')
        const isDeleteButton = target.closest('[data-delete-button]')
        
        if (!isGoalCard && !isDeleteButton) {
          setSwipedGoalId(null)
        }
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => {
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [swipedGoalId])

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
    <div className="w-full bg-[#F8F9FA] min-h-screen">
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

      <main className="pt-2 pb-20">
        <div className="w-full h-[350px] bg-gradient-to-r from-[#03856E] to-[#005044]">
          <div className="max-w-[1335px] h-full mx-auto px-4 flex flex-col justify-center">
          </div>
        </div>
        
        <div className="max-w-[1335px] mx-auto px-4 -mt-64 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6">
            <section className="flex-[2] h-[400px] lg:h-[610px]">
              <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] p-6 h-full flex flex-col">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-[#F2F3F5] rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#333333]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1 text-[16px] text-[#333333] hover:bg-[#F0F9F7] rounded-[6px] transition-colors"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-[#F2F3F5] rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-[#333333]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 flex-1">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div
                      key={day}
                      className={`h-10 flex items-center justify-center text-[12px] ${
                        index === 0 ? 'text-[#ED1551]' : index === 6 ? 'text-[#1B8FF0]' : 'text-[#999999]'
                      }`}
                      style={{ fontFamily: "Hana2-CM, sans-serif" }}
                    >
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-16 lg:h-24"></div>
                  ))}

                  {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                    const day = index + 1
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const dayOfWeek = date.getDay()  
                    const isToday = formatDate(date) === formatDate(new Date())
                    const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate)
                    const dayGoals = getGoalsForDate(date)
                    
                    const getDayColor = () => {
                      if (isToday) return 'text-white' 
                      if (dayOfWeek === 0) return 'text-[#ED1551]' 
                      if (dayOfWeek === 6) return 'text-[#1B8FF0]' 
                      return 'text-[#999999]'
                    }
                    
                    return (
                      <div
                        key={day}
                        className={`h-16 lg:h-24 cursor-pointer hover:bg-[#F8F9FA] transition-colors ${
                          isSelected ? 'bg-[#F8F9FA]' : ''
                        }`}
                        onClick={() => {
                          setSelectedDate(date)
                          setShowDateModal(true)
                        }}
                      >
                        <div className="h-full flex flex-col">
                          <div className="p-1 flex items-start justify-start">
                            {isToday ? (
                              <div className="w-6 h-6 bg-[#005044] rounded-full flex items-center justify-center">
                                <span 
                                  className="text-[12px] text-white"
                                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                >
                                  {day}
                                </span>
                              </div>
                            ) : (
                              <span 
                                className={`text-[12px] ${getDayColor()}`}
                                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                              >
                                {day}
                              </span>
                            )}
                          </div>
                          <div className={`flex-1 flex flex-col gap-0.5 ${isToday ? '' : 'mt-1.5'}`}>
                            {globalGoalOrder.map((goal, globalIndex) => {
                              const currentDateStr = formatDate(date)
                              const goalStartDate = goal.startDate.split('T')[0]
                              const goalEndDate = goal.targetDate.split('T')[0]
                              const isInRange = isDateInRange(date, goal.startDate, goal.targetDate)
                              
                              if (!isInRange) {
                                return (
                                  <div
                                    key={`empty-${goal.id}-${globalIndex}`}
                                    className="h-1.5"
                                  ></div>
                                )
                              }
                              
                              const activeGoals = dayGoals
                              const shouldShow = activeGoals.findIndex(activeGoal => activeGoal.id === goal.id) < 3
                              
                              if (!shouldShow) {
                                return null
                              }
                              
                              const isStartDate = currentDateStr === goalStartDate
                              const isEndDate = currentDateStr === goalEndDate
                              
                              const getBorderRadiusStyle = () => {
                                if (isStartDate && isEndDate) {
                                  return { borderRadius: '6px' }  
                                } else if (isStartDate) {
                                  return { borderRadius: '6px 0 0 6px' }
                                } else if (isEndDate) {
                                  return { borderRadius: '0 6px 6px 0' } 
                                } else {
                                  return { borderRadius: '0' } 
                                }
                              }
                              
                              return (
                                <div
                                  key={`${goal.id}-${globalIndex}`}
                                  className="h-1.5"
                                  style={{
                                    ...getBorderRadiusStyle(),
                                    backgroundColor: goal.color || '#03856E'
                                  }}
                                  title={`${goal.title} (${goalStartDate} ~ ${goalEndDate})`}
                                ></div>
                              )
                            })}
                            {dayGoals.length > 3 && (
                              <div 
                                className="text-[8px] text-[#666]"
                                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                              >
                                +{dayGoals.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>
            </section>

            <section className="flex-[1] h-[400px] lg:h-[610px]">
              <div className="bg-white rounded-[15px] shadow-[0px_4px_4px_rgba(0,0,0,0.1)] p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <Segmented
                    items={[
                      { key: "진행 중", label: "진행 중" },
                      { key: "성공", label: "성공" },
                      { key: "실패", label: "실패" },
                    ]}
                    value={goalTab}
                    onChange={(k) => setGoalTab(k as any)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(true)
                      setCreateStep(1)
                      setShowSuccessMessage(false)
                      setTempStartDate(null)
                      setTempEndDate(null)
                    }}
                    className="w-8 h-8 rounded-full bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {getFilteredGoals().map((goal) => {
                      const progress = calculateProgress(goal)
                      const daysRemaining = getDaysRemaining(goal.targetDate)
                      const assetInfo = assets.find(a => a.key === goal.asset)
                      
                      return (
                        <div
                          key={goal.id}
                          className="relative overflow-hidden"
                        >
                          {swipedGoalId === goal.id && (
                            <div className="absolute right-0 top-0 h-full w-20 rounded-[15px] bg-[#ED1551] flex items-center justify-center z-10">
                                  <button
                                    data-delete-button
                                    type="button"
                                    onClick={(e) => handleDeleteClick(goal.id, e)}
                                    className="text-white p-2"
                                  >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                          
                          <div
                            data-goal-card
                            className={`px-4 py-3 border 
                            border-[#E6E6E6] rounded-[10px] hover:shadow-sm transition-all duration-300 cursor-pointer ${
                              swipedGoalId === goal.id ? 'transform -translate-x-20' : 'transform translate-x-0'
                            }`}
                            onClick={(e) => handleCardClick(goal, e)}
                            onTouchStart={(e) => handleSwipeStart(e, goal.id)}
                            onTouchMove={handleSwipeMove}
                            onTouchEnd={() => handleSwipeEnd(goal.id)}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={() => handleMouseUp(goal.id)}
                            onMouseLeave={() => handleMouseUp(goal.id)}
                        >
                          <div className="flex items-start justify-between mb-2 lg:mb-3">
                            <div className="flex items-center gap-2">
                              <div className="relative w-5 h-5 lg:w-6 lg:h-6">
                                <Image 
                                  src={assetInfo?.icon || "/images/ic_market_gold.png"} 
                                  alt={goal.asset} 
                                  fill 
                                  className="object-contain" 
                                />
                              </div>
                              <div>
                                <h3 
                                  className="text-[12px] lg:text-[14px] text-[#666666]"
                                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                                >
                                  {goal.title}
                                </h3>
                                <p 
                                  className="text-[10px] lg:text-[11px] text-[#818898]"
                                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                                >
                                  {goal.targetAmount}{assetInfo?.unitLabel}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                            {goal.status === 'COMPLETED' || progress >= 100 ? (
                                <>
                              <span 
                                    className="text-[10px] text-[#1B8FF0]"
                                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                              >
                                    달성 완료
                              </span>
                                </>
                               ) : goal.status === 'FAILED' ? (
                                 <>
                              <span 
                                     className="text-[10px] text-[#ED1551]"
                                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                              >
                                     달성 실패
                              </span>
                                 </>
                               ) : (
                                 <>
                              <span 
                                     className="text-[10px] text-[#03856E] animate-pulse"
                                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                              >
                                     진행 중
                              </span>
                                 </>
                               )}
                            </div>
                          </div>

                          <div className="mb-2 lg:mb-3">
                            <div className="flex items-center justify-between mb-1">
                            </div>
                            <div className="w-full bg-[#F2F3F5] rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${progress}%`,
                                  backgroundColor: goal.status === 'COMPLETED' || progress >= 100 
                                    ? '#1B8FF0' 
                                    : goal.status === 'FAILED' 
                                      ? '#ED1551' 
                                      : (goal.color || '#03856E')
                                }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span 
                                className="text-[10px] text-[#818898]"
                                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                              >
                                  {goal.startDate.split('T')[0]} ~ {goal.targetDate.split('T')[0]}
                              </span>
                              <span 
                                className="text-[10px] text-[#818898]"
                                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                              >
                                {daysRemaining > 0 ? `${daysRemaining}일 남음` : goal.status === 'FAILED' ? '기한 만료' : '기한 만료'}
                              </span>
                            </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                   {getFilteredGoals().length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <Image 
                        src="/images/ic_goal_run.gif" 
                        alt="목표 아이콘" 
                        fill 
                        className="object-contain opacity-50" 
                      />
                    </div>
                    <h3 
                      className="text-[14px] text-[#818898] mb-2"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      {goalTab === "진행 중" 
                        ? "아직 설정된 목표가 없습니다"
                        : goalTab === "성공"
                        ? "달성 완료된 목표가 없습니다"
                        : "실패한 목표가 없습니다"
                      }
                    </h3>
                    <p 
                      className="text-[12px] text-[#999999] mb-4"
                      style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                    >
                      {goalTab === "진행 중" 
                        ? "첫 번째 투자 목표를 설정해보세요"
                        : goalTab === "성공"
                        ? "목표를 달성해보세요"
                        : "목표를 성공적으로 달성해보세요"
                      }
                    </p>
                  </div>
                   )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => {
            if (createStep === 5) return
            
            setShowCreateModal(false)
            setCreateStep(1)
            setShowSuccessMessage(false)
            setNewGoal({
              title: '',
              targetAmount: '',
              startDate: '',
              targetDate: '',
              asset: '',
              description: '',
              color: '#008D70'
            })
            setTempStartDate(null)
            setTempEndDate(null)
          }}
        >
          <div 
            className="bg-white rounded-[20px] p-4 sm:p-8 w-full max-w-[95vw] sm:w-[500px] mx-2 sm:mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <div className="w-full bg-[#F2F3F5] rounded-full h-2 relative overflow-hidden">
                <div 
                  className="h-2 rounded-full transition-all duration-300 absolute top-0"
                  style={{ 
                    backgroundColor: '#03856E',
                    width: '20%',
                    left: createStep === 1 ? '0%' : 
                          createStep === 2 ? '20%' : 
                          createStep === 3 ? '40%' : 
                          createStep === 4 ? '60%' : '80%'
                  }}
                ></div>
              </div>
            </div>

            {createStep === 5 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4">
                  <Image 
                    src="/images/ic_check.gif" 
                    alt="완료" 
                    width={64}
                    height={64}
                    className="object-contain" 
                  />
                </div>
                <h3 
                  className="text-[18px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  목표가 생성되었습니다!
                </h3>
                <p 
                  className="text-[14px] text-[#818898]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  새로운 투자 목표를 시작해보세요
                </p>
              </div>
            ) : (
              <>
                {createStep === 1 && (
                  <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 
                className="text-[20px] text-[#2D3541] mb-2"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                        목표 기본 정보
              </h2>
              <p 
                className="text-[14px] text-[#818898]"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                        목표의 제목과 색상을 설정해주세요
              </p>
            </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  목표 제목 <span className="text-[#ED1551]">*</span>
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="예: 금 10g 모으기"
                  className="w-full px-4 py-3 border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                />
              </div>

                    <div>
                      <label 
                        className="block text-[14px] text-[#2D3541] mb-2"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        목표 색상 <span className="text-[#ED1551]">*</span>
                      </label>
                      <div className="flex gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setNewGoal({...newGoal, color: color.value})}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              newGoal.color === color.value 
                                ? 'border-[#333333] scale-110' 
                                : 'border-[#E6E6E6] hover:border-[#03856E]'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-[14px] text-[#2D3541] mb-2"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        설명 (선택사항)
                      </label>
                      <textarea
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                        placeholder="목표에 대한 설명을 입력해주세요"
                        rows={3}
                        className="w-full px-4 py-3 border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent resize-none"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      />
                    </div>
                  </div>
                )}

                {createStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 
                        className="text-[20px] text-[#2D3541] mb-2"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        투자 설정
                      </h2>
                      <p 
                        className="text-[14px] text-[#818898]"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        투자할 자산과 목표 금액을 설정해주세요
                      </p>
              </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  투자 자산 <span className="text-[#ED1551]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {assets.map((asset) => (
                    <button
                      key={asset.key}
                      type="button"
                      onClick={() => setNewGoal({...newGoal, asset: asset.key})}
                      className={`p-3 rounded-[10px] border-2 flex flex-col items-center gap-2 transition-all ${
                        newGoal.asset === asset.key 
                          ? 'border-[#03856E] bg-[#F0F9F7]' 
                          : 'border-[#E6E6E6] hover:border-[#03856E]'
                      }`}
                    >
                      <div className="relative w-8 h-8">
                        <Image 
                          src={asset.icon} 
                          alt={asset.label} 
                          fill 
                          className="object-contain" 
                        />
                      </div>
                      <span 
                        className="text-[12px] text-[#2D3541]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        {asset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  목표 금액 <span className="text-[#ED1551]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                    placeholder="0"
                    className="flex-1 px-4 py-3 border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  />
                  <span 
                    className="text-[14px] text-[#818898] px-3 py-3 bg-[#F2F3F5] rounded-[10px]"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                    {assets.find(a => a.key === newGoal.asset)?.unitLabel || ''}
                  </span>
                </div>
              </div>
                  </div>
                )}

                {createStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 
                        className="text-[20px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                        기간 설정
                      </h2>
                      <p 
                        className="text-[14px] text-[#818898]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        목표 달성 기간을 설정해주세요
                      </p>
              </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                        기간 선택 <span className="text-[#ED1551]">*</span>
                </label>
                      <DatePickerCalendar />
                    </div>
                  </div>
                )}

                {createStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 
                        className="text-[20px] text-[#2D3541] mb-2"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        목표 확인
                      </h2>
                      <p 
                        className="text-[14px] text-[#818898]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        입력하신 정보를 확인해주세요
                      </p>
              </div>

                    <div className="bg-[#F8F9FA] rounded-[10px] p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: newGoal.color }}
                        ></div>
              <div>
                          <h3 
                            className="text-[16px] text-[#2D3541]"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                            {newGoal.title}
                          </h3>
                          {newGoal.description && (
                            <p 
                              className="text-[12px] text-[#818898]"
                              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                            >
                              {newGoal.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[14px] text-[#666666]"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          투자 자산
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6">
                            <Image 
                              src={assets.find(a => a.key === newGoal.asset)?.icon || "/images/ic_market_gold.png"} 
                              alt={newGoal.asset} 
                              fill 
                              className="object-contain" 
                            />
                          </div>
                          <span 
                            className="text-[14px] text-[#2D3541]"
                            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                          >
                            {assets.find(a => a.key === newGoal.asset)?.label}
                          </span>
                </div>
              </div>

                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[14px] text-[#666666]"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          목표 금액
                        </span>
                        <span 
                          className="text-[14px] text-[#2D3541]"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                          {newGoal.targetAmount}{assets.find(a => a.key === newGoal.asset)?.unitLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[14px] text-[#666666]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          기간
                        </span>
                        <span 
                          className="text-[14px] text-[#2D3541]"
                          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                        >
                          {newGoal.startDate.includes('T') ? newGoal.startDate.split('T')[0] : newGoal.startDate} ~ {newGoal.targetDate.includes('T') ? newGoal.targetDate.split('T')[0] : newGoal.targetDate}
                        </span>
              </div>
            </div>
                  </div>
                )}

            <div className="flex gap-3 mt-8">
                  {createStep === 1 ? (
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false)
                        setCreateStep(1)
                        setShowSuccessMessage(false)
                  setNewGoal({
                    title: '',
                    targetAmount: '',
                    startDate: '',
                    targetDate: '',
                    asset: '',
                    description: '',
                    color: '#008D70'
                  })
                        setTempStartDate(null)
                        setTempEndDate(null)
                }}
                className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                취소
              </button>
                  ) : (
              <button
                type="button"
                      onClick={() => setCreateStep(createStep - 1)}
                      className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      이전
                    </button>
                  )}
                  
                  {createStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (createStep === 1 && !newGoal.title.trim()) {
                          alert('목표 제목을 입력해주세요.')
                          return
                        }
                        if (createStep === 2 && (!newGoal.asset || !newGoal.targetAmount)) {
                          alert('투자 자산과 목표 금액을 모두 입력해주세요.')
                          return
                        }
                        if (createStep === 3 && (!newGoal.startDate || !newGoal.targetDate)) {
                          alert('시작 날짜와 종료 날짜를 모두 선택해주세요.')
                          return
                        }
                        setCreateStep(createStep + 1)
                      }}
                      className="flex-1 py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      다음
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCreateStep(5)
                        createGoal()
                      }}
                disabled={isLoading}
                className="flex-1 py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors disabled:opacity-50"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                목표 생성
              </button>
                  )}
            </div>
              </>
            )}
          </div>
        </div>
      )}

      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => {
            if (editStep === 5) return
            
            setShowEditModal(false)
            setEditStep(1)
            setShowEditSuccessMessage(false)
            setEditGoal({
              id: '',
              title: '',
              targetAmount: '',
              startDate: '',
              targetDate: '',
              asset: '',
              description: '',
              color: '#008D70'
            })
            setSelectedGoal(null)
            setTempStartDate(null)
            setTempEndDate(null)
          }}
        >
          <div 
            className="bg-white rounded-[20px] p-4 sm:p-8 w-full max-w-[95vw] sm:w-[500px] mx-2 sm:mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <div className="w-full bg-[#F2F3F5] rounded-full h-2 relative overflow-hidden">
                <div 
                  className="h-2 rounded-full transition-all duration-300 absolute top-0"
                  style={{ 
                    backgroundColor: '#03856E',
                    width: '20%',
                    left: editStep === 1 ? '0%' : 
                          editStep === 2 ? '20%' : 
                          editStep === 3 ? '40%' : 
                          editStep === 4 ? '60%' : '80%'
                  }}
                ></div>
              </div>
            </div>

            {editStep === 5 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4">
                  <Image 
                    src="/images/ic_check.gif" 
                    alt="완료" 
                    width={64}
                    height={64}
                    className="object-contain" 
                  />
                </div>
                <h3 
                  className="text-[18px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  목표가 수정되었습니다!
                </h3>
                <p 
                  className="text-[14px] text-[#818898]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                >
                  수정된 목표로 계속 진행해보세요
                </p>
              </div>
            ) : (
              <>
                {editStep === 1 && (
                  <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 
                className="text-[20px] text-[#2D3541] mb-2"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                        목표 기본 정보
              </h2>
              <p 
                className="text-[14px] text-[#818898]"
                style={{ fontFamily: "Hana2-Regular, sans-serif" }}
              >
                        목표의 제목과 색상을 수정해주세요
              </p>
            </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  목표 제목 <span className="text-[#ED1551]">*</span>
                </label>
                <input
                  type="text"
                        value={editGoal.title}
                        onChange={(e) => setEditGoal({...editGoal, title: e.target.value})}
                  placeholder="예: 금 10g 모으기"
                  className="w-full px-4 py-3 border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                />
              </div>

                    <div>
                      <label 
                        className="block text-[14px] text-[#2D3541] mb-2"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        목표 색상 <span className="text-[#ED1551]">*</span>
                      </label>
                      <div className="flex gap-3">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setEditGoal({...editGoal, color: color.value})}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              editGoal.color === color.value 
                                ? 'border-[#333333] scale-110' 
                                : 'border-[#E6E6E6] hover:border-[#03856E]'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-[14px] text-[#2D3541] mb-2"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        설명 (선택사항)
                      </label>
                      <textarea
                        value={editGoal.description}
                        onChange={(e) => setEditGoal({...editGoal, description: e.target.value})}
                        placeholder="목표에 대한 설명을 입력해주세요"
                        rows={3}
                        className="w-full px-4 py-3 border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent resize-none"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      />
                    </div>
                  </div>
                )}

                {editStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 
                        className="text-[20px] text-[#2D3541] mb-2"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        투자 설정
                      </h2>
                      <p 
                        className="text-[14px] text-[#818898]"
                        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        투자할 자산과 목표 금액을 수정해주세요
                      </p>
              </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  투자 자산 <span className="text-[#ED1551]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {assets.map((asset) => (
                    <button
                      key={asset.key}
                      type="button"
                            onClick={() => setEditGoal({...editGoal, asset: asset.key})}
                      className={`p-3 rounded-[10px] border-2 flex flex-col items-center gap-2 transition-all ${
                              editGoal.asset === asset.key 
                          ? 'border-[#03856E] bg-[#F0F9F7]' 
                          : 'border-[#E6E6E6] hover:border-[#03856E]'
                      }`}
                    >
                      <div className="relative w-8 h-8">
                        <Image 
                          src={asset.icon} 
                          alt={asset.label} 
                          fill 
                          className="object-contain" 
                        />
                      </div>
                      <span 
                        className="text-[12px] text-[#2D3541]"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        {asset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                  목표 금액 <span className="text-[#ED1551]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                          value={editGoal.targetAmount}
                          onChange={(e) => setEditGoal({...editGoal, targetAmount: e.target.value})}
                    placeholder="0"
                    className="flex-1 px-4 py-3 border border-[#E6E6E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#03856E] focus:border-transparent"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  />
                  <span 
                    className="text-[14px] text-[#818898] px-3 py-3 bg-[#F2F3F5] rounded-[10px]"
                    style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                  >
                          {assets.find(a => a.key === editGoal.asset)?.unitLabel || ''}
                  </span>
                </div>
              </div>
                  </div>
                )}

                {editStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 
                        className="text-[20px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                        기간 설정
                      </h2>
                      <p 
                        className="text-[14px] text-[#818898]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        목표 달성 기간을 수정해주세요
                      </p>
              </div>

              <div>
                <label 
                  className="block text-[14px] text-[#2D3541] mb-2"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                        기간 선택 <span className="text-[#ED1551]">*</span>
                </label>
                      <DatePickerCalendar />
                    </div>
                  </div>
                )}

                {editStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 
                        className="text-[20px] text-[#2D3541] mb-2"
                        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                      >
                        목표 확인
                      </h2>
                      <p 
                        className="text-[14px] text-[#818898]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                      >
                        수정하신 정보를 확인해주세요
                      </p>
              </div>

                    <div className="bg-[#F8F9FA] rounded-[10px] p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: editGoal.color }}
                        ></div>
              <div>
                          <h3 
                            className="text-[16px] text-[#2D3541]"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                            {editGoal.title}
                          </h3>
                          {editGoal.description && (
                            <p 
                              className="text-[12px] text-[#818898]"
                              style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                            >
                              {editGoal.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[14px] text-[#666666]"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          투자 자산
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6">
                            <Image 
                              src={assets.find(a => a.key === editGoal.asset)?.icon || "/images/ic_market_gold.png"} 
                              alt={editGoal.asset} 
                              fill 
                              className="object-contain" 
                            />
                          </div>
                          <span 
                            className="text-[14px] text-[#2D3541]"
                            style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                          >
                            {assets.find(a => a.key === editGoal.asset)?.label}
                          </span>
                </div>
              </div>

                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[14px] text-[#666666]"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          목표 금액
                        </span>
                        <span 
                          className="text-[14px] text-[#2D3541]"
                  style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                >
                          {editGoal.targetAmount}{assets.find(a => a.key === editGoal.asset)?.unitLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[14px] text-[#666666]"
                  style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          기간
                        </span>
                        <span 
                          className="text-[14px] text-[#2D3541]"
                          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                        >
                          {editGoal.startDate.includes('T') ? editGoal.startDate.split('T')[0] : editGoal.startDate} ~ {editGoal.targetDate.includes('T') ? editGoal.targetDate.split('T')[0] : editGoal.targetDate}
                        </span>
              </div>
            </div>
                  </div>
                )}

            <div className="flex gap-3 mt-8">
                  {editStep === 1 ? (
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                        setEditStep(1)
                        setShowEditSuccessMessage(false)
                        setEditGoal({
                          id: '',
                    title: '',
                    targetAmount: '',
                    startDate: '',
                    targetDate: '',
                    asset: '',
                    description: '',
                    color: '#008D70'
                  })
                        setSelectedGoal(null)
                        setTempStartDate(null)
                        setTempEndDate(null)
                }}
                className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                취소
              </button>
                  ) : (
              <button
                type="button"
                      onClick={() => setEditStep(editStep - 1)}
                      className="flex-1 py-3 rounded-[10px] border border-[#E6E6E6] text-[#666666] hover:bg-[#F8F9FA] transition-colors"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      이전
                    </button>
                  )}
                  
                  {editStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (editStep === 1 && !editGoal.title.trim()) {
                          alert('목표 제목을 입력해주세요.')
                          return
                        }
                        if (editStep === 2 && (!editGoal.asset || !editGoal.targetAmount)) {
                          alert('투자 자산과 목표 금액을 모두 입력해주세요.')
                          return
                        }
                        if (editStep === 3 && (!editGoal.startDate || !editGoal.targetDate)) {
                          alert('시작 날짜와 종료 날짜를 모두 선택해주세요.')
                          return
                        }
                        setEditStep(editStep + 1)
                      }}
                      className="flex-1 py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors"
                      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                    >
                      다음
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditStep(5)
                        updateGoal()
                      }}
                disabled={isLoading}
                className="flex-1 py-3 rounded-[10px] bg-[#03856E] text-white hover:bg-[#026B5A] transition-colors disabled:opacity-50"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                목표 수정
              </button>
                  )}
            </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDateModal && selectedDate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => {
            setShowDateModal(false)
            setSelectedDate(null)
          }}
        >
          <div 
            className="w-full max-w-[95vw] sm:w-[400px] mx-2 sm:mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-left mb-4">
              <h2 
                className="text-[16px] text-[#F5F5F5]"
                style={{ fontFamily: "Hana2-Medium, sans-serif" }}
              >
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 {getDayName(selectedDate.getDay())}요일
              </h2>
            </div>
            
            <div className="bg-white rounded-[20px] p-6">

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {getGoalsForDate(selectedDate).length > 0 ? (
                getGoalsForDate(selectedDate).map((goal) => {
                  const assetInfo = assets.find(a => a.key === goal.asset)
                  return (
                    <div
                      key={goal.id}
                      className="flex items-center gap-3 p-3 bg-[#FFFFFF] rounded-[10px] cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                      onClick={() => {
                        setShowDateModal(false)
                        setSelectedDate(null)
                        openEditModal(goal)
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-[4px]"
                        style={{ backgroundColor: goal.color || '#03856E' }}
                      ></div>
                      <div className="flex-1">
                        <span 
                          className="text-[14px] text-[#2D3541]"
                          style={{ fontFamily: "Hana2-Medium, sans-serif" }}
                        >
                          {goal.title}
                        </span>
                        <p 
                          className="text-[12px] text-[#818898]"
                          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                        >
                          목표: {goal.targetAmount}{assetInfo?.unitLabel}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <p 
                    className="text-[14px] text-[#818898]"
                    style={{ fontFamily: "Hana2-Regular, sans-serif" }}
                  >
                    이 날짜에는 진행 중인 목표가 없습니다.
                  </p>
                </div>
              )}
            </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowDateModal(false)
                    setNewGoal({
                      title: '',
                      targetAmount: '',
                      startDate: selectedDate ? formatDate(selectedDate) : '',
                      targetDate: '',
                      asset: '',
                      description: '',
                      color: '#008D70'
                    })
                    setCreateStep(1)
                    setShowSuccessMessage(false)
                    setShowCreateModal(true)
                  }}
                  className="w-8 h-8 rounded-full bg-[#005044] text-white hover:bg-[#026B5A] transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
