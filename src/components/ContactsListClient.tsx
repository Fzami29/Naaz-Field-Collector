'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, MapPin, Phone, Building, Users, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export interface Contact {
  id: string
  created_by: string
  full_name: string
  category: string
  mobile_number: string | null
  whatsapp_number: string | null
  company_name: string | null
  designation: string | null
  district: string | null
  taluk: string | null
  village: string | null
  area: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface ContactsListClientProps {
  initialContacts: Contact[]
  initialQuery?: string
  initialCategory?: string
  deletedBanner?: boolean
}

export function ContactsListClient({
  initialContacts,
  initialQuery = '',
  initialCategory = '',
  deletedBanner = false,
}: ContactsListClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null)
  const [showDeletedAlert, setShowDeletedAlert] = useState(deletedBanner)

  const categories = [
    'Advocate',
    'Seller',
    'Buyer',
    'Banker',
    'Real Estate Agent',
    'Developer',
    'Land Owner',
    'Other',
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

  // ── Supabase Realtime Subscription ──────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('field_contacts_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'field_contacts' },
        (payload) => {
          const newContact = payload.new as Contact
          setContacts((prev) => {
            if (prev.some((c) => c.id === newContact.id)) return prev
            return [newContact, ...prev]
          })
          setRealtimeNotification(`New contact added: ${newContact.full_name}`)
          setTimeout(() => setRealtimeNotification(null), 4000)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'field_contacts' },
        (payload) => {
          const updatedContact = payload.new as Contact
          setContacts((prev) =>
            prev.map((c) => (c.id === updatedContact.id ? updatedContact : c))
          )
          setRealtimeNotification(`Contact updated: ${updatedContact.full_name}`)
          setTimeout(() => setRealtimeNotification(null), 4000)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'field_contacts' },
        (payload) => {
          const deletedId = (payload.old as { id: string })?.id
          if (deletedId) {
            setContacts((prev) => prev.filter((c) => c.id !== deletedId))
            setRealtimeNotification('A contact was deleted in real-time.')
            setTimeout(() => setRealtimeNotification(null), 4000)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription active for field_contacts')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Sync initial contacts if server props change
  useEffect(() => {
    setContacts(initialContacts)
  }, [initialContacts])

  // ── Filtered Contacts ───────────────────────────────────────────────────────
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesCategory = selectedCategory ? c.category === selectedCategory : true
      if (!matchesCategory) return false

      if (!searchTerm.trim()) return true
      const q = searchTerm.toLowerCase()
      return (
        c.full_name?.toLowerCase().includes(q) ||
        c.mobile_number?.toLowerCase().includes(q) ||
        c.company_name?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q) ||
        c.taluk?.toLowerCase().includes(q) ||
        c.village?.toLowerCase().includes(q) ||
        c.designation?.toLowerCase().includes(q)
      )
    })
  }, [contacts, searchTerm, selectedCategory])

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* ── Realtime & Deleted Banner Notifications ── */}
      {showDeletedAlert && (
        <div className="mb-6 p-4 rounded-2xl text-sm font-medium flex items-center justify-between anim-fadeIn bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>Contact deleted successfully from Supabase database.</span>
          </div>
          <button
            onClick={() => setShowDeletedAlert(false)}
            className="text-xs text-emerald-400 hover:text-emerald-200 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {realtimeNotification && (
        <div className="mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-2 anim-fadeIn bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
          <span className="glow-dot" style={{ background: '#22d3ee' }} />
          <span>{realtimeNotification}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 anim-fadeInUp">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="section-label">Directory</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient">Contacts</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found in database
          </p>
        </div>
        <Link href="/contacts/add" id="contacts-add-btn" className="btn-primary rounded-2xl">
          <Plus className="h-5 w-5" />
          Add Contact
        </Link>
      </div>

      {/* ── Filter Bar ── */}
      <div className="glass rounded-2xl p-4 mb-6 anim-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col sm:flex-row gap-3" id="contacts-filter-form">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, company, district..."
              className="input-glass pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-glass sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {(searchTerm || selectedCategory) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
              }}
              className="btn-ghost px-4 text-xs text-slate-400 hover:text-slate-200"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Contacts Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full glass rounded-2xl p-12 text-center anim-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-1">No contacts found</h3>
            <p className="text-slate-400 mb-6 text-sm">
              {searchTerm || selectedCategory
                ? 'Try adjusting your search query or filter to find contacts.'
                : 'No contacts collected in Supabase yet.'}
            </p>
            <Link href="/contacts/add" id="contacts-empty-add" className="btn-primary inline-flex">
              <Plus className="h-4 w-4" />
              Add First Contact
            </Link>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="card-link glass rounded-2xl p-5 anim-fadeInUp flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                      {contact.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-100 truncate">{contact.full_name}</h3>
                      {contact.designation && (
                        <p className="text-xs text-slate-400 truncate">{contact.designation}</p>
                      )}
                    </div>
                  </div>
                  <span className={`badge shrink-0 ${categoryColors[contact.category] ?? 'badge-gray'}`}>
                    {contact.category}
                  </span>
                </div>

                <div className="space-y-2 mt-3 text-xs text-slate-400">
                  {contact.mobile_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{contact.mobile_number}</span>
                    </div>
                  )}
                  {contact.company_name && (
                    <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{contact.company_name}</span>
                    </div>
                  )}
                  {contact.district && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">
                        {contact.village ? `${contact.village}, ` : ''}
                        {contact.taluk ? `${contact.taluk}, ` : ''}
                        {contact.district}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                <span>Added {new Date(contact.created_at).toLocaleDateString()}</span>
                <span className="text-emerald-400 hover:underline">View details →</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
