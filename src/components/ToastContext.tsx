'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const lastToastRef = useRef<{ message: string; timestamp: number }>({ message: '', timestamp: 0 })

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const now = Date.now()
      // Prevent spamming identical toasts within 1.5s
      if (lastToastRef.current.message === message && now - lastToastRef.current.timestamp < 1500) {
        return
      }
      lastToastRef.current = { message, timestamp: now }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const newToast: ToastItem = { id, type, title, message, duration }

      setToasts((prev) => [...prev.slice(-4), newToast])

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }
    },
    [dismiss]
  )

  const success = useCallback((message: string, title?: string) => {
    showToast({ type: 'success', title: title || 'Success', message })
  }, [showToast])

  const error = useCallback((message: string, title?: string) => {
    showToast({ type: 'error', title: title || 'Error', message, duration: 6000 })
  }, [showToast])

  const warning = useCallback((message: string, title?: string) => {
    showToast({ type: 'warning', title: title || 'Warning', message })
  }, [showToast])

  const info = useCallback((message: string, title?: string) => {
    showToast({ type: 'info', title: title || 'Notice', message })
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
        aria-live="polite"
        role="region"
      >
        {toasts.map((toast) => {
          const typeStyles: Record<ToastType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
            success: {
              bg: 'rgba(6, 78, 59, 0.9)',
              border: 'rgba(52, 211, 153, 0.4)',
              text: 'text-emerald-200',
              icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
            },
            error: {
              bg: 'rgba(127, 29, 29, 0.9)',
              border: 'rgba(248, 113, 113, 0.4)',
              text: 'text-red-200',
              icon: <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />,
            },
            warning: {
              bg: 'rgba(120, 53, 15, 0.9)',
              border: 'rgba(251, 191, 36, 0.4)',
              text: 'text-amber-200',
              icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
            },
            info: {
              bg: 'rgba(12, 74, 110, 0.9)',
              border: 'rgba(56, 189, 248, 0.4)',
              text: 'text-cyan-200',
              icon: <Info className="h-5 w-5 text-cyan-400 shrink-0" />,
            },
          }

          const style = typeStyles[toast.type]

          return (
            <div
              key={toast.id}
              className="pointer-events-auto p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-start gap-3 anim-toast-in transition-all"
              style={{
                background: style.bg,
                borderColor: style.border,
              }}
            >
              <div className="mt-0.5">{style.icon}</div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className={`text-xs sm:text-sm font-medium ${style.text} leading-relaxed`}>
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
