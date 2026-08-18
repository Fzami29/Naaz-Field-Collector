'use client'

import { useTransition, useState } from 'react'
import { Trash2, AlertCircle } from 'lucide-react'
import { DeleteConfirmModal } from './DeleteConfirmModal'

interface DeleteButtonProps {
  action: () => Promise<void>
  label?: string
  confirmMessage?: string
  itemName?: string
  itemType?: string
  onDeleted?: () => void
}

export function DeleteButton({
  action,
  label = 'Delete',
  itemName = 'this item',
  itemType = 'record',
  onDeleted,
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleConfirm = () => {
    setErrorMsg(null)
    startTransition(async () => {
      try {
        await action()
        setIsModalOpen(false)
        if (onDeleted) onDeleted()
      } catch (err: unknown) {
        console.error('Delete operation failed:', err)
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to delete record. Please check permissions and try again.'
        setErrorMsg(message)
      }
    })
  }

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={isPending}
          className="btn-danger flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>{isPending ? 'Deleting...' : label}</span>
        </button>
        {errorMsg && (
          <span className="text-xs text-red-400 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" /> {errorMsg}
          </span>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={isModalOpen}
        itemName={itemName}
        itemType={itemType}
        isDeleting={isPending}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
}
