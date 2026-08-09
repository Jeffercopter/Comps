'use client'

// Sign-in panel for the VTM tool. Password sign-in against Supabase Auth —
// accounts are provisioned by CMD (no self-signup UI by design; disable
// public signups in the Supabase dashboard to enforce that server-side).

import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Dim, Err } from '@/components/ui'
import { getBrowserSupabase } from '@/lib/supabase-browser'

export default function VtmAuth({
  session,
  authRequired,
}: {
  session: Session | null
  authRequired: boolean
}) {
  const supabase = getBrowserSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!supabase) {
    return authRequired ? (
      <Err>Sign-in is required but Supabase is not configured on this deployment.</Err>
    ) : (
      <span className="chip">auth offline — open access</span>
    )
  }

  if (session) {
    return (
      <div className="flex flex-wrap items-baseline gap-3 text-[12px]">
        <span>
          <Dim>signed in as</Dim> <span className="text-phos-hot">{session.user.email}</span>
        </span>
        <button
          type="button"
          className="link-cmd"
          onClick={() => {
            void supabase.auth.signOut()
          }}
        >
          sign out
        </button>
      </div>
    )
  }

  async function signIn() {
    setBusy(true)
    setError(null)
    const { error: err } = await supabase!.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setBusy(false)
  }

  return (
    <div className="space-y-2">
      {authRequired ? (
        <div className="text-[12px] text-warn">
          This tool is licence-gated — sign in to run the model. Access is provisioned by CMD
          Consulting.
        </div>
      ) : (
        <div className="text-[12px] text-phos-dim">
          Optional sign-in — signed-in runs are attributed in the audit log.
        </div>
      )}
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          void signIn()
        }}
      >
        <label className="block">
          <span className="text-phos-dim text-[11px] uppercase tracking-widest">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-56 border border-edge bg-panel px-2 py-1 text-phos"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-phos-dim text-[11px] uppercase tracking-widest">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-44 border border-edge bg-panel px-2 py-1 text-phos"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="border border-phos/60 px-3 py-1 text-phos-hot uppercase tracking-widest hover:bg-phos/10 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {error ? <Err>ERR: {error}</Err> : null}
    </div>
  )
}
