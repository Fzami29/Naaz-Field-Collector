'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  action: () => Promise<void>
  label?: string
  confirmMessage?: string
}

export function DeleteButton({
  action,
  label = 'Delete',
  confirmMessage = 'Are you sure you want to delete this record? This action cannot be undone.',
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(confirmMessage)) return
    startTransition(async () => {
      await action()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? 'Deleting...' : label}
    </button>
  )
}
