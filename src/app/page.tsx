import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PlusCircle, Users, Map, Clock } from 'lucide-react'

export default async function Dashboard() {
  const supabase = await createClient()

  // Get start of today for filtering
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  // Fetch counts
  const [
    { count: totalContacts },
    { count: todayContacts },
    { count: totalLand },
    { count: todayLand }
  ] = await Promise.all([
    supabase.from('field_contacts').select('*', { count: 'exact', head: true }),
    supabase.from('field_contacts').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
    supabase.from('land_opportunities').select('*', { count: 'exact', head: true }),
    supabase.from('land_opportunities').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
  ])

  // Fetch recent entries
  const [
    { data: recentContacts },
    { data: recentLand }
  ] = await Promise.all([
    supabase.from('field_contacts').select('id, full_name, category, created_at').order('created_at', { ascending: false }).limit(3),
    supabase.from('land_opportunities').select('id, owner_name, property_type, created_at').order('created_at', { ascending: false }).limit(3)
  ])

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your field collection</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Today's Contacts</h3>
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{todayContacts || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Contacts</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalContacts || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Today's Land</h3>
            <Map className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{todayLand || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Land</h3>
            <Map className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalLand || 0}</p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link href="/contacts/add" className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white p-4 rounded-lg shadow-sm transition-colors font-medium text-lg">
          <PlusCircle className="h-6 w-6" />
          Add Contact
        </Link>
        <Link href="/land/add" className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white p-4 rounded-lg shadow-sm transition-colors font-medium text-lg">
          <PlusCircle className="h-6 w-6" />
          Add Land
        </Link>
      </div>

      {/* Recent Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Recent Contacts
            </h2>
            <Link href="/contacts" className="text-sm text-emerald-700 hover:underline">View all</Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
            {recentContacts?.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No contacts collected yet.</div>
            ) : (
              recentContacts?.map((contact) => (
                <Link key={contact.id} href={`/contacts/${contact.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">{contact.full_name}</div>
                  <div className="text-sm text-gray-500 mt-1">{contact.category}</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Recent Land
            </h2>
            <Link href="/land" className="text-sm text-emerald-700 hover:underline">View all</Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
            {recentLand?.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No land opportunities collected yet.</div>
            ) : (
              recentLand?.map((land) => (
                <Link key={land.id} href={`/land/${land.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">{land.owner_name || 'Unknown Owner'}</div>
                  <div className="text-sm text-gray-500 mt-1">{land.property_type || 'Unspecified Type'}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
