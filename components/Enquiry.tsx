'use client'

import { useState } from 'react'
import { Dim, Head } from '@/components/ui'
import { submitEnquiry } from '@/lib/supabase'

const INTERESTS = [
  'Open gear conversion',
  'Enclosed gearbox oils',
  'Dragline package',
  'Grease consolidation',
  'Distributorship discussion',
]

type State = 'idle' | 'sending' | 'sent' | 'failed'

/**
 * Enquiry capture. Writes to the Supabase `enquiries` table, which is
 * insert-only for anonymous users — the console can lodge a lead but cannot
 * read the lead list back.
 */
export default function Enquiry() {
  const [form, setForm] = useState({
    company: '',
    contact: '',
    email: '',
    interest: INTERESTS[0],
    message: '',
  })
  const [state, setState] = useState<State>('idle')
  const [detail, setDetail] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    const res = await submitEnquiry(form)
    setDetail(res.detail)
    setState(res.ok ? 'sent' : 'failed')
  }

  if (state === 'sent') {
    return (
      <div className="max-w-[72ch]">
        <Head>enquiry lodged</Head>
        <div className="text-phos-hot">
          ✓ Recorded against {form.company || 'your organisation'}. A technical response follows —
          the first step is a gear survey, not a quotation.
        </div>
      </div>
    )
  }

  const field = 'w-full bg-transparent border border-edge px-2 py-1 outline-none focus:border-phos text-phos'

  return (
    <form onSubmit={onSubmit} className="max-w-[72ch]">
      <Head>enquiry</Head>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-phos-dim">Company</span>
          <input required className={field} value={form.company} onChange={set('company')} />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-phos-dim">Contact</span>
          <input required className={field} value={form.contact} onChange={set('contact')} />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-phos-dim">Email</span>
          <input required type="email" className={field} value={form.email} onChange={set('email')} />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-widest text-phos-dim">Interest</span>
          <select className={field} value={form.interest} onChange={set('interest')}>
            {INTERESTS.map((i) => (
              <option key={i} value={i} className="bg-panel text-phos">
                {i}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-2 block">
        <span className="text-[11px] uppercase tracking-widest text-phos-dim">
          Equipment / current product / measured consumption
        </span>
        <textarea rows={3} className={field} value={form.message} onChange={set('message')} />
      </label>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={state === 'sending'}
          className="border border-phos px-3 py-1 uppercase tracking-widest text-[11px] text-phos-hot hover:bg-phos/15 disabled:opacity-50"
        >
          {state === 'sending' ? 'transmitting…' : 'transmit'}
        </button>
        {state === 'failed' ? <span className="text-crit">{detail}</span> : null}
      </div>

      <div className="mt-2 text-[11px]">
        <Dim>
          Stored in Supabase (`enquiries`, insert-only under RLS). With no Supabase project
          configured the form reports the failure rather than pretending to have sent.
        </Dim>
      </div>
    </form>
  )
}
