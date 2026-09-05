import { createClient } from '@/utils/supabase/server'
import { LayoutTemplate, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { TemplateForm } from '@/components/TemplateForm'

export const metadata = {
  title: 'New Template | Naaz Field Collector',
}

export default async function NewTemplatePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <Link
          href="/whatsapp/templates"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Link>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <LayoutTemplate className="h-6 w-6 text-emerald-400" />
          </div>
          Create Template
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Save a reusable message that can be loaded into any campaign. Use <strong className="text-emerald-400">{"{{full_name}}"}</strong> and <strong className="text-emerald-400">{"{{category}}"}</strong> for personalization.
        </p>
      </div>

      <TemplateForm />
    </main>
  )
}
