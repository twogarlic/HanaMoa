"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import NavigationBar from "./NavigationBar"
import LoadingOverlay from "./LoadingOverlay"
import { AlertModal } from "./ui/AlertModal"
import { SocialLogin } from "./auth/SocialLogin"
import { IdLogin } from "./auth/IdLogin"
import { Signup } from "./auth/Signup"
import { AccountUnlockModal } from "./auth/AccountUnlockModal"
import { FindCredentialsModal } from "./auth/FindCredentialsModal"
import { useLogin } from "../hooks/useLogin"
import { useSignup } from "../hooks/useSignup"
import { useAccountUnlock } from "../hooks/useAccountUnlock"
import { useFindCredentials } from "../hooks/useFindCredentials"
import styles from "./styles/LoginPage.module.css"

declare global {
  interface Window {
    Kakao: any
  }
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("id-login")
  const [isKakaoReady, setIsKakaoReady] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [signupStep, setSignupStep] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [hanaPointInfo, setHanaPointInfo] = useState<any>(null)
  const [isLinkingPoint, setIsLinkingPoint] = useState(false)
  const [signupResult, setSignupResult] = useState<any>(null)
  
  const [showSocialSignup, setShowSocialSignup] = useState(false)
  const [socialSignupStep, setSocialSignupStep] = useState(1)
  const [socialUserInfo, setSocialUserInfo] = useState({
    provider: '', 
    providerId: '', 
    name: '',
    email: ''
  })

  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [shouldShowUnlockAfterError, setShouldShowUnlockAfterError] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [unlockStep, setUnlockStep] = useState(1)
  const [showFindModal, setShowFindModal] = useState(false)
  const [findType, setFindType] = useState('')
  const [findStep, setFindStep] = useState(1)

  const {
    loginData,
    loginValidation,
    isAccountLocked,
    loginFailCount,
    handleLoginInputChange,
    handleLogin,
    setIsAccountLocked,
    setLoginFailCount
  } = useLogin()

  const {
    signupData,
    signupStep2Data,
    validation,
    step2Validation,
    phoneVerification,
    idCheckStatus,
    availableAccounts,
    selectedAccount,
    accountPassword,
    confirmAccountPassword,
    accountPasswordValid,
    handleSignupInputChange,
    handleStep2InputChange,
    handleIdCheck,
    setPhoneVerification,
    setAvailableAccounts,
    setSelectedAccount,
    setAccountPassword,
    setConfirmAccountPassword,
    validateAccountPassword,
    validateConfirmAccountPassword,
    setSignupStep2Data,
    setStep2Validation
  } = useSignup()

  const {
    unlockData,
    unlockValidation,
    unlockSmsVerification,
    handleUnlockInputChange,
    handleUnlockSendSMS,
    handleUnlockVerifySMS,
    resetUnlockData,
    setUnlockSmsVerification
  } = useAccountUnlock(loginData.id)

  const {
    findData,
    findValidation,
    findSmsVerification,
    findResult,
    handleFindInputChange,
    handleFindId,
    handleFindPasswordSendSMS,
    handleFindPasswordVerifySMS,
    resetFindData,
    setFindSmsVerification
  } = useFindCredentials()

  const showAlert = (message: string) => {
    setAlertMessage(message)
    setShowAlertModal(true)
  }

  const handleCloseAlertModal = () => {
    setShowAlertModal(false)
    setAlertMessage('')
  }

  const changeTabWithAnimation = (newTab: string) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveTab(newTab)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }, 300)
  }

  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      showAlert('카카오 SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.')
      return
    }

    if (!window.Kakao.isInitialized()) {
      showAlert('카카오 SDK가 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    if (!window.Kakao.Auth || !window.Kakao.Auth.login) {
      showAlert('카카오 로그인 기능을 사용할 수 없습니다.')
      return
    }

    try {
      window.Kakao.Auth.login({
        success: function (response: any) {
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: async function (userResponse: any) {
               const kakaoId = String(userResponse.id)
               const kakaoEmail = userResponse.kakao_account?.email || ''
               const kakaoName = userResponse.properties?.nickname || ''

               try {
                 const requestBody = {
                   provider: 'kakao',
                   providerId: kakaoId,
                   email: kakaoEmail,
                   name: kakaoName
                 }
                 
                 const checkResponse = await fetch('/api/auth/social-login', {
                   method: 'POST',
                   headers: {
                     'Content-Type': 'application/json',
                   },
                   body: JSON.stringify(requestBody)
                 })

                const checkData = await checkResponse.json()

                if (checkData.success) {
                  if (checkData.isExistingUser) {
                    const urlParams = new URLSearchParams(window.location.search)
                    const redirectPath = urlParams.get('redirect')
                    window.location.href = redirectPath ? decodeURIComponent(redirectPath) : '/home'
                  } else {
                    setSocialUserInfo({
                      provider: 'kakao',
                      providerId: kakaoId,
                      name: kakaoName,
                      email: kakaoEmail
                    })
                    setShowSocialSignup(true)
                    setSocialSignupStep(2)
                  }
                }
              } catch (error) {
              }
            },
            fail: function (error: any) {
            }
          })
        },
        fail: function (error: any) {
        }
      })
    } catch (error) {
    }
  }

  const handleNaverLogin = () => {
    const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
    
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/naver/callback`)
    const state = Math.random().toString(36).substr(2, 11)

    localStorage.setItem('naver_oauth_state', state)
    
    const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${redirectUri}&state=${state}`
    
    window.location.href = naverLoginUrl
  }

  const handleLoginSubmit = async () => {
    const result = await handleLogin()
    
    if (result.success && result.redirect) {
      const urlParams = new URLSearchParams(window.location.search)
      const redirectPath = urlParams.get('redirect')
      window.location.href = redirectPath ? decodeURIComponent(redirectPath) : '/home'
    } else if (result.needsUnlock) {
      setErrorMessage(result.message || '')
      setShouldShowUnlockAfterError(true)
      setShowErrorModal(true)
    } else {
      setErrorMessage(result.message || '')
      setShowErrorModal(true)
    }
  }

  const handleSignupClick = () => {
    setShowSignup(true)
  }

  const handleBackToLogin = () => {
    setShowSignup(false)
    setSignupStep(1)
    setSelectedAccount('')
  }

  const handleSendVerificationCode = async () => {
    setPhoneVerification(prev => ({
      ...prev,
      sendMessage: '',
      verifyMessage: ''
    }))

    if (!step2Validation.nameValid) {
      setPhoneVerification(prev => ({
        ...prev,
        sendMessage: '이름을 입력해주세요.'
      }))
      return
    }
    
    if (!step2Validation.ssnValid) {
      setPhoneVerification(prev => ({
        ...prev,
        sendMessage: '주민등록번호를 입력해주세요.'
      }))
      return
    }
    
    if (!step2Validation.phoneValid) {
      setPhoneVerification(prev => ({
        ...prev,
        sendMessage: '유효한 전화번호를 입력해주세요.'
      }))
      return
    }

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: signupStep2Data.phone
        })
      })

      const data = await response.json()

      if (data.success) {
        setPhoneVerification(prev => ({
          ...prev,
          isCodeSent: true,
          timer: 60,
          isTimerActive: true,
          sendMessage: data.message || '인증번호가 발송되었습니다.'
        }))
        
        if (data.verificationCode) {
          localStorage.setItem('verification_code', data.verificationCode)
          localStorage.setItem('verification_phone', signupStep2Data.phone.replace(/-/g, ''))
          localStorage.setItem('verification_expires', (Date.now() + 60 * 1000).toString())
        }
      } else {
        setPhoneVerification(prev => ({
          ...prev,
          sendMessage: data.message || '인증번호 발송에 실패했습니다.'
        }))
      }
    } catch (error) {
      setPhoneVerification(prev => ({
        ...prev,
        sendMessage: '인증번호 발송에 실패했습니다.'
      }))
    }
  }

  const handleVerifyCode = async () => {
    setPhoneVerification(prev => ({
      ...prev,
      verifyMessage: ''
    }))

    if (!step2Validation.verificationCodeValid) {
      setPhoneVerification(prev => ({
        ...prev,
        verifyMessage: '6자리 인증번호를 입력해주세요.'
      }))
      return
    }

    try {
      const storedCode = localStorage.getItem('verification_code')
      const storedPhone = localStorage.getItem('verification_phone')
      const storedExpires = localStorage.getItem('verification_expires')
      
      if (!storedCode || !storedPhone || !storedExpires) {
        setPhoneVerification(prev => ({
          ...prev,
          verifyMessage: '인증번호를 먼저 발송해주세요.'
        }))
        return
      }

      if (Date.now() > parseInt(storedExpires)) {
        localStorage.removeItem('verification_code')
        localStorage.removeItem('verification_phone')
        localStorage.removeItem('verification_expires')
        setPhoneVerification(prev => ({
          ...prev,
          verifyMessage: '인증번호가 만료되었습니다. 다시 발송해주세요.'
        }))
        return
      }
      
      const currentPhone = signupStep2Data.phone.replace(/-/g, '')
      if (storedPhone !== currentPhone) {
        setPhoneVerification(prev => ({
          ...prev,
          verifyMessage: '전화번호가 일치하지 않습니다.'
        }))
        return
      }
      
      if (storedCode === signupStep2Data.verificationCode) {
        localStorage.removeItem('verification_code')
        localStorage.removeItem('verification_phone')
        localStorage.removeItem('verification_expires')
        
        setPhoneVerification(prev => ({
          ...prev,
          isVerified: true,
          isTimerActive: false,
          verifyMessage: '전화번호 인증이 완료되었습니다.'
        }))
        
        try {
          const response = await fetch('/api/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: signupStep2Data.name,
              ssn: `${signupStep2Data.ssn1}-${signupStep2Data.ssn2}`
            })
          })

          const data = await response.json()
          
          if (data.success) {
            setAvailableAccounts(data.accounts || [])
            if (showSocialSignup) {
              setSocialSignupStep(3)
            } else {
              setSignupStep(3)
            }
          } else {
            showAlert(data.message || '계좌 조회에 실패했습니다.')
          }
        } catch (error) {
          showAlert('계좌 조회에 실패했습니다.')
        }
      } else {
        setPhoneVerification(prev => ({
          ...prev,
          verifyMessage: '인증번호가 일치하지 않습니다.'
        }))
      }
    } catch (error) {
      setPhoneVerification(prev => ({
        ...prev,
        verifyMessage: '인증번호 확인에 실패했습니다.'
      }))
    }
  }

  const checkHanaPoint = async () => {
    setIsLinkingPoint(true)
    try {
      const response = await fetch('/api/points/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupStep2Data.name,
          ssn: `${signupStep2Data.ssn1}-${signupStep2Data.ssn2}`
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setHanaPointInfo(data)
      } else {
        setHanaPointInfo(null)
      }
    } catch (error) {
      setHanaPointInfo(null)
    } finally {
      setIsLinkingPoint(false)
    }
  }

  const performSignup = async () => {
    setIsSigningUp(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: signupData.id,
          password: signupData.password,
          name: signupStep2Data.name,
          ssn: `${signupStep2Data.ssn1}-${signupStep2Data.ssn2}`,
          phone: signupStep2Data.phone,
          selectedAccount: selectedAccount,
          accountPassword: accountPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setSignupResult(data)
        setSignupStep(6)
      } else {
        showAlert(data.message || '회원가입에 실패했습니다.')
      }
    } catch (error) {
      showAlert('회원가입에 실패했습니다.')
    } finally {
      setIsSigningUp(false)
    }
  }

  const performSocialSignup = async () => {
    setIsSigningUp(true)
    try {
      const signupDataBody = {
        name: signupStep2Data.name,
        ssn: `${signupStep2Data.ssn1}-${signupStep2Data.ssn2}`,
        phone: signupStep2Data.phone,
        provider: socialUserInfo.provider,
        providerId: socialUserInfo.providerId,
        email: socialUserInfo.email,
        selectedAccount: selectedAccount,
        accountPassword: accountPassword
      }
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupDataBody)
      })

      const data = await response.json()

      if (data.success) {
        setSignupResult(data)
        setSocialSignupStep(6)
      } else {
        showAlert(data.message || '회원가입에 실패했습니다.')
      }
    } catch (error) {
      showAlert('회원가입에 실패했습니다.')
    } finally {
      setIsSigningUp(false)
    }
  }

  const handleSignupNext = async () => {
    if (signupStep === 1) {
      if (!validation.idValid || !validation.passwordValid || !validation.passwordMatch || !idCheckStatus.isChecked || !idCheckStatus.isAvailable) {
        return
      }
      setSignupStep(2)
    } else if (signupStep === 2) {
      if (!step2Validation.nameValid || !step2Validation.ssnValid || !step2Validation.phoneValid || !phoneVerification.isVerified) {
        return
      }
    } else if (signupStep === 3) {
      if (!selectedAccount) {
        showAlert('계좌를 선택해주세요.')
        return
      }
      setSignupStep(4)
    } else if (signupStep === 4) {
      if (!accountPasswordValid || !validateConfirmAccountPassword(confirmAccountPassword)) {
        showAlert('계좌 비밀번호를 확인해주세요.')
        return
      }
      setSignupStep(5)
    } else if (signupStep === 5) {
      await performSignup()
    } else if (signupStep === 6) {
      handleBackToLogin()
    }
  }

  const handleSocialSignupNext = async () => {
    if (socialSignupStep === 2) {
      if (!step2Validation.nameValid || !step2Validation.ssnValid || !step2Validation.phoneValid || !phoneVerification.isVerified) {
        showAlert('모든 정보를 입력하고 전화번호 인증을 완료해주세요.')
        return
      }
    } else if (socialSignupStep === 3) {
      if (!selectedAccount) {
        showAlert('계좌를 선택해주세요.')
        return
      }
      setSocialSignupStep(4)
    } else if (socialSignupStep === 4) {
      if (!accountPasswordValid || !validateConfirmAccountPassword(confirmAccountPassword)) {
        showAlert('계좌 비밀번호를 확인해주세요.')
        return
      }
      setSocialSignupStep(5)
    } else if (socialSignupStep === 5) {
      await performSocialSignup()
    } else if (socialSignupStep === 6) {
      setShowSocialSignup(false)
      setSocialSignupStep(1)
      setSelectedAccount('')
      setActiveTab('simple-login')
    }
  }

  const handleIdCheckClick = async () => {
    const result = await handleIdCheck()
    if (!result.success && result.message) {
      showAlert(result.message)
    }
  }

  const handleUnlockSendSMSClick = async () => {
    const result = await handleUnlockSendSMS()
    if (result.success && result.step) {
      setUnlockStep(result.step)
    } else if (result.message) {
      setErrorMessage(result.message)
      setShowErrorModal(true)
    }
  }

  const handleUnlockVerifySMSClick = async () => {
    const result = await handleUnlockVerifySMS()
    if (result.success && result.step) {
      setUnlockStep(result.step)
      setIsAccountLocked(false)
      setLoginFailCount(0)
    }
  }

  const handleFindIdClick = async () => {
    const result = await handleFindId()
    if (result.success && result.step) {
      setFindStep(result.step)
    } else if (result.message) {
      setErrorMessage(result.message)
      setShowErrorModal(true)
    }
  }

  const handleFindPasswordSendSMSClick = async () => {
    const result = await handleFindPasswordSendSMS()
    if (result.success && result.step) {
      setFindStep(result.step)
    } else if (result.message) {
      setErrorMessage(result.message)
      setShowErrorModal(true)
    }
  }

  const handleFindPasswordVerifySMSClick = async () => {
    const result = await handleFindPasswordVerifySMS()
    if (result.success && result.step) {
      setFindStep(result.step)
    }
  }

  useEffect(() => {
    if ((signupStep === 5 || socialSignupStep === 5) && !hanaPointInfo && !isLinkingPoint) {
      checkHanaPoint()
    }
  }, [signupStep, socialSignupStep])

  useEffect(() => {
    const initialTimer = setTimeout(() => setIsInitialLoad(false), 100)
    const socialLogin = searchParams.get('social_login')
    if (socialLogin === 'naver') {
      const naverUserInfo = localStorage.getItem('naver_user_info')
      if (naverUserInfo) {
        const userInfo = JSON.parse(naverUserInfo)
        setSocialUserInfo(userInfo)
        
        if (userInfo.name) {
          setSignupStep2Data(prev => ({
            ...prev,
            name: userInfo.name
          }))
          setStep2Validation(prev => ({
            ...prev,
            nameValid: userInfo.name.trim().length >= 2
          }))
        }
        
        setShowSocialSignup(true)
        setSocialSignupStep(2)
        localStorage.removeItem('naver_user_info')
      }
    }

    const kakaoScript = document.createElement('script')
    kakaoScript.src = 'https://developers.kakao.com/sdk/js/kakao.js'
    kakaoScript.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
        if (!kakaoKey) {
          return
        }
        try {
          window.Kakao.init(kakaoKey)
          setIsKakaoReady(true)
        } catch (error) {
        }
      }
    }
    kakaoScript.onerror = () => {
    }
    document.head.appendChild(kakaoScript)

    return () => {
      if (document.head.contains(kakaoScript)) {
        document.head.removeChild(kakaoScript)
      }
      clearTimeout(initialTimer)
    }
  }, [searchParams])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (phoneVerification.isTimerActive && phoneVerification.timer > 0) {
      interval = setInterval(() => {
        setPhoneVerification(prev => ({
          ...prev,
          timer: prev.timer - 1
        }))
      }, 1000)
    } else if (phoneVerification.timer === 0 && phoneVerification.isCodeSent) {
      setPhoneVerification(prev => ({
        ...prev,
        isTimerActive: false,
        isCodeSent: false,
        sendMessage: '인증 시간이 만료되었습니다. 다시 인증번호를 요청해주세요.',
        verifyMessage: ''
      }))
    }
    return () => clearInterval(interval)
  }, [phoneVerification.isTimerActive, phoneVerification.timer, phoneVerification.isCodeSent])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (unlockSmsVerification.isTimerActive && unlockSmsVerification.timer > 0) {
      interval = setInterval(() => {
        setUnlockSmsVerification(prev => ({
          ...prev,
          timer: prev.timer - 1
        }))
      }, 1000)
    } else if (unlockSmsVerification.timer === 0 && unlockSmsVerification.isCodeSent) {
      setUnlockSmsVerification(prev => ({
        ...prev,
        isTimerActive: false,
        isCodeSent: false,
        sendMessage: '인증 시간이 만료되었습니다. 다시 인증번호를 요청해주세요.',
        verifyMessage: ''
      }))
      setUnlockStep(1)
    }
    return () => clearInterval(interval)
  }, [unlockSmsVerification.isTimerActive, unlockSmsVerification.timer, unlockSmsVerification.isCodeSent])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (findSmsVerification.isTimerActive && findSmsVerification.timer > 0) {
      interval = setInterval(() => {
        setFindSmsVerification(prev => ({
          ...prev,
          timer: prev.timer - 1
        }))
      }, 1000)
    } else if (findSmsVerification.timer === 0 && findSmsVerification.isCodeSent) {
      setFindSmsVerification(prev => ({
        ...prev,
        isTimerActive: false,
        isCodeSent: false,
        sendMessage: '인증 시간이 만료되었습니다. 다시 인증번호를 요청해주세요.',
        verifyMessage: ''
      }))
      setFindStep(2)
    }
    return () => clearInterval(interval)
  }, [findSmsVerification.isTimerActive, findSmsVerification.timer, findSmsVerification.isCodeSent])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <NavigationBar 
          friendRequestsCount={0}
          giftRequestsCount={0}
          friendRequests={[]}
          giftRequests={[]}
          notifications={[]}
          unreadNotificationCount={0}
          isLoadingRequests={false}
        />
      </div>

      <div className={styles.content}>
        <div className={`${styles.mainCard} ${
          isInitialLoad ? styles.mainCardInitial : styles.mainCardLoaded
        }`}>
          <div className={styles.tabContainer}>
            <button
              onClick={() => changeTabWithAnimation("simple-login")}
              className={`${styles.tabButton} ${
                activeTab === "simple-login" ? styles.tabButtonActive : styles.tabButtonInactive
              }`}
            >
              간편 로그인
            </button>
            <button
              onClick={() => changeTabWithAnimation("id-login")}
              className={`${styles.tabButton} ${
                activeTab === "id-login" ? styles.tabButtonActive : styles.tabButtonInactive
              }`}
            >
              아이디 로그인
            </button>
          </div>

          <div className={`${styles.tabContent} ${
            (signupStep === 4 || socialSignupStep === 4) ? styles.tabContentNoPadding : styles.tabContentWithPadding
          } ${
            isTransitioning ? styles.tabContentTransitioning : styles.tabContentNormal
          }`}>
            {activeTab === "simple-login" && !showSocialSignup ? (
              <SocialLogin 
                isKakaoReady={isKakaoReady}
                onKakaoLogin={handleKakaoLogin}
                onNaverLogin={handleNaverLogin}
              />
            ) : showSocialSignup ? (
              <div className={styles.simpleLoginWrapper}>
                <Signup
                  step={socialSignupStep}
                  signupData={signupData}
                  signupStep2Data={signupStep2Data}
                  validation={validation}
                  step2Validation={step2Validation}
                  phoneVerification={phoneVerification}
                  idCheckStatus={idCheckStatus}
                  availableAccounts={availableAccounts}
                  selectedAccount={selectedAccount}
                  accountPassword={accountPassword}
                  confirmAccountPassword={confirmAccountPassword}
                  accountPasswordValid={accountPasswordValid}
                  hanaPointInfo={hanaPointInfo}
                  isLinkingPoint={isLinkingPoint}
                  onInputChange={handleSignupInputChange}
                  onStep2InputChange={handleStep2InputChange}
                  onIdCheck={handleIdCheckClick}
                  onSendVerificationCode={handleSendVerificationCode}
                  onVerifyCode={handleVerifyCode}
                  onAccountSelect={setSelectedAccount}
                  onAccountPasswordChange={setAccountPassword}
                  onConfirmAccountPasswordChange={setConfirmAccountPassword}
                  validateAccountPassword={validateAccountPassword}
                  validateConfirmAccountPassword={validateConfirmAccountPassword}
                  onNext={handleSocialSignupNext}
                />
              </div>
            ) : !showSignup ? (
              <IdLogin
                loginData={loginData}
                loginValidation={loginValidation}
                onInputChange={handleLoginInputChange}
                onLogin={handleLoginSubmit}
                onSignupClick={handleSignupClick}
                onFindCredentials={() => setShowFindModal(true)}
              />
            ) : (
              <Signup
                step={signupStep}
                signupData={signupData}
                signupStep2Data={signupStep2Data}
                validation={validation}
                step2Validation={step2Validation}
                phoneVerification={phoneVerification}
                idCheckStatus={idCheckStatus}
                availableAccounts={availableAccounts}
                selectedAccount={selectedAccount}
                accountPassword={accountPassword}
                confirmAccountPassword={confirmAccountPassword}
                accountPasswordValid={accountPasswordValid}
                hanaPointInfo={hanaPointInfo}
                isLinkingPoint={isLinkingPoint}
                onInputChange={handleSignupInputChange}
                onStep2InputChange={handleStep2InputChange}
                onIdCheck={handleIdCheckClick}
                onSendVerificationCode={handleSendVerificationCode}
                onVerifyCode={handleVerifyCode}
                onAccountSelect={setSelectedAccount}
                onAccountPasswordChange={setAccountPassword}
                onConfirmAccountPasswordChange={setConfirmAccountPassword}
                validateAccountPassword={validateAccountPassword}
                validateConfirmAccountPassword={validateConfirmAccountPassword}
                onNext={handleSignupNext}
                onBack={handleBackToLogin}
              />
            )}
          </div>
        </div>
      </div>

      <AccountUnlockModal
        isOpen={showUnlockModal}
        step={unlockStep}
        unlockData={unlockData}
        unlockValidation={unlockValidation}
        unlockSmsVerification={unlockSmsVerification}
        onInputChange={handleUnlockInputChange}
        onSendSMS={handleUnlockSendSMSClick}
        onVerifySMS={handleUnlockVerifySMSClick}
        onClose={() => {
          setShowUnlockModal(false)
          setUnlockStep(1)
          resetUnlockData()
        }}
        onStepChange={setUnlockStep}
      />

      <FindCredentialsModal
        isOpen={showFindModal}
        findType={findType}
        findStep={findStep}
        findData={findData}
        findValidation={findValidation}
        findSmsVerification={findSmsVerification}
        findResult={findResult}
        onInputChange={handleFindInputChange}
        onFindId={handleFindIdClick}
        onFindPasswordSendSMS={handleFindPasswordSendSMSClick}
        onFindPasswordVerifySMS={handleFindPasswordVerifySMSClick}
        onClose={() => {
          setShowFindModal(false)
          setFindType('')
          setFindStep(1)
          resetFindData()
        }}
        onTypeSelect={setFindType}
        onStepChange={setFindStep}
      />

      {showErrorModal && (
        <div className={styles.modalOverlayHighZ}>
          <div className={styles.modalContentLarge}>
            <div className={styles.spaceY6}>
              <div className={styles.textCenterModal}>
                <div className={styles.iconContainer60}>
                  <img src="/images/ic_danger.gif" alt="오류" className={styles.iconImage60} />
                </div>
                <h2 className={styles.text18BlackMB}>
                  인증 실패
                </h2>
                <p className={styles.text14GrayNormal}>
                  {errorMessage}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowErrorModal(false)
                  if (shouldShowUnlockAfterError) {
                    setShouldShowUnlockAfterError(false)
                    setShowUnlockModal(true)
                  }
                }}
                className={styles.buttonMedium}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={showAlertModal}
        onClose={handleCloseAlertModal}
        message={alertMessage}
      />

      <LoadingOverlay isVisible={isSigningUp} />
    </div>
  )
}

