'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Shared type definitions
export type WhatsAppCampaign = {
  id: string
  created_by: string
  name: string
  category: string | null
  message_template: string
  created_at: string
  updated_at: string
}

export type WhatsAppTemplate = {
  id: string
  created_by: string
  name: string
  category: string | null
  message: string
  created_at: string
  updated_at: string
}

export type ContactRow = {
  id: string
  full_name: string
  category: string | null
  mobile_number: string | null
  whatsapp_number: string | null
}

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
    .select('id, full_name, mobile_number, whatsapp_number, category')
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching contacts:', error)
    throw new Error('Failed to fetch contacts')
  }

  return data
}

export async function createCampaign(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  const name = (formData.get('name') as string)?.trim()
  const category = (formData.get('category') as string)?.trim()
  const message_template = (formData.get('message_template') as string)?.trim()

  if (!name || !message_template) {
    throw new Error('Campaign Name and Message Template are required')
  }

  const campaignData = {
    created_by: user.id,
    name,
    category: category && category !== 'All' ? category : null,
    message_template,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('whatsapp_campaigns')
    .insert(campaignData)
    .select('id')
    .single()

  if (error) {
    console.error('Supabase error creating campaign:', error)
    throw new Error(`Failed to create campaign: ${error.message}`)
  }

  // No redirect - we let the client UI transition to ACTIVE phase
  return data
}

export async function fetchCampaigns() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  // RLS ensures only own campaigns are returned; .eq() here is defense-in-depth
  const { data: campaigns, error } = await supabase
    .from('whatsapp_campaigns')
    .select('id, created_by, name, category, message_template, created_at, updated_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
    throw new Error('Failed to fetch campaigns')
  }

  // Compute recipient_count per campaign by checking actual valid contacts
  // We only select what we need — no full record leak
  const { data: contacts } = await supabase
    .from('field_contacts')
    .select('category, whatsapp_number, mobile_number')

  const validContacts = (contacts ?? []).filter(
    (c) => (c.whatsapp_number ?? '').trim() || (c.mobile_number ?? '').trim()
  )

  const categoryCounts = validContacts.reduce<Record<string, number>>((acc, c) => {
    const cat = c.category ?? 'Unknown'
    acc[cat] = (acc[cat] ?? 0) + 1
    acc['All'] = (acc['All'] ?? 0) + 1
    return acc
  }, {})

  return (campaigns ?? []).map((c: WhatsAppCampaign) => ({
    ...c,
    recipient_count: c.category
      ? (categoryCounts[c.category] ?? 0)
      : (categoryCounts['All'] ?? 0),
  }))
}

export async function fetchCampaignById(id: string): Promise<WhatsAppCampaign> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // RLS ensures only own campaigns are returned; .eq(created_by) is defense-in-depth
  const { data, error } = await supabase
    .from('whatsapp_campaigns')
    .select('id, created_by, name, category, message_template, created_at, updated_at')
    .eq('id', id)
    .eq('created_by', user.id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch campaign: ${error.message}`)
  }

  return data as WhatsAppCampaign
}

// ------------------------------------------------------------------
// WhatsApp Templates
// ------------------------------------------------------------------

export async function fetchTemplates(): Promise<WhatsAppTemplate[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // RLS enforces created_by; .eq() is defense-in-depth
  const { data, error } = await supabase
    .from('whatsapp_templates')
    .select('id, created_by, name, category, message, created_at, updated_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching templates:', error)
    throw new Error('Failed to fetch templates')
  }

  return (data ?? []) as WhatsAppTemplate[]
}

export async function createTemplate(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const name = (formData.get('name') as string)?.trim()
  const category = (formData.get('category') as string)?.trim()
  const message = (formData.get('message') as string)?.trim()

  if (!name || !message) {
    throw new Error('Template Name and Message are required')
  }

  const templateData = {
    created_by: user.id,
    name,
    category: category && category !== 'All' ? category : null,
    message,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('whatsapp_templates')
    .insert(templateData)

  if (error) {
    console.error('Supabase error creating template:', error)
    throw new Error(`Failed to create template: ${error.message}`)
  }

  revalidatePath('/whatsapp/templates')
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Defense-in-depth: only delete if the row belongs to the authenticated user.
  // RLS already enforces this at the DB level, but we add an explicit check here
  // so the server action never silently succeeds for a foreign-owned record.
  const { error } = await supabase
    .from('whatsapp_templates')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    console.error('Supabase error deleting template:', error)
    throw new Error(`Failed to delete template: ${error.message}`)
  }

  revalidatePath('/whatsapp/templates')
}
