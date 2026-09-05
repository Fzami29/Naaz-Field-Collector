import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, MessageCircle } from 'lucide-react'
import { fetchCampaigns } from '@/app/whatsapp/actions'
import type { WhatsAppCampaign } from '@/app/whatsapp/actions'

export const metadata = {
  title: 'WhatsApp Campaigns | Naaz Field Collector',
}

export default async function WhatsAppCampaignsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  let campaigns: (WhatsAppCampaign & { recipient_count: number })[] = []
  try {
    campaigns = await fetchCampaigns()
  } catch (error) {
    console.error('Error fetching campaigns:', error)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <MessageCircle className="h-6 w-6 text-emerald-400" />
            </div>
            WhatsApp Campaigns
          </h1>
          <p className="text-slate-400 mt-2">Manage your saved click-to-chat WhatsApp messages</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/whatsapp/templates"
            className="btn-ghost flex items-center gap-2 border border-slate-700 hover:border-slate-600"
          >
            <span className="hidden sm:inline">Templates</span>
          </Link>
          <Link
            href="/whatsapp/campaigns/new"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Campaign</span>
          </Link>
        </div>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="card-glass border-dashed border-slate-700/50 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No campaigns yet</h3>
          <p className="text-slate-500 mb-6">Create your first WhatsApp campaign to quickly message contacts.</p>
          <Link href="/whatsapp/campaigns/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link
              href={`/whatsapp/campaigns/${campaign.id}`}
              key={campaign.id}
              className="card-glass flex flex-col justify-between hover:border-emerald-500/50 transition-colors group cursor-pointer"
            >
              <div>
                <h3 className="font-semibold text-lg text-slate-200 mb-4 group-hover:text-emerald-400 transition-colors">
                  {campaign.name}
                </h3>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Target Category</span>
                    <span className="text-slate-300 font-medium">{campaign.category || 'All Contacts'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Recipients (Current)</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {campaign.recipient_count}
                    </span>
                  </div>
                  <div className="flex flex-col mt-4">
                    <span className="text-slate-500 mb-1">Message Preview</span>
                    <p className="text-slate-300 italic line-clamp-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      {campaign.message_template}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-800 mt-4">
                <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  By You
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
