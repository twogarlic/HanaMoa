"use client"

import { Check } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  selectedAssetType: string | null
  selectedAmount: number
  selectedAssetUnit: string | null
  selectedBranch: string
  selectedDate: Date | null
  selectedTime: string | null
  isMobile: boolean
  onStepClick: (step: number) => void
}

export default function StepIndicator({
  currentStep,
  selectedAssetType,
  selectedAmount,
  selectedAssetUnit,
  selectedBranch,
  selectedDate,
  selectedTime,
  isMobile,
  onStepClick
}: StepIndicatorProps) {
  const isStepClickable = (step: number) => {
    if (step < currentStep) return true
    
    if (step === currentStep + 1) {
      if (step === 2) {
        return selectedAssetType && (['usd', 'eur', 'jpy', 'cny'].includes(selectedAssetType) ? selectedAmount > 0 : selectedAssetUnit)
      } else if (step === 3) {
        return selectedBranch
      } else if (step === 4) {
        return selectedDate && selectedTime
      } else if (step === 5) {
        return true
      }
    }
    
    return false
  }

  return (
    <div className={`flex items-center justify-center ${isMobile ? 'flex-row gap-4 mb-6' : 'flex-col pl-8 h-full mt-28 ml-8'}`}>
      <div className={`flex items-center ${isMobile ? 'gap-4' : 'flex-col space-y-2'}`}>
        {[1, 2, 3, 4, 5].map((step) => {
          const isClickable = isStepClickable(step)
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step < currentStep
                    ? 'bg-[#03856E] text-white cursor-pointer hover:bg-[#026B5A]'
                    : step === currentStep
                    ? 'bg-[#03856E] text-white'
                    : isClickable
                    ? 'bg-[#E9ECEF] text-[#666666] cursor-pointer hover:bg-[#D1D5DB]'
                    : 'bg-[#E9ECEF] text-[#666666]'
                }`}
                onClick={() => isClickable && onStepClick(step)}
              >
                {step < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step
                )}
              </div>
              {step < 5 && !isMobile && (
                <div className={`w-1 h-8 mt-1 ${
                  step < currentStep ? 'bg-[#03856E]' : 'bg-[#E9ECEF]'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
