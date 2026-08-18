import { createContact } from '../actions'
import { SubmitButton } from '@/app/login/submit-button'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'

export default function AddContactPage() {
  const categories = [
    'Advocate','Seller','Buyer','Banker','Real Estate Agent','Developer','Land Owner','Other'
  ]

  const f = "input-glass"
  const l = "block text-xs font-semibold text-slate-400 mb-1.5 tracking-wide uppercase"

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 anim-fadeInUp">
        <Link href="/contacts" id="add-contact-back" className="btn-ghost p-2.5 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
            <User className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Add Contact</h1>
            <p className="text-xs text-slate-500">Fill in contact details below</p>
          </div>
        </div>
      </div>

      <form action={createContact} className="glass rounded-3xl p-6 space-y-7 anim-fadeInUp" style={{ animationDelay:'0.1s' }}>

        {/* Personal */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="glow-dot" />
            <p className="section-label mb-0">Personal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={l}>Full Name *</label>
              <input type="text" name="full_name" required className={f} placeholder="Enter full name" />
            </div>
            <div>
              <label className={l}>Category *</label>
              <select name="category" required className={f}>
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
              <label className={l}>Mobile Number</label>
              <input type="tel" name="mobile_number" className={f} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={l}>WhatsApp Number</label>
              <input type="tel" name="whatsapp_number" className={f} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={l}>Company / Office</label>
              <input type="text" name="company_name" className={f} placeholder="Company name" />
            </div>
            <div>
              <label className={l}>Designation</label>
              <input type="text" name="designation" className={f} placeholder="e.g. Manager" />
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Location */}
        <section>
          <p className="section-label">Location</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={l}>District</label>
              <input type="text" name="district" className={f} placeholder="District" />
            </div>
            <div>
              <label className={l}>Taluk</label>
              <input type="text" name="taluk" className={f} placeholder="Taluk" />
            </div>
            <div>
              <label className={l}>Village</label>
              <input type="text" name="village" className={f} placeholder="Village" />
            </div>
            <div>
              <label className={l}>Area</label>
              <input type="text" name="area" className={f} placeholder="Area" />
            </div>
            <div className="md:col-span-2">
              <label className={l}>Address</label>
              <textarea name="address" rows={2} className={f} placeholder="Full address…" />
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Notes */}
        <section>
          <p className="section-label">Additional Info</p>
          <div>
            <label className={l}>Notes</label>
            <textarea name="notes" rows={3} className={f} placeholder="Any additional notes…" />
          </div>
        </section>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40"
             style={{ background:'rgba(11,17,32,0.85)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-3xl mx-auto">
            <SubmitButton
              id="add-contact-submit"
              className="btn-primary w-full py-3.5 rounded-2xl text-base"
              pendingText="Saving Contact…"
            >
              Save Contact
            </SubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}
