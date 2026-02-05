import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRef, useEffect } from "react"

interface NumericDisplayProps {
  value: number | string
  className?: string
  isCountingDown?: boolean
  speed?: number // useful to catch small animation bugs (>1 is slower)
}

export function NumericDisplay({ value, className, isCountingDown = false, speed = 1 }: NumericDisplayProps) {
  const prevDigitsRef = useRef<string[]>([])
  const prevValueRef = useRef<number | string | null>(null)
  const versionCountersRef = useRef<number[]>([])
  const directionPerDigitRef = useRef<boolean[]>([])
  
  const digits = String(value).split("")
  
  if (prevValueRef.current !== value) {
    prevValueRef.current = value
    
    if (versionCountersRef.current.length === 0) {
      versionCountersRef.current = new Array(digits.length).fill(0)
      directionPerDigitRef.current = new Array(digits.length).fill(false)
      prevDigitsRef.current = [...digits]
    } else if (prevDigitsRef.current.length === digits.length) {
      let hasChanged = false
      digits.forEach((digit, i) => {
        if (hasChanged || prevDigitsRef.current[i] !== digit) {
          versionCountersRef.current[i] = (versionCountersRef.current[i] || 0) + 1
          directionPerDigitRef.current[i] = isCountingDown
          hasChanged = true
        }
      })
      prevDigitsRef.current = [...digits]
    } else {
      versionCountersRef.current = new Array(digits.length).fill(0).map((_, i) => 
        (versionCountersRef.current[i] || 0) + 1
      )
      directionPerDigitRef.current = new Array(digits.length).fill(isCountingDown)
      prevDigitsRef.current = [...digits]
    }
  }

  if (versionCountersRef.current.length < digits.length) {
    versionCountersRef.current = [
      ...versionCountersRef.current,
      ...new Array(digits.length - versionCountersRef.current.length).fill(0)
    ]
    directionPerDigitRef.current = [
      ...directionPerDigitRef.current,
      ...new Array(digits.length - directionPerDigitRef.current.length).fill(false)
    ]
  }

  return (
    <div className={cn("flex tabular-nums", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {digits.map((digit, i) => {
          const exitDirection = directionPerDigitRef.current[i] ?? false
          return (
            <motion.span
              key={`${i}-${versionCountersRef.current[i]}-${digit}`}
              initial={{ 
                y: isCountingDown ? -20 : 20, 
              opacity: 0, 
              filter: "blur(4px)", 
              scale: 0.8,
              zIndex: 10
            }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              filter: "blur(0px)", 
              scale: 1,
              zIndex: 10
            }}
            exit={{ 
              y: exitDirection ? 20 : -20, 
              opacity: 0, 
              filter: "blur(4px)", 
              scale: 0.6,
              zIndex: 1,
              transition: {
                duration: 0.15 * speed,
                ease: "easeIn"
              }
            }}
            transition={{
              type: "spring",
              stiffness: 400 / speed,
              damping: 18,
              mass: 0.8 * speed,
              delay: i * 0.025 * speed,
            }}
            className="inline-block min-w-[1ch] relative"
          >
            {digit}
          </motion.span>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
