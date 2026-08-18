'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createContact(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
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
    updated_at: new Date().toISOString()
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

  const { data: { user }, error: userError } = await supabase.auth.getUser()
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
    updated_at: new Date().toISOString()
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

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const { error } = await supabase
    .from('field_contacts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Supabase error deleting contact:', error)
    throw new Error(`Failed to delete contact: ${error.message}`)
  }

  revalidatePath('/contacts')
  revalidatePath('/')
  redirect('/contacts?deleted=true')
}
