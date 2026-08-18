'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ── Contact Actions ─────────────────────────────────────────────────────────

export async function createContact(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const fullName = (formData.get('full_name') as string)?.trim()
  const category = (formData.get('category') as string)?.trim()

  if (!fullName) {
    throw new Error('Full Name is required.')
  }
  if (!category) {
    throw new Error('Category is required.')
  }

  const contactData = {
    created_by: user.id,
    full_name: fullName,
    category: category,
    mobile_number: (formData.get('mobile_number') as string)?.trim() || null,
    whatsapp_number: (formData.get('whatsapp_number') as string)?.trim() || null,
    company_name: (formData.get('company_name') as string)?.trim() || null,
    designation: (formData.get('designation') as string)?.trim() || null,
    district: (formData.get('district') as string)?.trim() || null,
    taluk: (formData.get('taluk') as string)?.trim() || null,
    village: (formData.get('village') as string)?.trim() || null,
    area: (formData.get('area') as string)?.trim() || null,
    address: (formData.get('address') as string)?.trim() || null,
    notes: (formData.get('notes') as string)?.trim() || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('field_contacts')
    .insert(contactData)
    .select('id')
    .single()

  if (error) {
    console.error('Supabase error inserting contact:', error)
    throw new Error(`Failed to create contact: ${error.message}`)
  }

  revalidatePath('/contacts')
  revalidatePath('/')
  redirect(`/contacts/${data.id}?success=true`)
}

export async function updateContact(id: string, formData: FormData) {
  if (!id) {
    throw new Error('Missing contact ID for update.')
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const fullName = (formData.get('full_name') as string)?.trim()
  const category = (formData.get('category') as string)?.trim()

  if (!fullName) {
    throw new Error('Full Name is required.')
  }
  if (!category) {
    throw new Error('Category is required.')
  }

  const contactData = {
    full_name: fullName,
    category: category,
    mobile_number: (formData.get('mobile_number') as string)?.trim() || null,
    whatsapp_number: (formData.get('whatsapp_number') as string)?.trim() || null,
    company_name: (formData.get('company_name') as string)?.trim() || null,
    designation: (formData.get('designation') as string)?.trim() || null,
    district: (formData.get('district') as string)?.trim() || null,
    taluk: (formData.get('taluk') as string)?.trim() || null,
    village: (formData.get('village') as string)?.trim() || null,
    area: (formData.get('area') as string)?.trim() || null,
    address: (formData.get('address') as string)?.trim() || null,
    notes: (formData.get('notes') as string)?.trim() || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('field_contacts')
    .update(contactData)
    .eq('id', id)

  if (error) {
    console.error('Supabase error updating contact:', error)
    throw new Error(`Failed to update contact: ${error.message}`)
  }

  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  revalidatePath('/')
  redirect(`/contacts/${id}?success=true`)
}

export async function deleteContact(id: string) {
  if (!id) {
    throw new Error('Missing contact ID for deletion.')
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const { error } = await supabase.from('field_contacts').delete().eq('id', id)

  if (error) {
    console.error('Supabase error deleting contact:', error)
    throw new Error(`Failed to delete contact: ${error.message}`)
  }

  revalidatePath('/contacts')
  revalidatePath('/')
  redirect('/contacts?deleted=true')
}

// ── Meeting Actions ─────────────────────────────────────────────────────────

export async function createMeeting(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const contactId = formData.get('contact_id') as string
  const summary = (formData.get('summary') as string)?.trim()
  const meetingDate = formData.get('meeting_date') as string
  const meetingType = (formData.get('meeting_type') as string) || 'In-Person'
  const location = (formData.get('location') as string)?.trim() || null
  const outcome = (formData.get('outcome') as string)?.trim() || null

  if (!contactId || !summary) {
    throw new Error('Contact ID and Summary are required.')
  }

  const meetingData = {
    contact_id: contactId,
    created_by: user.id,
    meeting_date: meetingDate ? new Date(meetingDate).toISOString() : new Date().toISOString(),
    meeting_type: meetingType,
    status: (formData.get('status') as string) || 'Completed',
    location,
    summary,
    outcome,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('contact_meetings')
    .insert(meetingData)
    .select()
    .single()

  if (error) {
    console.error('Supabase error creating meeting:', error)
    throw new Error(`Failed to create meeting: ${error.message}`)
  }

  revalidatePath(`/contacts/${contactId}`)
  revalidatePath('/')
  return data
}

export async function deleteMeeting(id: string, contactId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const { error } = await supabase.from('contact_meetings').delete().eq('id', id)

  if (error) {
    console.error('Supabase error deleting meeting:', error)
    throw new Error(`Failed to delete meeting: ${error.message}`)
  }

  revalidatePath(`/contacts/${contactId}`)
  revalidatePath('/')
  return true
}

// ── Follow-up Actions ───────────────────────────────────────────────────────

export async function createFollowup(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const contactId = formData.get('contact_id') as string
  const title = (formData.get('title') as string)?.trim()
  const dueDate = formData.get('due_date') as string
  const priority = (formData.get('priority') as string) || 'Medium'
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!contactId || !title || !dueDate) {
    throw new Error('Contact ID, Title, and Due Date are required.')
  }

  const followupData = {
    contact_id: contactId,
    created_by: user.id,
    due_date: new Date(dueDate).toISOString(),
    title,
    priority,
    status: 'Pending',
    notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('contact_followups')
    .insert(followupData)
    .select()
    .single()

  if (error) {
    console.error('Supabase error creating follow-up:', error)
    throw new Error(`Failed to create follow-up: ${error.message}`)
  }

  revalidatePath(`/contacts/${contactId}`)
  revalidatePath('/')
  return data
}

export async function updateFollowupStatus(id: string, status: string, contactId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const updateData: { status: string; completed_at?: string | null; updated_at: string } = {
    status,
    completed_at: status === 'Completed' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('contact_followups')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Supabase error updating follow-up:', error)
    throw new Error(`Failed to update follow-up: ${error.message}`)
  }

  revalidatePath(`/contacts/${contactId}`)
  return true
}

export async function deleteFollowup(id: string, contactId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const { error } = await supabase.from('contact_followups').delete().eq('id', id)

  if (error) {
    console.error('Supabase error deleting follow-up:', error)
    throw new Error(`Failed to delete follow-up: ${error.message}`)
  }

  revalidatePath(`/contacts/${contactId}`)
  return true
}
