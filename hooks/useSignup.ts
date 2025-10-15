import { useState } from 'react'

export interface SignupData {
  id: string
  password: string
  confirmPassword: string
}

export interface SignupStep2Data {
  name: string
  ssn1: string
  ssn2: string
  phone: string
  verificationCode: string
}

export interface SignupValidation {
  idValid: boolean
  passwordValid: boolean
  passwordMatch: boolean
  idMessage: string
  passwordMessage: string
  confirmMessage: string
}

export interface Step2Validation {
  nameValid: boolean
  ssnValid: boolean
  phoneValid: boolean
  verificationCodeValid: boolean
  phoneMessage: string
  verificationMessage: string
  ssnMessage: string
}

export interface PhoneVerification {
  isCodeSent: boolean
  isVerified: boolean
  timer: number
  isTimerActive: boolean
  sendMessage: string
  verifyMessage: string
}

export interface IdCheckStatus {
  isChecked: boolean
  isAvailable: boolean
  isLoading: boolean
}

export function useSignup() {
  const [signupData, setSignupData] = useState<SignupData>({
    id: '',
    password: '',
    confirmPassword: ''
  })
  
  const [signupStep2Data, setSignupStep2Data] = useState<SignupStep2Data>({
    name: '',
    ssn1: '',
    ssn2: '',
    phone: '',
    verificationCode: ''
  })
  
  const [validation, setValidation] = useState<SignupValidation>({
    idValid: false,
    passwordValid: false,
    passwordMatch: false,
    idMessage: '',
    passwordMessage: '',
    confirmMessage: ''
  })
  
  const [step2Validation, setStep2Validation] = useState<Step2Validation>({
    nameValid: false,
    ssnValid: false,
    phoneValid: false,
    verificationCodeValid: false,
    phoneMessage: '',
    verificationMessage: '',
    ssnMessage: ''
  })
  
  const [phoneVerification, setPhoneVerification] = useState<PhoneVerification>({
    isCodeSent: false,
    isVerified: false,
    timer: 0,
    isTimerActive: false,
    sendMessage: '',
    verifyMessage: ''
  })
  
  const [idCheckStatus, setIdCheckStatus] = useState<IdCheckStatus>({
    isChecked: false,
    isAvailable: false,
    isLoading: false
  })

  const [availableAccounts, setAvailableAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [accountPassword, setAccountPassword] = useState('')
  const [confirmAccountPassword, setConfirmAccountPassword] = useState('')
  const [accountPasswordValid, setAccountPasswordValid] = useState(false)

  const validateSSN = (ssn1: string, ssn2: string) => {
    if (ssn1.length !== 6 || ssn2.length !== 7 || !/^\d{6}$/.test(ssn1) || !/^\d{7}$/.test(ssn2)) {
      return { isValid: false, message: '주민등록번호 형식이 올바르지 않습니다.' }
    }

    const year = ssn1.substring(0, 2)
    const month = ssn1.substring(2, 4)
    const day = ssn1.substring(4, 6)
    const genderCode = ssn2.charAt(0)

    const monthNum = parseInt(month)
    const dayNum = parseInt(day)
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
      return { isValid: false, message: '올바른 생년월일을 입력해주세요.' }
    }

    const yearNum = parseInt(year)
    
    if (yearNum >= 90 && yearNum <= 99) {
      if (genderCode === '1' || genderCode === '2') {
        return { isValid: true, message: '' }
      } else {
        return { isValid: false, message: '주민등록번호 형식이 올바르지 않습니다.' }
      }
    }

    else if (yearNum >= 0 && yearNum <= 9) {
      if (genderCode === '3' || genderCode === '4') {
        return { isValid: true, message: '' }
      } else {
        return { isValid: false, message: '주민등록번호 형식이 올바르지 않습니다.' }
      }
    }

    else {
      return { isValid: false, message: '주민등록번호 형식이 올바르지 않습니다.' }
    }
  }

  const validateId = (id: string) => {
    const idRegex = /^[a-zA-Z0-9_-]+$/
    
    if (id.length >= 6 && id.length <= 12 && idRegex.test(id)) {
      setValidation(prev => ({
        ...prev,
        idValid: true,
        idMessage: '' 
      }))
    } else if (id.length > 0) {
      let message = ''
      if (id.length < 6 || id.length > 12) {
        message = '아이디는 6-12자 이내로 입력해주세요.'
      } else if (!idRegex.test(id)) {
        message = '영문, 숫자, 기호(-_)만 사용 가능합니다.'
      }
      
      setValidation(prev => ({
        ...prev,
        idValid: false,
        idMessage: message
      }))
    } else {
      setValidation(prev => ({
        ...prev,
        idValid: false,
        idMessage: ''
      }))
    }
    
    if (id !== signupData.id) {
      setIdCheckStatus({
        isChecked: false,
        isAvailable: false,
        isLoading: false
      })
    }
  }

  const validatePassword = (password: string) => {
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_-]/.test(password)
    
    const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
    
    if (password.length >= 8 && password.length <= 20 && typeCount >= 2) {
      setValidation(prev => ({
        ...prev,
        passwordValid: true,
        passwordMessage: ''
      }))
    } else if (password.length > 0) {
      let message = ''
      if (password.length < 8 || password.length > 20) {
        message = '비밀번호는 8-20자 이내로 입력해주세요.'
      } else if (typeCount < 2) {
        message = '숫자, 특수문자, 영문자 중 2가지 이상을 조합해주세요.'
      }
      
      setValidation(prev => ({
        ...prev,
        passwordValid: false,
        passwordMessage: message
      }))
    } else {
      setValidation(prev => ({
        ...prev,
        passwordValid: false,
        passwordMessage: ''
      }))
    }
  }

  const validatePasswordConfirm = (confirmPassword: string) => {
    if (signupData.password === confirmPassword && confirmPassword !== '') {
      setValidation(prev => ({
        ...prev,
        passwordMatch: true,
        confirmMessage: ''
      }))
    } else {
      setValidation(prev => ({
        ...prev,
        passwordMatch: false,
        confirmMessage: '비밀번호가 일치하지 않습니다.'
      }))
    }
  }

  const handleSignupInputChange = (field: string, value: string) => {
    setSignupData(prev => ({
      ...prev,
      [field]: value || ''
    }))

    if (field === 'id') {
      validateId(value)
    } else if (field === 'password') {
      validatePassword(value)
      if (signupData.confirmPassword) {
        validatePasswordConfirm(signupData.confirmPassword)
      }
    } else if (field === 'confirmPassword') {
      validatePasswordConfirm(value)
    }
  }

  const validateStep2Field = (field: string, value: string, currentData?: any) => {
    switch (field) {
      case 'name':
        const nameValid = value.trim().length >= 2
        setStep2Validation(prev => ({
          ...prev,
          nameValid
        }))
        break
      case 'ssn1':
        const ssn1 = value
        const ssn2_1 = currentData?.ssn2 || signupStep2Data.ssn2
        const ssnResult1 = validateSSN(ssn1, ssn2_1)
        setStep2Validation(prev => ({
          ...prev,
          ssnValid: ssnResult1.isValid,
          ssnMessage: ssnResult1.message
        }))
        break
      case 'ssn2':
        const ssn1_2 = currentData?.ssn1 || signupStep2Data.ssn1
        const ssn2 = value
        const ssnResult2 = validateSSN(ssn1_2, ssn2)
        setStep2Validation(prev => ({
          ...prev,
          ssnValid: ssnResult2.isValid,
          ssnMessage: ssnResult2.message
        }))
        break
      case 'phone':
        const numbersOnly = value.replace(/\D/g, '').slice(0, 11)
        
        let formattedPhone = numbersOnly
        if (numbersOnly.length > 3) {
          formattedPhone = numbersOnly.substring(0, 3) + '-' + numbersOnly.substring(3)
        }
        if (numbersOnly.length > 7) {
          formattedPhone = numbersOnly.substring(0, 3) + '-' + numbersOnly.substring(3, 7) + '-' + numbersOnly.substring(7)
        }
        
        const phoneValid = /^01[01]-\d{4}-\d{4}$/.test(formattedPhone) && numbersOnly.length === 11
        
        setStep2Validation(prev => ({
          ...prev,
          phoneValid,
          phoneMessage: phoneValid ? '' : (numbersOnly.length > 0 ? '올바른 형식의 전화번호를 입력해주세요.' : '')
        }))
        
        setSignupStep2Data(prev => ({
          ...prev,
          phone: formattedPhone
        }))
        break
      case 'verificationCode':
        const codeValid = value.length === 6 && /^\d{6}$/.test(value)
        setStep2Validation(prev => ({
          ...prev,
          verificationCodeValid: codeValid,
          verificationMessage: codeValid ? '' : '6자리 숫자를 입력해주세요.'
        }))
        break
    }
  }

  const handleStep2InputChange = (field: string, value: string) => {
    const newData = {
      ...signupStep2Data,
      [field]: value || ''
    }
    
    setSignupStep2Data(newData)
    validateStep2Field(field, value, newData)
  }

  const handleIdCheck = async () => {
    if (!signupData.id || !validation.idValid) {
      return { success: false, message: '올바른 아이디를 입력해주세요.' }
    }

    setIdCheckStatus(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch('/api/auth/check-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: signupData.id
        })
      })

      const data = await response.json()

      if (data.success) {
        setIdCheckStatus({
          isChecked: true,
          isAvailable: data.isAvailable,
          isLoading: false
        })
        return { success: true, isAvailable: data.isAvailable }
      } else {
        setIdCheckStatus({
          isChecked: true,
          isAvailable: false,
          isLoading: false
        })
        return { success: false, isAvailable: false }
      }
    } catch (error) {
      setIdCheckStatus({
        isChecked: true,
        isAvailable: false,
        isLoading: false
      })
      return { success: false, message: '아이디 중복 확인에 실패했습니다.' }
    }
  }

  const validateAccountPassword = (password: string) => {
    const isValid = /^\d{4}$/.test(password)
    setAccountPasswordValid(isValid)
    return isValid
  }

  const validateConfirmAccountPassword = (confirmPassword: string) => {
    return accountPassword === confirmPassword && confirmPassword !== ''
  }

  return {
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
  }
}

