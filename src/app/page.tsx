import { createClient } from '@/utils/supabase/server'
import DashboardClient, { LandItem } from '@/components/DashboardClient'
import { Contact } from '@/components/ContactsListClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get start of today for initial filtering
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  // Fetch initial data from Supabase
  const [
    { data: allContacts },
    { data: recentLand },
    { count: totalLandCount },
    { count: todayLandCount },
  ] = await Promise.all([
    supabase
      .from('field_contacts')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('land_opportunities')
      .select('id, owner_name, property_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('land_opportunities')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('land_opportunities')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStr),
  ])

  return (
    <DashboardClient
      initialContacts={(allContacts as Contact[]) || []}
      initialLand={(recentLand as LandItem[]) || []}
      totalLandCount={totalLandCount || 0}
      todayLandCount={todayLandCount || 0}
    />
  )
}
