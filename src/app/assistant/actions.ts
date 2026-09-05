'use server'

import { createClient } from '@/utils/supabase/server'

export async function fetchContactsByCategory(category: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  let query = supabase
    .from('field_contacts')
    .select('id, full_name, mobile_number, whatsapp_number')
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching contacts for assistant:', error)
    throw new Error('Failed to fetch contacts')
  }

  return data
}
