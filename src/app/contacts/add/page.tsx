import { createContact } from '../actions'
import { SubmitButton } from '@/app/login/submit-button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AddContactPage() {
  const categories = [
    'Advocate', 'Seller', 'Buyer', 'Banker', 'Real Estate Agent', 'Developer', 'Land Owner', 'Other'
  ]

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/contacts" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Contact</h1>
        </div>
      </div>

      <form action={createContact} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
        
        {/* Personal */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="full_name" required className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" required className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white">
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
              <input type="tel" name="mobile_number" className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input type="tel" name="whatsapp_number" className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company/Office</label>
              <input type="text" name="company_name" className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input type="text" name="designation" className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input type="text" name="district" className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taluk</label>
              <input type="text" name="taluk" className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input type="text" name="village" className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <input type="text" name="area" className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" rows={2} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-lg font-semibold text-emerald-800 border-b border-gray-200 pb-2 mb-4">Additional Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" rows={3} className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
          </div>
        </section>

        <div className="pt-4 border-t border-gray-200 sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 -mx-6 -mb-6 rounded-b-lg">
          <SubmitButton 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-lg shadow-md transition-colors text-lg"
            pendingText="Saving Contact..."
          >
            Save Contact
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
