import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { checkAdminAccess } from '../_lib/auth'

export async function GET(req: NextRequest) {
  const token  = req.nextUrl.searchParams.get('token') ?? undefined
  const from   = req.nextUrl.searchParams.get('from') ?? undefined
  const to     = req.nextUrl.searchParams.get('to') ?? undefined

  const isAdmin = await checkAdminAccess(token)
  if (!isAdmin) return new NextResponse('403 — Accès refusé.', { status: 403 })

  const supabase = createServerSupabase()

  let query = supabase
    .from('registrations')
    .select('created_at, participant_email, amount_paid_cents, platform_fee_cents, stripe_session_id, payment_status, experiences(title)')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: true })

  if (from) query = query.gte('created_at', from)
  if (to)   query = query.lte('created_at', `${to}T23:59:59Z`)

  const { data, error } = await query
  if (error) return new NextResponse('Erreur DB', { status: 500 })

  const rows = (data ?? []) as {
    created_at: string
    participant_email: string
    amount_paid_cents: number | null
    platform_fee_cents: number | null
    stripe_session_id: string | null
    payment_status: string
    experiences: { title: string } | null
  }[]

  const header = 'date,experience,participant_email,montant_brut_eur,commission_15pct_eur,montant_net_eur,stripe_session_id,status'

  const lines = rows.map(r => {
    const brut = (r.amount_paid_cents  ?? 0) / 100
    const comm = (r.platform_fee_cents ?? 0) / 100
    const net  = brut - comm
    const title = (r.experiences?.title ?? '').replace(/"/g, '""')
    return [
      new Date(r.created_at).toISOString().slice(0, 10),
      `"${title}"`,
      r.participant_email,
      brut.toFixed(2),
      comm.toFixed(2),
      net.toFixed(2),
      r.stripe_session_id ?? '',
      r.payment_status,
    ].join(',')
  })

  const csv = [header, ...lines].join('\n')
  const filename = `export-comptable-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
