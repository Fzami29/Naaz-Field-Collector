import { createClient } from '@/utils/supabase/server'
import { WhatsAppAssistantClient } from '@/components/WhatsAppAssistantClient'
import { MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'WhatsApp Assistant | Naaz Field Collector',
}

export default async function AssistantPage() {
  const supabase = await createClient()

  // Ensure user is authenticated before rendering the page
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <MessageCircle className="h-6 w-6 text-emerald-400" />
          </div>
          WhatsApp Assistant
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Create personalized WhatsApp messages and send them manually via Click-to-Chat. 
          Select a category, write your template using <strong className="text-emerald-400">[Name]</strong>, and click send.
        </p>
      </div>

      <WhatsAppAssistantClient />
    </main>
  )
}
