"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import LoadingOverlay from "../../components/LoadingOverlay"
import NavigationBar from "../../components/NavigationBar"
import { useAuth } from "../../hooks/use-auth"
import ProfileSection from "../../components/mypage/ProfileSection"
import AssetChart from "../../components/mypage/AssetChart"
import SettingsSection from "../../components/mypage/SettingsSection"
import BannerSection from "../../components/mypage/BannerSection"
import ProfileModal from "../../components/mypage/ProfileModal"
import TransactionModal from "../../components/mypage/TransactionModal"
import HanaPointModal from "../../components/mypage/HanaPointModal"
import HanaPointTransferModal from "../../components/mypage/HanaPointTransferModal"
import PasswordModal from "../../components/mypage/PasswordModal"
import AlertModal from "../../components/mypage/AlertModal"

export default function MyPage() {
  const router = useRouter()
  const { user: userInfo, isAuthenticated, isCheckingAuth, setUser: setUserInfo } = useAuth()
  const [selectedProfile, setSelectedProfile] = useState<string>("fox") 
  const [isSaving, setIsSaving] = useState(false)
  const [isPublicProfile, setIsPublicProfile] = useState(false) 
  const [isPostsPublic, setIsPostsPublic] = useState(false) 
  const [notificationsEnabled, setNotificationsEnabled] = useState(true) 
  const [showProfileModal, setShowProfileModal] = useState(false)

  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [giftRequests, setGiftRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  const [holdings, setHoldings] = useState<any[]>([])
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(false)

  const [hanaPointInfo, setHanaPointInfo] = useState<any>(null)
  const [isLoadingHanaPoint, setIsLoadingHanaPoint] = useState(false)

  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  const [showHanaPointModal, setShowHanaPointModal] = useState(false)
  const [hanaPointHistory, setHanaPointHistory] = useState<any[]>([])
  const [isLoadingHanaPointHistory, setIsLoadingHanaPointHistory] = useState(false)

  const [showHanaPointTransferModal, setShowHanaPointTransferModal] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferValidation, setTransferValidation] = useState({
    isValid: false,
    message: ''
  })


  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordValidation, setPasswordValidation] = useState({
    currentPasswordValid: false,
    newPasswordValid: false,
    confirmPasswordValid: false,
    currentPasswordMessage: '',
    newPasswordMessage: '',
    confirmPasswordMessage: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const [showPasswordErrorModal, setShowPasswordErrorModal] = useState(false)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')

  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info')

  useEffect(() => {
    if (userInfo) {
      setSelectedProfile(userInfo.profileImage || "fox")
      setIsPublicProfile(userInfo.isPublicProfile || false)
      setIsPostsPublic(userInfo.isPostsPublic || false)
      setNotificationsEnabled(userInfo.notificationsEnabled !== undefined ? userInfo.notificationsEnabled : true)
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
    await fetchHoldings()
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

  const fetchHoldings = async () => {
    if (!userInfo) return
    
    setIsLoadingHoldings(true)
    
    try {
      const response = await fetch(`/api/holdings?userId=${userInfo.id}`)
      const result = await response.json()
            
      if (result.success) {
        setHoldings(result.holdings || [])
      } else {
        setHoldings([])
      }
    } catch (error) {
      setHoldings([])
    } finally {
      setIsLoadingHoldings(false)
    }
  }

  const fetchHanaPointBalance = async () => {
    if (!userInfo) return
    
    setIsLoadingHanaPoint(true)
    
    try {
      const response = await fetch(`/api/points/balance?userId=${userInfo.id}`)
      const result = await response.json()
      
      if (result.success) {
        setHanaPointInfo(result)
      } else {
        setHanaPointInfo(null)
      }
    } catch (error) {
      setHanaPointInfo(null)
    } finally {
      setIsLoadingHanaPoint(false)
    }
  }

  const fetchTransactions = async (accountId: string) => {
    if (!userInfo) return
    
    setIsLoadingTransactions(true)
    
    try {
      const response = await fetch(`/api/transactions/account/${accountId}?userId=${userInfo.id}&limit=20`)
      const result = await response.json()
      
      if (result.success) {
        const filteredTransactions = (result.data || []).filter(
          (transaction: any) => transaction.type !== 'COINBOX_INTEREST'
        )
        setTransactions(filteredTransactions)
      } else {
        setTransactions([])
      }
    } catch (error) {
      setTransactions([])
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const handleAccountClick = (accountId: string) => {
    setShowTransactionModal(true)
    fetchTransactions(accountId)
  }

  const fetchHanaPointHistory = async () => {
    if (!userInfo) return
    
    setIsLoadingHanaPointHistory(true)
    
    try {
      const response = await fetch(`/api/points/history?userId=${userInfo.id}&limit=20`)
      const result = await response.json()
      
      if (result.success) {
        setHanaPointHistory(result.data.histories || [])
      } else {
        setHanaPointHistory([])
      }
    } catch (error) {
      setHanaPointHistory([])
    } finally {
      setIsLoadingHanaPointHistory(false)
    }
  }

  const handleHanaPointClick = () => {
    setShowHanaPointModal(true)
    fetchHanaPointHistory()
  }

  const validateTransferAmount = (amount: string) => {
    const numAmount = parseInt(amount)
    
    if (!amount || numAmount <= 0) {
      setTransferValidation({ isValid: false, message: '' })
      return
    }
    
    if (numAmount % 100 !== 0) {
      setTransferValidation({ isValid: false, message: '100원 단위로 입력해주세요!' })
      return
    }
    
    if (numAmount > (hanaPointInfo?.balance || 0)) {
      setTransferValidation({ isValid: false, message: '보유 포인트가 부족합니다!' })
      return
    }
    
    setTransferValidation({ isValid: true, message: '' })
  }

  const handleTransferAmountChange = (value: string) => {
    setTransferAmount(value)
    validateTransferAmount(value)
  }

  const handleHanaPointTransfer = async () => {
    if (!userInfo || !hanaPointInfo || !transferValidation.isValid) return
    
    const amount = parseInt(transferAmount)
    
    setIsTransferring(true)
    try {
      const pointResponse = await fetch('/api/points/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.id,
          amount: amount,
          description: '계좌로 송금',
          sourceId: `transfer_${Date.now()}`
        })
      })
      
      const pointResult = await pointResponse.json()
      
      if (!pointResult.success) {
        showAlert(pointResult.error || '포인트 사용에 실패했습니다.', 'error')
        return
      }
      
      const accountResponse = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.id,
          accountId: userInfo.accounts[0].id,
          amount: amount,
          description: '하나머니에서 송금'
        })
      })
      
      const accountResult = await accountResponse.json()
      
      if (accountResult.success) {
        showAlert(`${amount.toLocaleString()}원이 계좌로 송금되었습니다!`, 'success')
        setShowHanaPointTransferModal(false)
        setTransferAmount('')
        setTransferValidation({ isValid: false, message: '' })
        fetchHanaPointBalance()
        fetchHoldings()
        if (userInfo) {
          const response = await fetch('/api/auth/check', {
            method: 'GET',
            credentials: 'include'
          })
          const data = await response.json()
          if (data.success && data.isAuthenticated) {
            setUserInfo(data.user)
          }
        }
      } else {
      }
    } catch (error) {
      showAlert('송금 처리 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsTransferring(false)
    }
  }

  useEffect(() => {
    if (userInfo) {
      fetchAllNotifications()
      fetchHoldings()
      fetchHanaPointBalance()
    }
  }, [userInfo])




  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlertModal(true)
  }

  const validatePassword = (password: string) => {
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_-]/.test(password)
    
    const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
    
    if (password.length >= 8 && password.length <= 20 && typeCount >= 2) {
      return { isValid: true, message: '' }
    } else if (password.length > 0) {
      if (password.length < 8 || password.length > 20) {
        return { isValid: false, message: '비밀번호는 8-20자 이내로 입력해주세요.' }
      } else if (typeCount < 2) {
        return { isValid: false, message: '숫자, 특수문자, 영문자 중 2가지 이상을 조합해주세요.' }
      }
    }
    return { isValid: false, message: '' }
  }

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))

    switch (field) {
      case 'currentPassword':
        setPasswordValidation(prev => ({
          ...prev,
          currentPasswordValid: value.length >= 6,
          currentPasswordMessage: value.length > 0 && value.length < 6 ? '현재 비밀번호를 입력해주세요.' : ''
        }))
        break
      case 'newPassword':
        const newPasswordResult = validatePassword(value)
        setPasswordValidation(prev => ({
          ...prev,
          newPasswordValid: newPasswordResult.isValid,
          newPasswordMessage: newPasswordResult.message
        }))
        if (passwordData.confirmPassword) {
          setPasswordValidation(prev => ({
            ...prev,
            confirmPasswordValid: value === passwordData.confirmPassword && value !== '',
            confirmPasswordMessage: value === passwordData.confirmPassword ? '' : '비밀번호가 일치하지 않습니다.'
          }))
        }
        break
      case 'confirmPassword':
        const isMatch = value === passwordData.newPassword && value !== ''
        setPasswordValidation(prev => ({
          ...prev,
          confirmPasswordValid: isMatch,
          confirmPasswordMessage: isMatch ? '' : '비밀번호가 일치하지 않습니다.'
        }))
        break
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordValidation.currentPasswordValid || !passwordValidation.newPasswordValid || !passwordValidation.confirmPasswordValid) {
      setPasswordErrorMessage('모든 항목을 올바르게 입력해주세요.')
      setShowPasswordErrorModal(true)
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo?.userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        setPasswordErrorMessage('비밀번호가 성공적으로 변경되었습니다.')
        setShowPasswordErrorModal(true)
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
          setPasswordValidation({
            currentPasswordValid: false,
            newPasswordValid: false,
            confirmPasswordValid: false,
            currentPasswordMessage: '',
            newPasswordMessage: '',
            confirmPasswordMessage: ''
          })
        }, 100)
      } else {
        setPasswordErrorMessage(result.message || '비밀번호 변경에 실패했습니다.')
        setShowPasswordErrorModal(true)
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      setPasswordErrorMessage('비밀번호 변경 중 오류가 발생했습니다.')
      setShowPasswordErrorModal(true)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordValidation({
      currentPasswordValid: false,
      newPasswordValid: false,
      confirmPasswordValid: false,
      currentPasswordMessage: '',
      newPasswordMessage: '',
      confirmPasswordMessage: ''
    })
  }

  const handleSaveProfile = async () => {
    if (!userInfo) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id,
          profileImage: selectedProfile,
          isPublicProfile: isPublicProfile,
          isPostsPublic: isPostsPublic,
          notificationsEnabled: notificationsEnabled
        })
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        showAlert('서버 오류가 발생했습니다. 페이지를 새로고침해주세요.', 'error')
        return
      }

      const result = await response.json()

      if (result.success) {
        const updatedUserInfo = { ...userInfo, profileImage: selectedProfile, isPublicProfile: isPublicProfile, isPostsPublic: isPostsPublic, notificationsEnabled: notificationsEnabled }
        localStorage.setItem('user_info', JSON.stringify(updatedUserInfo))
        setUserInfo(updatedUserInfo)
        showAlert('프로필 설정이 저장되었습니다!', 'success')
      } else {
        showAlert(`저장 실패: ${result.error}`, 'error')
      }
    } catch (error) {
      showAlert('프로필 저장 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSaving(false)
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
      <LoadingOverlay isVisible={isSaving} />
      
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

      <main className="pt-24 pb-40 bg-[#F5FBFA]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <ProfileSection
                userInfo={userInfo}
                selectedProfile={selectedProfile}
                onProfileClick={() => setShowProfileModal(true)}
                onAccountClick={handleAccountClick}
                hanaPointInfo={hanaPointInfo}
                isLoadingHanaPoint={isLoadingHanaPoint}
                onHanaPointClick={handleHanaPointClick}
              />

              <AssetChart
                holdings={holdings}
                isLoadingHoldings={isLoadingHoldings}
              />
            </div>
            
            <div className="lg:w-[400px]">
              <SettingsSection
                isPublicProfile={isPublicProfile}
                isPostsPublic={isPostsPublic}
                notificationsEnabled={notificationsEnabled}
                isSaving={isSaving}
                userInfo={userInfo}
                selectedProfile={selectedProfile}
                onTogglePublicProfile={async () => {
                  const newValue = !isPublicProfile
                  setIsPublicProfile(newValue)
                  
                  if (!userInfo) return

                  setIsSaving(true)
                  try {
                    const response = await fetch('/api/auth/update-profile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: userInfo.id,
                        profileImage: selectedProfile,
                        isPublicProfile: newValue,
                        isPostsPublic: isPostsPublic,
                        notificationsEnabled: notificationsEnabled
                      })
                    })

                    const result = await response.json()

                    if (result.success) {
                      const updatedUserInfo = { ...userInfo, profileImage: selectedProfile, isPublicProfile: newValue, isPostsPublic: isPostsPublic, notificationsEnabled: notificationsEnabled }
                      localStorage.setItem('user_info', JSON.stringify(updatedUserInfo))
                      setUserInfo(updatedUserInfo)
                    } else {
                      setIsPublicProfile(!newValue)
                    }
                  } catch (error) {
                    setIsPublicProfile(!newValue)
                  } finally {
                    setIsSaving(false)
                  }
                }}
                onTogglePostsPublic={async () => {
                  const newValue = !isPostsPublic
                  setIsPostsPublic(newValue)
                  
                  if (!userInfo) return

                  setIsSaving(true)
                  try {
                    const response = await fetch('/api/auth/update-profile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: userInfo.id,
                        profileImage: selectedProfile,
                        isPublicProfile: isPublicProfile,
                        isPostsPublic: newValue,
                        notificationsEnabled: notificationsEnabled
                      })
                    })

                    const result = await response.json()

                    if (result.success) {
                      const updatedUserInfo = { ...userInfo, profileImage: selectedProfile, isPublicProfile: isPublicProfile, isPostsPublic: newValue, notificationsEnabled: notificationsEnabled }
                      localStorage.setItem('user_info', JSON.stringify(updatedUserInfo))
                      setUserInfo(updatedUserInfo)
                    } else {
                      setIsPostsPublic(!newValue)
                    }
                  } catch (error) {
                    setIsPostsPublic(!newValue)
                  } finally {
                    setIsSaving(false)
                  }
                }}
                onToggleNotifications={async () => {
                  const newValue = !notificationsEnabled
                  setNotificationsEnabled(newValue)

                  if (!userInfo) return

                  setIsSaving(true)
                  try {
                    const response = await fetch('/api/auth/update-profile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: userInfo.id,
                        profileImage: selectedProfile,
                        isPublicProfile: isPublicProfile,
                        isPostsPublic: isPostsPublic,
                        notificationsEnabled: newValue
                      })
                    })

                    const result = await response.json()

                    if (result.success) {
                      const updatedUserInfo = { ...userInfo, profileImage: selectedProfile, isPublicProfile: isPublicProfile, isPostsPublic: isPostsPublic, notificationsEnabled: newValue }
                      localStorage.setItem('user_info', JSON.stringify(updatedUserInfo))
                      setUserInfo(updatedUserInfo)
                    } else {
                      setNotificationsEnabled(!newValue)
                    }
                  } catch (error) {
                    setNotificationsEnabled(!newValue)
                  } finally {
                    setIsSaving(false)
                  }
                }}
                onPasswordModalOpen={() => setShowPasswordModal(true)}
              />
              
              <BannerSection />
            </div>
          </div>
        </div>
      </main>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        selectedProfile={selectedProfile}
        onProfileSelect={setSelectedProfile}
        onSave={async () => {
                  await handleSaveProfile()
                  setShowProfileModal(false)
                }}
        isSaving={isSaving}
      />

      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transactions={transactions}
        isLoadingTransactions={isLoadingTransactions}
      />

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handleClosePasswordModal}
        passwordData={passwordData}
        passwordValidation={passwordValidation}
        isChangingPassword={isChangingPassword}
        onPasswordInputChange={handlePasswordInputChange}
        onPasswordChange={handlePasswordChange}
      />

      <AlertModal
        isOpen={showPasswordErrorModal}
        onClose={() => {
                  setShowPasswordErrorModal(false)
                  setPasswordErrorMessage('')
                }}
        message={passwordErrorMessage}
        type={passwordErrorMessage.includes('성공적으로') ? 'success' : 'error'}
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => {
                  setShowAlertModal(false)
                  setAlertMessage('')
                  setAlertType('info')
                }}
        message={alertMessage}
        type={alertType}
      />

      <HanaPointModal
        isOpen={showHanaPointModal}
        onClose={() => setShowHanaPointModal(false)}
        hanaPointHistory={hanaPointHistory}
        isLoadingHanaPointHistory={isLoadingHanaPointHistory}
        onTransferClick={() => {
                  setShowHanaPointModal(false)
                  setShowHanaPointTransferModal(true)
                }}
      />

      <HanaPointTransferModal
        isOpen={showHanaPointTransferModal}
        onClose={() => {
                setShowHanaPointTransferModal(false)
                setTransferAmount('')
                setTransferValidation({ isValid: false, message: '' })
              }}
        transferAmount={transferAmount}
        transferValidation={transferValidation}
        hanaPointInfo={hanaPointInfo}
        userInfo={userInfo}
        isTransferring={isTransferring}
        onTransferAmountChange={handleTransferAmountChange}
        onTransfer={handleHanaPointTransfer}
      />
    </div>
  )
}
