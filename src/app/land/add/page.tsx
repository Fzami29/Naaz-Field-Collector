import { createLand } from '../actions'
import { SubmitButton } from '@/app/login/submit-button'
import Link from 'next/link'
import { ArrowLeft, Map } from 'lucide-react'

export default function AddLandPage() {
  const listingTypes = ['For Sale','Wanted to Buy','For Lease','Other']
  const propertyTypes = ['Agricultural Land','Residential Land','Commercial Land','Site','House','Building','Other']
  const statuses = ['Available','Under Discussion','Sold','Not Available','Follow Up Required']

  const f = "input-glass"
  const l = "block text-xs font-semibold text-slate-400 mb-1.5 tracking-wide uppercase"

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 anim-fadeInUp">
        <Link href="/land" id="add-land-back" className="btn-ghost p-2.5 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.25)' }}>
            <Map className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Add Land Opportunity</h1>
            <p className="text-xs text-slate-500">Enter property details below</p>
          </div>
        </div>
      </div>

      <form action={createLand} className="glass rounded-3xl p-6 space-y-7 anim-fadeInUp" style={{ animationDelay:'0.1s' }}>

        {/* Opportunity */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="glow-dot" style={{ background:'#a78bfa', boxShadow:'0 0 10px 3px rgba(167,139,250,0.5)' }} />
            <p className="section-label mb-0" style={{ color:'#a78bfa' }}>Opportunity</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={l}>Listing Type *</label>
              <select name="listing_type" required className={f}>
                <option value="">Select listing type</option>
                {listingTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={l}>Property Type</label>
              <select name="property_type" className={f}>
                <option value="">Select property type</option>
                {propertyTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={l}>Status *</label>
              <select name="status" required className={f}>
                <option value="">Select status</option>
                {statuses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Location */}
        <section>
          <p className="section-label" style={{ color:'#a78bfa' }}>Location</p>
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
              <label className={l}>Hobli</label>
              <input type="text" name="hobli" className={f} placeholder="Hobli" />
            </div>
            <div>
              <label className={l}>Village</label>
              <input type="text" name="village" className={f} placeholder="Village" />
            </div>
            <div className="md:col-span-2">
              <label className={l}>Area / Location Details</label>
              <input type="text" name="area" className={f} placeholder="e.g. Near NH-48, Industrial zone" />
            </div>
            <div>
              <label className={l}>Survey Number</label>
              <input type="text" name="survey_number" className={f} placeholder="Survey No." />
            </div>
            <div>
              <label className={l}>Road Access</label>
              <input type="text" name="road_access" className={f} placeholder="e.g. 30ft road, Highway facing" />
            </div>
            <div className="md:col-span-2">
              <label className={l}>Nearby Landmark</label>
              <input type="text" name="nearby_landmark" className={f} placeholder="Nearest landmark" />
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Owner */}
        <section>
          <p className="section-label" style={{ color:'#a78bfa' }}>Owner / Contact</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={l}>Owner Name</label>
              <input type="text" name="owner_name" className={f} placeholder="Owner full name" />
            </div>
            <div>
              <label className={l}>Contact Number</label>
              <input type="tel" name="contact_number" className={f} placeholder="+91 98765 43210" />
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Property Details */}
        <section>
          <p className="section-label" style={{ color:'#a78bfa' }}>Property Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={l}>Approximate Area</label>
              <input type="text" name="approximate_area" className={f} placeholder="e.g. 2 Acres, 1200 Sq ft" />
            </div>
            <div>
              <label className={l}>Asking Price</label>
              <input type="text" name="asking_price" className={f} placeholder="e.g. ₹50,00,000 or ₹2Cr/Acre" />
            </div>
            <div className="md:col-span-2">
              <label className={l}>Location Description</label>
              <textarea name="location_description" rows={2} className={f} placeholder="Describe the location and surroundings…" />
            </div>
            <div className="md:col-span-2">
              <label className={l}>Notes</label>
              <textarea name="notes" rows={3} className={f} placeholder="Any additional notes…" />
            </div>
          </div>
        </section>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40"
             style={{ background:'rgba(11,17,32,0.85)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-3xl mx-auto">
            <SubmitButton
              id="add-land-submit"
              className="btn-primary w-full py-3.5 rounded-2xl text-base"
              pendingText="Saving Land Opportunity…"
              style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)', boxShadow:'0 4px 20px rgba(124,58,237,0.4)' }}
            >
              Save Land Opportunity
            </SubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}
