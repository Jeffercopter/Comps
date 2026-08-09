// ── /api/vtm — VTM tower mill power model endpoint ───────────────────────────
// GET  → public frame catalogue (geometry + motor sizes, no model output)
// POST → run the power model server-side and return numbers only
//
// The calculation engine and its coefficients never leave this process: the
// client bundle contains the form and the renderer, nothing else. Every run is
// logged to Supabase (vtm_runs, insert-only) when configured. If a Supabase
// JWT is presented it is verified and attached to the log; set
// VTM_REQUIRE_AUTH=1 to make a valid sign-in mandatory.

import { NextResponse, type NextRequest } from 'next/server'
import { evaluate, listFrames, type EvaluateRequest } from '@/lib/vtm/engine.server'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ frames: listFrames() })
}

async function resolveUser(req: NextRequest): Promise<{ userId: string | null; authError: string | null }> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return { userId: null, authError: null }
  const supabase = getSupabase()
  if (!supabase) return { userId: null, authError: 'auth token presented but Supabase is not configured' }
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return { userId: null, authError: 'invalid or expired token' }
  return { userId: data.user.id, authError: null }
}

export async function POST(req: NextRequest) {
  let body: EvaluateRequest
  try {
    body = (await req.json()) as EvaluateRequest
  } catch {
    return NextResponse.json({ error: 'request body must be JSON' }, { status: 400 })
  }

  const { userId, authError } = await resolveUser(req)
  if (process.env.VTM_REQUIRE_AUTH === '1' && !userId) {
    return NextResponse.json({ error: authError ?? 'sign-in required' }, { status: 401 })
  }

  try {
    const result = evaluate(body)

    // Audit trail: best-effort — an insert failure never fails the
    // calculation. Awaited rather than fire-and-forget because a serverless
    // function can be frozen as soon as the response returns, which would
    // drop an un-awaited insert.
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { error: insertError } = await supabase.from('vtm_runs').insert({
          user_id: userId,
          mode: body.mode === 'frame' ? 'frame' : 'custom',
          family: result.family,
          model: result.model,
          units: result.units,
          d_m: result.geometry.D,
          h_m: result.geometry.H,
          s_m: result.geometry.S,
          rpm: result.geometry.rpm,
          tph: result.duty?.tph ?? null,
          se_kwht: result.duty?.seKwht ?? null,
          p_avg_kw: result.perUnit.pAvgKW,
          expected_shaft_kw: result.perUnit.expectedShaftKW,
        })
        if (insertError) console.warn('vtm_runs insert failed:', insertError.message)
      } catch (logErr) {
        console.warn('vtm_runs insert failed:', logErr)
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode === 400 ? 400 : 500
    const message =
      status === 400 ? (err as Error).message : 'calculation failed'
    if (status === 500) console.error('vtm evaluate failed:', err)
    return NextResponse.json({ error: message }, { status })
  }
}
