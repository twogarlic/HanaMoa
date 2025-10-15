import { SignupData, SignupStep2Data, SignupValidation, Step2Validation, PhoneVerification, IdCheckStatus } from '../../hooks/useSignup'
import styles from '../styles/LoginPage.module.css'

interface SignupProps {
  step: number
  signupData: SignupData
  signupStep2Data: SignupStep2Data
  validation: SignupValidation
  step2Validation: Step2Validation
  phoneVerification: PhoneVerification
  idCheckStatus: IdCheckStatus
  availableAccounts: any[]
  selectedAccount: string
  accountPassword: string
  confirmAccountPassword: string
  accountPasswordValid: boolean
  hanaPointInfo: any
  isLinkingPoint: boolean
  onInputChange: (field: string, value: string) => void
  onStep2InputChange: (field: string, value: string) => void
  onIdCheck: () => void
  onSendVerificationCode: () => void
  onVerifyCode: () => void
  onAccountSelect: (accountId: string) => void
  onAccountPasswordChange: (password: string) => void
  onConfirmAccountPasswordChange: (password: string) => void
  validateAccountPassword: (password: string) => boolean
  validateConfirmAccountPassword: (password: string) => boolean
  onNext: () => void
  onBack?: () => void
}

export function Signup({
  step,
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
  hanaPointInfo,
  isLinkingPoint,
  onInputChange,
  onStep2InputChange,
  onIdCheck,
  onSendVerificationCode,
  onVerifyCode,
  onAccountSelect,
  onAccountPasswordChange,
  onConfirmAccountPasswordChange,
  validateAccountPassword,
  validateConfirmAccountPassword,
  onNext,
  onBack
}: SignupProps) {
  if (step === 1) {
    return (
      <div className={styles.spaceY7}>
        <div className={styles.relativeContainer}>
          <div className={styles.relativeContainerSmall}>
            <input
              type="text"
              placeholder="아이디 입력"
              value={signupData.id}
              onChange={(e) => onInputChange('id', e.target.value)}
              className={styles.idInput}
            />
            <button
              onClick={onIdCheck}
              disabled={!validation.idValid || idCheckStatus.isLoading || (idCheckStatus.isChecked && idCheckStatus.isAvailable)}
              className={`${styles.idCheckButton} ${
                validation.idValid && !idCheckStatus.isLoading && !(idCheckStatus.isChecked && idCheckStatus.isAvailable)
                  ? styles.idCheckButtonEnabled
                  : styles.idCheckButtonDisabled
              }`}
            >
              {idCheckStatus.isLoading ? '확인중' : (idCheckStatus.isChecked && idCheckStatus.isAvailable) ? '확인완료' : '중복확인'}
            </button>
          </div>
          <div className={styles.absoluteErrorContainer}>
            {validation.idMessage && (
              <p className={styles.errorText}>
                {validation.idMessage}
              </p>
            )}
            {idCheckStatus.isChecked && (
              <p className={idCheckStatus.isAvailable ? styles.successText : styles.errorText}>
                {idCheckStatus.isAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'}
              </p>
            )}
          </div>
        </div>

        <div className={styles.relativeContainer}>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={signupData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            className={styles.accountPasswordInput}
          />
          <div className={styles.absoluteErrorContainer}>
            {validation.passwordMessage && (
              <p className={styles.errorText}>
                {validation.passwordMessage}
              </p>
            )}
          </div>
        </div>

        <div className={styles.relativeContainer}>
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={signupData.confirmPassword}
            onChange={(e) => onInputChange('confirmPassword', e.target.value)}
            className={styles.accountPasswordInput}
          />
          <div className={styles.absoluteErrorContainer}>
            {validation.confirmMessage && (
              <p className={styles.errorText}>
                {validation.confirmMessage}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!(signupData.id && signupData.password && signupData.confirmPassword && validation.idValid && validation.passwordValid && validation.passwordMatch && idCheckStatus.isChecked && idCheckStatus.isAvailable)}
          className={`${styles.buttonLargeWithCondition} ${
            signupData.id && signupData.password && signupData.confirmPassword && validation.idValid && validation.passwordValid && validation.passwordMatch && idCheckStatus.isChecked && idCheckStatus.isAvailable
              ? styles.buttonLargeWithConditionEnabled
              : styles.buttonLargeWithConditionDisabled
          }`}
        >
          다음
        </button>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className={styles.spaceY7}>
        <div className={styles.relativeContainer}>
          <input
            type="text"
            placeholder="이름을 입력해주세요"
            value={signupStep2Data.name}
            onChange={(e) => onStep2InputChange('name', e.target.value)}
            className={styles.accountPasswordInput}
          />
        </div>

        <div className={styles.relativeContainer}>
          <div className={styles.flexSpaceX2}>
            <input
              type="text"
              placeholder="주민번호 앞자리"
              value={signupStep2Data.ssn1}
              onChange={(e) => onStep2InputChange('ssn1', e.target.value)}
              maxLength={6}
              className={styles.ssnInput1}
            />
            <span className={styles.ssnDashText}>-</span>
            <input
              type="password"
              placeholder="주민번호 뒷자리"
              value={signupStep2Data.ssn2}
              onChange={(e) => onStep2InputChange('ssn2', e.target.value)}
              maxLength={7}
              className={styles.ssnInput2}
            />
          </div>
          <div className={styles.absoluteErrorContainer}>
            {step2Validation.ssnMessage && (
              <p className={styles.errorText}>
                {step2Validation.ssnMessage}
              </p>
            )}
          </div>
        </div>

        <div className={styles.relativeContainer}>
          <div className={styles.relativeContainerSmall}>
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={signupStep2Data.phone}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/\D/g, '').slice(0, 11)
                onStep2InputChange('phone', inputValue)
              }}
              disabled={phoneVerification.isVerified}
              maxLength={13}
              className={`${styles.phoneInputWithButton} ${phoneVerification.isVerified ? styles.phoneInputWithButtonDisabled : ''}`}
            />
            <button
              type="button"
              onClick={onSendVerificationCode}
              disabled={!(step2Validation.nameValid && step2Validation.ssnValid && step2Validation.phoneValid) || phoneVerification.isVerified}
              className={`${styles.phoneButtonSmall} ${
                step2Validation.nameValid && step2Validation.ssnValid && step2Validation.phoneValid && !phoneVerification.isVerified
                  ? styles.phoneButtonSmallEnabled
                  : styles.phoneButtonSmallDisabled
              }`}
            >
              {phoneVerification.isVerified ? '인증완료' : '인증번호'}
            </button>
          </div>
          <div className={styles.absoluteErrorContainer}>
            {step2Validation.phoneMessage && (
              <p className={styles.errorText}>
                {step2Validation.phoneMessage}
              </p>
            )}
            {phoneVerification.sendMessage && (
              <p className={phoneVerification.sendMessage.includes('발송되었습니다') || phoneVerification.sendMessage.includes('완료되었습니다') ? styles.successText : styles.errorText}>
                {phoneVerification.sendMessage}
              </p>
            )}
          </div>
        </div>

        {phoneVerification.isCodeSent && !phoneVerification.isVerified && (
          <div className={styles.relativeContainer}>
            <div className={styles.relativeContainerSmall}>
              <input
                type="text"
                placeholder="인증번호 6자리를 입력해주세요"
                value={signupStep2Data.verificationCode}
                onChange={(e) => onStep2InputChange('verificationCode', e.target.value)}
                maxLength={6}
                className={styles.verificationInputWithButton}
              />
              <button
                type="button"
                onClick={onVerifyCode}
                disabled={!step2Validation.verificationCodeValid}
                className={`${styles.verificationButtonSmall} ${
                  step2Validation.verificationCodeValid
                    ? styles.verificationButtonSmallEnabled
                    : styles.verificationButtonSmallDisabled
                }`}
              >
                확인
              </button>
            </div>
            <div className={styles.absoluteErrorContainerFlex}>
              {step2Validation.verificationMessage && (
                <p className={styles.errorText}>
                  {step2Validation.verificationMessage}
                </p>
              )}
              {phoneVerification.verifyMessage && (
                <p className={phoneVerification.verifyMessage.includes('완료되었습니다') ? styles.successText : styles.errorText}>
                  {phoneVerification.verifyMessage}
                </p>
              )}
              {phoneVerification.isTimerActive && phoneVerification.timer > 0 && (
                <p className={styles.timerTextSmall}>
                  {Math.floor(phoneVerification.timer / 60)}:{String(phoneVerification.timer % 60).padStart(2, '0')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className={styles.spaceY20}>
        <div className={styles.textLeft}>
          <h3 className={styles.descriptionText}>
            {availableAccounts.length > 0 && (availableAccounts[0] as any).isNew 
              ? '새 계좌를 생성하시겠습니까?' 
              : '어느 계좌를 연결하시겠습니까?'}
          </h3>
        </div>

        <div className={styles.spaceY10}>
          {availableAccounts.map((account) => (
            <div 
              key={(account as any).id}
              className={`${styles.accountCard} ${
                selectedAccount === (account as any).accountNumber 
                  ? styles.accountCardSelected
                  : styles.accountCardUnselected
              }`}
              onClick={() => onAccountSelect((account as any).accountNumber)}
            >
              <div className={styles.relativeFullHeight}>
                <div className={styles.flexItemsCenter}>
                  <div className={styles.width18Height16}>
                    <img src="/images/ic_small_logo.svg" alt="logo" className={styles.accountLogoImg} />
                  </div>
                  <span className={styles.subtitleText}>
                    {(account as any).accountName}
                    {(account as any).isNew && (
                      <span className={styles.newBadge}>신규</span>
                    )}
                  </span>
                </div>
                <div className={styles.marginLeft26}>
                  <span className={styles.subtitleTextGray}>
                    {(account as any).accountNumber}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!selectedAccount}
          className={`${styles.buttonLargeWithCondition} ${
            selectedAccount
              ? styles.buttonLargeWithConditionEnabled
              : styles.buttonLargeWithConditionDisabled
          }`}
        >
          다음
        </button>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className={styles.spaceY7}>
        <div className={styles.textLeft}>
          <h3 className={styles.text18Gray}>
            {(availableAccounts.find(acc => (acc as any).accountNumber === selectedAccount) as any)?.isNew 
              ? '계좌 비밀번호를 설정해주세요' 
              : '계좌 비밀번호를 입력해주세요'}
          </h3>
        </div>

        <div className={styles.relativeContainer}>
          <input
            type="password"
            placeholder="계좌 비밀번호 4자리"
            value={accountPassword}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4)
              onAccountPasswordChange(value)
              validateAccountPassword(value)
            }}
            maxLength={4}
            className={styles.accountPasswordInput}
          />
          <div className={styles.absoluteErrorContainer}>
            {!accountPasswordValid && accountPassword && (
              <p className={styles.errorText}>
                4자리 숫자를 입력해주세요.
              </p>
            )}
          </div>
        </div>

        <div className={styles.relativeContainer}>
          <input
            type="password"
            placeholder="계좌 비밀번호 확인"
            value={confirmAccountPassword}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4)
              onConfirmAccountPasswordChange(value)
            }}
            maxLength={4}
            className={styles.accountPasswordInput}
          />
          <div className={styles.absoluteErrorContainer}>
            {confirmAccountPassword && !validateConfirmAccountPassword(confirmAccountPassword) && (
              <p className={styles.errorText}>
                계좌 비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!accountPasswordValid || !validateConfirmAccountPassword(confirmAccountPassword)}
          className={`${styles.buttonLargeWithCondition} ${
            accountPasswordValid && validateConfirmAccountPassword(confirmAccountPassword)
              ? styles.buttonLargeWithConditionEnabled
              : styles.buttonLargeWithConditionDisabled
          }`}
        >
          {(availableAccounts.find(acc => (acc as any).accountNumber === selectedAccount) as any)?.isNew 
            ? '계좌 생성하기' 
            : '계좌 연결하기'}
        </button>
      </div>
    )
  }

  if (step === 5) {
    return (
      <div className={styles.spaceY20}>
        <div className={styles.textLeft}>
          <h3 className={styles.descriptionText}>
            {isLinkingPoint 
              ? '하나머니를 확인 중입니다...'
              : hanaPointInfo?.isNewAccount 
                ? '앗! 하나머니 계정이 없으시네요'
                : '하나머니 계정을 발견했습니다!'}
          </h3>
        </div>

        {!isLinkingPoint && hanaPointInfo && (
          <div className={styles.modalContentResponsive}>
            <div className={styles.hanaPointCardInner}>
              <div className={styles.relativeFullHeight}>
                <div className={styles.flexItemsCenter}>
                  <div className={styles.width20Height18}>
                    <img src="/images/ic_hanamoney.png" alt="하나머니" className={styles.hanaPointLogoImg} />
                  </div>
                  <span className={styles.text14Black}>
                    하나머니
                    {hanaPointInfo.isNewAccount && (
                      <span className={styles.newBadgeGreen}>신규</span>
                    )}
                  </span>
                </div>
                <div className={styles.marginLeft22}>
                  <span className={styles.text13Gray}>
                    {hanaPointInfo.data.balance?.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
            <p className={styles.timerTextCenter}>
              {hanaPointInfo.message}
            </p>
          </div>
        )}

        {isLinkingPoint && (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
        )}

        <button
          onClick={onNext}
          disabled={isLinkingPoint}
          className={`${styles.buttonLargeWithCondition} ${
            isLinkingPoint
              ? styles.buttonLargeWithConditionDisabled
              : styles.buttonLargeWithConditionEnabled
          }`}
        >
          {isLinkingPoint ? '확인 중...' : '다음'}
        </button>
      </div>
    )
  }

  return (
    <div className={styles.fullWidthFlex}>
      <div className={styles.flex1Column}>
        <div className={styles.imageContainer}>
          <img 
            src="/images/ic_account_success.png" 
            alt="회원가입 완료" 
            className={styles.imageContainerImg} 
          />
        </div>
        <p className={styles.descriptionTextSmall}>
          계정이 생성되었습니다.
          <br />
          하나모아에 로그인해보세요!
        </p>
      </div>

      <div className={styles.flex1ColumnCenter}>
        <div className={styles.flexColumnCenter}>
          <div className={styles.textCenter}>
            <p className={styles.text20Black}>
              계정이 생성되었습니다.
            </p>
            <h2 className={styles.text18Gray31}>
              하나모아에 로그인해보세요!
            </h2>
          </div>

          <button
            onClick={onNext}
            className={styles.buttonGreenLarge}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

