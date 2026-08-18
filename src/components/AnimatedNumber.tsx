'use client'

import { useEffect, useState, useRef } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, duration = 600, className = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValueRef = useRef(0)

  useEffect(() => {
    const startValue = prevValueRef.current
    const endValue = value
    if (startValue === endValue) {
      setDisplayValue(endValue)
      return
    }

    const startTime = performance.now()

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (endValue - startValue) * easeOut)
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      } else {
        prevValueRef.current = endValue
        setDisplayValue(endValue)
      }
    }

    requestAnimationFrame(updateCounter)
  }, [value, duration])

  return <span className={className}>{displayValue}</span>
}
