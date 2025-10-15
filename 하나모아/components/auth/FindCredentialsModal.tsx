import { FindData, FindValidation, FindSmsVerification, FindResult } from '../../hooks/useFindCredentials'
import styles from '../styles/LoginPage.module.css'

interface FindCredentialsModalProps {
  isOpen: boolean
  findType: string
  findStep: number
  findData: FindData
  findValidation: FindValidation
  findSmsVerification: FindSmsVerification
  findResult: FindResult
  onInputChange: (field: string, value: string) => void
  onFindId: () => void
  onFindPasswordSendSMS: () => void
  onFindPasswordVerifySMS: () => void
  onClose: () => void
  onTypeSelect: (type: string) => void
  onStepChange: (step: number) => void
}

export function FindCredentialsModal({
  isOpen,
  findType,
  findStep,
  findData,
  findValidation,
  findSmsVerification,
  findResult,
  onInputChange,
  onFindId,
  onFindPasswordSendSMS,
  onFindPasswordVerifySMS,
  onClose,
  onTypeSelect,
  onStepChange
}: FindCredentialsModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {findStep === 1 ? (
          <div className={styles.spaceY6}>
            <div className={styles.textCenterModal}>
              <h2 className={styles.modalTitle20}>
                아이디/비밀번호 찾기
              </h2>
              <p className={styles.modalDescription14}>
                찾으실 정보를 선택해주세요.
              </p>
            </div>

            <div className={styles.spaceY3}>
              <button
                onClick={() => {
                  onTypeSelect('id')
                  onStepChange(2)
                }}
                className={styles.modalButtonFullHeight}
              >
                아이디 찾기
              </button>
              <button
                onClick={() => {
                  onTypeSelect('password')
                  onStepChange(2)
                }}
                className={styles.modalButtonFullHeight}
              >
                비밀번호 재설정
              </button>
            </div>

            <button
              onClick={onClose}
              className={styles.buttonMedium}
            >
              취소
            </button>
          </div>
        ) : findStep === 2 ? (
          <div className={styles.spaceY6}>
            <div className={styles.textCenterModal}>
              <h2 className={styles.modalTitle20}>
                {findType === 'id' ? '아이디 찾기' : '비밀번호 찾기'}
              </h2>
              <p className={styles.modalDescription14}>
                {findType === 'id' 
                  ? '가입 시 입력한 정보를 입력해주세요.' 
                  : '아이디와 전화번호를 입력해주세요.'}
              </p>
            </div>

            <div className={styles.spaceY4}>
              {findType === 'id' ? (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="이름을 입력해주세요"
                      value={findData.name}
                      onChange={(e) => onInputChange('name', e.target.value)}
                      className={styles.modalInputFull}
                    />
                  </div>

                  <div>
                    <div className={styles.flexSpaceX2}>
                      <input
                        type="text"
                        placeholder="주민번호 앞자리"
                        value={findData.ssn1}
                        onChange={(e) => onInputChange('ssn1', e.target.value)}
                        maxLength={6}
                        className={styles.unlockSsnInput2}
                      />
                      <span className={styles.ssnDashText}>-</span>
                      <input
                        type="password"
                        placeholder="주민번호 뒷자리"
                        value={findData.ssn2}
                        onChange={(e) => onInputChange('ssn2', e.target.value)}
                        maxLength={7}
                        className={styles.unlockSsnInput2}
                      />
                    </div>
                    {findValidation.ssnMessage && (
                      <p className={styles.text10RedLeft}>
                        {findValidation.ssnMessage}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={findData.phone}
                      onChange={(e) => {
                        const inputValue = e.target.value.replace(/\D/g, '').slice(0, 11)
                        onInputChange('phone', inputValue)
                      }}
                      maxLength={13}
                      className={styles.modalInputFull}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="아이디를 입력해주세요"
                      value={findData.userId}
                      onChange={(e) => onInputChange('userId', e.target.value)}
                      className={styles.modalInputFull}
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={findData.phone}
                      onChange={(e) => {
                        const inputValue = e.target.value.replace(/\D/g, '').slice(0, 11)
                        onInputChange('phone', inputValue)
                      }}
                      maxLength={13}
                      className={styles.modalInputFull}
                    />
                  </div>
                </>
              )}
            </div>

            <div className={styles.flexSpaceX3}>
              <button
                onClick={() => onStepChange(1)}
                className={styles.modalButtonSecondaryFull}
              >
                이전
              </button>
              <button
                onClick={findType === 'id' ? onFindId : onFindPasswordSendSMS}
                disabled={findType === 'id' 
                  ? (!findValidation.nameValid || !findValidation.ssnValid || !findValidation.phoneValid)
                  : (!findValidation.userIdValid || !findValidation.phoneValid)
                }
                className={`${styles.modalButtonPrimary} ${
                  (findType === 'id' 
                    ? (findValidation.nameValid && findValidation.ssnValid && findValidation.phoneValid)
                    : (findValidation.userIdValid && findValidation.phoneValid))
                    ? styles.modalButtonPrimaryEnabled
                    : styles.modalButtonPrimaryDisabled
                }`}
              >
                {findType === 'id' ? '아이디 찾기' : '인증번호 발송'}
              </button>
            </div>
          </div>
        ) : findStep === 3 ? (
          <div className={styles.spaceY6}>
            <div className={styles.textCenterModal}>
              <h2 className={styles.modalTitle20}>
                SMS 인증
              </h2>
              <p className={styles.modalDescription14}>
                {findData.phone}로<br />발송된 인증번호를 입력해주세요.
              </p>
            </div>

            <div className={styles.spaceY4}>
              <div>
                <input
                  type="text"
                  placeholder="인증번호 6자리를 입력해주세요"
                  value={findData.verificationCode}
                  onChange={(e) => onInputChange('verificationCode', e.target.value)}
                  maxLength={6}
                  className={styles.modalInputFull}
                />
                <div className={styles.flexJustifyBetween}>
                  <div>
                    {findSmsVerification.sendMessage && (
                      <p className={findSmsVerification.sendMessage.includes('발송되었습니다') ? styles.successText : styles.errorText}>
                        {findSmsVerification.sendMessage}
                      </p>
                    )}
                    {findSmsVerification.verifyMessage && (
                      <p className={findSmsVerification.verifyMessage.includes('완료되었습니다') ? styles.successText : styles.errorText}>
                        {findSmsVerification.verifyMessage}
                      </p>
                    )}
                  </div>
                  {findSmsVerification.isTimerActive && findSmsVerification.timer > 0 && (
                    <p className={styles.text12Green}>
                      {Math.floor(findSmsVerification.timer / 60)}:{String(findSmsVerification.timer % 60).padStart(2, '0')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.flexSpaceX3}>
              <button
                onClick={() => onStepChange(2)}
                className={styles.modalButtonSecondaryFull}
              >
                이전
              </button>
              <button
                onClick={onFindPasswordVerifySMS}
                disabled={!findValidation.verificationCodeValid}
                className={`${styles.modalButtonPrimary} ${
                  findValidation.verificationCodeValid
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
              <div className={styles.iconContainer60}>
                <img src="/images/ic_check.gif" alt="완료" className={styles.iconImage60} />
              </div>
              <h2 className={styles.text18BlackMB}>
                {findType === 'id' ? '아이디 찾기 완료' : '비밀번호 재설정 완료'}
              </h2>
              <p className={styles.text14GrayMB}>
                {findResult.message}
              </p>
              {findType === 'id' && findResult.foundUserId && (
                <div className={styles.resultCardBg}>
                  <p className={styles.text12Gray}>
                    찾은 아이디
                  </p>
                  <p className={styles.text16BlackBold}>
                    {findResult.foundUserId}
                  </p>
                </div>
              )}
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

