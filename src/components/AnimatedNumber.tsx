'use client'

import { useEffect, useState, useRef } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, duration = 320, className = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)

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
      // Fast ease out quad
      const easeOut = 1 - Math.pow(1 - progress, 2)
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
