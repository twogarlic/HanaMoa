"use client"

interface SocialLoginButtonProps {
  provider: "kakao" | "naver"
  onClick: () => void
  disabled?: boolean
}

export function SocialLoginButton({ provider, onClick, disabled = false }: SocialLoginButtonProps) {
  if (provider === "kakao") {
    return (
      <button 
        onClick={onClick}
        disabled={disabled}
        className="w-full h-[45px] bg-[#FEE500] rounded-[6px] flex items-center justify-center px-[14px] hover:bg-[#FDD835] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <img src="/images/kakao.svg" alt="kakao" className="w-[18px] h-[18px]" />
          <span
            className="text-[15px] leading-[150%] font-semibold text-black/85"
            style={{
              fontFamily:
                "'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            카카오 로그인
          </span>
        </div>
      </button>
    )
  }

  if (provider === "naver") {
    return (
      <button 
        onClick={onClick}
        disabled={disabled}
        className="w-full h-[45px] bg-[#03C75A] rounded-[4px] flex items-center justify-center px-[35px] hover:bg-[#02B150] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-[15px]">
          <img src="/images/naver.svg" alt="naver" className="w-[16px] h-[16px]" />
          <span
            className="text-[15px] leading-[150%] font-semibold text-white"
            style={{
              fontFamily:
                "'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            네이버 로그인
          </span>
        </div>
      </button>
    )
  }

  return null
}
