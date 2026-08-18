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
      className="btn-danger"
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? 'Deleting...' : label}
    </button>
  )
}
