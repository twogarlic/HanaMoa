"use client"

import { Search, Menu, Bell, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import styles from "./styles/NavigationBar.module.css"

interface NavigationBarProps {
  friendRequestsCount?: number
  giftRequestsCount?: number
  friendRequests?: any[]
  giftRequests?: any[]
  notifications?: any[]
  unreadNotificationCount?: number
  isLoadingRequests?: boolean
  onFriendRequest?: (requestId: string, action: 'accept' | 'decline') => Promise<void>
  onGiftRequest?: (giftId: string, action: 'accept' | 'decline' | 'detail') => Promise<void>
  onNotificationClick?: () => void
  onNotificationRead?: (notificationId: string) => void
  onPostNotificationClick?: (postId: string, authorId: string, asset: string) => void
  backgroundStyle?: string
  isAuthenticated?: boolean 
}

const searchableMenus = [
  { name: "투자하기", path: "/invest", keywords: ["투자", "invest", "투자하기"] },
  { name: "투자소개", path: "/invest/info", keywords: ["투자소개", "소개", "info", "투자정보"] },
  { name: "잔돈투자", path: "/invest/coinbox", keywords: ["잔돈", "coinbox", "잔돈투자", "코인박스"] },
  { name: "AI분석", path: "/predict", keywords: ["예측", "predict", "투자예측", "예상", "AI", "분석", "AI분석", "포트폴리오"] },
  { name: "하이챗봇", path: "/chatbot", keywords: ["챗봇", "chatbot", "하이챗봇", "채팅", "상담"] },
  { name: "목표", path: "/goal", keywords: ["목표", "goal", "목표설정"] },
  { name: "선물", path: "/gift", keywords: ["선물", "gift", "선물하기"] },
  { name: "실물교환", path: "/service", keywords: ["실물", "교환", "service", "실물교환"] },
  { name: "상품교환", path: "/market", keywords: ["상품", "market", "상품교환", "마켓"] },
  { name: "마이페이지", path: "/mypage", keywords: ["마이페이지", "mypage", "내정보", "프로필"] },
  { name: "예약관리", path: "/reservations", keywords: ["예약", "reservations", "예약관리", "관리"] },
  { name: "친구관리", path: "/friends", keywords: ["친구", "friends", "친구관리", "친구목록"] },
  { name: "포트폴리오", path: "/portfolio", keywords: ["포트폴리오", "portfolio", "자산", "보유"] },
  { name: "홈", path: "/home", keywords: ["홈", "home", "메인", "홈페이지"] }
]

export default function NavigationBar({ 
  friendRequestsCount = 0, 
  giftRequestsCount = 0,
  friendRequests = [],
  giftRequests = [],
  notifications = [],
  unreadNotificationCount = 0,
  isLoadingRequests = false,
  onFriendRequest,
  onGiftRequest,
  onNotificationClick,
  onNotificationRead,
  onPostNotificationClick,
  backgroundStyle,
  isAuthenticated: isAuthenticatedProp
}: NavigationBarProps) {
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(searchableMenus)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  
  const finalIsLoggedIn = isAuthenticatedProp !== undefined ? isAuthenticatedProp : isLoggedIn
  
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultModalType, setResultModalType] = useState<'success' | 'error'>('success')
  const [resultModalMessage, setResultModalMessage] = useState('')
  
  const notificationModalRef = useRef<HTMLDivElement>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const totalNotifications = notificationsEnabled ? (friendRequestsCount + giftRequestsCount + unreadNotificationCount) : 0

  useEffect(() => {
    if (isAuthenticatedProp !== undefined) {
      return
    }
    
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        })
        
        if (!response.ok) {
          setIsLoggedIn(false)
          return
        }
        
        const data = await response.json()
        setIsLoggedIn(data.success && data.isAuthenticated)
        
        if (data.user && data.user.notificationsEnabled !== undefined) {
          setNotificationsEnabled(data.user.notificationsEnabled)
        }
      } catch (error) {
        setIsLoggedIn(false)
      }
    }
    
    checkLoginStatus()
    
    const handleStorageChange = () => {
      checkLoginStatus()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    const interval = setInterval(checkLoginStatus, 30000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [isAuthenticatedProp])

  const [isInvestDropdownOpen, setIsInvestDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isChangeDropdownOpen, setIsChangeDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const userDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const changeDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults(searchableMenus)
      return
    }
    
    const filtered = searchableMenus.filter(menu => 
      menu.keywords.some(keyword => 
        keyword.toLowerCase().includes(query.toLowerCase())
      )
    )
    setSearchResults(filtered)
  }

  const handleSearchClick = () => {
    setShowSearchModal(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  const handleSearchResultClick = (path: string) => {
    setShowSearchModal(false)
    setSearchQuery("")
    setSearchResults(searchableMenus)
    window.location.href = path
  }

  const handleMobileMenuClick = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  const handleMobileMenuItemClick = (path: string) => {
    setShowMobileMenu(false)
    window.location.href = path
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showNotificationModal) return
      if (notificationModalRef.current && !notificationModalRef.current.contains(e.target as Node)) {
        setShowNotificationModal(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [showNotificationModal])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showSearchModal) return
      if (searchModalRef.current && !searchModalRef.current.contains(e.target as Node)) {
        setShowSearchModal(false)
        setSearchQuery("")
        setSearchResults(searchableMenus)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [showSearchModal])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showMobileMenu) return
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [showMobileMenu])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSearchModal) {
          setShowSearchModal(false)
          setSearchQuery("")
          setSearchResults(searchableMenus)
        }
        if (showMobileMenu) {
          setShowMobileMenu(false)
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showSearchModal, showMobileMenu])

  const handleNotificationClick = () => {
    setShowNotificationModal(true)
    onNotificationClick?.()
  }

  const openDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setIsInvestDropdownOpen(true)
  }

  const closeDropdown = (delay: number = 0) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsInvestDropdownOpen(false)
    }, delay)
  }

  const openChangeDropdown = () => {
    if (changeDropdownTimeoutRef.current) {
      clearTimeout(changeDropdownTimeoutRef.current)
      changeDropdownTimeoutRef.current = null
    }
    setIsChangeDropdownOpen(true)
  }

  const closeChangeDropdown = (delay: number = 0) => {
    if (changeDropdownTimeoutRef.current) {
      clearTimeout(changeDropdownTimeoutRef.current)
    }
    changeDropdownTimeoutRef.current = setTimeout(() => {
      setIsChangeDropdownOpen(false)
    }, delay)
  }

  const openUserDropdown = () => {
    if (userDropdownTimeoutRef.current) {
      clearTimeout(userDropdownTimeoutRef.current)
      userDropdownTimeoutRef.current = null
    }
    setIsUserDropdownOpen(true)
  }

  const closeUserDropdown = (delay: number = 0) => {
    if (userDropdownTimeoutRef.current) {
      clearTimeout(userDropdownTimeoutRef.current)
    }
    userDropdownTimeoutRef.current = setTimeout(() => {
      setIsUserDropdownOpen(false)
    }, delay)
  }

  return (
    <>
      <header 
        className={`${styles.header} ${backgroundStyle === "white" ? styles.headerWhite : styles.headerGradient}`}
      >
        <div className={styles.container}>
          <div className={styles.navContainer}>
            <div className={styles.logoContainer}>
              <Link href="/home">
                <Image 
                  src={backgroundStyle === "white" ? "/images/ic_logo.svg" : "/images/ic_logo_white.svg"} 
                  alt="Logo" 
                  width={120} 
                  height={30} 
                  className={styles.logo}
                />
              </Link>
            </div>
            
            <nav className={styles.nav}>
              <div
                onMouseEnter={openDropdown}
                onMouseLeave={() => closeDropdown(160)}
              >
                <Link 
                  href="/invest" 
                  className={`${styles.navLink} ${backgroundStyle === "white" ? styles.navLinkWhite : styles.navLinkDark}`}
                >
                  투자
                </Link>
              </div>
              <Link 
                href="/goal" 
                className={`${styles.navLink} ${backgroundStyle === "white" ? styles.navLinkWhite : styles.navLinkDark}`}
              >
                목표
              </Link>
              <Link 
                href="/gift" 
                className={`${styles.navLink} ${backgroundStyle === "white" ? styles.navLinkWhite : styles.navLinkDark}`}
              >
                선물
              </Link>
              <div
                onMouseEnter={openChangeDropdown}
                onMouseLeave={() => closeChangeDropdown(160)}
              >
              <a 
                className={`${styles.navLink} ${backgroundStyle === "white" ? styles.navLinkWhite : styles.navLinkDark}`}
              >
                교환
              </a>
              </div>
              <div
                onMouseEnter={openUserDropdown}
                onMouseLeave={() => closeUserDropdown(160)}
              >
                <a 
                  className={`${styles.navLink} ${backgroundStyle === "white" ? styles.navLinkWhite : styles.navLinkDark}`}
                >
                  내정보
                </a>
              </div>
            </nav>
            
            <div className={styles.actionsContainer}>
              <button
                onClick={handleNotificationClick}
                className={`${styles.actionButton} ${backgroundStyle === "white" ? styles.actionButtonWhite : styles.actionButtonDark}`}
                title="알림"
              >
                <Bell className={`${styles.actionIcon} ${backgroundStyle === "white" ? styles.actionIconWhite : styles.actionIconDark}`} />
                {finalIsLoggedIn && totalNotifications > 0 && (
                  <span className={styles.notificationBadge}>
                    {totalNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={handleSearchClick}
                className={`${styles.actionButton} ${backgroundStyle === "white" ? styles.actionButtonWhite : styles.actionButtonDark}`}
                title="검색"
              >
                <Search className={`${styles.actionIcon} ${backgroundStyle === "white" ? styles.actionIconWhite : styles.actionIconDark}`} />
              </button>
              <button
                onClick={handleMobileMenuClick}
                className={`${styles.actionButton} ${backgroundStyle === "white" ? styles.actionButtonWhite : styles.actionButtonDark}`}
                title="메뉴"
              >
                <Menu className={`${styles.actionIcon} ${backgroundStyle === "white" ? styles.actionIconWhite : styles.actionIconDark}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {showNotificationModal && (
        <div className={styles.notificationModal}>
          <div 
            ref={notificationModalRef}
            className={styles.notificationContent}
          >
            <div className={styles.notificationScroll}>
              {isLoadingRequests ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.loadingSpinner}></div>
                  <p className={styles.loadingText}>
                    로딩 중
                  </p>
                </div>
              ) : !finalIsLoggedIn ? (
                <div className={styles.loginPrompt}>
                  <p className={styles.loginPromptText}>
                    <button
                      onClick={() => {
                        setShowNotificationModal(false)
                        window.location.href = '/'
                      }}
                      className={styles.loginButton}
                    >
                      로그인
                    </button>
                    <span>을 해주세요.</span>
                  </p>
                </div>
              ) : !notificationsEnabled ? (
                <div className={styles.notificationsDisabled}>
                  <div className={styles.notificationsDisabledIcon}>
                    <Bell className="w-6 h-6 text-[#03856E]" />
                  </div>
                  <p className={styles.notificationsDisabledTitle}>
                    알림이 꺼져있습니다
                  </p>
                  <p className={styles.notificationsDisabledSubtitle}>
                    마이페이지에서 알림을 켤 수 있습니다
                  </p>
                  <button
                    onClick={() => {
                      setShowNotificationModal(false)
                      window.location.href = '/mypage'
                    }}
                    className={styles.settingsButton}
                  >
                    설정으로 이동
                  </button>
                </div>
              ) : (friendRequests.length === 0 && giftRequests.length === 0 && notifications.length === 0) ? (
                <div className={styles.noNotifications}>
                  <p className={styles.noNotificationsText}>
                    알림이 없습니다.
                  </p>
                </div>
              ) : (
                <div className={styles.notificationsList}>
                  {(() => {
                    const allNotifications = [
                      ...friendRequests.map(item => ({ ...item, notificationType: 'friend_request' })),
                      ...giftRequests.map(item => ({ ...item, notificationType: 'gift_request' })),
                      ...notifications.map(item => ({ ...item, notificationType: 'notification' }))
                    ]
                    
                    const sortedNotifications = allNotifications.sort((a, b) => 
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                    
                    return sortedNotifications.map((item) => {
                      if (item.notificationType === 'friend_request') {
                        const request = item
                        return (
                    <div key={request.id} className={styles.notificationItem}>
                      <div className={styles.notificationHeader}>
                        <div className={styles.notificationAvatar}>
                          {request.sender.profileImage ? (
                            <Image
                              src={`/images/ic_${request.sender.profileImage}.png`}
                              alt=""
                              width={30}
                              height={30}
                              className="object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="${styles.notificationAvatarFallback}">
                                      <span class="text-white text-[14px]" style="font-family: Hana2-Medium, sans-serif;">
                                        ${request.sender.name.charAt(0)}
                                      </span>
                                    </div>
                                  `
                                }
                              }}
                            />
                          ) : (
                            <div className={styles.notificationAvatarFallback}>
                              <span className="text-white text-[14px]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                                {request.sender.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className={styles.notificationContent}>
                          <div className={styles.notificationTitle}>
                            {request.sender.name}님이 친구 신청을 보냈습니다.
                          </div>
                          <div className={styles.notificationSubtitle}>
                            {request.sender.phone}
                          </div>
                          <div className={styles.notificationTime}>
                            {new Date(request.createdAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        <div className={styles.notificationActions}>
                          <button
                            onClick={async () => {
                              setShowNotificationModal(false)
                              try {
                                if (onFriendRequest) {
                                  await onFriendRequest(request.id, 'accept')
                                }
                                setResultModalType('success')
                                setResultModalMessage('친구 신청을 수락했습니다.')
                                setShowResultModal(true)
                              } catch (error) {
                                setResultModalType('error')
                                setResultModalMessage('친구 신청 수락에 실패했습니다.')
                                setShowResultModal(true)
                              }
                            }}
                            className={styles.notificationActionButton}
                            title="수락"
                          >
                            <Image
                              src="/images/ic_accept.svg"
                              alt="수락"
                              width={12}
                              height={12}
                              className="object-contain"
                            />
                          </button>
                          <button
                            onClick={async () => {
                              setShowNotificationModal(false)
                              try {
                                if (onFriendRequest) {
                                  await onFriendRequest(request.id, 'decline')
                                }
                                setResultModalType('success')
                                setResultModalMessage('친구 신청을 거절했습니다.')
                                setShowResultModal(true)
                              } catch (error) {
                                setResultModalType('error')
                                setResultModalMessage('친구 신청 거절에 실패했습니다.')
                                setShowResultModal(true)
                              }
                            }}
                            className={styles.notificationActionButton}
                            title="거절"
                          >
                            <Image
                              src="/images/ic_reject.svg"
                              alt="거절"
                              width={12}
                              height={12}
                              className="object-contain"
                            />
                          </button>
                        </div>
                      </div>
                      
                      {request.message && (
                        <div className={styles.notificationMessage}>
                          <p className={styles.notificationMessageText}>
                            "{request.message}"
                          </p>
                        </div>
                      )}
                    </div>
                        )
                      } else if (item.notificationType === 'gift_request') {
                        const gift = item
                        return (
                    <div key={gift.id} className={styles.notificationItem}>
                      <div className={styles.notificationHeader}>
                        <div 
                          className={styles.notificationGiftItem}
                          onClick={() => {
                            onGiftRequest?.(gift.id, 'detail')
                            setShowNotificationModal(false)
                          }}
                        >
                          <div className={styles.notificationGiftIcon}>
                            <Image
                              src={gift.asset === 'usd' || gift.asset === 'jpy' || gift.asset === 'eur' || gift.asset === 'cny' 
                                ? `/images/ic_market_money.png` 
                                : `/images/ic_market_${gift.asset}.png`}
                              alt={gift.asset}
                              width={32}
                              height={32}
                              className="object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/ic_market_money.png'
                              }}
                            />
                          </div>
                          <div className={styles.notificationGiftContent}>
                            <div className={styles.notificationGiftTitle}>
                              {gift.sender.name}님이 선물하셨습니다.
                            </div>
                            <div className={styles.notificationGiftSubtitle}>
                              수락하시겠습니까?
                            </div>
                            <div className={styles.notificationGiftTime}>
                              {new Date(gift.createdAt).toLocaleString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className={styles.notificationGiftActions}>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              setShowNotificationModal(false)
                              try {
                                if (onGiftRequest) {
                                  await onGiftRequest(gift.id, 'accept')
                                }
                                setResultModalType('success')
                                setResultModalMessage('선물을 수락했습니다!')
                                setShowResultModal(true)
                              } catch (error) {
                                setResultModalType('error')
                                setResultModalMessage('선물 수락에 실패했습니다.')
                                setShowResultModal(true)
                              }
                            }}
                            className={`${styles.notificationGiftActionButton} ${styles.notificationGiftActionButtonAccept}`}
                            title="수락"
                          >
                            <Image
                              src="/images/ic_accept.svg"
                              alt="수락"
                              width={12}
                              height={12}
                              className="object-contain"
                            />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation() 
                              setShowNotificationModal(false)
                              try {
                                if (onGiftRequest) {
                                  await onGiftRequest(gift.id, 'decline')
                                }
                                setResultModalType('success')
                                setResultModalMessage('선물을 거절했습니다.')
                                setShowResultModal(true)
                              } catch (error) {
                                setResultModalType('error')
                                setResultModalMessage('선물 거절에 실패했습니다.')
                                setShowResultModal(true)
                              }
                            }}
                            className={`${styles.notificationGiftActionButton} ${styles.notificationGiftActionButtonReject}`}
                            title="거절"
                          >
                            <Image
                              src="/images/ic_reject.svg"
                              alt="거절"
                              width={12}
                              height={12}
                              className="object-contain"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                        )
                      } else if (item.notificationType === 'notification') {
                        const notification = item
                        return (
                    <div key={notification.id} className={styles.notificationItem}>
                      <div 
                        className={`${styles.notificationSystemItem} ${
                          notification.type === 'NEW_POST' ? styles.notificationSystemItemClickable : ''
                        }`}
                        onClick={() => {
                          if (notification.type === 'NEW_POST' && notification.data) {
                            const data = typeof notification.data === 'string' 
                              ? JSON.parse(notification.data) 
                              : notification.data
                            onPostNotificationClick?.(data.postId, data.authorId, data.asset)
                            onNotificationRead?.(notification.id)
                            setShowNotificationModal(false)
                          }
                        }}
                      >
                        <div className={styles.notificationSystemIcon}>
                          {notification.type === 'ORDER_EXECUTED' ? (
                            <div className={styles.notificationSystemIconLarge}>
                              <Image
                                src="/images/ic_notification_deal.gif"
                                alt="체결 알림"
                                width={48}
                                height={48}
                                className="object-cover scale-200"
                                style={{ 
                                  objectPosition: 'center center',
                                  transform: 'scale(2)'
                                }}
                              />
                            </div>
                          ) : (
                            <div className={styles.notificationSystemIconFallback}>
                              <span className="text-white text-[12px]" style={{ fontFamily: "Hana2-Medium, sans-serif" }}>
                                {notification.type === 'NEW_POST' ? 'N' : 
                                 notification.type === 'GOAL_ACHIEVED' ? 'G' : 'A'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className={styles.notificationSystemContent}>
                          <div className={styles.notificationSystemTitle}>
                            {notification.title}
                          </div>
                          <div className={styles.notificationSystemMessage}>
                            {notification.message}
                          </div>
                          <div className={styles.notificationSystemTime}>
                            {new Date(notification.createdAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onNotificationRead?.(notification.id)
                            }}
                            className={styles.notificationReadButton}
                            title="읽음 처리"
                          >
                            <div className={styles.notificationReadDot}></div>
                          </button>
                        )}
                      </div>
                    </div>
                        )
                      }
                      return null
                    })
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showMobileMenu && (
        <div className={styles.mobileMenuOverlay}>
          <div 
            ref={mobileMenuRef}
            className={styles.mobileMenu}
          >
            <div className={styles.mobileMenuHeader}>
              <div className={styles.mobileMenuLogo}>
                <Image 
                  src="/images/ic_logo.svg" 
                  alt="Logo" 
                  width={100} 
                  height={25} 
                  className="object-contain" 
                />
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className={styles.mobileMenuCloseButton}
                title="닫기"
              >
                <X className={styles.mobileMenuCloseIcon} />
              </button>
            </div>

            <div className={styles.mobileMenuContent}>
              <div className={styles.mobileMenuScroll}>
                <div className={styles.mobileMenuSection}>
                  <h3 className={styles.mobileMenuSectionTitle}>
                    주요 서비스
                  </h3>
                  
                  <button
                    onClick={() => handleMobileMenuItemClick('/invest')}
                    className={`${styles.mobileMenuItem} ${styles.mobileMenuItemGroup}`}
                  >
                    <div>
                      <div className={styles.mobileMenuItemTitle}>
                        투자하기
                      </div>
                      <div className={styles.mobileMenuItemSubtitle}>
                        투자를 쉽게, 하나모아
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileMenuItemClick('/goal')}
                    className={`${styles.mobileMenuItem} ${styles.mobileMenuItemGroup}`}
                  >
                    <div>
                      <div className={styles.mobileMenuItemTitle}>
                        목표
                      </div>
                      <div className={styles.mobileMenuItemSubtitle}>
                        목표 설정하고 달성하기
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileMenuItemClick('/gift')}
                    className={`${styles.mobileMenuItem} ${styles.mobileMenuItemGroup}`}
                  >
                    <div>
                      <div className={styles.mobileMenuItemTitle}>
                        선물
                      </div>
                      <div className={styles.mobileMenuItemSubtitle}>
                        소중한 사람에게 선물하기
                      </div>
                    </div>
                  </button>
                </div>

                <div className={styles.mobileMenuSection}>
                  <h3 className={styles.mobileMenuSectionTitle}>
                    투자 서비스
                  </h3>
                  
                  <button
                    onClick={() => handleMobileMenuItemClick('/invest/info')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      투자소개
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileMenuItemClick('/invest/coinbox')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      잔돈투자
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileMenuItemClick('/predict')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      투자예측
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileMenuItemClick('/chatbot')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      하이챗봇
                    </div>
                  </button>
                </div>

                <div className={styles.mobileMenuSection}>
                  <h3 className={styles.mobileMenuSectionTitle}>
                    교환 서비스
                  </h3>
                  
                  <button
                    onClick={() => handleMobileMenuItemClick('/service')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      실물교환
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileMenuItemClick('/market')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      상품교환
                    </div>
                  </button>
                </div>

                <div className={styles.mobileMenuSection}>
                  <h3 className={styles.mobileMenuSectionTitle}>
                    내정보
                  </h3>
                  
                  <button
                    onClick={() => handleMobileMenuItemClick('/mypage')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      마이페이지
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileMenuItemClick('/portfolio')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      포트폴리오
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileMenuItemClick('/reservations')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      예약관리
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileMenuItemClick('/friends')}
                    className={styles.mobileMenuItem}
                  >
                    <div className={styles.mobileMenuItemTitle}>
                      친구관리
                    </div>
                  </button>
                </div>

                <div className={styles.mobileMenuDivider}>
                  {finalIsLoggedIn ? (
                    <button
                      onClick={async () => {
                        await fetch('/api/auth/logout', {
                          method: 'POST',
                          credentials: 'include',
                        })
                        window.location.href = '/'
                      }}
                      className={styles.mobileMenuLogoutButton}
                    >
                      <div className={styles.mobileMenuButtonText}>
                        로그아웃
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowMobileMenu(false)
                        window.location.href = '/'
                      }}
                      className={styles.mobileMenuLoginButton}
                    >
                      <div className={styles.mobileMenuButtonText}>
                        로그인
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className={styles.mobileMenuOverlayClick}
            onClick={() => setShowMobileMenu(false)}
          />
        </div>
      )}

      {showSearchModal && (
        <div className={styles.searchModalOverlay}>
          <div 
            ref={searchModalRef}
            className={styles.searchModal}
          >

            <div className={styles.searchModalHeader}>
              <div className={styles.searchInputContainer}>
                <Search className={styles.searchInputIcon} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="메뉴를 검색하세요..."
                  className={styles.searchInput}
                />
              </div>
              <button
                onClick={() => {
                  setShowSearchModal(false)
                  setSearchQuery("")
                  setSearchResults(searchableMenus)
                }}
                className={styles.searchModalCloseButton}
                title="닫기"
              >
                <X className={styles.searchModalCloseIcon} />
              </button>
            </div>

            <div className={styles.searchModalContent}>
              {searchResults.length === 0 ? (
                <div className={styles.searchNoResults}>
                  <p className={styles.searchNoResultsText}>
                    검색 결과가 없습니다.
                  </p>
                </div>
              ) : (
                <div className={styles.searchResults}>
                  {searchResults.map((menu, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(menu.path)}
                      className={styles.searchResultItem}
                    >
                      <div className={styles.searchResultContent}>
                        <div>
                          <div className={styles.searchResultTitle}>
                            {menu.name}
                          </div>
                        </div>
                        <div className={styles.searchResultArrow}>
                          <svg 
                            className={styles.searchResultArrowIcon} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7" 
                            />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {searchQuery === "" && (
              <div className={styles.searchModalFooter}>
                <p className={styles.searchModalTip}>
                  팁: "투자", "목표", "선물", "친구" 등의 키워드로 검색해보세요
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        ref={dropdownRef}
        onMouseEnter={openDropdown}
        onMouseLeave={() => closeDropdown(160)}
        className={`${styles.dropdown} ${isInvestDropdownOpen ? styles.dropdownVisible : styles.dropdownHidden}`}
      >
        <div className={styles.dropdownContent}>
          <div className={styles.dropdownGrid}>
            <div>
              <div className={styles.dropdownTitle}>
                투자하기
              </div>
              <div className={styles.dropdownSubtitle}>
                <div>투자를 쉽게,</div>
                <div>하나모아</div>
              </div>
            </div>

            <div className={styles.dropdownMenu}>
            <ul className={styles.dropdownMenuList}>
              <li className={styles.dropdownMenuItem}><Link href="/invest/info" className="hover:underline whitespace-nowrap">투자소개</Link></li>
              <li className={styles.dropdownMenuItem}><Link href="/invest" className="hover:underline">투자하기</Link></li>
              <li className={styles.dropdownMenuItem}><Link href="/invest/coinbox" className="hover:underline">잔돈투자</Link></li>
              <li className={styles.dropdownMenuItem}><Link href="/predict" className="hover:underline">AI분석</Link></li>
              <li className={styles.dropdownMenuItem}><Link href="/chatbot" className="hover:underline">하이챗봇</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={dropdownRef}
        onMouseEnter={openChangeDropdown}
        onMouseLeave={() => closeChangeDropdown(160)}
        className={`${styles.dropdown} ${isChangeDropdownOpen ? styles.dropdownVisible : styles.dropdownHidden}`}
      >
        <div className={styles.dropdownContent}>
          <div className={styles.dropdownGrid}>
            <div>
              <div className={styles.dropdownTitle}>
                교환하기
              </div>
              <div className={styles.dropdownSubtitle}>
                <div>교환 쉽게,</div>
                <div>하나모아</div>
              </div>
            </div>

            <div className={styles.dropdownMenuRight}>
              <ul className={styles.dropdownMenuList}>
                <li className={styles.dropdownMenuItem}><Link href="/service" className="hover:underline whitespace-nowrap">실물교환</Link></li>
                <li className={styles.dropdownMenuItem}><Link href="/market" className="hover:underline">상품교환</Link></li>
                <li className={styles.dropdownSpacer}></li>
                <li className={styles.dropdownSpacer}></li>
                <li className={styles.dropdownSpacer}></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={userDropdownRef}
        onMouseEnter={openUserDropdown}
        onMouseLeave={() => closeUserDropdown(160)}
        className={`${styles.dropdown} ${isUserDropdownOpen ? styles.dropdownVisible : styles.dropdownHidden}`}
      >
        <div className={styles.dropdownContent}>
          <div className={styles.dropdownGrid}>
            <div>
              <div className={styles.dropdownTitle}>
                내정보
              </div>
              <div className={styles.dropdownSubtitle}>
                <div>관리를 쉽게,</div>
                <div>하나모아</div>
              </div>
            </div>

            <div className={styles.dropdownMenuFarRight}>
              <ul className={styles.dropdownMenuList}>
                {finalIsLoggedIn ? (
                  <>
                    <li className={styles.dropdownMenuItem}><Link href="/mypage" className="hover:underline">마이페이지</Link></li>
                    <li className={styles.dropdownMenuItem}><Link href="/reservations" className="hover:underline whitespace-nowrap">예약관리</Link></li>
                    <li className={styles.dropdownMenuItem}><Link href="/friends" className="hover:underline whitespace-nowrap">친구관리</Link></li>
                    <li className={styles.dropdownMenuItem}>
                      <button 
                        onClick={async () => {
                          await fetch('/api/auth/logout', {
                            method: 'POST',
                            credentials: 'include',
                          })
                          window.location.href = '/'
                        }}
                        className={styles.dropdownMenuItemButton}
                      >
                        로그아웃
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className={styles.dropdownMenuItem}>
                      <button 
                        onClick={() => window.location.href = '/'}
                        className={styles.dropdownMenuItemButton}
                      >
                        로그인
                      </button>
                    </li>
                  </>
                )}
                <li className={styles.dropdownSpacer}></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showResultModal && (
        <div className={styles.resultModalOverlay}>
          <div className={styles.resultModal}>
            <div className={styles.resultModalContent}>
              <div className={styles.resultModalIcon}>
                <Image
                  src={resultModalType === 'success' ? "/images/ic_check.gif" : "/images/ic_danger.gif"}
                  alt={resultModalType === 'success' ? "완료" : "오류"}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              
              <div className={styles.resultModalMessage}>
                <p className={styles.resultModalMessageText}>
                  {resultModalMessage}
                </p>
              </div>

              <button
                onClick={() => setShowResultModal(false)}
                className={styles.resultModalButton}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
