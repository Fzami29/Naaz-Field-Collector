import { createClient } from '@/utils/supabase/server'
import { ContactsListClient, Contact } from '@/components/ContactsListClient'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; deleted?: string }>
}) {
  const supabase = await createClient()
  const { q, category, deleted } = await searchParams

  let query = supabase
    .from('field_contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,mobile_number.ilike.%${q}%,company_name.ilike.%${q}%,district.ilike.%${q}%,village.ilike.%${q}%`
    )
  }

  if (category) {
    query = query.eq('category', category)
  }

  const { data: contacts, error } = await query

  if (error) {
    console.error('Supabase query error on /contacts:', error)
  }

  return (
    <ContactsListClient
      initialContacts={(contacts as Contact[]) || []}
      initialQuery={q || ''}
      initialCategory={category || ''}
      deletedBanner={deleted === 'true'}
    />
  )
}
