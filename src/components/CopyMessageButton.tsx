'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyMessageButton({ message }: { message: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy message:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="btn-ghost flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-emerald-400 border border-transparent hover:border-emerald-500/30 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}
