import bcrypt from 'bcryptjs'
import { userRepository } from '@/lib/repositories/user.repository'
import { accountRepository } from '@/lib/repositories/account.repository'
import { generateToken } from '@/lib/jwt'
import { ValidationError, AuthenticationError, ConflictError } from '@/lib/api/utils/errors'
import type { LoginInput, SignupInput, SocialLoginInput } from '@/lib/api/validators/auth.schema'

export class AuthService {
  async socialLogin(data: SocialLoginInput) {
    const { provider, providerId, email, name } = data

    const user = await userRepository.findByProviderInfo(provider, providerId)

    if (user) {
      const token = generateToken({
        userId: user.userId,
        id: user.id,
        email: user.email,
        name: user.name
      })

      return {
        isExistingUser: true,
        token,
        user: {
          id: user.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          isPublicProfile: user.isPublicProfile,
          isPostsPublic: user.isPostsPublic,
          notificationsEnabled: user.notificationsEnabled,
          accounts: user.accounts?.map((account: any) => ({
            id: account.id,
            accountNumber: account.accountNumber,
            accountName: account.accountName,
            balance: account.balance
          }))
        }
      }
    }

    return {
      isExistingUser: false,
      socialUserInfo: {
        provider,
        providerId,
        email,
        name
      }
    }
  }

  async login(data: LoginInput) {
    const user = await userRepository.findByUserId(data.id)

    if (!user) {
      throw new AuthenticationError('아이디 또는 비밀번호가 올바르지 않습니다')
    }

    const currentFailCount = user.loginFailCount || 0
    const isLocked = user.isLocked || false
    const lockedUntil = user.lockedUntil

    if (isLocked && lockedUntil && new Date() < lockedUntil) {
      throw new AuthenticationError('계정이 잠금되어 있습니다. 본인인증을 통해 잠금을 해제해주세요')
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      const newFailCount = currentFailCount + 1
      const shouldLock = newFailCount >= 5

      if (shouldLock) {
        const lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await userRepository.lockAccount(data.id, lockUntil)
      } else {
        await userRepository.incrementLoginFailCount(data.id)
      }

      throw new AuthenticationError('아이디 또는 비밀번호가 올바르지 않습니다')
    }

    if (currentFailCount > 0 || isLocked) {
      await userRepository.unlockAccount(data.id)
    }

    const token = generateToken({
      userId: user.userId,
      id: user.id,
      email: user.email,
      name: user.name
    })

    return {
      token,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isPublicProfile: user.isPublicProfile,
        isPostsPublic: user.isPostsPublic,
        notificationsEnabled: user.notificationsEnabled,
        accounts: user.accounts.map((account: any) => ({
          id: account.id,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          balance: account.balance
        }))
      }
    }
  }

  async signup(data: SignupInput) {
    const existingUser = await this.checkExistingUser(data)
    
    if (existingUser) {
      throw new ConflictError(existingUser.error)
    }

    let hashedPassword = null
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12)
    }

    const finalUserId = data.userId || `${data.provider}_${data.providerId}`

    const user = await userRepository.create({
      userId: finalUserId,
      password: hashedPassword || '',
      name: data.name,
      ssn: data.ssn,
      phone: data.phone,
      provider: data.provider || null,
      providerId: data.providerId || null,
      email: data.email || null
    })

    let userAccounts = []

    if (data.selectedAccount && data.accountPassword) {
      const account = await this.handleAccountSelection(
        user.id,
        data.selectedAccount,
        data.accountPassword
      )
      userAccounts.push(account)
    }

    return {
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        provider: user.provider
      },
      accounts: userAccounts
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new ValidationError('사용자를 찾을 수 없습니다')
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new AuthenticationError('현재 비밀번호가 올바르지 않습니다')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await userRepository.update(userId, {
      password: hashedPassword
    })
  }

  async resetPassword(userId: string, ssn: string, newPassword: string) {
    const user = await userRepository.findByUserId(userId)

    if (!user || user.ssn !== ssn) {
      throw new ValidationError('사용자 정보가 일치하지 않습니다')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await userRepository.update(user.id, {
      password: hashedPassword
    })
  }

  async findUserId(name: string, ssn: string, phone: string) {
    const user = await userRepository.findBySSN(ssn)

    if (!user || user.name !== name || user.phone !== phone) {
      throw new ValidationError('일치하는 사용자를 찾을 수 없습니다')
    }

    return {
      userId: user.userId,
      maskedUserId: this.maskUserId(user.userId)
    }
  }

  private async checkExistingUser(data: SignupInput) {
    if (data.provider && data.providerId) {
      const existingUser = await userRepository.findByProviderInfo(data.provider, data.providerId)
      if (existingUser) {
        return { error: '이미 가입된 소셜 계정입니다' }
      }
    }

    if (data.userId) {
      const existingUser = await userRepository.findByUserId(data.userId)
      if (existingUser) {
        return { error: '이미 사용 중인 아이디입니다' }
      }
    }

    const existingBySSN = await userRepository.findBySSN(data.ssn)
    if (existingBySSN) {
      return { error: '이미 등록된 주민등록번호입니다' }
    }

    const existingByPhone = await userRepository.findByPhone(data.phone)
    if (existingByPhone) {
      return { error: '이미 등록된 전화번호입니다' }
    }

    return null
  }

  private async handleAccountSelection(userId: string, selectedAccount: string, accountPassword: string) {
    const isNewAccount = selectedAccount.includes('282-')

    if (isNewAccount) {
      let finalAccountNumber = selectedAccount

      const existingAccount = await accountRepository.findByAccountNumber(selectedAccount)
      if (existingAccount) {
        finalAccountNumber = await this.generateUniqueAccountNumber()
      }

      const hashedAccountPassword = await bcrypt.hash(accountPassword, 12)

      return await accountRepository.create({
        accountNumber: finalAccountNumber,
        accountName: '하나모아',
        accountPassword: hashedAccountPassword,
        balance: Math.floor(Math.random() * 1000000) + 100000,
        user: {
          connect: { id: userId }
        }
      })
    } else {
      const account = await accountRepository.findByAccountNumber(selectedAccount)

      if (!account) {
        throw new ValidationError('선택한 계좌를 찾을 수 없습니다')
      }

      const isPasswordValid = await bcrypt.compare(accountPassword, account.accountPassword)
      if (!isPasswordValid) {
        throw new ValidationError('계좌 비밀번호가 일치하지 않습니다')
      }

      return await accountRepository.linkToUser(account.id, userId)
    }
  }

  private async generateUniqueAccountNumber(): Promise<string> {
    const bankCode = '282'
    
    while (true) {
      const randomNumber1 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      const randomNumber2 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      const accountNumber = `${bankCode}-${randomNumber1}-${randomNumber2}`

      const existing = await accountRepository.findByAccountNumber(accountNumber)
      if (!existing) {
        return accountNumber
      }
    }
  }

  private maskUserId(userId: string): string {
    if (userId.length <= 4) return userId
    const visibleLength = Math.ceil(userId.length / 2)
    return userId.substring(0, visibleLength) + '*'.repeat(userId.length - visibleLength)
  }
}

export const authService = new AuthService()

