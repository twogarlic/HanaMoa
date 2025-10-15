import { SocialLoginButton } from '../ui/SocialLoginButton'
import styles from '../styles/LoginPage.module.css'

interface SocialLoginProps {
  isKakaoReady: boolean
  onKakaoLogin: () => void
  onNaverLogin: () => void
}

export function SocialLogin({ isKakaoReady, onKakaoLogin, onNaverLogin }: SocialLoginProps) {
  return (
    <div className={styles.simpleLoginWrapper}>
      <div className={styles.simpleLoginLeft}>
        <div className={styles.simpleLoginImage}>
          <img src="/images/ic_login.png" alt="간편 로그인" className={styles.simpleLoginImageImg} />
        </div>
        <p className={styles.simpleLoginDescription}>
          소셜 계정을 통해
          <br />
          하나모아에 로그인합니다.
        </p>
      </div>

      <div className={styles.simpleLoginRight}>
        <div className={styles.socialButtonWrapper}>
          <SocialLoginButton
            provider="kakao"
            onClick={onKakaoLogin}
            disabled={!isKakaoReady}
          />
        </div>
        <div className={styles.socialButtonWrapper}>
          <SocialLoginButton
            provider="naver"
            onClick={onNaverLogin}
          />
        </div>
      </div>
    </div>
  )
}

