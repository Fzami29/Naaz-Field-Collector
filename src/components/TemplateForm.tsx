'use client'

import { useState } from 'react'
import { createTemplate } from '@/app/whatsapp/actions'
import { Save, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  'All',
  'Advocate',
  'Seller',
  'Buyer',
  'Banker',
  'Real Estate Agent',
  'Developer',
  'Land Owner',
  'Other',
]

export function TemplateForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('All')
  const [message, setMessage] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('category', category)
      formData.append('message', message)
      
      await createTemplate(formData)
      router.push('/whatsapp/templates')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="card-glass p-6 space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm text-slate-400 mb-1.5">Template Name <span className="text-red-400">*</span></label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Follow Up Pitch"
          className="input-field w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1.5">Intended Audience (Optional)</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field w-full"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'Any Category' : cat}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">Used to filter templates when building a campaign.</p>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1.5">Message Content <span className="text-red-400">*</span></label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input-field w-full min-h-[200px] resize-y"
          placeholder="Type your template message here..."
        />
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button 
          type="submit" 
          disabled={saving}
          className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Template
        </button>
      </div>
    </form>
  )
}
