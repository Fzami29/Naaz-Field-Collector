import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, LayoutTemplate, ArrowLeft, Trash2 } from 'lucide-react'
import { fetchTemplates, deleteTemplate } from '@/app/whatsapp/actions'
import type { WhatsAppTemplate } from '@/app/whatsapp/actions'

export const metadata = {
  title: 'Message Templates | Naaz Field Collector',
}

export default async function TemplatesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  let templates: WhatsAppTemplate[] = []
  try {
    templates = await fetchTemplates()
  } catch (error) {
    console.error('Error fetching templates:', error)
  }

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
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <LayoutTemplate className="h-6 w-6 text-emerald-400" />
              </div>
              Message Templates
            </h1>
            <p className="text-slate-400 mt-2">Create reusable messages to quickly load into your campaigns.</p>
          </div>
          
          <Link
            href="/whatsapp/templates/new"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Template</span>
          </Link>
        </div>
      </div>

      {!templates || templates.length === 0 ? (
        <div className="card-glass border-dashed border-slate-700/50 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <LayoutTemplate className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No templates yet</h3>
          <p className="text-slate-500 mb-6">Create a reusable template to speed up your workflow.</p>
          <Link href="/whatsapp/templates/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="card-glass flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-slate-200">
                    {template.name}
                  </h3>
                  <form action={async () => {
                    'use server'
                    await deleteTemplate(template.id)
                  }}>
                    <button type="submit" className="text-slate-500 hover:text-red-400 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Intended For</span>
                    <span className="text-slate-300 font-medium">{template.category || 'Any Category'}</span>
                  </div>
                  <div className="flex flex-col mt-4">
                    <span className="text-slate-500 mb-1">Message Content</span>
                    <p className="text-slate-300 italic whitespace-pre-wrap line-clamp-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      {template.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 pt-4 border-t border-slate-800 mt-4">
                Created {new Date(template.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
