import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  userId: string
  name: string
  email: string
  phone: string
  profileImage: string | null
  isPublicProfile: boolean
  isPostsPublic: boolean
  notificationsEnabled: boolean
  accounts: {
    id: number
    accountNumber: string
    accountName: string
    balance: number
  }[]
}

interface UseAuthOptions {
  redirectOnFail?: boolean 
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectOnFail = true } = options
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include', 
        })

        if (!response.ok) {
          setIsAuthenticated(false)
          setUser(null)
          if (redirectOnFail) {
            router.push('/')
          }
          return
        }

        const data = await response.json()

        if (data.success && data.isAuthenticated) {
          setIsAuthenticated(true)
          setUser(data.user)
        } else {
          setIsAuthenticated(false)
          setUser(null)
          if (redirectOnFail) {
            router.push('/')
          }
        }
      } catch (error) {
        if (!redirectOnFail) {
          setIsAuthenticated(false)
          setUser(null)
        } else {
          setIsAuthenticated(false)
          setUser(null)
          router.push('/')
        }
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuthentication()
  }, [router, redirectOnFail])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      setUser(null)
      setIsAuthenticated(false)
      router.push('/')
    } catch (error) {
    }
  }

  return {
    user,
    isAuthenticated,
    isCheckingAuth,
    logout,
    setUser,
  }
}

