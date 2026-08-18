'use client'

import { useState, useEffect } from 'react'
import { X, User, Loader2, Plus, Check } from 'lucide-react'
import { Contact } from './ContactsListClient'
import { createClient } from '@/utils/supabase/client'
import { useToast } from './ToastContext'

interface ContactModalProps {
  isOpen: boolean
  contact?: Contact | null
  onClose: () => void
  onSuccess: (savedContact: Contact, isNew: boolean) => void
}

export function ContactModal({ isOpen, contact, onClose, onSuccess }: ContactModalProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(contact)

  const [fullName, setFullName] = useState('')
  const [category, setCategory] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [designation, setDesignation] = useState('')
  const [district, setDistrict] = useState('')
  const [taluk, setTaluk] = useState('')
  const [village, setVillage] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const categories = [
    'Advocate',
    'Seller',
    'Buyer',
    'Banker',
    'Real Estate Agent',
    'Developer',
    'Land Owner',
    'Other',
  ]

  useEffect(() => {
    if (contact) {
      setFullName(contact.full_name || '')
      setCategory(contact.category || '')
      setMobileNumber(contact.mobile_number || '')
      setWhatsappNumber(contact.whatsapp_number || '')
      setCompanyName(contact.company_name || '')
      setDesignation(contact.designation || '')
      setDistrict(contact.district || '')
      setTaluk(contact.taluk || '')
      setVillage(contact.village || '')
      setArea(contact.area || '')
      setAddress(contact.address || '')
      setNotes(contact.notes || '')
    } else {
      setFullName('')
      setCategory('')
      setMobileNumber('')
      setWhatsappNumber('')
      setCompanyName('')
      setDesignation('')
      setDistrict('')
      setTaluk('')
      setVillage('')
      setArea('')
      setAddress('')
      setNotes('')
    }
  }, [contact, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      toast.error('Full Name is required.')
      return
    }
    if (!category.trim()) {
      toast.error('Please select a Category.')
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
        throw new Error('Authentication required. Please log in again.')
      }

      const payload = {
        full_name: fullName.trim(),
        category: category.trim(),
        mobile_number: mobileNumber.trim() || null,
        whatsapp_number: whatsappNumber.trim() || null,
        company_name: companyName.trim() || null,
        designation: designation.trim() || null,
        district: district.trim() || null,
        taluk: taluk.trim() || null,
        village: village.trim() || null,
        area: area.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      }

      let resultContact: Contact

      if (isEdit && contact) {
        const { data, error } = await supabase
          .from('field_contacts')
          .update(payload)
          .eq('id', contact.id)
          .select()
          .single()

        if (error) throw error
        resultContact = data as Contact
        toast.success(`Contact "${resultContact.full_name}" updated successfully!`)
        onSuccess(resultContact, false)
      } else {
        const { data, error } = await supabase
          .from('field_contacts')
          .insert({
            ...payload,
            created_by: user.id,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        resultContact = data as Contact
        toast.success(`Contact "${resultContact.full_name}" added successfully!`)
        onSuccess(resultContact, true)
      }

      onClose()
    } catch (err: unknown) {
      console.error('Contact save error:', err)
      const msg = err instanceof Error ? err.message : 'Failed to save contact to Supabase.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = 'input-glass'
  const labelClass = 'block text-xs font-semibold text-slate-400 mb-1 tracking-wide uppercase'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 anim-modal-backdrop overflow-y-auto"
      style={{ background: 'rgba(5, 10, 20, 0.8)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-strong w-full max-w-2xl rounded-3xl p-6 sm:p-8 anim-modal-content border border-white/[0.12] shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
        style={{
          background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.96) 0%, rgba(8, 14, 26, 0.98) 100%)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit ? 'Update details in real Supabase database' : 'Record field partner in database'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-white p-2 rounded-xl transition-colors hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 flex-1 space-y-5">
          {/* Personal Info */}
          <div>
            <span className="section-label">Personal Details</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={fieldClass}
                  disabled={loading}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <span className="section-label">Contact & Work</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
              <div>
                <label className={labelClass}>Mobile Number</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>Company / Office</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Realtors"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Advocate"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div>
            <span className="section-label">Location</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
              <div>
                <label className={labelClass}>District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>Taluk</label>
                <input
                  type="text"
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  placeholder="Taluk"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
              <div>
                <label className={labelClass}>Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area / Landmark"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Full Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete postal or landmark address"
                  className={fieldClass}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <span className="section-label">Additional Notes</span>
            <div className="mt-2">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key context, preferred calling hours, referral info..."
                className={fieldClass}
                disabled={loading}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3 shrink-0">
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
                  <span>{isEdit ? 'Updating Supabase...' : 'Saving to Supabase...'}</span>
                </>
              ) : (
                <>
                  {isEdit ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{isEdit ? 'Update Contact' : 'Save Contact'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
