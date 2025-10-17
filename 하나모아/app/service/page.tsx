"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"
import StepIndicator from "../../components/service/StepIndicator"
import AssetSelectionStep from "../../components/service/AssetSelectionStep"
import BranchSelectionStep from "../../components/service/BranchSelectionStep"
import DateTimeSelectionStep from "../../components/service/DateTimeSelectionStep"
import ConfirmationStep from "../../components/service/ConfirmationStep"
import PaymentStep from "../../components/service/PaymentStep"
import ErrorModal from "../../components/service/ErrorModal"
import ConfirmModal from "../../components/service/ConfirmModal"

declare global {
  interface Window {
    kakao: any
  }
}

interface Asset {
  id: string
  type: 'gold' | 'silver' | 'forex'
  amount: number
  unit: string
  name: string
  currentPrice: number
  totalValue: number
}

interface BankBranch {
  id: string
  name: string
  address: string
  distance: number
  phone: string
  operatingHours: string
  isAvailable: boolean
  lat?: number
  lng?: number
}

export default function ServicePage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth()
  const mapRef = useRef<HTMLDivElement>(null)
  const [userAssets, setUserAssets] = useState<Asset[]>([])
  const [branches, setBranches] = useState<BankBranch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [selectedBranchInfo, setSelectedBranchInfo] = useState<BankBranch | null>(null)
  const [sortedBranches, setSortedBranches] = useState<BankBranch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [reservationNumber, setReservationNumber] = useState<string>("")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [branchMarkers, setBranchMarkers] = useState<any[]>([])
  const [currentInfoWindow, setCurrentInfoWindow] = useState<any>(null)
  const mapClickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null) 
  const [selectedAssetUnit, setSelectedAssetUnit] = useState<string | null>(null) 
  const [selectedAmount, setSelectedAmount] = useState<number>(0) 
  const [selectedAmountInput, setSelectedAmountInput] = useState<string>("") 

  const [currentPrice, setCurrentPrice] = useState<number>(0) 
  const [serviceFee, setServiceFee] = useState<number>(0) 
  const [paymentMethod, setPaymentMethod] = useState<'account' | 'point' | null>(null)
  const [accountBalance, setAccountBalance] = useState<number>(0)
  const [pointBalance, setPointBalance] = useState<number>(0)
  const [isPaying, setIsPaying] = useState(false) 
  const [accountNumber, setAccountNumber] = useState<string>('')
  const [pointCreatedAt, setPointCreatedAt] = useState<string>('')
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)

  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  useEffect(() => {
    const fetchUserAssets = async () => {
      try {
        if (!userInfo) {
          return
        }
        
        const response = await fetch(`/api/holdings/user?userId=${userInfo.id}`)
        const result = await response.json()
        
        if (result.success) {
          const assets: Asset[] = []
          const holdings = result.holdings || result.data || []
          
          if (Array.isArray(holdings)) {
            holdings.forEach((holding: any) => {
              if (holding.quantity > 0) {
                let assetType: 'gold' | 'silver' | 'forex' = 'gold'
                let unit = holding.unit || holding.asset
                let name = holding.name || holding.asset
                
                if (holding.asset && holding.asset.toLowerCase().includes('silver')) {
                  assetType = 'silver'
                } else if (holding.asset && (holding.asset.toLowerCase().includes('usd') || 
                          holding.asset.toLowerCase().includes('eur') || 
                          holding.asset.toLowerCase().includes('jpy') || 
                          holding.asset.toLowerCase().includes('cny'))) {
                  assetType = 'forex'
                }
                
                if (assetType === 'gold' || assetType === 'silver') {
                  const unitMap: {[key: string]: string} = {
                    '1000': '1kg',
                    '100': '100g', 
                    '37.5': '37.5g',
                    '5': '5g',
                    '3.75': '3.75g',
                    '1': '1g'
                  }

                  if (unitMap[unit]) {
                    unit = unitMap[unit]
                  } else {
                    const numericUnit = parseFloat(unit)
                    if (!isNaN(numericUnit)) {
                      if (numericUnit >= 1000) {
                        unit = `${numericUnit / 1000}kg`
                      } else {
                        unit = `${numericUnit}g`
                      }
                    } else {
                      if (unit.toLowerCase().includes('goldg')) {
                        unit = '1g'
                      } else if (unit.toLowerCase().includes('silverg')) {
                        unit = '1g'
                      } else {
                        unit = `${unit}g`
                      }
                    }
                  }
                  name = `${assetType === 'gold' ? '골드바' : '실버바'} ${unit}`
                } else if (assetType === 'forex') {
                  name = `${unit} 외환`
                }
                
                assets.push({
                  id: `${assetType}_${holding.asset || unit}`,
                  type: assetType,
                  amount: holding.quantity,
                  unit: unit,
                  name: name,
                  currentPrice: 0,
                  totalValue: 0
                })
              }
            })
          }
          setUserAssets(assets)
        } else {
          setUserAssets([])
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAssets()
  }, [userInfo])

  const searchBranchesInArea = async (lat: number, lng: number, level: number) => {
    try {
      const radiusMap: {[key: number]: number} = {
        1: 50000, 
        2: 30000,  
        3: 20000,  
        4: 15000, 
        5: 10000,  
        6: 8000,   
        7: 5000,    
        8: 3000,  
        9: 2000,   
        10: 1000   
      }
      
      const radius = radiusMap[level] || 5000
      const size = level <= 5 ? 30 : 15

      const response = await fetch('/api/kakao/search-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: '하나은행',
          x: lng,
          y: lat,
          radius: radius,
          size: size
        })
      })

      const result = await response.json()
      
        if (result.success && result.documents) {
          const branches: BankBranch[] = result.documents
            .filter((place: any) => {
              const placeName = (place.place_name || place.name || '').toLowerCase()
              return !placeName.includes('atm') && !placeName.includes('주차장')
            })
            .map((place: any, index: number) => ({
              id: place.id || `branch_${Date.now()}_${index}`, 
              name: place.place_name || place.name,
              address: place.address_name || place.road_address_name,
              distance: place.distance ? Math.round(place.distance / 1000 * 10) / 10 : 0,
              phone: place.phone || '전화번호 없음',
              operatingHours: '평일 09:00-16:00',
              isAvailable: true,
              lat: parseFloat(place.y),
              lng: parseFloat(place.x)
            }))
        
        const selectedBranchExists = selectedBranch && branches.some(branch => branch.id === selectedBranch)

        if (selectedBranch && !selectedBranchExists) {
          setSelectedBranch("")
          setSelectedBranchInfo(null)
        }
        
        setBranches(branches)
      }
      } catch (error) {
    }
  }

  useEffect(() => {
    if (userLocation) {
      searchBranchesInArea(userLocation.lat, userLocation.lng, 8)
    }
  }, [userLocation])

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
    } finally {
      setIsLoadingRequests(false)
    }
  }

  useEffect(() => {
    if (userInfo) {
      fetchAllNotifications()
      fetchAccountBalance()
      fetchPointBalance()
    }
  }, [userInfo])
  
  const fetchAccountBalance = async () => {
    try {
      if (!userInfo) return
      
      if (userInfo.accounts && userInfo.accounts.length > 0) {
        setAccountBalance(userInfo.accounts[0].balance || 0)
        setAccountNumber(userInfo.accounts[0].accountNumber || '')
      }
    } catch (error) {
    }
  }

  const fetchPointBalance = async () => {
    try {
      if (!userInfo) return
      
      const response = await fetch(`/api/points/balance?userId=${userInfo.id}`)
      const result = await response.json()
      
      if (result.success) {
        setPointBalance(result.balance || 0)
        if (result.createdAt) {
          const date = new Date(result.createdAt)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          setPointCreatedAt(`${year}/${month}/${day}`)
        }
      }
    } catch (error) {
    }
  }
  
  const fetchCurrentPrice = async () => {
    if (!selectedAssetType) return
    
    try {
      let asset = selectedAssetType
      if (['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType)) {
        asset = selectedAssetType
      }
      
      const response = await fetch(`/api/market/${asset}`)
      const result = await response.json()
      
      let price = 0
      if (asset === 'gold') {
        price = result.currentPrice || 0
      } else if (asset === 'silver') {
        price = result.depositPrice || 0
      } else {
        price = result.currentPrice || 0
      }
      
      setCurrentPrice(price)
      
      let quantity = 0
      let feeRate = 0
      
      if (['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType)) {
        quantity = selectedAmount
        feeRate = 0.0175
      } else if (selectedAssetUnit) {
        const match = selectedAssetUnit.match(/^(\d+(?:\.\d+)?)(kg|g)$/)
        if (match) {
          const value = parseFloat(match[1])
          const unit = match[2]
          quantity = unit === 'kg' ? value * 1000 : value
        }
        feeRate = 0.1 
      }
      
      const fee = Math.floor(price * quantity * feeRate)
      setServiceFee(fee)
      
    } catch (error) {
    }
  }
  
  useEffect(() => {
    if (currentStep === 4) {
      fetchCurrentPrice()
    }
  }, [currentStep, selectedAssetType, selectedAssetUnit, selectedAmount])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    loadKakaoMap()
    getUserLocation()
  }, [])

  useEffect(() => {
    if (mapLoaded && userLocation && currentStep === 2) {
      const timer = setTimeout(() => {
        initMap()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [mapLoaded, userLocation, currentStep, isMobile])

  const createBranchMarkers = (branches: BankBranch[], map: any) => {
    if (!map || !window.kakao || !window.kakao.maps) return

    branchMarkers.forEach(marker => marker.setMap(null))
    setBranchMarkers([])

    const newMarkers: any[] = []

    branches.forEach((branch, index) => {
      const branchPosition = new window.kakao.maps.LatLng(
        branch.lat || (userLocation ? userLocation.lat + (Math.random() - 0.5) * 0.1 : 37.5665),
        branch.lng || (userLocation ? userLocation.lng + (Math.random() - 0.5) * 0.1 : 126.9780)
      )

      const isSelected = selectedBranch === branch.id

      const marker = new window.kakao.maps.Marker({
        position: branchPosition,
        map: map,
        title: branch.name,
        image: new window.kakao.maps.MarkerImage(
          isSelected ? '/images/ic_hana_mark_clicked.svg' : '/images/ic_hana_mark_unclicked.svg',
          new window.kakao.maps.Size(32, 40),
          { offset: new window.kakao.maps.Point(16, 40) }
        )
      })

      ;(marker as any).branchId = branch.id
      ;(marker as any).isSelected = isSelected

      window.kakao.maps.event.addListener(marker, 'click', () => {
        if (mapClickTimeoutRef.current) {
          clearTimeout(mapClickTimeoutRef.current)
          mapClickTimeoutRef.current = null
        }

        newMarkers.forEach(m => {
          if ((m as any).isSelected) {
            m.setImage(new window.kakao.maps.MarkerImage(
              '/images/ic_hana_mark_unclicked.svg',
              new window.kakao.maps.Size(32, 40),
              { offset: new window.kakao.maps.Point(16, 40) }
            ))
            ;(m as any).isSelected = false
          }
        })

        marker.setImage(new window.kakao.maps.MarkerImage(
          '/images/ic_hana_mark_clicked.svg',
          new window.kakao.maps.Size(32, 40),
          { offset: new window.kakao.maps.Point(16, 40) }
        ))
        ;(marker as any).isSelected = true

        setSelectedBranch(branch.id)
        setSelectedBranchInfo(branch)
      })

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:10px; min-width:260px; min-height:90px;">
            <div style="font-weight:bold; margin-bottom:5px; font-size:14px;">${branch.name}</div>
            <div style="font-size:12px; color:#666; margin-bottom:4px; line-height:1.4;">${branch.address}</div>
            <div style="font-size:12px; color:#666; line-height:1.4;">${branch.phone}</div>
          </div>
        `
      })

      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        if (currentInfoWindow) {
          currentInfoWindow.close()
        }
        
        infoWindow.open(map, marker)
        setCurrentInfoWindow(infoWindow)
      })

      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        infoWindow.close()
        if (currentInfoWindow === infoWindow) {
          setCurrentInfoWindow(null)
        }
      })

      newMarkers.push(marker)
    })

    setBranchMarkers(newMarkers)
  }

  useEffect(() => {
    if (mapInstance && currentStep === 2 && branches.length > 0) {
      createBranchMarkers(branches, mapInstance)
    }
  }, [branches, mapInstance, currentStep, selectedBranch])

  useEffect(() => {
    if (selectedBranch) {
      const selected = branches.find(branch => branch.id === selectedBranch)
      const others = branches.filter(branch => branch.id !== selectedBranch)
      setSortedBranches(selected ? [selected, ...others] : branches)
    } else {
      setSortedBranches(branches)
    }
  }, [branches, selectedBranch])

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline'): Promise<void> => {
    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.')
    
    const response = await fetch(`/api/friends/request/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        userId: userInfo.id
      })
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || '친구 신청 처리에 실패했습니다.')
    }
    
    fetchAllNotifications()
  }

  const handleGiftRequest = async (giftId: string, action: 'accept' | 'decline' | 'detail'): Promise<void> => {
    if (action === 'detail') {
      return
    }
    
    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.')
    
    const response = await fetch(`/api/gifts/${giftId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        userId: userInfo.id
      })
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
    }
  }



  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorModal(true)
  }

  const changeStepWithAnimation = (newStep: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep(newStep)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }, 300)
  }

  const fetchAvailableTimes = async (branchId: string, date: Date) => {
    if (!branchId || !date) return

    setIsLoadingTimes(true)
    try {
      const response = await fetch('/api/service/available-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branchId: branchId,
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` 
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setAvailableTimes(result.data.availableTimes)
        setBookedTimes(result.data.bookedTimes)
      } else {
        setAvailableTimes([])
        setBookedTimes([])
      }
    } catch (error) {
      setAvailableTimes([])
      setBookedTimes([])
    } finally {
      setIsLoadingTimes(false)
    }
  }



  const handleStep1Complete = () => {
    if (!selectedAssetType) {
      showError('자산 유형을 선택해주세요.')
      return
  }

    if (['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType)) {
      if (selectedAmount <= 0) {
        showError('수령할 금액을 입력해주세요.')
        return
      }
      
      const forexAsset = userAssets.find(asset => 
        asset.type === 'forex' && asset.unit.toLowerCase().includes(selectedAssetType)
      )
      
      if (!forexAsset || forexAsset.amount < selectedAmount) {
        showError('보유 자산이 부족합니다.')
        return
      }
    } else {
      if (!selectedAssetUnit) {
        showError('자산 단위를 선택해주세요.')
        return
      }
      
      const asset = userAssets.find(a => {
        if (a.type !== selectedAssetType) return false
        
        let assetUnit = a.unit
        if (assetUnit.toLowerCase().includes('goldg')) {
          assetUnit = `${a.amount}g`
        } else if (assetUnit.toLowerCase().includes('silverg')) {
          assetUnit = `${a.amount}g`
        }
        
        const assetUnitMatch = assetUnit.match(/^(\d+(?:\.\d+)?)(.*)$/)
        const selectedUnitMatch = selectedAssetUnit.match(/^(\d+(?:\.\d+)?)(.*)$/)
        
        if (assetUnitMatch && selectedUnitMatch) {
          const assetUnitType = assetUnitMatch[2] 
          const selectedUnitType = selectedUnitMatch[2] 

          if (assetUnitType === selectedUnitType) {
            const selectedAmount = parseFloat(selectedUnitMatch[1])
            return a.amount >= selectedAmount
          }
        }

        return assetUnit === selectedAssetUnit
      })

      userAssets.filter(a => a.type === selectedAssetType).forEach((a, index) => {
      })
      
      if (!asset || asset.amount < 1) {
        showError('보유 자산이 부족합니다.')
        return
      }
    }
    
    changeStepWithAnimation(2) 
  }

  const handleStep2Complete = () => {
    if (!selectedBranch) {
      showError('수령 지점을 선택해주세요.')
      return
    }
    changeStepWithAnimation(3)
  }

  const handleStep3Complete = () => {
    if (!selectedDate) {
      showError('수령 날짜를 선택해주세요.')
      return
    }
    if (!selectedTime) {
      showError('수령 시간을 선택해주세요.')
      return
    }
    changeStepWithAnimation(4)
  }
  
  const handleStep4Complete = () => {
    changeStepWithAnimation(5)
  }

  const handleGoBack = () => {
    if (currentStep > 1) {
      changeStepWithAnimation(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      changeStepWithAnimation(step)
    }

    else if (step === currentStep + 1) {
      if (step === 2 && selectedAssetType && (['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType) ? selectedAmount > 0 : selectedAssetUnit)) {
        changeStepWithAnimation(step)
      } else if (step === 3 && selectedBranch) {
        changeStepWithAnimation(step)
      } else if (step === 4 && selectedDate && selectedTime) {
        changeStepWithAnimation(step)
      } else if (step === 5) {
        changeStepWithAnimation(step)
      }
    }
  }

  const handleSubmit = async () => {
    if (!selectedBranch || !selectedAssetType) {
      showError('수령할 자산과 지점을 선택해주세요.')
      return
    }
    
    changeStepWithAnimation(5)
  }
  
  const handlePayFee = async () => {
    if (!paymentMethod) {
      showError('결제 방법을 선택해주세요.')
      return
    }
    
    if (paymentMethod === 'account' && accountBalance < serviceFee) {
      showError('계좌 잔액이 부족합니다.')
      return
    }
    
    if (paymentMethod === 'point' && pointBalance < serviceFee) {
      showError('하나머니 잔액이 부족합니다.')
      return
    }
    
    setIsPaying(true)
    try {
      if (!userInfo) {
        showError('사용자 정보를 찾을 수 없습니다.')
        return
      }
      
      const assetInfo = {
        type: selectedAssetType,
        unit: ['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType || '') ? 'amount' : selectedAssetUnit,
        amount: ['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType || '') ? selectedAmount : 1
      }
      
      const reservationResponse = await fetch('/api/service/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id,
          branchId: selectedBranch,
          branchName: selectedBranchInfo?.name || '',
          branchAddress: selectedBranchInfo?.address || '',
          branchPhone: selectedBranchInfo?.phone || '',
          asset: assetInfo,
          requestDate: new Date().toISOString(),
          reservationDate: selectedDate?.toISOString(),
          reservationTime: selectedTime
        })
      })
      
      const reservationResult = await reservationResponse.json()
      
      if (!reservationResult.success) {
        showError(`예약 실패: ${reservationResult.error}`)
        return
      }
      
      const reservationNum = reservationResult.data.reservationNumber
      setReservationNumber(reservationNum)
      
      const paymentResponse = await fetch('/api/service/pay-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id,
          paymentMethod: paymentMethod,
          fee: serviceFee,
          serviceRequestId: reservationNum
        })
      })
      
      const paymentResult = await paymentResponse.json()
      
      if (paymentResult.success) {
        setShowConfirmModal(true)
      } else {
        showError(`결제 실패: ${paymentResult.error}`)
      }
    } catch (error) {
      showError('수수료 결제 중 오류가 발생했습니다.')
    } finally {
      setIsPaying(false)
    }
  }


  const loadKakaoMap = () => {
    if (window.kakao && window.kakao.maps) {
      setMapLoaded(true)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
    if (!apiKey || apiKey === 'YOUR_KAKAO_API_KEY') {
      setMapLoaded(true)
      return
    }

    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setMapLoaded(true)
        })
      } else {
        setMapLoaded(true)
      }
    }
    
    script.onerror = () => {
      setMapLoaded(true)
    }
    
    document.head.appendChild(script)
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          setUserLocation({
            lat: 37.5665,
            lng: 126.9780
          })
        }
      )
    } else {
      setUserLocation({
        lat: 37.5665,
        lng: 126.9780
      })
    }
  }

  const initMap = () => {
    if (!mapLoaded || !userLocation || !mapRef.current) {
      return
    }

    if (!window.kakao || !window.kakao.maps) {
      return
    }

    try {
      const container = mapRef.current
      const options = {
        center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
        level: isMobile ? 6 : 8 
      }

      const map = new window.kakao.maps.Map(container, options)
      setMapInstance(map) 

      window.kakao.maps.event.addListener(map, 'dragend', () => {
        const center = map.getCenter()
        searchBranchesInArea(center.getLat(), center.getLng(), map.getLevel())
      })

      window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
        const center = map.getCenter()
        searchBranchesInArea(center.getLat(), center.getLng(), map.getLevel())
      })

      window.kakao.maps.event.addListener(map, 'click', () => {
        if (mapClickTimeoutRef.current) {
          clearTimeout(mapClickTimeoutRef.current)
        }
        
        mapClickTimeoutRef.current = setTimeout(() => {
          branchMarkers.forEach(marker => {
            if ((marker as any).isSelected) {
              marker.setImage(new window.kakao.maps.MarkerImage(
                '/images/ic_hana_mark_unclicked.svg',
                new window.kakao.maps.Size(32, 40),
                { offset: new window.kakao.maps.Point(16, 40) }
              ))
              ;(marker as any).isSelected = false
            }
          })
          
          if (currentInfoWindow) {
            currentInfoWindow.close()
            setCurrentInfoWindow(null)
          }
          
          setSelectedBranch("")
          setSelectedBranchInfo(null)
        }, 100) 
      })

    const userMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      map: map,
      image: new window.kakao.maps.MarkerImage(
        'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#005044" opacity="0.9"/>
          </svg>
        `),
          new window.kakao.maps.Size(16, 16),
          { offset: new window.kakao.maps.Point(8, 8) }
      )
    })
   
    } catch (error) {
    }
  }


  if (isLoading) {
    return (
      <div className="w-full bg-[#F5FBFA] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#03856E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[14px] text-[#666]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
            자산 정보를 불러오는 중...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#F5FBFA] min-h-screen">
      <style jsx>{`
        .rotate-y-90 {
          transform: rotateY(90deg);
        }
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
        @keyframes slideToTop {
          0% {
            transform: translateY(20px);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
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

      <div className="w-full h-[350px] bg-gradient-to-r from-[#03856E] to-[#005044]">
        <div className="max-w-[1335px] h-full mx-auto px-4 flex flex-col justify-center">
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-60 pb-8">

        {currentStep === 1 && (
          <div className={`bg-white rounded-[20px] shadow-lg p-4 sm:p-6 mb-6 transition-all duration-300 min-h-[600px] ${
            isTransitioning ? 'transform rotate-y-90 opacity-0' : 'transform rotate-y-0 opacity-100'
          }`}>
            <div className={`flex ${isMobile ? 'flex-col' : 'gap-12'} h-full`}>
              <StepIndicator
                currentStep={currentStep}
                selectedAssetType={selectedAssetType}
                selectedAmount={selectedAmount}
                selectedAssetUnit={selectedAssetUnit}
                selectedBranch={selectedBranch}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                isMobile={isMobile}
                onStepClick={handleStepClick}
              />
              <AssetSelectionStep
                userAssets={userAssets}
                selectedAssetType={selectedAssetType}
                selectedAssetUnit={selectedAssetUnit}
                selectedAmount={selectedAmount}
                selectedAmountInput={selectedAmountInput}
                isMobile={isMobile}
                onAssetTypeSelect={setSelectedAssetType}
                onAssetUnitSelect={setSelectedAssetUnit}
                onAmountChange={setSelectedAmount}
                onAmountInputChange={setSelectedAmountInput}
                onComplete={handleStep1Complete}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={`bg-white rounded-[20px] shadow-lg p-4 sm:p-6 mb-6 transition-all duration-300 min-h-[600px] ${
            isTransitioning ? 'transform rotate-y-90 opacity-0' : 'transform rotate-y-0 opacity-100'
          }`}>
            <div className={`flex ${isMobile ? 'flex-col' : 'gap-12'}`}>
              <StepIndicator
                currentStep={currentStep}
                selectedAssetType={selectedAssetType}
                selectedAmount={selectedAmount}
                selectedAssetUnit={selectedAssetUnit}
                selectedBranch={selectedBranch}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                isMobile={isMobile}
                onStepClick={handleStepClick}
              />
              <BranchSelectionStep
                branches={sortedBranches}
                selectedBranch={selectedBranch}
                selectedBranchInfo={selectedBranchInfo}
                mapRef={mapRef}
                mapLoaded={mapLoaded}
                userLocation={userLocation}
                isMobile={isMobile}
                onComplete={handleStep2Complete}
                onBranchSelect={(branchId, branchInfo) => {
                  setSelectedBranch(branchId)
                  setSelectedBranchInfo(branchInfo)
                }}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={`bg-white rounded-[20px] shadow-lg p-4 sm:p-6 mb-6 transition-all duration-300 min-h-[600px] ${
            isTransitioning ? 'transform rotate-y-90 opacity-0' : 'transform rotate-y-0 opacity-100'
          }`}>
            <div className={`flex ${isMobile ? 'flex-col' : 'gap-12'}`}>
              <StepIndicator
                currentStep={currentStep}
                selectedAssetType={selectedAssetType}
                selectedAmount={selectedAmount}
                selectedAssetUnit={selectedAssetUnit}
                selectedBranch={selectedBranch}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                isMobile={isMobile}
                onStepClick={handleStepClick}
              />
              <DateTimeSelectionStep
                selectedAssetType={selectedAssetType}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                availableTimes={availableTimes}
                bookedTimes={bookedTimes}
                isLoadingTimes={isLoadingTimes}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
                onComplete={handleStep3Complete}
                selectedBranch={selectedBranch}
                fetchAvailableTimes={fetchAvailableTimes}
              />
                        </div>
                      </div>
        )}

        {currentStep === 4 && (
          <div className={`bg-white rounded-[20px] shadow-lg p-4 sm:p-6 mb-6 transition-all duration-300 min-h-[600px] ${
            isTransitioning ? 'transform rotate-y-90 opacity-0' : 'transform rotate-y-0 opacity-100'
          }`}>
            <div className={`flex ${isMobile ? 'flex-col' : 'gap-12'}`}>
              <StepIndicator
                currentStep={currentStep}
                selectedAssetType={selectedAssetType}
                selectedAmount={selectedAmount}
                selectedAssetUnit={selectedAssetUnit}
                selectedBranch={selectedBranch}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                isMobile={isMobile}
                onStepClick={handleStepClick}
              />
              <ConfirmationStep
                selectedAssetType={selectedAssetType}
                selectedAssetUnit={selectedAssetUnit}
                selectedAmount={selectedAmount}
                selectedBranchInfo={selectedBranchInfo}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        )}
        
        {currentStep === 5 && (
          <div className={`bg-white rounded-[20px] shadow-lg p-4 sm:p-6 mb-6 transition-all duration-300 min-h-[600px] ${
            isTransitioning ? 'transform rotate-y-90 opacity-0' : 'transform rotate-y-0 opacity-100'
          }`}>
            <div className={`flex ${isMobile ? 'flex-col' : 'gap-12'}`}>
              <StepIndicator
                currentStep={currentStep}
                selectedAssetType={selectedAssetType}
                selectedAmount={selectedAmount}
                selectedAssetUnit={selectedAssetUnit}
                selectedBranch={selectedBranch}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                isMobile={isMobile}
                onStepClick={handleStepClick}
              />
              <PaymentStep
                currentPrice={currentPrice}
                serviceFee={serviceFee}
                selectedAssetType={selectedAssetType}
                paymentMethod={paymentMethod}
                accountBalance={accountBalance}
                accountNumber={accountNumber}
                pointBalance={pointBalance}
                pointCreatedAt={pointCreatedAt}
                isPaying={isPaying}
                onPaymentMethodSelect={setPaymentMethod}
                onPayFee={handlePayFee}
              />
                    </div>
                  </div>
                )}
              </div>

      <ErrorModal
        isOpen={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        reservationNumber={reservationNumber}
        onClose={() => {
                  setShowConfirmModal(false)
                  router.push('/reservations')
                }}
      />
    </div>
  )
}
