'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  MapPin,
  Phone,
  Building,
  Users,
  Edit2,
  Trash2,
  RotateCw,
  MessageCircle,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from './ToastContext'
import { ContactModal } from './ContactModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'

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
  const toast = useToast()

  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [highlightedIds, setHighlightedIds] = useState<Record<string, 'green' | 'blue'>>({})
  const [collapsingIds, setCollapsingIds] = useState<Record<string, boolean>>({})

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    'Real Estate Agent': 'badge-purple',
    Developer: 'badge-yellow',
    'Land Owner': 'badge-emerald',
    Other: 'badge-gray',
  }

  // ── Highlighting Helper ───────────────────────────────────────────────────
  const triggerHighlight = useCallback((id: string, color: 'green' | 'blue') => {
    setHighlightedIds((prev) => ({ ...prev, [id]: color }))
    setTimeout(() => {
      setHighlightedIds((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }, 1500)
  }, [])

  // ── Supabase Realtime Subscription ──────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('field_contacts_realtime_list')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'field_contacts' },
        (payload) => {
          const newContact = payload.new as Contact
          setContacts((prev) => {
            if (prev.some((c) => c.id === newContact.id)) return prev
            return [newContact, ...prev]
          })
          triggerHighlight(newContact.id, 'green')
          toast.info(`Live: New contact added (${newContact.full_name})`)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'field_contacts' },
        (payload) => {
          const updated = payload.new as Contact
          setContacts((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          )
          triggerHighlight(updated.id, 'blue')
          toast.info(`Live: Contact updated (${updated.full_name})`)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'field_contacts' },
        (payload) => {
          const deletedId = (payload.old as { id: string })?.id
          if (deletedId) {
            setCollapsingIds((prev) => ({ ...prev, [deletedId]: true }))
            setTimeout(() => {
              setContacts((prev) => prev.filter((c) => c.id !== deletedId))
              setCollapsingIds((prev) => {
                const next = { ...prev }
                delete next[deletedId]
                return next
              })
            }, 180)
            toast.info('Live: A contact was deleted')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [triggerHighlight, toast])

  // Sync initial props
  useEffect(() => {
    setContacts(initialContacts)
  }, [initialContacts])

  // Show banner if navigated with ?deleted=true
  useEffect(() => {
    if (deletedBanner) {
      toast.success('Contact deleted successfully from Supabase.')
    }
  }, [deletedBanner, toast])

  // ── Manual Sync / Refresh ──────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('field_contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setContacts(data as Contact[])
      toast.success('Contacts synced with Supabase')
    } catch (err: unknown) {
      console.error('Refresh error:', err)
      toast.error('Failed to sync contacts. Check connection.')
    } finally {
      setIsRefreshing(false)
    }
  }

  // ── Contact Saved (from Modal) ─────────────────────────────────────────────
  const handleContactSaved = (savedContact: Contact, isNew: boolean) => {
    if (isNew) {
      setContacts((prev) => [savedContact, ...prev.filter((c) => c.id !== savedContact.id)])
      triggerHighlight(savedContact.id, 'green')
    } else {
      setContacts((prev) =>
        prev.map((c) => (c.id === savedContact.id ? savedContact : c))
      )
      triggerHighlight(savedContact.id, 'blue')
    }
  }

  // ── Delete Contact Flow ────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deletingContact) return
    setIsDeleting(true)
    const contactId = deletingContact.id
    const contactName = deletingContact.full_name
    const supabase = createClient()

    try {
      const { error } = await supabase.from('field_contacts').delete().eq('id', contactId)
      if (error) throw error

      // Animate row collapse
      setCollapsingIds((prev) => ({ ...prev, [contactId]: true }))
      setDeletingContact(null)
      toast.success(`Contact "${contactName}" deleted permanently.`)

      setTimeout(() => {
        setContacts((prev) => prev.filter((c) => c.id !== contactId))
        setCollapsingIds((prev) => {
          const next = { ...prev }
          delete next[contactId]
          return next
        })
      }, 180)
    } catch (err: unknown) {
      console.error('Delete contact error:', err)
      const msg = err instanceof Error ? err.message : 'Failed to delete contact from Supabase.'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Category Counts ────────────────────────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    contacts.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1
    })
    return counts
  }, [contacts])

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
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 anim-fadeInUp">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="section-label">Field Directory</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient">Contacts</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} available in Supabase
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-ghost px-3.5 py-2.5 rounded-2xl flex items-center gap-2"
            title="Sync with Supabase"
          >
            <RotateCw className={`h-4 w-4 text-emerald-400 ${isRefreshing ? 'anim-spin' : ''}`} />
            <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
              {isRefreshing ? 'Syncing...' : 'Sync'}
            </span>
          </button>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            id="contacts-add-btn"
            className="btn-primary rounded-2xl px-5 py-2.5 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filters Bar ── */}
      <div className="glass rounded-2xl p-4 mb-6 anim-fadeInUp space-y-3.5" style={{ animationDelay: '0.05s' }}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, company, village, district..."
            className="input-glass pl-10 pr-4 py-2.5 text-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className={`filter-pill ${!selectedCategory ? 'active' : ''}`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-bold">
              {contacts.length}
            </span>
          </button>
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0
            if (count === 0 && selectedCategory !== cat) return null
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                <span>{cat}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-bold">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Contacts Grid ── */}
      {isRefreshing ? (
        /* Skeleton Loaders */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="glass rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 skeleton" />
                  <div className="h-3 w-1/2 skeleton" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 w-4/5 skeleton" />
                <div className="h-3 w-2/3 skeleton" />
              </div>
              <div className="pt-3 border-t border-white/[0.06] flex justify-between">
                <div className="h-3 w-24 skeleton" />
                <div className="h-3 w-16 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        /* Empty State */
        <div className="glass rounded-3xl p-12 text-center anim-fadeIn max-w-xl mx-auto my-8 border border-white/[0.08]">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            {searchTerm || selectedCategory ? 'No matching contacts' : 'No contacts collected yet'}
          </h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            {searchTerm || selectedCategory
              ? 'Try changing your search terms or selecting a different category filter.'
              : 'Start recording field contacts, advocates, sellers, and bankers in your real Supabase database.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {searchTerm || selectedCategory ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                }}
                className="btn-secondary px-5 py-2.5"
              >
                Reset Filters
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              id="contacts-empty-add"
              className="btn-primary px-5 py-2.5 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Contact</span>
            </button>
          </div>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {filteredContacts.map((contact) => {
            const isCollapsing = collapsingIds[contact.id]
            const highlightColor = highlightedIds[contact.id]

            return (
              <div
                key={contact.id}
                className={`glass rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${
                  isCollapsing ? 'row-collapse' : 'anim-fadeInUp'
                } ${
                  highlightColor === 'green'
                    ? 'anim-highlight-green'
                    : highlightColor === 'blue'
                    ? 'anim-highlight-blue'
                    : ''
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between mb-3.5 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                        {contact.full_name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/contacts/${contact.id}`}
                          className="font-bold text-slate-100 text-sm hover:text-emerald-400 transition-colors truncate block"
                        >
                          {contact.full_name}
                        </Link>
                        {contact.designation && (
                          <p className="text-xs text-slate-400 truncate">{contact.designation}</p>
                        )}
                      </div>
                    </div>
                    <span className={`badge shrink-0 ${categoryColors[contact.category] ?? 'badge-gray'}`}>
                      {contact.category}
                    </span>
                  </div>

                  {/* Info details */}
                  <div className="space-y-2 text-xs text-slate-300">
                    {contact.mobile_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <a
                          href={`tel:${contact.mobile_number}`}
                          className="truncate hover:text-emerald-400 transition-colors"
                        >
                          {contact.mobile_number}
                        </a>
                      </div>
                    )}
                    {contact.company_name && (
                      <div className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-400">{contact.company_name}</span>
                      </div>
                    )}
                    {contact.district && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-400">
                          {contact.village ? `${contact.village}, ` : ''}
                          {contact.taluk ? `${contact.taluk}, ` : ''}
                          {contact.district}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row Actions */}
                <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {contact.mobile_number && (
                      <a
                        href={`tel:${contact.mobile_number}`}
                        className="btn-icon p-1.5 text-emerald-400 hover:text-emerald-300"
                        title="Call"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {contact.whatsapp_number && (
                      <a
                        href={`https://wa.me/${contact.whatsapp_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon p-1.5 text-emerald-400 hover:text-emerald-300"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingContact(contact)}
                      className="btn-icon p-1.5 text-cyan-400 hover:text-cyan-300"
                      title="Quick Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingContact(contact)}
                      className="btn-icon p-1.5 text-red-400 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Link
                    href={`/contacts/${contact.id}`}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View</span>
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modals ── */}
      <ContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleContactSaved}
      />

      <ContactModal
        isOpen={Boolean(editingContact)}
        contact={editingContact}
        onClose={() => setEditingContact(null)}
        onSuccess={handleContactSaved}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingContact)}
        itemName={deletingContact?.full_name || ''}
        itemType="contact"
        isDeleting={isDeleting}
        onClose={() => setDeletingContact(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
