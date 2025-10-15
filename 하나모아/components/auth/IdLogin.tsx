import styles from '../styles/LoginPage.module.css'
import { LoginData, LoginValidation } from '../../hooks/useLogin'

interface IdLoginProps {
  loginData: LoginData
  loginValidation: LoginValidation
  onInputChange: (field: string, value: string) => void
  onLogin: () => void
  onSignupClick: () => void
  onFindCredentials: () => void
}

export function IdLogin({
  loginData,
  loginValidation,
  onInputChange,
  onLogin,
  onSignupClick,
  onFindCredentials
}: IdLoginProps) {
  return (
    <div className={styles.spaceY1}>
      <div className={styles.relativeContainer}>
        <div className={styles.relativeContainerSmall}>
          <input
            type="text"
            placeholder="아이디 입력"
            value={loginData.id}
            onChange={(e) => onInputChange('id', e.target.value)}
            className={styles.loginInput}
          />
        </div>
        <div className={styles.absoluteErrorContainer}>
          {loginValidation.idMessage && (
            <p className={styles.errorText}>
              {loginValidation.idMessage}
            </p>
          )}
        </div>
      </div>

      <div className={styles.relativeContainer}>
        <div className={styles.relativeContainerSmall}>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={loginData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            className={styles.loginInput}
          />
        </div>
        <div className={styles.absoluteErrorContainer}>
          {loginValidation.passwordMessage && (
            <p className={styles.errorText}>
              {loginValidation.passwordMessage}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onLogin}
        disabled={!loginValidation.idValid || !loginValidation.passwordValid}
        className={`${styles.loginButtonWithCondition} ${
          loginValidation.idValid && loginValidation.passwordValid
            ? styles.loginButtonWithConditionEnabled
            : styles.loginButtonWithConditionDisabled
        }`}
      >
        로그인
      </button>

      <div className={styles.linkContainer}>
        <p className={styles.linkText}>
          이용자 비밀번호 5회 연속 오류시
        </p>
        <p className={styles.linkTextGray}>
          이용자 아이디/비밀번호 로그인 이용이 제한됩니다.
        </p>
      </div>

      <div className={styles.linkContainerResponsive}>
        <div className={styles.linkItem} onClick={onFindCredentials}>
          <span className={styles.accountText}>
            아이디/비밀번호 찾기
          </span>
          <img src="/images/arrow.svg" alt="arrow" className={styles.linkArrow} />
        </div>
        <div className={styles.linkItem} onClick={onSignupClick}>
          <span className={styles.accountTextBlack}>
            회원가입
          </span>
          <img src="/images/arrow.svg" alt="arrow" className={styles.linkArrow} />
        </div>
      </div>
    </div>
  )
}

