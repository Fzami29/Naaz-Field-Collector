'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title?: string
  itemName: string
  itemType?: string
  isDeleting?: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
}

export function DeleteConfirmModal({
  isOpen,
  title = 'Delete Confirmation',
  itemName,
  itemType = 'contact',
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [internalLoading, setInternalLoading] = useState(false)

  if (!isOpen) return null

  const loading = isDeleting || internalLoading

  const handleConfirm = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 anim-modal-backdrop"
      style={{ background: 'rgba(5, 10, 20, 0.75)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-strong w-full max-w-md rounded-3xl p-6 sm:p-7 anim-modal-content border border-red-500/25 shadow-2xl relative"
        style={{
          background: 'linear-gradient(165deg, rgba(30, 20, 25, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl transition-colors hover:bg-white/10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-5 text-red-400">
          <AlertTriangle className="h-7 w-7" />
        </div>

        {/* Title & Info */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
          Are you sure you want to permanently delete this {itemType}?
        </p>

        {/* Target record highlight */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold shrink-0">
            {itemName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate">{itemName}</p>
            <p className="text-xs text-slate-500">This action cannot be undone in Supabase.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1 sm:flex-initial px-5 py-2.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="btn-danger flex-1 sm:flex-initial px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 anim-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete {itemType}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
