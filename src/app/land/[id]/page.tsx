import { createClient } from '@/utils/supabase/server'
import { updateLand, deleteLand } from '../actions'
import { SubmitButton } from '@/app/login/submit-button'
import { DeleteButton } from '@/components/DeleteButton'
import Link from 'next/link'
import { ArrowLeft, Phone } from 'lucide-react'
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

  if (error || !land) {
    notFound()
  }

  const listingTypes = ['For Sale', 'Wanted to Buy', 'For Lease', 'Other']
  const propertyTypes = ['Agricultural Land', 'Residential Land', 'Commercial Land', 'Site', 'House', 'Building', 'Other']
  const statuses = ['Available', 'Under Discussion', 'Sold', 'Not Available', 'Follow Up Required']

  const updateLandWithId = updateLand.bind(null, id)
  const deleteLandWithId = deleteLand.bind(null, id)

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/land" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 truncate max-w-xs sm:max-w-md">{land.owner_name || 'Land Opportunity'}</h1>
            <p className="text-gray-500 text-sm">{land.listing_type} • {land.property_type}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {land.contact_number && (
            <a href={`tel:${land.contact_number}`} className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full transition-colors">
              <Phone className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center font-medium">
          Land opportunity saved successfully.
        </div>
      )}

      <form action={updateLandWithId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
        
        {/* Opportunity */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Opportunity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type *</label>
              <select name="listing_type" defaultValue={land.listing_type} required className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white">
                <option value="">Select listing type</option>
                {listingTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select name="property_type" defaultValue={land.property_type || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white">
                <option value="">Select property type</option>
                {propertyTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select name="status" defaultValue={land.status} required className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white">
                <option value="">Select status</option>
                {statuses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input type="text" name="district" defaultValue={land.district || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taluk</label>
              <input type="text" name="taluk" defaultValue={land.taluk || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hobli</label>
              <input type="text" name="hobli" defaultValue={land.hobli || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input type="text" name="village" defaultValue={land.village || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Area/Location Details</label>
              <input type="text" name="area" defaultValue={land.area || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Survey Number</label>
              <input type="text" name="survey_number" defaultValue={land.survey_number || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Road Access</label>
              <input type="text" name="road_access" defaultValue={land.road_access || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Landmark</label>
              <input type="text" name="nearby_landmark" defaultValue={land.nearby_landmark || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
        </section>

        {/* Owner */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Owner / Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
              <input type="text" name="owner_name" defaultValue={land.owner_name || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input type="tel" name="contact_number" defaultValue={land.contact_number || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
        </section>

        {/* Property */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approximate Area</label>
              <input type="text" name="area" defaultValue={land.area || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price</label>
              <input type="text" name="asking_price" defaultValue={land.asking_price || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Description</label>
              <textarea name="location_description" defaultValue={land.location_description || ''} rows={2} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" defaultValue={land.notes || ''} rows={3} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Last updated: {new Date(land.updated_at).toLocaleString()}
          </div>
        </section>

        <div className="pt-4 border-t border-gray-200 sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 -mx-6 -mb-6 rounded-b-lg flex gap-3">
          <DeleteButton
            action={deleteLandWithId}
            label="Delete Land"
            confirmMessage="Delete this land opportunity permanently? This cannot be undone."
          />
          <SubmitButton 
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-lg shadow-md transition-colors text-lg"
            pendingText="Saving Changes..."
          >
            Save Changes
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
