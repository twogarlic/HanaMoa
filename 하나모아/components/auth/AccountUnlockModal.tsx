import { UnlockData, UnlockValidation, UnlockSmsVerification } from '../../hooks/useAccountUnlock'
import styles from '../styles/LoginPage.module.css'

interface AccountUnlockModalProps {
  isOpen: boolean
  step: number
  unlockData: UnlockData
  unlockValidation: UnlockValidation
  unlockSmsVerification: UnlockSmsVerification
  onInputChange: (field: string, value: string) => void
  onSendSMS: () => void
  onVerifySMS: () => void
  onClose: () => void
  onStepChange: (step: number) => void
}

export function AccountUnlockModal({
  isOpen,
  step,
  unlockData,
  unlockValidation,
  unlockSmsVerification,
  onInputChange,
  onSendSMS,
  onVerifySMS,
  onClose,
  onStepChange
}: AccountUnlockModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {step === 1 ? (
          <div className={styles.spaceY6}>
            <div className={styles.textCenterModal}>
              <h2 className={styles.modalTitle20}>
                계정 잠금 해제
              </h2>
              <p className={styles.modalDescription14}>
                본인인증을 위해 계정에 등록된<br />정보를 입력해주세요.
              </p>
            </div>

            <div className={styles.spaceY4}>
              <div>
                <input
                  type="text"
                  placeholder="이름을 입력해주세요"
                  value={unlockData.name}
                  onChange={(e) => onInputChange('name', e.target.value)}
                  className={styles.modalInputFull}
                />
              </div>

              <div>
                <div className={styles.flexSpaceX2}>
                  <input
                    type="text"
                    placeholder="주민번호 앞자리"
                    value={unlockData.ssn1}
                    onChange={(e) => onInputChange('ssn1', e.target.value)}
                    maxLength={6}
                    className={styles.unlockSsnInput1}
                  />
                  <span className={styles.text18Gray8F}>-</span>
                  <input
                    type="password"
                    placeholder="주민번호 뒷자리"
                    value={unlockData.ssn2}
                    onChange={(e) => onInputChange('ssn2', e.target.value)}
                    maxLength={7}
                    className={styles.unlockSsnInput1}
                  />
                </div>
                {unlockValidation.ssnMessage && (
                  <p className={styles.text10RedLeft}>
                    {unlockValidation.ssnMessage}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={unlockData.phone}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/\D/g, '').slice(0, 11)
                    onInputChange('phone', inputValue)
                  }}
                  maxLength={13}
                  className={styles.modalInputFull}
                />
              </div>
            </div>

            <div className={styles.flexSpaceX3}>
              <button
                onClick={onClose}
                className={styles.modalButtonSecondaryFull}
              >
                취소
              </button>
              <button
                onClick={onSendSMS}
                disabled={!unlockValidation.nameValid || !unlockValidation.ssnValid || !unlockValidation.phoneValid}
                className={`${styles.modalButtonPrimary} ${
                  unlockValidation.nameValid && unlockValidation.ssnValid && unlockValidation.phoneValid
                    ? styles.modalButtonPrimaryEnabled
                    : styles.modalButtonPrimaryDisabled
                }`}
              >
                인증번호 발송
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          <div className={styles.spaceY6}>
            <div className={styles.textCenterModal}>
              <h2 className={styles.modalTitle20}>
                SMS 인증
              </h2>
              <p className={styles.modalDescription14}>
                {unlockData.phone}로<br />발송된 인증번호를 입력해주세요.
              </p>
            </div>

            <div className={styles.spaceY4}>
              <div>
                <input
                  type="text"
                  placeholder="인증번호 6자리를 입력해주세요"
                  value={unlockData.verificationCode}
                  onChange={(e) => onInputChange('verificationCode', e.target.value)}
                  maxLength={6}
                  className={styles.modalInputFull}
                />
                <div className={styles.flexJustifyBetween}>
                  <div>
                    {unlockSmsVerification.sendMessage && (
                      <p className={unlockSmsVerification.sendMessage.includes('발송되었습니다') ? styles.successText : styles.errorText}>
                        {unlockSmsVerification.sendMessage}
                      </p>
                    )}
                    {unlockSmsVerification.verifyMessage && (
                      <p className={unlockSmsVerification.verifyMessage.includes('완료되었습니다') ? styles.successText : styles.errorText}>
                        {unlockSmsVerification.verifyMessage}
                      </p>
                    )}
                  </div>
                  {unlockSmsVerification.isTimerActive && unlockSmsVerification.timer > 0 && (
                    <p className={styles.text12Green}>
                      {Math.floor(unlockSmsVerification.timer / 60)}:{String(unlockSmsVerification.timer % 60).padStart(2, '0')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.flexSpaceX3}>
              <button
                onClick={() => onStepChange(1)}
                className={styles.modalButtonSecondaryFull}
              >
                이전
              </button>
              <button
                onClick={onVerifySMS}
                disabled={!unlockValidation.verificationCodeValid}
                className={`${styles.modalButtonPrimary} ${
                  unlockValidation.verificationCodeValid
                    ? styles.modalButtonPrimaryEnabled
                    : styles.modalButtonPrimaryDisabled
                }`}
              >
                인증 확인
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.spaceY6}>
            <div className={styles.textCenterModal}>
              <div className={styles.iconContainer80}>
                <img src="/images/ic_check.gif" alt="완료" className={styles.iconImage80} />
              </div>
              <h2 className={styles.modalTitle20}>
                계정 잠금 해제 완료
              </h2>
              <p className={styles.modalDescription14}>
                본인인증이 완료되어<br />계정 잠금이 해제되었습니다.
              </p>
            </div>

            <button
              onClick={onClose}
              className={styles.buttonMedium}
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

