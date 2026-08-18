import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PlusCircle, Users, Map, ArrowRight, TrendingUp, Sparkles } from 'lucide-react'

export default async function Dashboard() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

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

  const [
    { data: recentContacts },
    { data: recentLand }
  ] = await Promise.all([
    supabase.from('field_contacts').select('id, full_name, category, created_at').order('created_at', { ascending: false }).limit(4),
    supabase.from('land_opportunities').select('id, owner_name, property_type, status, created_at').order('created_at', { ascending: false }).limit(4)
  ])

  const statusColors: Record<string, string> = {
    'Available':            'badge-emerald',
    'Under Discussion':     'badge-yellow',
    'Sold':                 'badge-gray',
    'Not Available':        'badge-red',
    'Follow Up Required':   'badge-blue',
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">

      {/* Header */}
      <div className="mb-8 anim-fadeInUp">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="section-label">Overview</span>
        </div>
        <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
        <p className="text-slate-400 mt-1">Your field collection at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        {[
          { label: "Today's Contacts", value: todayContacts ?? 0, icon: Users,       accent: 'from-emerald-400 to-teal-400',   glow: 'rgba(16,185,129,0.3)' },
          { label: 'Total Contacts',   value: totalContacts ?? 0, icon: Users,       accent: 'from-cyan-400 to-blue-400',      glow: 'rgba(34,211,238,0.25)' },
          { label: "Today's Land",     value: todayLand ?? 0,     icon: Map,         accent: 'from-violet-400 to-purple-400',  glow: 'rgba(167,139,250,0.25)' },
          { label: 'Total Land',       value: totalLand ?? 0,     icon: TrendingUp,  accent: 'from-amber-400 to-orange-400',   glow: 'rgba(251,191,36,0.25)' },
        ].map(({ label, value, icon: Icon, accent, glow }) => (
          <div key={label} className="stat-card anim-fadeInUp" style={{ '--glow': glow } as React.CSSProperties}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 leading-tight">{label}</p>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${accent} bg-opacity-10 shrink-0`}
                   style={{ background: `linear-gradient(135deg, ${glow.replace('0.3','0.18')}, transparent)`, border: `1px solid ${glow}` }}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{value}</p>
            <div className={`mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r ${accent} opacity-60`} />
          </div>
        ))}
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 anim-fadeInUp" style={{ animationDelay: '0.15s' }}>
        <Link
          href="/contacts/add"
          id="dash-add-contact"
          className="btn-primary py-5 text-base rounded-2xl group"
        >
          <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          Add New Contact
        </Link>
        <Link
          href="/land/add"
          id="dash-add-land"
          className="btn-primary py-5 text-base rounded-2xl group"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
        >
          <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          Add Land Opportunity
        </Link>
      </div>

      {/* Recent Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 anim-fadeInUp" style={{ animationDelay: '0.25s' }}>

        {/* Recent Contacts */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <h2 className="font-semibold text-slate-100">Recent Contacts</h2>
            </div>
            <Link href="/contacts" id="dash-view-contacts" className="btn-ghost text-xs px-3 py-1.5 rounded-lg">
              View all <ArrowRight className="h-3 w-3 inline ml-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {!recentContacts?.length ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">
                No contacts collected yet.
              </div>
            ) : (
              recentContacts.map(c => (
                <Link
                  key={c.id}
                  href={`/contacts/${c.id}`}
                  className="card-link flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                      {c.full_name.slice(0,1).toUpperCase()}
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
              <h2 className="font-semibold text-slate-100">Recent Land</h2>
            </div>
            <Link href="/land" id="dash-view-land" className="btn-ghost text-xs px-3 py-1.5 rounded-lg">
              View all <ArrowRight className="h-3 w-3 inline ml-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {!recentLand?.length ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">
                No land opportunities collected yet.
              </div>
            ) : (
              recentLand.map(l => (
                <Link
                  key={l.id}
                  href={`/land/${l.id}`}
                  className="card-link flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                      {(l.owner_name ?? 'U').slice(0,1).toUpperCase()}
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
    </div>
  )
}
