import { useState } from 'react'

export interface UnlockData {
  name: string
  ssn1: string
  ssn2: string
  phone: string
  verificationCode: string
}

export interface UnlockValidation {
  nameValid: boolean
  ssnValid: boolean
  phoneValid: boolean
  verificationCodeValid: boolean
  ssnMessage: string
}

export interface UnlockSmsVerification {
  isCodeSent: boolean
  isVerified: boolean
  timer: number
  isTimerActive: boolean
  sendMessage: string
  verifyMessage: string
}

export function useAccountUnlock(userId: string) {
  const [unlockData, setUnlockData] = useState<UnlockData>({
    name: '',
    ssn1: '',
    ssn2: '',
    phone: '',
    verificationCode: ''
  })
  
  const [unlockValidation, setUnlockValidation] = useState<UnlockValidation>({
    nameValid: false,
    ssnValid: false,
    phoneValid: false,
    verificationCodeValid: false,
    ssnMessage: ''
  })
  
  const [unlockSmsVerification, setUnlockSmsVerification] = useState<UnlockSmsVerification>({
    isCodeSent: false,
    isVerified: false,
    timer: 0,
    isTimerActive: false,
    sendMessage: '',
    verifyMessage: ''
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

  const validateUnlockField = (field: string, value: string, currentData?: any) => {
    switch (field) {
      case 'name':
        const nameValid = value.trim().length >= 2
        setUnlockValidation(prev => ({
          ...prev,
          nameValid
        }))
        break
      case 'ssn1':
        const ssn1 = value
        const ssn2_1 = currentData?.ssn2 || unlockData.ssn2
        const ssnResult1 = validateSSN(ssn1, ssn2_1)
        setUnlockValidation(prev => ({
          ...prev,
          ssnValid: ssnResult1.isValid,
          ssnMessage: ssnResult1.message
        }))
        break
      case 'ssn2':
        const ssn1_2 = currentData?.ssn1 || unlockData.ssn1
        const ssn2 = value
        const ssnResult2 = validateSSN(ssn1_2, ssn2)
        setUnlockValidation(prev => ({
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
        
        setUnlockValidation(prev => ({
          ...prev,
          phoneValid
        }))
        
        setUnlockData(prev => ({
          ...prev,
          phone: formattedPhone
        }))
        break
      case 'verificationCode':
        const codeValid = value.length === 6 && /^\d{6}$/.test(value)
        setUnlockValidation(prev => ({
          ...prev,
          verificationCodeValid: codeValid
        }))
        break
    }
  }

  const handleUnlockInputChange = (field: string, value: string) => {
    const newData = {
      ...unlockData,
      [field]: value || ''
    }
    
    setUnlockData(newData)
    validateUnlockField(field, value, newData)
  }

  const handleUnlockSendSMS = async () => {
    if (!unlockValidation.nameValid || !unlockValidation.ssnValid || !unlockValidation.phoneValid) {
      return { success: false, message: '모든 정보를 올바르게 입력해주세요.' }
    }

    try {
      const response = await fetch('/api/auth/verify-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          name: unlockData.name,
          ssn: `${unlockData.ssn1}-${unlockData.ssn2}`,
          phone: unlockData.phone
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
            phone: unlockData.phone
          })
        })

        const smsData = await smsResponse.json()

        if (smsData.success) {
          setUnlockSmsVerification(prev => ({
            ...prev,
            isCodeSent: true,
            timer: 60,
            isTimerActive: true,
            sendMessage: '인증번호가 발송되었습니다.'
          }))
          
          if (smsData.verificationCode) {
            localStorage.setItem('unlock_verification_code', smsData.verificationCode)
            localStorage.setItem('unlock_verification_phone', unlockData.phone.replace(/-/g, ''))
            localStorage.setItem('unlock_verification_expires', (Date.now() + 60 * 1000).toString())
          }
          
          return { success: true, step: 2 }
        } else {
          setUnlockSmsVerification(prev => ({
            ...prev,
            sendMessage: smsData.message || 'SMS 발송에 실패했습니다.'
          }))
          return { success: false, message: smsData.message }
        }
      } else {
        return { success: false, message: data.message || '계정 정보가 일치하지 않습니다.' }
      }
    } catch (error) {
      return { success: false, message: '계정 확인 중 오류가 발생했습니다.' }
    }
  }

  const handleUnlockVerifySMS = async () => {
    if (!unlockValidation.verificationCodeValid) {
      setUnlockSmsVerification(prev => ({
        ...prev,
        verifyMessage: '6자리 인증번호를 입력해주세요.'
      }))
      return { success: false }
    }

    try {
      const storedCode = localStorage.getItem('unlock_verification_code')
      const storedPhone = localStorage.getItem('unlock_verification_phone')
      const storedExpires = localStorage.getItem('unlock_verification_expires')
      
      if (!storedCode || !storedPhone || !storedExpires) {
        setUnlockSmsVerification(prev => ({
          ...prev,
          verifyMessage: '인증번호를 먼저 발송해주세요.'
        }))
        return { success: false }
      }
      
      if (Date.now() > parseInt(storedExpires)) {
        localStorage.removeItem('unlock_verification_code')
        localStorage.removeItem('unlock_verification_phone')
        localStorage.removeItem('unlock_verification_expires')
        setUnlockSmsVerification(prev => ({
          ...prev,
          verifyMessage: '인증번호가 만료되었습니다. 다시 발송해주세요.'
        }))
        return { success: false }
      }
      
      const currentPhone = unlockData.phone.replace(/-/g, '')
      if (storedPhone !== currentPhone) {
        setUnlockSmsVerification(prev => ({
          ...prev,
          verifyMessage: '전화번호가 일치하지 않습니다.'
        }))
        return { success: false }
      }
      
      if (storedCode === unlockData.verificationCode) {
        localStorage.removeItem('unlock_verification_code')
        localStorage.removeItem('unlock_verification_phone')
        localStorage.removeItem('unlock_verification_expires')
        
        const response = await fetch('/api/auth/unlock-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId
          })
        })

        const data = await response.json()

        if (data.success) {
          setUnlockSmsVerification(prev => ({
            ...prev,
            isVerified: true,
            verifyMessage: '본인인증이 완료되었습니다.'
          }))
          
          return { success: true, step: 3 }
        } else {
          setUnlockSmsVerification(prev => ({
            ...prev,
            verifyMessage: '계정 잠금 해제에 실패했습니다.'
          }))
          return { success: false }
        }
      } else {
        setUnlockSmsVerification(prev => ({
          ...prev,
          verifyMessage: '인증번호가 일치하지 않습니다.'
        }))
        return { success: false }
      }
    } catch (error) {
      setUnlockSmsVerification(prev => ({
        ...prev,
        verifyMessage: '인증번호 확인에 실패했습니다.'
      }))
      return { success: false }
    }
  }

  const resetUnlockData = () => {
    setUnlockData({
      name: '',
      ssn1: '',
      ssn2: '',
      phone: '',
      verificationCode: ''
    })
    setUnlockValidation({
      nameValid: false,
      ssnValid: false,
      phoneValid: false,
      verificationCodeValid: false,
      ssnMessage: ''
    })
    setUnlockSmsVerification({
      isCodeSent: false,
      isVerified: false,
      timer: 0,
      isTimerActive: false,
      sendMessage: '',
      verifyMessage: ''
    })
  }

  return {
    unlockData,
    unlockValidation,
    unlockSmsVerification,
    handleUnlockInputChange,
    handleUnlockSendSMS,
    handleUnlockVerifySMS,
    resetUnlockData,
    setUnlockSmsVerification
  }
}

