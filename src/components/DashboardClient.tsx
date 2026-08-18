'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Map,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Briefcase,
  Building2,
  ShoppingCart,
  DollarSign,
  Landmark,
  ShieldCheck,
  RotateCw,
  Calendar,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Contact } from './ContactsListClient'
import { AnimatedNumber } from './AnimatedNumber'
import { ContactModal } from './ContactModal'
import { useToast } from './ToastContext'

export interface LandItem {
  id: string
  owner_name: string | null
  property_type: string | null
  status: string
  created_at: string
}

interface DashboardClientProps {
  initialContacts: Contact[]
  initialLand: LandItem[]
  totalLandCount: number
  todayLandCount: number
  totalMeetingsCount?: number
}

export default function DashboardClient({
  initialContacts,
  initialLand,
  totalLandCount,
  todayLandCount,
  totalMeetingsCount = 0,
}: DashboardClientProps) {
  const toast = useToast()

  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [recentLand, setRecentLand] = useState<LandItem[]>(initialLand)
  const [landCounts, setLandCounts] = useState({
    total: totalLandCount,
    today: todayLandCount,
  })
  const [meetingsCount, setMeetingsCount] = useState(totalMeetingsCount)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)

  const statusColors: Record<string, string> = {
    Available: 'badge-emerald',
    'Under Discussion': 'badge-yellow',
    Sold: 'badge-gray',
    'Not Available': 'badge-red',
    'Follow Up Required': 'badge-blue',
  }

  // ── Supabase Realtime Subscriptions ─────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()

    // 1. Contacts Channel
    const contactsChannel = supabase
      .channel('dashboard_contacts_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'field_contacts' },
        (payload) => {
          const newContact = payload.new as Contact
          setContacts((prev) => [newContact, ...prev.filter((c) => c.id !== newContact.id)])
          toast.info(`Live update: Contact added (${newContact.full_name})`)
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
          toast.info(`Live update: Contact updated (${updatedContact.full_name})`)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'field_contacts' },
        (payload) => {
          const deletedId = (payload.old as { id: string })?.id
          if (deletedId) {
            setContacts((prev) => prev.filter((c) => c.id !== deletedId))
            toast.info('Live update: A contact was deleted')
          }
        }
      )
      .subscribe()

    // 2. Land Channel
    const landChannel = supabase
      .channel('dashboard_land_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'land_opportunities' },
        (payload) => {
          const newLand = payload.new as LandItem
          setRecentLand((prev) => [newLand, ...prev.slice(0, 3)])
          setLandCounts((prev) => ({
            total: prev.total + 1,
            today: prev.today + 1,
          }))
          toast.info(`Live update: Land opportunity added (${newLand.owner_name || 'New'})`)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'land_opportunities' },
        (payload) => {
          const deletedId = (payload.old as { id: string })?.id
          if (deletedId) {
            setRecentLand((prev) => prev.filter((l) => l.id !== deletedId))
            setLandCounts((prev) => ({
              ...prev,
              total: Math.max(0, prev.total - 1),
            }))
          }
        }
      )
      .subscribe()

    // 3. Meetings Channel
    const meetingsChannel = supabase
      .channel('dashboard_meetings_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_meetings' },
        () => {
          setMeetingsCount((prev) => prev + 1)
          toast.info('Live update: New meeting logged')
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'contact_meetings' },
        () => {
          setMeetingsCount((prev) => Math.max(0, prev - 1))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(contactsChannel)
      supabase.removeChannel(landChannel)
      supabase.removeChannel(meetingsChannel)
    }
  }, [toast])

  // Sync initial props
  useEffect(() => {
    setContacts(initialContacts)
  }, [initialContacts])

  // ── Manual Sync / Refresh ──────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    const supabase = createClient()
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString()

      const [
        { data: allContacts },
        { data: recentLandData },
        { count: totalLand },
        { count: todayLand },
        { count: totalMeetings },
      ] = await Promise.all([
        supabase.from('field_contacts').select('*').order('created_at', { ascending: false }),
        supabase
          .from('land_opportunities')
          .select('id, owner_name, property_type, status, created_at')
          .order('created_at', { ascending: false })
          .limit(4),
        supabase.from('land_opportunities').select('*', { count: 'exact', head: true }),
        supabase.from('land_opportunities').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
        supabase.from('contact_meetings').select('*', { count: 'exact', head: true }),
      ])

      if (allContacts) setContacts(allContacts as Contact[])
      if (recentLandData) setRecentLand(recentLandData as LandItem[])
      if (totalLand !== null && todayLand !== null) {
        setLandCounts({ total: totalLand, today: todayLand })
      }
      if (totalMeetings !== null) {
        setMeetingsCount(totalMeetings)
      }
      toast.success('Dashboard data synced from Supabase')
    } catch (err: unknown) {
      console.error('Refresh error:', err)
      toast.error('Failed to sync dashboard')
    } finally {
      setIsRefreshing(false)
    }
  }

  // ── Stats Calculations ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTime = today.getTime()

    let todayContacts = 0
    let advocates = 0
    let realEstate = 0
    let buyers = 0
    let sellers = 0
    let banks = 0
    let landOwners = 0
    let others = 0

    contacts.forEach((c) => {
      if (new Date(c.created_at).getTime() >= todayTime) {
        todayContacts++
      }

      switch (c.category) {
        case 'Advocate':
          advocates++
          break
        case 'Real Estate Agent':
        case 'Developer':
          realEstate++
          break
        case 'Buyer':
          buyers++
          break
        case 'Seller':
          sellers++
          break
        case 'Banker':
          banks++
          break
        case 'Land Owner':
          landOwners++
          break
        default:
          others++
          break
      }
    })

    return {
      totalContacts: contacts.length,
      todayContacts,
      advocates,
      realEstate,
      buyers,
      sellers,
      banks,
      landOwners,
      others,
    }
  }, [contacts])

  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
  }, [contacts])

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 anim-fadeInUp">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="section-label">Realtime Operations Center</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Live database overview connected directly to Supabase PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
        </div>
      </div>

      {/* ── Primary Stat Cards with Animated Numbers ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        {[
          {
            label: "Today's Contacts",
            value: stats.todayContacts,
            icon: Users,
            accent: 'from-emerald-400 to-teal-400',
            glow: 'rgba(16,185,129,0.3)',
          },
          {
            label: 'Total Contacts',
            value: stats.totalContacts,
            icon: Users,
            accent: 'from-cyan-400 to-blue-400',
            glow: 'rgba(34,211,238,0.25)',
          },
          {
            label: "Today's Land",
            value: landCounts.today,
            icon: Map,
            accent: 'from-violet-400 to-purple-400',
            glow: 'rgba(167,139,250,0.25)',
          },
          {
            label: 'Total Land',
            value: landCounts.total,
            icon: TrendingUp,
            accent: 'from-amber-400 to-orange-400',
            glow: 'rgba(251,191,36,0.25)',
          },
        ].map(({ label, value, icon: Icon, accent, glow }) => (
          <div key={label} className="stat-card anim-fadeInUp">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 leading-tight">{label}</p>
              <div
                className="p-2 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${glow.replace('0.3', '0.18')}, transparent)`,
                  border: `1px solid ${glow}`,
                }}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">
              <AnimatedNumber value={value} />
            </p>
            <div className={`mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r ${accent} opacity-60`} />
          </div>
        ))}
      </div>

      {/* ── Category Breakdown Cards ── */}
      <div className="mb-8 anim-fadeInUp">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contacts Breakdown by Category
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Click to filter directory</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Advocates', count: stats.advocates, icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Real Estate', count: stats.realEstate, icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Buyers', count: stats.buyers, icon: ShoppingCart, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Sellers', count: stats.sellers, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Banks', count: stats.banks, icon: Landmark, color: 'text-slate-300', bg: 'bg-slate-500/10' },
            { label: 'Land Owners', count: stats.landOwners, icon: Map, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(({ label, count, icon: Icon, color, bg }) => (
            <Link
              key={label}
              href={`/contacts?category=${encodeURIComponent(
                label === 'Real Estate' ? 'Real Estate Agent' : label === 'Banks' ? 'Banker' : label
              )}`}
              className="glass rounded-2xl p-3.5 card-link flex flex-col justify-between hover:border-emerald-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 truncate">{label}</span>
                <div className={`p-1.5 rounded-lg ${bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-100 mt-2">
                <AnimatedNumber value={count} />
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Primary Action Buttons ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 anim-fadeInUp">
        <button
          type="button"
          onClick={() => setIsAddContactModalOpen(true)}
          id="dash-add-contact"
          className="btn-primary py-5 text-base rounded-2xl group flex items-center justify-center gap-3 shadow-xl"
        >
          <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add New Contact</span>
        </button>

        <Link
          href="/land/add"
          id="dash-add-land"
          className="btn-primary py-5 text-base rounded-2xl group flex items-center justify-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          }}
        >
          <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add Land Opportunity</span>
        </Link>
      </div>

      {/* ── Recent Live Database Entries ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 anim-fadeInUp">
        {/* Recent Contacts */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <h2 className="font-semibold text-slate-100 text-sm sm:text-base">Recent Contacts</h2>
            </div>
            <Link href="/contacts" id="dash-view-contacts" className="btn-ghost text-xs px-3 py-1.5 rounded-lg">
              View all <ArrowRight className="h-3 w-3 inline ml-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {!recentContacts.length ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">
                No contacts collected yet in Supabase.
              </div>
            ) : (
              recentContacts.map((c) => (
                <Link
                  key={c.id}
                  href={`/contacts/${c.id}`}
                  className="card-link flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                      {c.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100 text-sm">{c.full_name}</p>
                      <p className="text-xs text-slate-500">{c.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Land */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-violet-400" />
              <h2 className="font-semibold text-slate-100 text-sm sm:text-base">Recent Land</h2>
            </div>
            <Link href="/land" id="dash-view-land" className="btn-ghost text-xs px-3 py-1.5 rounded-lg">
              View all <ArrowRight className="h-3 w-3 inline ml-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {!recentLand.length ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">
                No land opportunities collected yet.
              </div>
            ) : (
              recentLand.map((l) => (
                <Link
                  key={l.id}
                  href={`/land/${l.id}`}
                  className="card-link flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                      {(l.owner_name ?? 'U').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100 text-sm">{l.owner_name ?? 'Unknown Owner'}</p>
                      <p className="text-xs text-slate-500">{l.property_type ?? 'Unspecified'}</p>
                    </div>
                  </div>
                  <span className={`badge ${statusColors[l.status] ?? 'badge-gray'}`}>{l.status}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <ContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onSuccess={(newC) => {
          setContacts((prev) => [newC, ...prev])
        }}
      />
    </div>
  )
}
