"use client"

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}

export function CustomButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = ""
}: ButtonProps) {
  const baseClasses = "rounded-[8px] font-medium transition-colors cursor-pointer border"
  
  const variantClasses = {
    primary: "bg-[#03856E] text-white border-[#03856E] hover:bg-[#005044]",
    secondary: "bg-[#F8F9FA] text-[#666666] border-[#E5E5E5] hover:bg-[#E5E5E5]",
    outline: "bg-white text-[#03856E] border-[#03856E] hover:bg-[#03856E] hover:text-white"
  }
  
  const sizeClasses = {
    sm: "h-[40px] px-3 text-[14px] leading-[20px]",
    md: "h-[48px] px-4 text-[16px] leading-[23px]",
    lg: "h-[56px] px-6 text-[18px] leading-[26px]"
  }
  
  const disabledClasses = disabled 
    ? "bg-[#A0AEC0] text-white border-[#A0AEC0] cursor-not-allowed hover:bg-[#A0AEC0]" 
    : ""

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      style={{ fontFamily: "Hana2-Medium, sans-serif" }}
    >
      {children}
    </button>
  )
}