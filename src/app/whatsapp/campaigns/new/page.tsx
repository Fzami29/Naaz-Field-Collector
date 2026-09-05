import { createClient } from '@/utils/supabase/server'
import { WhatsAppAssistantClient } from '@/components/WhatsAppAssistantClient'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'New WhatsApp Campaign | Naaz Field Collector',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NewWhatsAppCampaignPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const supabase = await createClient()

  // Ensure user is authenticated before rendering the page
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <Link
          href="/whatsapp/campaigns"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <MessageCircle className="h-6 w-6 text-emerald-400" />
          </div>
          New WhatsApp Campaign
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Create personalized WhatsApp messages and send them manually via Click-to-Chat. 
          Select a category, write your template using <strong className="text-emerald-400">{"{{full_name}}"}</strong>, save the campaign, and click send.
        </p>
      </div>

      <WhatsAppAssistantClient 
        initialData={{
          name: typeof resolvedParams.name === 'string' ? resolvedParams.name : undefined,
          category: typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined,
          messageTemplate: typeof resolvedParams.message === 'string' ? resolvedParams.message : undefined,
        }}
      />
    </main>
  )
}
