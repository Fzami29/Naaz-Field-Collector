'use client'

import { useState } from 'react'
import { X, Calendar, Loader2, Plus, Clock, MapPin, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from './ToastContext'

export interface ContactMeeting {
  id: string
  contact_id: string
  created_by: string
  meeting_date: string
  meeting_type: string
  status: string
  location: string | null
  summary: string
  outcome: string | null
  created_at: string
  updated_at: string
}

interface MeetingModalProps {
  isOpen: boolean
  contactId: string
  contactName: string
  onClose: () => void
  onSuccess: (meeting: ContactMeeting) => void
}

export function MeetingModal({
  isOpen,
  contactId,
  contactName,
  onClose,
  onSuccess,
}: MeetingModalProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const [summary, setSummary] = useState('')
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 16))
  const [meetingType, setMeetingType] = useState('In-Person')
  const [status, setStatus] = useState('Completed')
  const [location, setLocation] = useState('')
  const [outcome, setOutcome] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!summary.trim()) {
      toast.error('Meeting summary is required.')
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
        summary: summary.trim(),
        meeting_date: new Date(meetingDate).toISOString(),
        meeting_type: meetingType,
        status,
        location: location.trim() || null,
        outcome: outcome.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('contact_meetings')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      toast.success('Meeting recorded successfully in Supabase!')
      onSuccess(data as ContactMeeting)
      onClose()
    } catch (err: unknown) {
      console.error('Meeting save error:', err)
      const msg = err instanceof Error ? err.message : 'Failed to record meeting in Supabase.'
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
        className="glass-strong w-full max-w-lg rounded-3xl p-6 sm:p-7 anim-modal-content border border-emerald-500/25 shadow-2xl relative my-auto"
        style={{
          background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.96) 0%, rgba(6, 78, 59, 0.25) 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Record Meeting</h2>
              <p className="text-xs text-slate-400">With {contactName}</p>
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
            <label className={labelClass}>Meeting Summary / Discussion *</label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What was discussed in this meeting? (e.g. land valuation, title deed review)"
              className={fieldClass}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelClass}>Meeting Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className={fieldClass}
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClass}>Meeting Type</label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
                className={fieldClass}
                disabled={loading}
              >
                <option value="In-Person">In-Person</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Site Visit">Site Visit</option>
                <option value="WhatsApp / Video">WhatsApp / Video</option>
                <option value="Office Meeting">Office Meeting</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={fieldClass}
                disabled={loading}
              >
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Location / Place</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sub-Registrar Office"
                className={fieldClass}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Outcome / Next Action</label>
            <input
              type="text"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g. Agreed to share survey sketch tomorrow"
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
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 anim-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Save Meeting</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
