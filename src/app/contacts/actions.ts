'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createContact(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const contactData = {
    created_by: user.id,
    full_name: formData.get('full_name') as string,
    category: formData.get('category') as string,
    mobile_number: formData.get('mobile_number') as string || null,
    whatsapp_number: formData.get('whatsapp_number') as string || null,
    company_name: formData.get('company_name') as string || null,
    designation: formData.get('designation') as string || null,
    district: formData.get('district') as string || null,
    taluk: formData.get('taluk') as string || null,
    village: formData.get('village') as string || null,
    area: formData.get('area') as string || null,
    address: formData.get('address') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error, data } = await supabase.from('field_contacts').insert(contactData).select('id').single()

  if (error) {
    console.error('Error inserting contact:', error)
    throw new Error('Failed to create contact')
  }

  revalidatePath('/contacts')
  revalidatePath('/')
  redirect(`/contacts/${data.id}?success=true`)
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient()

  const contactData = {
    full_name: formData.get('full_name') as string,
    category: formData.get('category') as string,
    mobile_number: formData.get('mobile_number') as string || null,
    whatsapp_number: formData.get('whatsapp_number') as string || null,
    company_name: formData.get('company_name') as string || null,
    designation: formData.get('designation') as string || null,
    district: formData.get('district') as string || null,
    taluk: formData.get('taluk') as string || null,
    village: formData.get('village') as string || null,
    area: formData.get('area') as string || null,
    address: formData.get('address') as string || null,
    notes: formData.get('notes') as string || null,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase.from('field_contacts').update(contactData).eq('id', id)

  if (error) {
    console.error('Error updating contact:', error)
    throw new Error('Failed to update contact')
  }

  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  revalidatePath('/')
  redirect(`/contacts/${id}?success=true`)
}
