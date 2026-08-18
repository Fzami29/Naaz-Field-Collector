import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Search, Plus, MapPin, Phone, Building, Users } from 'lucide-react'

export default async function ContactsList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const supabase = await createClient()
  const { q, category } = await searchParams

  let query = supabase.from('field_contacts').select('*').order('created_at', { ascending: false })
  if (q) query = query.or(`full_name.ilike.%${q}%,mobile_number.ilike.%${q}%,company_name.ilike.%${q}%,district.ilike.%${q}%`)
  if (category) query = query.eq('category', category)

  const { data: contacts } = await query

  const categories = [
    'Advocate','Seller','Buyer','Banker','Real Estate Agent','Developer','Land Owner','Other'
  ]

  const categoryColors: Record<string, string> = {
    Advocate: 'badge-blue',
    Seller: 'badge-emerald',
    Buyer: 'badge-yellow',
    Banker: 'badge-gray',
    'Real Estate Agent': 'badge-blue',
    Developer: 'badge-yellow',
    'Land Owner': 'badge-emerald',
    Other: 'badge-gray',
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 anim-fadeInUp">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="section-label">Directory</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient">Contacts</h1>
          <p className="text-slate-400 text-sm mt-1">
            {contacts?.length ?? 0} contact{contacts?.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link href="/contacts/add" id="contacts-add-btn" className="btn-primary rounded-2xl">
          <Plus className="h-5 w-5" />
          Add Contact
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass rounded-2xl p-4 mb-6 anim-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <form className="flex flex-col sm:flex-row gap-3" id="contacts-filter-form">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by name, phone, company…"
              className="input-glass pl-10"
            />
          </div>
          <select
            name="category"
            defaultValue={category || ''}
            className="input-glass sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button id="contacts-filter-btn" type="submit" className="btn-ghost px-5">
            Filter
          </button>
        </form>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {contacts?.length === 0 ? (
          <div className="col-span-full glass rounded-2xl p-12 text-center anim-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-slate-400 mb-4">No contacts found.</p>
            <Link href="/contacts/add" id="contacts-empty-add" className="btn-primary inline-flex">
              Add First Contact
            </Link>
          </div>
        ) : (
          contacts?.map(contact => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="card-link glass rounded-2xl p-5 anim-fadeInUp"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                    {contact.full_name.slice(0,1).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-slate-100 truncate max-w-[140px]">{contact.full_name}</h3>
                </div>
                <span className={`badge ${categoryColors[contact.category] ?? 'badge-gray'}`}>
                  {contact.category}
                </span>
              </div>

              <div className="space-y-2 mt-3">
                {contact.mobile_number && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                    <span>{contact.mobile_number}</span>
                  </div>
                )}
                {contact.company_name && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Building className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                    <span className="truncate">{contact.company_name}</span>
                  </div>
                )}
                {contact.district && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-600 shrink-0" />
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
