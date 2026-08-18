import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, Plus, MapPin, Phone, Building } from 'lucide-react'

export default async function ContactsList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const supabase = await createClient()
  const { q, category } = await searchParams

  let query = supabase.from('field_contacts').select('*').order('created_at', { ascending: false })

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,mobile_number.ilike.%${q}%,company_name.ilike.%${q}%,district.ilike.%${q}%`)
  }

  if (category) {
    query = query.eq('category', category)
  }

  const { data: contacts } = await query

  const categories = [
    'Advocate', 'Seller', 'Buyer', 'Banker', 'Real Estate Agent', 'Developer', 'Land Owner', 'Other'
  ]

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500">Manage your collected contacts</p>
        </div>
        <Link href="/contacts/add" className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium">
          <Plus className="h-5 w-5" />
          Add Contact
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
              placeholder="Search by name, phone, company..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <select 
            name="category"
            defaultValue={category || ''}
            className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors border border-gray-300">
            Filter
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts?.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-500 mb-4">No contacts found.</p>
            <Link href="/contacts/add" className="inline-flex items-center text-emerald-700 font-medium hover:underline">
              Add First Contact
            </Link>
          </div>
        ) : (
          contacts?.map(contact => (
            <Link key={contact.id} href={`/contacts/${contact.id}`} className="block bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900 truncate">{contact.full_name}</h3>
                <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full whitespace-nowrap ml-2">
                  {contact.category}
                </span>
              </div>
              
              <div className="space-y-2 mt-4 text-sm text-gray-600">
                {contact.mobile_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{contact.mobile_number}</span>
                  </div>
                )}
                {contact.company_name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{contact.company_name}</span>
                  </div>
                )}
                {contact.district && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{contact.district}{contact.taluk ? `, ${contact.taluk}` : ''}</span>
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
