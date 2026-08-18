import { createClient } from '@/utils/supabase/server'
import { updateLand, deleteLand } from '../actions'
import { SubmitButton } from '@/app/login/submit-button'
import { DeleteButton } from '@/components/DeleteButton'
import Link from 'next/link'
import { ArrowLeft, Phone, Map } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditLandPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { id } = await params
  const { success } = await searchParams
  const supabase = await createClient()

  const { data: land, error } = await supabase.from('land_opportunities').select('*').eq('id', id).single()
  if (error || !land) notFound()

  const listingTypes = ['For Sale','Wanted to Buy','For Lease','Other']
  const propertyTypes = ['Agricultural Land','Residential Land','Commercial Land','Site','House','Building','Other']
  const statuses = ['Available','Under Discussion','Sold','Not Available','Follow Up Required']

  const updateLandWithId = updateLand.bind(null, id)
  const deleteLandWithId = deleteLand.bind(null, id)

  const fieldClass = "input-glass"
  const labelClass = "block text-xs font-semibold text-slate-400 mb-1.5 tracking-wide uppercase"

  const statusColors: Record<string,string> = {
    'Available':           'rgba(16,185,129,0.15)',
    'Under Discussion':    'rgba(234,179,8,0.15)',
    'Sold':                'rgba(148,163,184,0.12)',
    'Not Available':       'rgba(239,68,68,0.15)',
    'Follow Up Required':  'rgba(59,130,246,0.15)',
  }
  const statusTextColors: Record<string,string> = {
    'Available':           '#34d399',
    'Under Discussion':    '#fbbf24',
    'Sold':                '#94a3b8',
    'Not Available':       '#f87171',
    'Follow Up Required':  '#93c5fd',
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 anim-fadeInUp">
        <div className="flex items-center gap-3">
          <Link href="/land" id="land-back-btn" className="btn-ghost p-2.5 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                 style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.25)', color:'#a78bfa' }}>
              {(land.owner_name ?? 'U').slice(0,1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 truncate max-w-[200px] sm:max-w-sm">
                {land.owner_name || 'Land Opportunity'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-500">{land.listing_type}</span>
                {land.property_type && <>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-500">{land.property_type}</span>
                </>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status pill */}
          <span className="badge text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: statusColors[land.status] ?? 'rgba(148,163,184,0.12)',
                  color: statusTextColors[land.status] ?? '#94a3b8',
                  border: `1px solid ${(statusTextColors[land.status] ?? '#94a3b8')}40`
                }}>
            {land.status}
          </span>
          {land.contact_number && (
            <a href={`tel:${land.contact_number}`} id="land-call-btn"
               className="p-2.5 rounded-xl transition-all hover:scale-110"
               style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#34d399' }}>
              <Phone className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="mb-5 p-4 rounded-2xl text-sm font-medium flex items-center gap-2 anim-fadeIn"
             style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'#34d399' }}>
          ✓ Land opportunity saved successfully.
        </div>
      )}

      <form action={updateLandWithId} className="glass rounded-3xl p-6 space-y-7 anim-fadeInUp" style={{ animationDelay:'0.1s' }}>

        {/* Opportunity */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Map className="h-4 w-4 text-violet-400" />
            <p className="section-label mb-0" style={{ color:'#a78bfa' }}>Opportunity</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Listing Type *</label>
              <select name="listing_type" defaultValue={land.listing_type} required className={fieldClass}>
                <option value="">Select listing type</option>
                {listingTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Property Type</label>
              <select name="property_type" defaultValue={land.property_type || ''} className={fieldClass}>
                <option value="">Select property type</option>
                {propertyTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select name="status" defaultValue={land.status} required className={fieldClass}>
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
              <label className={labelClass}>District</label>
              <input type="text" name="district" defaultValue={land.district || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Taluk</label>
              <input type="text" name="taluk" defaultValue={land.taluk || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Hobli</label>
              <input type="text" name="hobli" defaultValue={land.hobli || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Village</label>
              <input type="text" name="village" defaultValue={land.village || ''} className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Area / Location Details</label>
              <input type="text" name="area" defaultValue={land.area || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Survey Number</label>
              <input type="text" name="survey_number" defaultValue={land.survey_number || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Road Access</label>
              <input type="text" name="road_access" defaultValue={land.road_access || ''} className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Nearby Landmark</label>
              <input type="text" name="nearby_landmark" defaultValue={land.nearby_landmark || ''} className={fieldClass} />
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Owner */}
        <section>
          <p className="section-label" style={{ color:'#a78bfa' }}>Owner / Contact</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Owner Name</label>
              <input type="text" name="owner_name" defaultValue={land.owner_name || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Contact Number</label>
              <input type="tel" name="contact_number" defaultValue={land.contact_number || ''} className={fieldClass} />
            </div>
          </div>
        </section>

        <hr className="divider-glass" />

        {/* Property Details */}
        <section>
          <p className="section-label" style={{ color:'#a78bfa' }}>Property Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Approximate Area</label>
              <input type="text" name="area" defaultValue={land.area || ''} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Asking Price</label>
              <input type="text" name="asking_price" defaultValue={land.asking_price || ''} className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Location Description</label>
              <textarea name="location_description" defaultValue={land.location_description || ''} rows={2} className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea name="notes" defaultValue={land.notes || ''} rows={3} className={fieldClass} />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Last updated: {new Date(land.updated_at).toLocaleString()}
          </p>
        </section>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 md:bottom-0 md:relative md:mt-4 p-4 md:p-0 flex gap-3 z-40"
             style={{ background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-full max-w-3xl mx-auto flex gap-3">
            <DeleteButton
              action={deleteLandWithId}
              label="Delete"
              confirmMessage="Delete this land opportunity permanently? This cannot be undone."
            />
            <SubmitButton
              id="land-save-btn"
              className="btn-primary flex-1 py-3.5 rounded-2xl text-base"
              pendingText="Saving…"
              style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)', boxShadow:'0 4px 20px rgba(124,58,237,0.4)' }}
            >
              Save Changes
            </SubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}
