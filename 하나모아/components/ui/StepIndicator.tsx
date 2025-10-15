"use client"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex justify-center items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            index + 1 <= currentStep ? "bg-[#03856E]" : "bg-[#E5E5E5]"
          }`}
        />
      ))}
    </div>
  )
}
