import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/login/actions'
import { Home, Users, Map, Plus, LogOut } from 'lucide-react'

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-emerald-700">
            <Home className="h-6 w-6" />
            <span className="text-[10px] font-medium mt-1">Home</span>
          </Link>
          <Link href="/contacts" className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-emerald-700">
            <Users className="h-6 w-6" />
            <span className="text-[10px] font-medium mt-1">Contacts</span>
          </Link>
          <Link href="/land" className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-emerald-700">
            <Map className="h-6 w-6" />
            <span className="text-[10px] font-medium mt-1">Land</span>
          </Link>
          
          <div className="relative flex justify-center w-full h-full">
            <Link href="/contacts/add" className="absolute -top-5 bg-emerald-700 text-white p-3 rounded-full shadow-lg hover:bg-emerald-800 transition-colors">
              <Plus className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden md:block bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl">Naaz Field Collector</span>
              </div>
              <div className="ml-6 flex items-center space-x-4">
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700">Dashboard</Link>
                <Link href="/contacts" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700">Contacts</Link>
                <Link href="/land" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700">Land</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-emerald-100">{user.email}</span>
              <form action={logout}>
                <button className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
