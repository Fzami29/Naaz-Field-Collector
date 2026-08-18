'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLand(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const landData = {
    created_by: user.id,
    listing_type: formData.get('listing_type') as string,
    property_type: formData.get('property_type') as string || null,
    status: formData.get('status') as string,
    owner_name: formData.get('owner_name') as string || null,
    contact_number: formData.get('contact_number') as string || null,
    district: formData.get('district') as string || null,
    taluk: formData.get('taluk') as string || null,
    hobli: formData.get('hobli') as string || null,
    village: formData.get('village') as string || null,
    area: formData.get('area') as string || null,
    survey_number: formData.get('survey_number') as string || null,
    nearby_landmark: formData.get('nearby_landmark') as string || null,
    road_access: formData.get('road_access') as string || null,
    asking_price: formData.get('asking_price') as string || null,
    location_description: formData.get('location_description') as string || null,
    notes: formData.get('notes') as string || null,
  }

  const { error, data } = await supabase.from('land_opportunities').insert(landData).select('id').single()

  if (error) {
    console.error('Error inserting land opportunity:', error)
    throw new Error('Failed to create land opportunity')
  }

  revalidatePath('/land')
  revalidatePath('/')
  redirect(`/land/${data.id}?success=true`)
}

export async function updateLand(id: string, formData: FormData) {
  const supabase = await createClient()

  const landData = {
    listing_type: formData.get('listing_type') as string,
    property_type: formData.get('property_type') as string || null,
    status: formData.get('status') as string,
    owner_name: formData.get('owner_name') as string || null,
    contact_number: formData.get('contact_number') as string || null,
    district: formData.get('district') as string || null,
    taluk: formData.get('taluk') as string || null,
    hobli: formData.get('hobli') as string || null,
    village: formData.get('village') as string || null,
    area: formData.get('area') as string || null,
    survey_number: formData.get('survey_number') as string || null,
    nearby_landmark: formData.get('nearby_landmark') as string || null,
    road_access: formData.get('road_access') as string || null,
    asking_price: formData.get('asking_price') as string || null,
    location_description: formData.get('location_description') as string || null,
    notes: formData.get('notes') as string || null,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase.from('land_opportunities').update(landData).eq('id', id)

  if (error) {
    console.error('Error updating land opportunity:', error)
    throw new Error('Failed to update land opportunity')
  }

  revalidatePath('/land')
  revalidatePath(`/land/${id}`)
  revalidatePath('/')
  redirect(`/land/${id}?success=true`)
}

export async function deleteLand(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('land_opportunities').delete().eq('id', id)

  if (error) {
    console.error('Error deleting land opportunity:', error)
    throw new Error('Failed to delete land opportunity')
  }

  revalidatePath('/land')
  revalidatePath('/')
  redirect('/land')
}
