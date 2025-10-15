import { useState } from 'react'

export interface FindData {
  name: string
  ssn1: string
  ssn2: string
  phone: string
  userId: string
  verificationCode: string
}

export interface FindValidation {
  nameValid: boolean
  ssnValid: boolean
  phoneValid: boolean
  userIdValid: boolean
  verificationCodeValid: boolean
  ssnMessage: string
}

export interface FindSmsVerification {
  isCodeSent: boolean
  isVerified: boolean
  timer: number
  isTimerActive: boolean
  sendMessage: string
  verifyMessage: string
}

export interface FindResult {
  foundUserId: string
  message: string
}

export function useFindCredentials() {
  const [findData, setFindData] = useState<FindData>({
    name: '',
    ssn1: '',
    ssn2: '',
    phone: '',
    userId: '',
    verificationCode: ''
  })

  const [findValidation, setFindValidation] = useState<FindValidation>({
    nameValid: false,
    ssnValid: false,
    phoneValid: false,
    userIdValid: false,
    verificationCodeValid: false,
    ssnMessage: ''
  })

  const [findSmsVerification, setFindSmsVerification] = useState<FindSmsVerification>({
    isCodeSent: false,
    isVerified: false,
    timer: 0,
    isTimerActive: false,
    sendMessage: '',
    verifyMessage: ''
  })

  const [findResult, setFindResult] = useState<FindResult>({
    foundUserId: '',
    message: ''
  })

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
    } else if (yearNum >= 0 && yearNum <= 9) {
      if (genderCode === '3' || genderCode === '4') {
        return { isValid: true, message: '' }
      } else {
        return { isValid: false, message: '주민등록번호 형식이 올바르지 않습니다.' }
      }
    } else {
      return { isValid: false, message: '주민등록번호 형식이 올바르지 않습니다.' }
    }
  }

  const validateFindField = (field: string, value: string, currentData?: any) => {
    switch (field) {
      case 'name':
        const nameValid = value.trim().length >= 2
        setFindValidation(prev => ({
          ...prev,
          nameValid
        }))
        break
      case 'ssn1':
        const ssn1 = value
        const ssn2_1 = currentData?.ssn2 || findData.ssn2
        const ssnResult1 = validateSSN(ssn1, ssn2_1)
        setFindValidation(prev => ({
          ...prev,
          ssnValid: ssnResult1.isValid,
          ssnMessage: ssnResult1.message
        }))
        break
      case 'ssn2':
        const ssn1_2 = currentData?.ssn1 || findData.ssn1
        const ssn2 = value
        const ssnResult2 = validateSSN(ssn1_2, ssn2)
        setFindValidation(prev => ({
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
        
        setFindValidation(prev => ({
          ...prev,
          phoneValid
        }))

        setFindData(prev => ({
          ...prev,
          phone: formattedPhone
        }))
        break
      case 'userId':
        const userIdValid = value.trim().length >= 6
        setFindValidation(prev => ({
          ...prev,
          userIdValid
        }))
        break
      case 'verificationCode':
        const codeValid = value.length === 6 && /^\d{6}$/.test(value)
        setFindValidation(prev => ({
          ...prev,
          verificationCodeValid: codeValid
        }))
        break
    }
  }

  const handleFindInputChange = (field: string, value: string) => {
    const newData = {
      ...findData,
      [field]: value || ''
    }
    
    setFindData(newData)
    validateFindField(field, value, newData)
  }

  const handleFindId = async () => {
    if (!findValidation.nameValid || !findValidation.ssnValid || !findValidation.phoneValid) {
      return { success: false, message: '모든 정보를 올바르게 입력해주세요.' }
    }

    try {
      const response = await fetch('/api/auth/find-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: findData.name,
          ssn: `${findData.ssn1}-${findData.ssn2}`,
          phone: findData.phone
        })
      })

      const data = await response.json()

      if (data.success) {
        setFindResult({
          foundUserId: data.userId,
          message: '아이디를 찾았습니다.'
        })
        return { success: true, step: 4 }
      } else {
        return { success: false, message: data.message || '가입되지 않은 사용자입니다.' }
      }
    } catch (error) {
      return { success: false, message: '아이디 찾기 중 오류가 발생했습니다.' }
    }
  }

  const handleFindPasswordSendSMS = async () => {
    if (!findValidation.userIdValid || !findValidation.phoneValid) {
      return { success: false, message: '아이디와 전화번호를 올바르게 입력해주세요.' }
    }

    try {
      const response = await fetch('/api/auth/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: findData.userId,
          phone: findData.phone
        })
      })

      const data = await response.json()

      if (data.success) {
        const smsResponse = await fetch('/api/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: findData.phone
          })
        })

        const smsData = await smsResponse.json()

        if (smsData.success) {
          setFindSmsVerification(prev => ({
            ...prev,
            isCodeSent: true,
            timer: 60,
            isTimerActive: true,
            sendMessage: '인증번호가 발송되었습니다.'
          }))
          
          if (smsData.verificationCode) {
            localStorage.setItem('find_verification_code', smsData.verificationCode)
            localStorage.setItem('find_verification_phone', findData.phone.replace(/-/g, ''))
            localStorage.setItem('find_verification_expires', (Date.now() + 60 * 1000).toString())
          }
          
          return { success: true, step: 3 }
        } else {
          setFindSmsVerification(prev => ({
            ...prev,
            sendMessage: smsData.message || 'SMS 발송에 실패했습니다.'
          }))
          return { success: false }
        }
      } else {
        let errorMsg = data.message || '일치하는 사용자 정보가 없습니다.'
        if (data.message === '가입되지 않은 아이디입니다.') {
          errorMsg = '가입되지 않은 아이디입니다.'
        } else if (data.message === '해당 아이디에 등록된 전화번호가 아닙니다.') {
          errorMsg = '해당 아이디에 등록된 전화번호가 아닙니다.'
        }
        
        return { success: false, message: errorMsg }
      }
    } catch (error) {
      return { success: false, message: '사용자 확인 중 오류가 발생했습니다.' }
    }
  }

  const handleFindPasswordVerifySMS = async () => {
    if (!findValidation.verificationCodeValid) {
      setFindSmsVerification(prev => ({
        ...prev,
        verifyMessage: '6자리 인증번호를 입력해주세요.'
      }))
      return { success: false }
    }

    try {
      const storedCode = localStorage.getItem('find_verification_code')
      const storedPhone = localStorage.getItem('find_verification_phone')
      const storedExpires = localStorage.getItem('find_verification_expires')
      
      if (!storedCode || !storedPhone || !storedExpires) {
        setFindSmsVerification(prev => ({
          ...prev,
          verifyMessage: '인증번호를 먼저 발송해주세요.'
        }))
        return { success: false }
      }
      
      if (Date.now() > parseInt(storedExpires)) {
        localStorage.removeItem('find_verification_code')
        localStorage.removeItem('find_verification_phone')
        localStorage.removeItem('find_verification_expires')
        setFindSmsVerification(prev => ({
          ...prev,
          verifyMessage: '인증번호가 만료되었습니다. 다시 발송해주세요.'
        }))
        return { success: false }
      }
      
      const currentPhone = findData.phone.replace(/-/g, '')
      if (storedPhone !== currentPhone) {
        setFindSmsVerification(prev => ({
          ...prev,
          verifyMessage: '전화번호가 일치하지 않습니다.'
        }))
        return { success: false }
      }
      
      if (storedCode === findData.verificationCode) {
        localStorage.removeItem('find_verification_code')
        localStorage.removeItem('find_verification_phone')
        localStorage.removeItem('find_verification_expires')
        
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: findData.userId
          })
        })

        const data = await response.json()

        if (data.success) {
          setFindResult({
            foundUserId: '',
            message: '임시 비밀번호가 SMS로 발송되었습니다.'
          })
          return { success: true, step: 4 }
        } else {
          setFindSmsVerification(prev => ({
            ...prev,
            verifyMessage: '비밀번호 재설정에 실패했습니다.'
          }))
          return { success: false }
        }
      } else {
        setFindSmsVerification(prev => ({
          ...prev,
          verifyMessage: '인증번호가 일치하지 않습니다.'
        }))
        return { success: false }
      }
    } catch (error) {
      setFindSmsVerification(prev => ({
        ...prev,
        verifyMessage: '인증번호 확인에 실패했습니다.'
      }))
      return { success: false }
    }
  }

  const resetFindData = () => {
    setFindData({
      name: '',
      ssn1: '',
      ssn2: '',
      phone: '',
      userId: '',
      verificationCode: ''
    })
    setFindValidation({
      nameValid: false,
      ssnValid: false,
      phoneValid: false,
      userIdValid: false,
      verificationCodeValid: false,
      ssnMessage: ''
    })
    setFindSmsVerification({
      isCodeSent: false,
      isVerified: false,
      timer: 0,
      isTimerActive: false,
      sendMessage: '',
      verifyMessage: ''
    })
    setFindResult({
      foundUserId: '',
      message: ''
    })
  }

  return {
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
  }
}

