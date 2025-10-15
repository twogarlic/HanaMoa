import { useState } from 'react'

export interface LoginData {
  id: string
  password: string
}

export interface LoginValidation {
  idValid: boolean
  passwordValid: boolean
  idMessage: string
  passwordMessage: string
}

export function useLogin() {
  const [loginData, setLoginData] = useState<LoginData>({
    id: '',
    password: ''
  })
  
  const [loginValidation, setLoginValidation] = useState<LoginValidation>({
    idValid: false,
    passwordValid: false,
    idMessage: '',
    passwordMessage: ''
  })
  
  const [isAccountLocked, setIsAccountLocked] = useState(false)
  const [loginFailCount, setLoginFailCount] = useState(0)

  const validateLoginField = (field: string, value: string) => {
    switch (field) {
      case 'id':
        const idRegex = /^[a-zA-Z0-9_-]+$/
        const idValid = value.length >= 6 && value.length <= 12 && idRegex.test(value)
        let idMessage = ''
        if (value.length > 0 && !idValid) {
          if (value.length < 6 || value.length > 12) {
            idMessage = '아이디는 6-12자 이내로 입력해주세요.'
          } else if (!idRegex.test(value)) {
            idMessage = '영문, 숫자, 기호(-_)만 사용 가능합니다.'
          }
        }
        setLoginValidation(prev => ({
          ...prev,
          idValid,
          idMessage
        }))
        break
      case 'password':
        const passwordValid = value.length >= 6
        setLoginValidation(prev => ({
          ...prev,
          passwordValid,
          passwordMessage: passwordValid ? '' : (value.length > 0 ? '6자리 이상 비밀번호를 입력해주세요.' : '')
        }))
        break
    }
  }

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value || ''
    }))
    
    validateLoginField(field, value)
  }

  const handleLogin = async () => {
    if (!loginValidation.idValid || !loginValidation.passwordValid) {
      return { success: false, message: '아이디와 비밀번호를 올바르게 입력해주세요.' }
    }

    if (isAccountLocked) {
      return { success: false, message: '계정이 잠금되어 있습니다.', needsUnlock: true }
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: loginData.id,
          password: loginData.password
        })
      })

      const data = await response.json()

      if (data.success) {
        setLoginFailCount(0)
        setIsAccountLocked(false)
        return { success: true, redirect: true }
      } else {
        const serverFailCount = data.failCount || 0
        const serverIsLocked = data.isLocked || false
        
        setLoginFailCount(serverFailCount)
        setIsAccountLocked(serverIsLocked)
        
        if (serverIsLocked) {
          return { 
            success: false, 
            message: '비밀번호를 5회 연속 틀렸습니다.\n계정이 잠금되었습니다.',
            needsUnlock: true
          }
        } else if (response.status === 423) {
          return { 
            success: false, 
            message: '계정이 잠금되어 있습니다.\n본인인증을 통해 잠금을 해제해주세요.',
            needsUnlock: true
          }
        } else {
          return { 
            success: false, 
            message: `${data.message || '로그인에 실패했습니다.'}\n(${serverFailCount}/5회 실패)`
          }
        }
      }
    } catch (error) {
      return { success: false, message: '로그인 중 오류가 발생했습니다.' }
    }
  }

  return {
    loginData,
    loginValidation,
    isAccountLocked,
    loginFailCount,
    handleLoginInputChange,
    handleLogin,
    setIsAccountLocked,
    setLoginFailCount
  }
}

