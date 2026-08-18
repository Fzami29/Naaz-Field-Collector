import { createContact } from '../actions'
import { SubmitButton } from '@/app/login/submit-button'
import Link from 'next/link'
import { ArrowLeft, User, Sparkles } from 'lucide-react'

export default function AddContactPage() {
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

  const fieldClass = 'input-glass'
  const labelClass = 'block text-xs font-semibold text-slate-400 mb-1.5 tracking-wide uppercase'

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 anim-fadeInUp">
        <Link href="/contacts" id="add-contact-back" className="btn-ghost p-2.5 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Add New Contact</h1>
            <p className="text-xs text-slate-500">Record field partner into real Supabase database</p>
          </div>
        </div>
      </div>

      <form
        action={createContact}
        className="glass rounded-3xl p-6 sm:p-8 space-y-7 anim-fadeInUp"
        style={{ animationDelay: '0.1s' }}
      >
        {/* Personal */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="glow-dot" />
            <p className="section-label mb-0">Personal Details</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                name="full_name"
                required
                className={fieldClass}
                placeholder="e.g. Ramesh Kumar"
              />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select name="category" required className={fieldClass}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
              <input
                type="tel"
                name="mobile_number"
                className={fieldClass}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input
                type="tel"
                name="whatsapp_number"
                className={fieldClass}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className={labelClass}>Company / Office</label>
              <input
                type="text"
                name="company_name"
                className={fieldClass}
                placeholder="e.g. Apex Legal Associates"
              />
            </div>
            <div>
              <label className={labelClass}>Designation</label>
              <input
                type="text"
                name="designation"
                className={fieldClass}
                placeholder="e.g. Senior Advocate / Broker"
              />
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
              <input type="text" name="district" className={fieldClass} placeholder="District" />
            </div>
            <div>
              <label className={labelClass}>Taluk</label>
              <input type="text" name="taluk" className={fieldClass} placeholder="Taluk" />
            </div>
            <div>
              <label className={labelClass}>Village</label>
              <input type="text" name="village" className={fieldClass} placeholder="Village" />
            </div>
            <div>
              <label className={labelClass}>Area</label>
              <input type="text" name="area" className={fieldClass} placeholder="Area / Landmark" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Full Address</label>
              <textarea
                name="address"
                rows={2}
                className={fieldClass}
                placeholder="Full address…"
              />
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Notes */}
        <section>
          <p className="section-label">Additional Info</p>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              rows={3}
              className={fieldClass}
              placeholder="Any additional notes…"
            />
          </div>
        </section>

        {/* Sticky Footer */}
        <div
          className="fixed bottom-0 left-0 right-0 p-4 z-40"
          style={{
            background: 'rgba(11,17,32,0.9)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="max-w-3xl mx-auto flex gap-3">
            <Link href="/contacts" className="btn-secondary py-3.5 px-5 rounded-2xl">
              Cancel
            </Link>
            <SubmitButton
              id="add-contact-submit"
              className="btn-primary flex-1 py-3.5 rounded-2xl text-base shadow-xl"
              pendingText="Saving to Supabase…"
            >
              Save Contact
            </SubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}
