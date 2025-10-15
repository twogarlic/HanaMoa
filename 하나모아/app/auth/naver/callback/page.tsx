"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function NaverCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleNaverCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      console.log('네이버 콜백 파라미터:', {
        code: code ? 'exists' : 'missing',
        state: state ? 'exists' : 'missing',
        error,
        errorDescription
      })
      
      if (error) {
        console.error('네이버 로그인 에러:', error, errorDescription)
        alert(`네이버 로그인에 실패했습니다.\n오류: ${error}\n설명: ${errorDescription || '알 수 없는 오류'}`)
        router.push('/')
        return
      }


      if (!code) {
        console.error('Authorization code가 없습니다.')
        alert('로그인 처리 중 오류가 발생했습니다.')
        router.push('/')
        return
      }

      try {
        const tokenResponse = await fetch('/api/auth/naver/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (!tokenResponse.ok) {
          throw new Error('토큰 요청 실패')
        }

        const tokenData = await tokenResponse.json()
        
        const userResponse = await fetch('/api/auth/naver/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken: tokenData.access_token }),
        })

        if (!userResponse.ok) {
          throw new Error('사용자 정보 요청 실패')
        }

        const userData = await userResponse.json()
        
        const naverId = userData.response.id
        const naverEmail = userData.response.email || ''
        const naverName = userData.response.name || ''
        
        const checkResponse = await fetch('/api/auth/social-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: 'naver',
            providerId: naverId,
            email: naverEmail,
            name: naverName
          })
        })

        if (!checkResponse.ok) {
          throw new Error('소셜 로그인 체크 실패')
        }

        const checkData = await checkResponse.json()

        if (checkData.success) {
          if (checkData.isExistingUser) {
            const urlParams = new URLSearchParams(window.location.search)
            const redirectPath = urlParams.get('redirect')
            router.push(redirectPath ? decodeURIComponent(redirectPath) : '/home')
          } else {
            localStorage.setItem('naver_user_info', JSON.stringify({
              provider: 'naver',
              providerId: naverId,
              name: naverName,
              email: naverEmail
            }))
            router.push('/?social_login=naver')
          }
        } else {
          throw new Error('소셜 로그인 처리 실패')
        }

      } catch (error) {
        console.error('네이버 로그인 처리 오류:', error)
        alert('로그인 처리 중 오류가 발생했습니다.')
        router.push('/')
      }
    }

    handleNaverCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
    </div>
  )
} 