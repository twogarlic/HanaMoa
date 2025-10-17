import { z } from 'zod'

export const loginSchema = z.object({
  id: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요')
})

export const signupSchema = z.object({
  userId: z.string().min(4, '아이디는 최소 4자 이상이어야 합니다').optional(),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다').optional(),
  name: z.string().min(1, '이름을 입력해주세요'),
  ssn: z.string().min(1, '주민등록번호를 입력해주세요'),
  phone: z.string().min(1, '전화번호를 입력해주세요'),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional().nullable(),
  provider: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
  selectedAccount: z.string().optional(),
  accountPassword: z.string().optional()
}).refine(
  (data: any) => data.provider || (data.userId && data.password),
  { message: '아이디와 비밀번호를 입력하거나 소셜 로그인을 사용해주세요' }
).refine(
  (data: any) => !data.provider || data.providerId,
  { message: '소셜 로그인 정보가 올바르지 않습니다' }
)

export const changePasswordSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
  newPassword: z.string().min(8, '새 비밀번호는 최소 8자 이상이어야 합니다')
})

export const resetPasswordSchema = z.object({
  userId: z.string().min(1, '아이디를 입력해주세요'),
  ssn: z.string().min(1, '주민등록번호를 입력해주세요'),
  newPassword: z.string().min(8, '새 비밀번호는 최소 8자 이상이어야 합니다')
})

export const findIdSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  ssn: z.string().min(1, '주민등록번호를 입력해주세요'),
  phone: z.string().min(1, '전화번호를 입력해주세요')
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const socialLoginSchema = z.object({
  provider: z.string().min(1, '소셜 로그인 제공자가 필요합니다'),
  providerId: z.string().min(1, '소셜 로그인 ID가 필요합니다'),
  email: z.string().email('유효한 이메일을 입력해주세요').optional(),
  name: z.string().optional()
})

export type SocialLoginInput = z.infer<typeof socialLoginSchema>
export type FindIdInput = z.infer<typeof findIdSchema>

