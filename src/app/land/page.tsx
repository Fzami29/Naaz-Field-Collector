import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, Plus, MapPin, DollarSign, Tag, Clock } from 'lucide-react'

export default async function LandList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; property_type?: string }>
}) {
  const supabase = await createClient()
  const { q, status, property_type } = await searchParams

  let query = supabase.from('land_opportunities').select('*').order('created_at', { ascending: false })

  if (q) {
    query = query.or(`owner_name.ilike.%${q}%,district.ilike.%${q}%,village.ilike.%${q}%,area.ilike.%${q}%`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (property_type) {
    query = query.eq('property_type', property_type)
  }

  const { data: landOpportunities } = await query

  const statuses = [
    'Available', 'Under Discussion', 'Sold', 'Not Available', 'Follow Up Required'
  ]
  const propertyTypes = [
    'Agricultural Land', 'Residential Land', 'Commercial Land', 'Site', 'House', 'Building', 'Other'
  ]

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Under Discussion': return 'bg-yellow-100 text-yellow-800'
      case 'Sold': return 'bg-gray-100 text-gray-800'
      case 'Not Available': return 'bg-red-100 text-red-800'
      case 'Follow Up Required': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Land Opportunities</h1>
          <p className="text-gray-500">Manage property listings and inquiries</p>
        </div>
        <Link href="/land/add" className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium">
          <Plus className="h-5 w-5" />
          Add Land
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by owner, location..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <select 
            name="property_type"
            defaultValue={property_type || ''}
            className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Types</option>
            {propertyTypes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select 
            name="status"
            defaultValue={status || ''}
            className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Statuses</option>
            {statuses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors border border-gray-300">
            Filter
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {landOpportunities?.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-500 mb-4">No land opportunities found.</p>
            <Link href="/land/add" className="inline-flex items-center text-emerald-700 font-medium hover:underline">
              Add First Land Opportunity
            </Link>
          </div>
        ) : (
          landOpportunities?.map(land => (
            <Link key={land.id} href={`/land/${land.id}`} className="block bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900 truncate">{land.owner_name || 'Unknown Owner'}</h3>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${getStatusColor(land.status)}`}>
                  {land.status}
                </span>
              </div>
              
              <div className="space-y-2 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-emerald-700">{land.listing_type}</span>
                  <span className="text-gray-400">•</span>
                  <span className="truncate">{land.property_type}</span>
                </div>
                {land.district && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{land.village ? `${land.village}, ` : ''}{land.taluk ? `${land.taluk}, ` : ''}{land.district}</span>
                  </div>
                )}
                {land.asking_price && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate font-medium">{land.asking_price}</span>
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
