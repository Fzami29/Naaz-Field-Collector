import { fetchCampaignById, fetchContactsByCategory } from '@/app/whatsapp/actions'
import { generateWhatsAppLink, normalizeIndianPhoneNumber, renderMessage } from '@/utils/whatsapp'
import { ArrowLeft, MessageCircle, Send, Users, Copy } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CopyMessageButton } from '@/components/CopyMessageButton'

type ContactItem = {
  id: string
  full_name: string
  category: string | null
  mobile_number: string | null
  whatsapp_number: string | null
}

export const metadata = {
  title: 'Campaign Details | Naaz Field Collector',
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  
  let campaign
  try {
    campaign = await fetchCampaignById(resolvedParams.id)
  } catch {
    redirect('/whatsapp/campaigns')
  }

  // Generate the reuse URL
  const reuseParams = new URLSearchParams()
  reuseParams.append('name', `${campaign.name} (Copy)`)
  if (campaign.category) reuseParams.append('category', campaign.category)
  reuseParams.append('message', campaign.message_template)
  
  const reuseUrl = `/whatsapp/campaigns/new?${reuseParams.toString()}`

  // Fetch the current matching contacts for the detail list
  const contacts = await fetchContactsByCategory(campaign.category || 'All')

  const validContacts = contacts.filter(
    (c: { whatsapp_number: string | null; mobile_number: string | null }) =>
      normalizeIndianPhoneNumber(c.whatsapp_number || c.mobile_number || '') !== null
  )

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <MessageCircle className="h-6 w-6 text-emerald-400" />
              </div>
              {campaign.name}
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-3">
              <span>{campaign.category || 'All Contacts'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
            </p>
          </div>
          
          <Link 
            href={reuseUrl}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Copy className="h-4 w-4" />
            Reuse Campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Configuration Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-glass p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Message Template</h2>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-sm text-slate-300 italic whitespace-pre-wrap">
                {campaign.message_template}
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Current Stats</h3>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400/80 text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Valid Recipients
                </span>
                <span className="font-bold text-emerald-400">{validContacts.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recipient List (Read Only Execution) */}
        <div className="lg:col-span-2">
          <div className="card-glass p-6 min-h-[500px] flex flex-col">
            <h2 className="text-lg font-semibold text-slate-200 mb-6">
              Recipient List
            </h2>
            
            {validContacts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-700/50 rounded-xl">
                <Users className="h-12 w-12 text-slate-600 mb-4" />
                <p className="text-slate-400">No valid contacts found for this category.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[700px]">
                {(validContacts as ContactItem[]).map((contact) => (
                  <div 
                    key={contact.id} 
                    className="flex flex-col gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col max-w-[70%]">
                        <span className="font-medium text-slate-200 truncate">{contact.full_name}</span>
                        <span className="text-xs text-slate-500 mt-1">
                          {normalizeIndianPhoneNumber(contact.whatsapp_number || contact.mobile_number || '')} 
                          {contact.category && ` • ${contact.category}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CopyMessageButton message={renderMessage(campaign.message_template, contact)} />
                        <a
                          href={generateWhatsAppLink(contact.whatsapp_number || contact.mobile_number, campaign.message_template, contact) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open WhatsApp for ${contact.full_name ?? 'contact'}`}
                          className="btn-primary flex items-center gap-2 py-2 px-4 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-sm whitespace-nowrap"
                        >
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Open WhatsApp</span>
                          <span className="sm:hidden">Send</span>
                        </a>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30 text-sm text-slate-400 whitespace-pre-wrap">
                      {renderMessage(campaign.message_template, contact)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
