import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/login/actions'
import { Home, Users, Map, Plus, LogOut, Leaf } from 'lucide-react'

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const email = user.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <>
      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 nav-bottom z-50 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 px-2">

          <Link href="/" id="nav-home" className="flex flex-col items-center justify-center gap-1 w-16 h-full text-slate-400 hover:text-emerald-400 transition-all duration-200 hover:scale-110">
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-semibold tracking-wide">Home</span>
          </Link>

          <Link href="/contacts" id="nav-contacts" className="flex flex-col items-center justify-center gap-1 w-16 h-full text-slate-400 hover:text-emerald-400 transition-all duration-200 hover:scale-110">
            <Users className="h-5 w-5" />
            <span className="text-[9px] font-semibold tracking-wide">Contacts</span>
          </Link>

          {/* Floating Add Button */}
          <div className="relative flex justify-center items-center w-16 h-full">
            <Link
              href="/contacts/add"
              id="nav-add"
              className="absolute -top-4 btn-primary p-3.5 rounded-full anim-pulse-glow"
              aria-label="Add Contact"
            >
              <Plus className="h-5 w-5" />
            </Link>
          </div>

          <Link href="/land" id="nav-land" className="flex flex-col items-center justify-center gap-1 w-16 h-full text-slate-400 hover:text-emerald-400 transition-all duration-200 hover:scale-110">
            <Map className="h-5 w-5" />
            <span className="text-[9px] font-semibold tracking-wide">Land</span>
          </Link>

          <form action={logout} className="flex items-center justify-center w-16 h-full">
            <button
              id="nav-logout-mobile"
              type="submit"
              className="flex flex-col items-center justify-center gap-1 w-full h-full text-slate-400 hover:text-red-400 transition-all duration-200 hover:scale-110"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[9px] font-semibold tracking-wide">Logout</span>
            </button>
          </form>
        </div>
      </nav>

      {/* ── Desktop Top Navigation ── */}
      <nav className="hidden md:block nav-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" id="nav-logo" className="flex items-center gap-2.5 group">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <Leaf className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="font-bold text-lg text-gradient">Naaz Field Collector</span>
              </Link>

              {/* Nav Links */}
              <div className="flex items-center gap-1">
                <Link href="/" id="nav-desk-home" className="btn-ghost text-sm">Dashboard</Link>
                <Link href="/contacts" id="nav-desk-contacts" className="btn-ghost text-sm">Contacts</Link>
                <Link href="/land" id="nav-desk-land" className="btn-ghost text-sm">Land</Link>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-strong">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-slate-900">
                  {initials}
                </div>
                <span className="text-sm text-slate-300 max-w-[160px] truncate">{email}</span>
              </div>

              <form action={logout}>
                <button
                  id="nav-logout-desktop"
                  type="submit"
                  className="btn-ghost text-sm text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-400/40"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
