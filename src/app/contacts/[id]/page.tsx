import { createClient } from '@/utils/supabase/server'
import { updateContact, deleteContact } from '../actions'
import { SubmitButton } from '@/app/login/submit-button'
import { DeleteButton } from '@/components/DeleteButton'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Phone, User } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { id } = await params
  const { success } = await searchParams
  const supabase = await createClient()

  const { data: contact, error } = await supabase.from('field_contacts').select('*').eq('id', id).single()
  if (error || !contact) notFound()

  const categories = [
    'Advocate','Seller','Buyer','Banker','Real Estate Agent','Developer','Land Owner','Other'
  ]

  const updateContactWithId = updateContact.bind(null, id)
  const deleteContactWithId = deleteContact.bind(null, id)

  const fieldClass = "input-glass"
  const labelClass = "block text-xs font-semibold text-slate-400 mb-1.5 tracking-wide uppercase"

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 anim-fadeInUp">
        <div className="flex items-center gap-3">
          <Link href="/contacts" id="contact-back-btn" className="btn-ghost p-2.5 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
              {contact.full_name.slice(0,1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">{contact.full_name}</h1>
              <p className="text-xs text-slate-500">{contact.category}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {contact.mobile_number && (
            <a
              href={`tel:${contact.mobile_number}`}
              id="contact-call-btn"
              className="p-2.5 rounded-xl transition-all hover:scale-110"
              style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#34d399' }}
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
          {contact.whatsapp_number && (
            <a
              href={`https://wa.me/${contact.whatsapp_number.replace(/\D/g, '')}`}
              id="contact-whatsapp-btn"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl transition-all hover:scale-110"
              style={{ background:'rgba(37,211,102,0.12)', border:'1px solid rgba(37,211,102,0.25)', color:'#4ade80' }}
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="mb-5 p-4 rounded-2xl text-sm font-medium flex items-center gap-2 anim-fadeIn"
             style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}>
          ✓ Contact saved successfully.
        </div>
      )}

      <form action={updateContactWithId} className="glass rounded-3xl p-6 space-y-7 anim-fadeInUp" style={{ animationDelay:'0.1s' }}>

        {/* Personal */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-emerald-400" />
            <p className="section-label mb-0">Personal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" name="full_name" defaultValue={contact.full_name} required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select name="category" defaultValue={contact.category} required className={fieldClass}>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Contact & Work */}
        <section>
          <p className="section-label">Contact &amp; Work</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mobile Number</label>
              <input type="tel" name="mobile_number" defaultValue={contact.mobile_number || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input type="tel" name="whatsapp_number" defaultValue={contact.whatsapp_number || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Company / Office</label>
              <input type="text" name="company_name" defaultValue={contact.company_name || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Designation</label>
              <input type="text" name="designation" defaultValue={contact.designation || ''} className={fieldClass} />
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Location */}
        <section>
          <p className="section-label">Location</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>District</label>
              <input type="text" name="district" defaultValue={contact.district || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Taluk</label>
              <input type="text" name="taluk" defaultValue={contact.taluk || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Village</label>
              <input type="text" name="village" defaultValue={contact.village || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Area</label>
              <input type="text" name="area" defaultValue={contact.area || ''} className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <textarea name="address" defaultValue={contact.address || ''} rows={2} className={fieldClass} />
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Notes */}
        <section>
          <p className="section-label">Additional Info</p>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" defaultValue={contact.notes || ''} rows={3} className={fieldClass} />
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Last updated: {new Date(contact.updated_at).toLocaleString()}
          </p>
        </section>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 md:bottom-0 md:relative md:mt-4 p-4 md:p-0 flex gap-3 z-40"
             style={{ background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-full max-w-3xl mx-auto flex gap-3">
            <DeleteButton
              action={deleteContactWithId}
              label="Delete"
              confirmMessage="Delete this contact permanently? This cannot be undone."
            />
            <SubmitButton
              id="contact-save-btn"
              className="btn-primary flex-1 py-3.5 rounded-2xl text-base"
              pendingText="Saving…"
            >
              Save Changes
            </SubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}
