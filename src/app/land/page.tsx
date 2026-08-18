import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, Plus, MapPin, IndianRupee, Tag, Map } from 'lucide-react'

export default async function LandList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; property_type?: string }>
}) {
  const supabase = await createClient()
  const { q, status, property_type } = await searchParams

  let query = supabase.from('land_opportunities').select('*').order('created_at', { ascending: false })
  if (q) query = query.or(`owner_name.ilike.%${q}%,district.ilike.%${q}%,village.ilike.%${q}%,area.ilike.%${q}%`)
  if (status) query = query.eq('status', status)
  if (property_type) query = query.eq('property_type', property_type)

  const { data: landOpportunities } = await query

  const statuses = ['Available','Under Discussion','Sold','Not Available','Follow Up Required']
  const propertyTypes = ['Agricultural Land','Residential Land','Commercial Land','Site','House','Building','Other']

  const statusBadge: Record<string, string> = {
    'Available':           'badge-emerald',
    'Under Discussion':    'badge-yellow',
    'Sold':                'badge-gray',
    'Not Available':       'badge-red',
    'Follow Up Required':  'badge-blue',
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 anim-fadeInUp">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Map className="h-4 w-4 text-violet-400" />
            <span className="section-label" style={{ color: '#a78bfa' }}>Properties</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ background:'linear-gradient(135deg,#a78bfa 0%,#818cf8 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Land Opportunities
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {landOpportunities?.length ?? 0} propert{landOpportunities?.length !== 1 ? 'ies' : 'y'} found
          </p>
        </div>
        <Link href="/land/add" id="land-add-btn" className="btn-primary rounded-2xl"
              style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)', boxShadow:'0 4px 20px rgba(124,58,237,0.4)' }}>
          <Plus className="h-5 w-5" />
          Add Land
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass rounded-2xl p-4 mb-6 anim-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <form className="flex flex-col sm:flex-row gap-3" id="land-filter-form">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by owner, location…"
              className="input-glass pl-10"
            />
          </div>
          <select name="property_type" defaultValue={property_type || ''} className="input-glass sm:w-44">
            <option value="">All Types</option>
            {propertyTypes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="status" defaultValue={status || ''} className="input-glass sm:w-48">
            <option value="">All Statuses</option>
            {statuses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button id="land-filter-btn" type="submit" className="btn-ghost px-5">
            Filter
          </button>
        </form>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {landOpportunities?.length === 0 ? (
          <div className="col-span-full glass rounded-2xl p-12 text-center anim-fadeIn">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.25)' }}>
              <Map className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-slate-400 mb-4">No land opportunities found.</p>
            <Link href="/land/add" id="land-empty-add" className="btn-primary inline-flex"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow:'0 4px 20px rgba(124,58,237,0.4)' }}>
              Add First Land Opportunity
            </Link>
          </div>
        ) : (
          landOpportunities?.map(land => (
            <Link
              key={land.id}
              href={`/land/${land.id}`}
              className="card-link glass rounded-2xl p-5 anim-fadeInUp"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                       style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.25)', color:'#a78bfa' }}>
                    {(land.owner_name ?? 'U').slice(0,1).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-slate-100 truncate max-w-[130px]">
                    {land.owner_name ?? 'Unknown Owner'}
                  </h3>
                </div>
                <span className={`badge ${statusBadge[land.status] ?? 'badge-gray'}`}>
                  {land.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Tag className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  <span className="font-medium" style={{ color:'#a78bfa' }}>{land.listing_type}</span>
                  {land.property_type && <><span className="text-slate-600">·</span><span className="truncate">{land.property_type}</span></>}
                </div>
                {land.district && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                    <span className="truncate">
                      {land.village ? `${land.village}, ` : ''}{land.taluk ? `${land.taluk}, ` : ''}{land.district}
                    </span>
                  </div>
                )}
                {land.asking_price && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{land.asking_price}</span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
