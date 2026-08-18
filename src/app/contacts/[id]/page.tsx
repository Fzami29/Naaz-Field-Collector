import { createClient } from '@/utils/supabase/server'
import { updateContact, deleteContact } from '../actions'
import { SubmitButton } from '@/app/login/submit-button'
import { DeleteButton } from '@/components/DeleteButton'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react'
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

  if (error || !contact) {
    notFound()
  }

  const categories = [
    'Advocate', 'Seller', 'Buyer', 'Banker', 'Real Estate Agent', 'Developer', 'Land Owner', 'Other'
  ]

  const updateContactWithId = updateContact.bind(null, id)
  const deleteContactWithId = deleteContact.bind(null, id)

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contacts" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contact.full_name}</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          {contact.mobile_number && (
            <a href={`tel:${contact.mobile_number}`} className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full transition-colors">
              <Phone className="h-5 w-5" />
            </a>
          )}
          {contact.whatsapp_number && (
            <a href={`https://wa.me/${contact.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors">
              <MessageCircle className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center font-medium">
          Contact saved successfully.
        </div>
      )}

      <form action={updateContactWithId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
        
        {/* Personal */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="full_name" defaultValue={contact.full_name} required className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" defaultValue={contact.category} required className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white">
                <option value="">Select a category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Contact & Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input type="tel" name="mobile_number" defaultValue={contact.mobile_number || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input type="tel" name="whatsapp_number" defaultValue={contact.whatsapp_number || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company/Office</label>
              <input type="text" name="company_name" defaultValue={contact.company_name || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input type="text" name="designation" defaultValue={contact.designation || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input type="text" name="district" defaultValue={contact.district || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taluk</label>
              <input type="text" name="taluk" defaultValue={contact.taluk || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input type="text" name="village" defaultValue={contact.village || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <input type="text" name="area" defaultValue={contact.area || ''} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" defaultValue={contact.address || ''} rows={2} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Additional Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" defaultValue={contact.notes || ''} rows={3} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Last updated: {new Date(contact.updated_at).toLocaleString()}
          </div>
        </section>

        <div className="pt-4 border-t border-gray-200 sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 -mx-6 -mb-6 rounded-b-lg flex gap-3">
          <DeleteButton
            action={deleteContactWithId}
            label="Delete Contact"
            confirmMessage="Delete this contact permanently? This cannot be undone."
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
