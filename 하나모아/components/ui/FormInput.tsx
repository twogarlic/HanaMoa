"use client"

interface FormInputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = ""
}: FormInputProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        className="text-[14px] leading-[20px] text-[#333333]"
        style={{ fontFamily: "Hana2-Medium, sans-serif" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full h-[48px] px-4 border rounded-[8px] text-[16px] leading-[23px] text-[#333333] bg-white transition-colors ${
          error 
            ? "border-[#E53E3E]" 
            : "border-[#E5E5E5] focus:border-[#03856E] focus:outline-none"
        }`}
        style={{ fontFamily: "Hana2-Regular, sans-serif" }}
      />
      {error && (
        <p
          className="text-[12px] leading-[18px] text-[#E53E3E]"
          style={{ fontFamily: "Hana2-Regular, sans-serif" }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
