'use client'

import { useTransition, useState } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'

interface DeleteButtonProps {
  action: () => Promise<void>
  label?: string
  confirmMessage?: string
  onDeleted?: () => void
}

export function DeleteButton({
  action,
  label = 'Delete',
  confirmMessage = 'Are you sure you want to delete this contact? This action cannot be undone.',
  onDeleted
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleClick() {
    setErrorMsg(null)
    if (!window.confirm(confirmMessage)) return

    startTransition(async () => {
      try {
        await action()
        if (onDeleted) onDeleted()
      } catch (err: unknown) {
        console.error('Delete operation failed:', err)
        const message = err instanceof Error ? err.message : 'Failed to delete record. Please check permissions and try again.'
        setErrorMsg(message)
        alert(`Error: ${message}`)
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="btn-danger"
      >
        <Trash2 className="h-4 w-4" />
        {isPending ? 'Deleting...' : label}
      </button>
      {errorMsg && (
        <span className="text-xs text-red-400 flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" /> {errorMsg}
        </span>
      )}
    </div>
  )
}
