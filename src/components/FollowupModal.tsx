'use client'

import { useState } from 'react'
import { X, Clock, Loader2, Plus, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from './ToastContext'

export interface ContactFollowup {
  id: string
  contact_id: string
  created_by: string
  due_date: string
  title: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | string
  notes: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

interface FollowupModalProps {
  isOpen: boolean
  contactId: string
  contactName: string
  onClose: () => void
  onSuccess: (followup: ContactFollowup) => void
}

export function FollowupModal({
  isOpen,
  contactId,
  contactName,
  onClose,
  onSuccess,
}: FollowupModalProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  // Default tomorrow 10:00 AM
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  const [dueDate, setDueDate] = useState(tomorrow.toISOString().slice(0, 16))
  const [priority, setPriority] = useState('Medium')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Follow-up title is required.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser()
      if (authErr || !user) {
        throw new Error('Please log in again.')
      }

      const payload = {
        contact_id: contactId,
        created_by: user.id,
        title: title.trim(),
        due_date: new Date(dueDate).toISOString(),
        priority,
        status: 'Pending',
        notes: notes.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('contact_followups')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      toast.success('Follow-up scheduled successfully in Supabase!')
      onSuccess(data as ContactFollowup)
      onClose()
    } catch (err: unknown) {
      console.error('Follow-up save error:', err)
      const msg = err instanceof Error ? err.message : 'Failed to schedule follow-up.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = 'input-glass'
  const labelClass = 'block text-xs font-semibold text-slate-400 mb-1 tracking-wide uppercase'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 anim-modal-backdrop overflow-y-auto"
      style={{ background: 'rgba(5, 10, 20, 0.8)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-strong w-full max-w-lg rounded-3xl p-6 sm:p-7 anim-modal-content border border-cyan-500/25 shadow-2xl relative my-auto"
        style={{
          background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.96) 0%, rgba(12, 74, 110, 0.25) 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Schedule Follow-up</h2>
              <p className="text-xs text-slate-400">For {contactName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-white p-2 rounded-xl transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Follow-up Task / Objective *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call to verify RTC mutation status"
              className={fieldClass}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelClass}>Due Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={fieldClass}
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={fieldClass}
                disabled={loading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Details / Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Specific points to check, reminder notes..."
              className={fieldClass}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary px-5 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2.5 flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                boxShadow: '0 4px 18px rgba(6, 182, 212, 0.4)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 anim-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Schedule Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
