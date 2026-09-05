'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchContactsByCategory, createCampaign, fetchTemplates } from '@/app/whatsapp/actions'
import type { WhatsAppTemplate } from '@/app/whatsapp/actions'
import { generateWhatsAppLink, normalizeIndianPhoneNumber, renderMessage } from '@/utils/whatsapp'
import { Send, Search, Loader2, User, Save, Eye, CheckCircle2, AlertTriangle, AlertCircle, Users } from 'lucide-react'
import { CopyMessageButton } from './CopyMessageButton'

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

type Contact = {
  id: string
  full_name: string
  category: string | null
  mobile_number: string | null
  whatsapp_number: string | null
}

type WizardStep = 'DRAFT' | 'REVIEW' | 'ACTIVE'

interface WhatsAppAssistantClientProps {
  initialData?: {
    name?: string
    category?: string
    messageTemplate?: string
  }
}

export function WhatsAppAssistantClient({ initialData }: WhatsAppAssistantClientProps) {
  
  // Form State
  const [name, setName] = useState(initialData?.name || '')
  const [category, setCategory] = useState<string>(initialData?.category || 'All')
  const [messageTemplate, setMessageTemplate] = useState<string>(initialData?.messageTemplate || 'Hello {{full_name}},\n\n')
  
  // Data State
  const [contacts, setContacts] = useState<Contact[]>([])
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  
  // UI State
  const [step, setStep] = useState<WizardStep>('DRAFT')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadContacts = useCallback(async (selectedCategory: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchContactsByCategory(selectedCategory)
      setContacts(data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }, [])

  // Reload contacts whenever category or step changes (only while composing)
  useEffect(() => {
    if (step === 'DRAFT') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadContacts(category)
    }
  }, [category, step, loadContacts])

  useEffect(() => {
    fetchTemplates()
      .then((data) => setTemplates(data ?? []))
      .catch(console.error)
  }, [])

  // --- Statistics & Categorization ---
  const valid: Contact[] = []
  const invalid: Contact[] = []
  const missing: Contact[] = []
  const duplicates: Contact[] = []

  const seenPhones = new Set<string>()

  contacts.forEach(contact => {
    const rawNumber = contact.whatsapp_number || contact.mobile_number
    if (!rawNumber) {
      missing.push(contact)
      return
    }

    const normalized = normalizeIndianPhoneNumber(rawNumber)
    if (!normalized) {
      invalid.push(contact)
      return
    }

    if (seenPhones.has(normalized)) {
      duplicates.push(contact)
      return
    }

    seenPhones.add(normalized)
    valid.push(contact)
  })

  const searchLower = searchTerm.toLowerCase()
  const displayedContacts = valid.filter(c =>
    (c.full_name ?? '').toLowerCase().includes(searchLower) ||
    (c.whatsapp_number ?? '').includes(searchTerm) ||
    (c.mobile_number ?? '').includes(searchTerm)
  )

  // --- Handlers ---
  const handleGeneratePreview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !messageTemplate.trim()) {
      setError("Campaign name and message are required.")
      return
    }
    setError(null)
    setStep('REVIEW')
  }

  const handleConfirmActivate = async () => {
    setSaving(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('category', category)
      formData.append('message_template', messageTemplate)

      await createCampaign(formData)

      setStep('ACTIVE')
      setSaving(false)
    } catch (err: unknown) {
      // Next.js server actions throw a special error on redirect();
      // detect it via the `digest` property, not the message string.
      const isRedirect =
        typeof err === 'object' &&
        err !== null &&
        'digest' in err &&
        typeof (err as { digest: string }).digest === 'string' &&
        (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')

      if (isRedirect) {
        setStep('ACTIVE')
        setSaving(false)
      } else {
        const message = err instanceof Error ? err.message : 'Failed to activate campaign'
        setError(message)
        setSaving(false)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* ── Configuration Panel (Steps 1 & 2) ── */}
      <div className={`space-y-6 transition-all duration-300 ${step === 'DRAFT' ? 'lg:col-span-5' : 'lg:col-span-4 opacity-50 pointer-events-none'}`}>
        <div className="card-glass p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">1</span>
              Configuration
            </h2>
            {step !== 'DRAFT' && (
              <button onClick={() => setStep('DRAFT')} className="text-xs text-emerald-400 hover:underline pointer-events-auto">
                Edit
              </button>
            )}
          </div>
          
          <form id="draft-form" onSubmit={handleGeneratePreview} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Campaign Name <span className="text-red-400">*</span></label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Festival Offer"
                className="input-field w-full"
                disabled={step !== 'DRAFT'}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Target Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field w-full"
                disabled={step !== 'DRAFT'}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Contacts' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-1.5 gap-2">
                <label className="block text-sm text-slate-400">
                  Message Template <span className="text-red-400">*</span>
                </label>
                {templates.length > 0 && step === 'DRAFT' && (
                  <select
                    className="input-field py-1.5 px-3 text-xs w-full sm:w-64 bg-slate-800/50"
                    onChange={(e) => {
                      const t = templates.find(temp => temp.id === e.target.value)
                      if (t) {
                        setMessageTemplate(t.message)
                        if (t.category && t.category !== 'All') setCategory(t.category)
                      }
                      e.target.value = '' // Reset so you can select again if needed
                    }}
                  >
                    <option value="">Load saved template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Personalize with <strong className="text-emerald-400">{"{{full_name}}"}</strong> and <strong className="text-emerald-400">{"{{category}}"}</strong>.
              </p>
              <textarea
                required
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="input-field w-full min-h-[150px] resize-y mb-4"
                placeholder="Type your message here..."
                disabled={step !== 'DRAFT'}
              />

              {step === 'DRAFT' && (
                <div className="mb-4 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Live Preview
                  </h3>
                  <p className="text-sm text-slate-300 italic whitespace-pre-wrap">
                    {renderMessage(messageTemplate, valid[0] || { full_name: 'John Doe', category: category === 'All' ? 'Advocate' : category })}
                  </p>
                </div>
              )}
            </div>

            {step === 'DRAFT' && (
              <button 
                type="submit" 
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Generate Recipient Preview
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ── Main Panel (Review & Execute) ── */}
      <div className={`space-y-6 transition-all duration-300 ${step === 'DRAFT' ? 'lg:col-span-7 opacity-20 pointer-events-none grayscale' : step === 'REVIEW' ? 'lg:col-span-7' : 'lg:col-span-8'}`}>
        
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Step 3 & 4: Review Stats */}
        <div className="card-glass p-6">
           <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step === 'REVIEW' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>2</span>
            Campaign Statistics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Total</div>
              <div className="text-2xl font-bold text-slate-200">{contacts.length}</div>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
              <div className="text-emerald-400/80 text-xs mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Valid</div>
              <div className="text-2xl font-bold text-emerald-400">{valid.length}</div>
            </div>
            <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
              <div className="text-red-400/80 text-xs mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Invalid</div>
              <div className="text-2xl font-bold text-red-400">{invalid.length}</div>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
              <div className="text-orange-400/80 text-xs mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Duplicates/Missing</div>
              <div className="text-2xl font-bold text-orange-400">{duplicates.length + missing.length}</div>
            </div>
          </div>

          {step === 'REVIEW' && (
            <div className="flex justify-end pt-4 border-t border-slate-800 mt-2">
               <button 
                onClick={handleConfirmActivate}
                disabled={saving || valid.length === 0}
                className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Confirm & Activate Campaign
              </button>
            </div>
          )}
        </div>

        {/* Step 6: Execution List */}
        {step === 'ACTIVE' && (
          <div className="card-glass p-6 min-h-[400px] flex flex-col border-emerald-500/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">3</span>
                Execute Campaign
              </h2>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search recipients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field w-full pl-9 py-1.5 text-sm"
                />
              </div>
            </div>

            {valid.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-700/50 rounded-xl">
                <User className="h-12 w-12 text-slate-600 mb-4" />
                <p className="text-slate-400">No valid contacts found in this category.</p>
              </div>
            ) : displayedContacts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-700/50 rounded-xl">
                <Search className="h-12 w-12 text-slate-600 mb-4" />
                <p className="text-slate-400">No recipients match your search.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[600px]">
                {displayedContacts.map((contact) => (
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
                        <CopyMessageButton message={renderMessage(messageTemplate, contact)} />
                        <a
                          href={generateWhatsAppLink(contact.whatsapp_number || contact.mobile_number, messageTemplate, contact) ?? '#'}
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
                      {renderMessage(messageTemplate, contact)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
