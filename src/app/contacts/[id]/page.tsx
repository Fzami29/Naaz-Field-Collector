import { createClient } from '@/utils/supabase/server'
import { ContactDetailClient } from '@/components/ContactDetailClient'
import { Contact } from '@/components/ContactsListClient'
import { ContactMeeting } from '@/components/MeetingModal'
import { ContactFollowup } from '@/components/FollowupModal'
import { notFound } from 'next/navigation'

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { id } = await params
  const { success } = await searchParams
  const supabase = await createClient()

  // Fetch contact, meetings, and follow-ups concurrently from Supabase
  const [
    { data: contact, error: contactError },
    { data: meetings },
    { data: followups },
  ] = await Promise.all([
    supabase.from('field_contacts').select('*').eq('id', id).single(),
    supabase
      .from('contact_meetings')
      .select('*')
      .eq('contact_id', id)
      .order('meeting_date', { ascending: false }),
    supabase
      .from('contact_followups')
      .select('*')
      .eq('contact_id', id)
      .order('due_date', { ascending: true }),
  ])

  if (contactError || !contact) {
    notFound()
  }

  return (
    <ContactDetailClient
      contact={contact as Contact}
      initialMeetings={(meetings as ContactMeeting[]) || []}
      initialFollowups={(followups as ContactFollowup[]) || []}
      successBanner={success === 'true'}
    />
  )
}
