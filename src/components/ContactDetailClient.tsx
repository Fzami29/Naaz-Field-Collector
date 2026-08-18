'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Building,
  MapPin,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Check,
  Loader2,
  Briefcase,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Contact } from './ContactsListClient'
import { ContactMeeting, MeetingModal } from './MeetingModal'
import { ContactFollowup, FollowupModal } from './FollowupModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { useToast } from './ToastContext'
import { createClient } from '@/utils/supabase/client'

interface ContactDetailClientProps {
  contact: Contact
  initialMeetings: ContactMeeting[]
  initialFollowups: ContactFollowup[]
  successBanner?: boolean
}

export function ContactDetailClient({
  contact: initialContact,
  initialMeetings,
  initialFollowups,
  successBanner = false,
}: ContactDetailClientProps) {
  const router = useRouter()
  const toast = useToast()

  const [contact, setContact] = useState<Contact>(initialContact)
  const [meetings, setMeetings] = useState<ContactMeeting[]>(initialMeetings)
  const [followups, setFollowups] = useState<ContactFollowup[]>(initialFollowups)

  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'followups' | 'edit'>('overview')
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit form state
  const [editLoading, setEditLoading] = useState(false)
  const [fullName, setFullName] = useState(contact.full_name)
  const [category, setCategory] = useState(contact.category)
  const [mobileNumber, setMobileNumber] = useState(contact.mobile_number || '')
  const [whatsappNumber, setWhatsappNumber] = useState(contact.whatsapp_number || '')
  const [companyName, setCompanyName] = useState(contact.company_name || '')
  const [designation, setDesignation] = useState(contact.designation || '')
  const [district, setDistrict] = useState(contact.district || '')
  const [taluk, setTaluk] = useState(contact.taluk || '')
  const [village, setVillage] = useState(contact.village || '')
  const [area, setArea] = useState(contact.area || '')
  const [address, setAddress] = useState(contact.address || '')
  const [notes, setNotes] = useState(contact.notes || '')

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

  // ── Handle Edit Contact Submission ─────────────────────────────────────────
  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !category.trim()) {
      toast.error('Full Name and Category are required.')
      return
    }

    setEditLoading(true)
    const supabase = createClient()

    try {
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

      const { data, error } = await supabase
        .from('field_contacts')
        .update(payload)
        .eq('id', contact.id)
        .select()
        .single()

      if (error) throw error

      setContact(data as Contact)
      toast.success('Contact details updated successfully!')
      setActiveTab('overview')
    } catch (err: unknown) {
      console.error('Update error:', err)
      const msg = err instanceof Error ? err.message : 'Failed to update contact.'
      toast.error(msg)
    } finally {
      setEditLoading(false)
    }
  }

  // ── Delete Contact ─────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.from('field_contacts').delete().eq('id', contact.id)
      if (error) throw error

      toast.success('Contact permanently deleted.')
      router.push('/contacts?deleted=true')
    } catch (err: unknown) {
      console.error('Delete error:', err)
      const msg = err instanceof Error ? err.message : 'Failed to delete contact.'
      toast.error(msg)
      setIsDeleting(false)
    }
  }

  // ── Follow-up Toggle Status ────────────────────────────────────────────────
  const toggleFollowupStatus = async (followup: ContactFollowup) => {
    const nextStatus = followup.status === 'Completed' ? 'Pending' : 'Completed'
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('contact_followups')
        .update({
          status: nextStatus,
          completed_at: nextStatus === 'Completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', followup.id)

      if (error) throw error

      setFollowups((prev) =>
        prev.map((f) =>
          f.id === followup.id
            ? { ...f, status: nextStatus, completed_at: nextStatus === 'Completed' ? new Date().toISOString() : null }
            : f
        )
      )
      toast.success(`Follow-up marked as ${nextStatus}`)
    } catch (err: unknown) {
      console.error('Toggle status error:', err)
      toast.error('Failed to update follow-up status.')
    }
  }

  // Split follow-ups into pending and completed
  const pendingFollowups = followups.filter((f) => f.status !== 'Completed')
  const completedFollowups = followups.filter((f) => f.status === 'Completed')

  const fieldClass = 'input-glass'
  const labelClass = 'block text-xs font-semibold text-slate-400 mb-1.5 tracking-wide uppercase'

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 anim-fadeInUp">
        <div className="flex items-center gap-3">
          <Link href="/contacts" id="contact-back-btn" className="btn-ghost p-2.5 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-lg font-bold text-emerald-400 shrink-0">
              {contact.full_name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{contact.full_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="badge badge-emerald text-xs">{contact.category}</span>
                {contact.company_name && (
                  <span className="text-xs text-slate-400 truncate max-w-[180px]">
                    · {contact.company_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="flex items-center gap-2">
          {contact.mobile_number && (
            <a
              href={`tel:${contact.mobile_number}`}
              id="contact-call-btn"
              className="btn-primary px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
              title="Call Contact"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call</span>
            </a>
          )}
          {contact.whatsapp_number && (
            <a
              href={`https://wa.me/${contact.whatsapp_number.replace(/\D/g, '')}`}
              id="contact-whatsapp-btn"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 4px 16px rgba(22,163,74,0.4)',
              }}
              title="WhatsApp Message"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn-danger p-2.5 rounded-xl"
            title="Delete Contact"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/[0.08] pb-3 overflow-x-auto scrollbar-none anim-fadeInUp">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'meetings', label: `Meetings (${meetings.length})`, icon: Calendar },
          { id: 'followups', label: `Follow-ups (${pendingFollowups.length})`, icon: Clock },
          { id: 'edit', label: 'Edit Info', icon: Edit2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as any)}
            className={`filter-pill text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 ${
              activeTab === id ? 'active font-semibold' : ''
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 anim-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Contact Details Card */}
            <div className="glass rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <User className="h-4 w-4 text-emerald-400" />
                <h3 className="font-semibold text-white text-sm">Contact Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Full Name</span>
                  <span className="text-slate-200 font-medium">{contact.full_name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Category</span>
                  <span className="badge badge-emerald text-xs mt-0.5">{contact.category}</span>
                </div>
                {contact.mobile_number && (
                  <div>
                    <span className="text-xs text-slate-500 block">Mobile Number</span>
                    <a
                      href={`tel:${contact.mobile_number}`}
                      className="text-emerald-400 hover:underline font-medium"
                    >
                      {contact.mobile_number}
                    </a>
                  </div>
                )}
                {contact.whatsapp_number && (
                  <div>
                    <span className="text-xs text-slate-500 block">WhatsApp Number</span>
                    <a
                      href={`https://wa.me/${contact.whatsapp_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline font-medium"
                    >
                      {contact.whatsapp_number}
                    </a>
                  </div>
                )}
                {contact.company_name && (
                  <div>
                    <span className="text-xs text-slate-500 block">Company / Office</span>
                    <span className="text-slate-200 font-medium">{contact.company_name}</span>
                  </div>
                )}
                {contact.designation && (
                  <div>
                    <span className="text-xs text-slate-500 block">Designation</span>
                    <span className="text-slate-200 font-medium">{contact.designation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Details Card */}
            <div className="glass rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <MapPin className="h-4 w-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-sm">Location Details</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">District</span>
                  <span className="text-slate-200 font-medium">{contact.district || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Taluk</span>
                  <span className="text-slate-200 font-medium">{contact.taluk || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Village</span>
                  <span className="text-slate-200 font-medium">{contact.village || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Area / Locality</span>
                  <span className="text-slate-200 font-medium">{contact.area || 'Not specified'}</span>
                </div>
                {contact.address && (
                  <div>
                    <span className="text-xs text-slate-500 block">Full Address</span>
                    <span className="text-slate-300 text-xs leading-relaxed block whitespace-pre-line">
                      {contact.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {contact.notes && (
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 mb-3">
                <FileText className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Field Notes</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {contact.notes}
              </p>
            </div>
          )}

          {/* Activity Summary / Quick Jump */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setActiveTab('meetings')}
              className="glass rounded-2xl p-5 cursor-pointer hover:border-emerald-500/40 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Recorded Meetings</h4>
                  <p className="text-xs text-slate-400">{meetings.length} meeting log{meetings.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>

            <div
              onClick={() => setActiveTab('followups')}
              className="glass rounded-2xl p-5 cursor-pointer hover:border-cyan-500/40 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Follow-up Tasks</h4>
                  <p className="text-xs text-slate-400">
                    {pendingFollowups.length} pending, {completedFollowups.length} done
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </div>
      )}

      {/* 2. MEETINGS TIMELINE TAB */}
      {activeTab === 'meetings' && (
        <div className="space-y-6 anim-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Meeting History</h3>
              <p className="text-xs text-slate-400">Chronological timeline of in-person & field meetings</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMeetingModalOpen(true)}
              className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Add Meeting</span>
            </button>
          </div>

          {meetings.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center border border-white/[0.08]">
              <Calendar className="h-10 w-10 text-slate-500 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base mb-1">No meetings logged yet</h4>
              <p className="text-xs text-slate-400 mb-5">
                Record your field interactions, discussions, and outcomes with {contact.full_name}.
              </p>
              <button
                type="button"
                onClick={() => setIsMeetingModalOpen(true)}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Record First Meeting</span>
              </button>
            </div>
          ) : (
            /* Timeline Container */
            <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-500/30 space-y-6">
              {meetings.map((m) => (
                <div key={m.id} className="relative anim-fadeInUp group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-900 shadow-md group-hover:scale-125 transition-transform" />

                  {/* Card Content */}
                  <div className="glass rounded-2xl p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-emerald text-[11px] font-bold">
                          {m.meeting_type}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(m.meeting_date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <span className="badge badge-gray text-[10px]">{m.status}</span>
                    </div>

                    <p className="text-sm font-medium text-slate-100 leading-relaxed">
                      {m.summary}
                    </p>

                    {m.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{m.location}</span>
                      </div>
                    )}

                    {m.outcome && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                        <span className="font-semibold block mb-0.5">Outcome / Action:</span>
                        {m.outcome}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. FOLLOW-UPS TIMELINE TAB */}
      {activeTab === 'followups' && (
        <div className="space-y-6 anim-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Follow-up Tasks</h3>
              <p className="text-xs text-slate-400">Track reminders, scheduled calls, and pending tasks</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFollowupModalOpen(true)}
              className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                boxShadow: '0 4px 16px rgba(6,182,212,0.4)',
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Follow-up</span>
            </button>
          </div>

          {followups.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center border border-white/[0.08]">
              <Clock className="h-10 w-10 text-slate-500 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base mb-1">No follow-ups scheduled</h4>
              <p className="text-xs text-slate-400 mb-5">
                Keep on top of field leads by setting reminders for title checks, calls, and follow-ups.
              </p>
              <button
                type="button"
                onClick={() => setIsFollowupModalOpen(true)}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                }}
              >
                <Plus className="h-4 w-4" />
                <span>Schedule First Follow-up</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Follow-ups */}
              {pendingFollowups.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Pending Tasks ({pendingFollowups.length})</span>
                  </h4>
                  <div className="space-y-3">
                    {pendingFollowups.map((f) => (
                      <div
                        key={f.id}
                        className="glass rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-cyan-500/40 transition-all"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleFollowupStatus(f)}
                            className="mt-0.5 w-5 h-5 rounded-lg border-2 border-cyan-400/60 hover:bg-cyan-500/20 flex items-center justify-center transition-all shrink-0"
                            title="Mark as Completed"
                          >
                            <span className="sr-only">Toggle</span>
                          </button>
                          <div className="space-y-1">
                            <h5 className="font-semibold text-white text-sm">{f.title}</h5>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                              <span>
                                Due: {new Date(f.due_date).toLocaleDateString()} {new Date(f.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span
                                className={`badge text-[10px] ${
                                  f.priority === 'Urgent'
                                    ? 'badge-red'
                                    : f.priority === 'High'
                                    ? 'badge-yellow'
                                    : 'badge-blue'
                                }`}
                              >
                                {f.priority} Priority
                              </span>
                            </div>
                            {f.notes && (
                              <p className="text-xs text-slate-300 mt-1">{f.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Follow-ups */}
              {completedFollowups.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Completed Tasks ({completedFollowups.length})</span>
                  </h4>
                  <div className="space-y-2 opacity-75">
                    {completedFollowups.map((f) => (
                      <div
                        key={f.id}
                        className="glass rounded-xl p-3.5 flex items-center justify-between gap-3 bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleFollowupStatus(f)}
                            className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0"
                            title="Re-open Task"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs text-slate-400 line-through">{f.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {f.completed_at ? new Date(f.completed_at).toLocaleDateString() : 'Done'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. EDIT FORM TAB */}
      {activeTab === 'edit' && (
        <form onSubmit={handleUpdateContact} className="glass rounded-3xl p-6 sm:p-7 space-y-6 anim-fadeIn">
          <div>
            <span className="section-label">Personal Details</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={fieldClass}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="divider-glass" />

          <div>
            <span className="section-label">Contact & Work</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <label className={labelClass}>Mobile Number</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Company / Office</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          <hr className="divider-glass" />

          <div>
            <span className="section-label">Location</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <label className={labelClass}>District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Taluk</label>
                <input
                  type="text"
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Full Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          <hr className="divider-glass" />

          <div>
            <span className="section-label">Notes</span>
            <div className="mt-2">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="btn-secondary px-5 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="btn-primary px-6 py-2.5 flex items-center gap-2"
            >
              {editLoading ? (
                <>
                  <Loader2 className="h-4 w-4 anim-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Modals */}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        contactId={contact.id}
        contactName={contact.full_name}
        onClose={() => setIsMeetingModalOpen(false)}
        onSuccess={(newMeeting) => {
          setMeetings((prev) => [newMeeting, ...prev])
        }}
      />

      <FollowupModal
        isOpen={isFollowupModalOpen}
        contactId={contact.id}
        contactName={contact.full_name}
        onClose={() => setIsFollowupModalOpen(false)}
        onSuccess={(newFollowup) => {
          setFollowups((prev) => [newFollowup, ...prev])
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        itemName={contact.full_name}
        itemType="contact"
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
