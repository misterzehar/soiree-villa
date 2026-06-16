import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import {
  sendReminderEmail,
  sendOrganizerReminderEmail,
  sendNpsEmail,
} from '@/lib/email'

export const dynamic = 'force-dynamic'

function dateWindow(offsetDays: number): { from: string; to: string } {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + offsetDays)
  const date = d.toISOString().slice(0, 10)
  return { from: `${date}T00:00:00Z`, to: `${date}T23:59:59Z` }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('401', { status: 401 })
  }

  const supabase = createServerSupabase()
  let sent = 0

  const fetchExps = async (w: ReturnType<typeof dateWindow>) => {
    const { data } = await supabase
      .from('experiences')
      .select('id, title, date, venue_name, organizer_name')
      .eq('status', 'published')
      .gte('date', w.from)
      .lte('date', w.to)
    return data ?? []
  }

  const getRegs = async (expId: string) => {
    const { data } = await supabase
      .from('registrations')
      .select('id, participant_email, participant_first_name')
      .eq('experience_id', expId)
      .eq('payment_status', 'paid')
    return data ?? []
  }

  const getOrganizerEmail = async (organizerName: string): Promise<{ email: string; firstName: string }> => {
    const { data: org } = await supabase
      .from('organizers')
      .select('user_id')
      .eq('display_name', organizerName)
      .single()

    if (org?.user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(org.user_id)
      if (userData?.user?.email) {
        return {
          email:     userData.user.email,
          firstName: userData.user.user_metadata?.first_name ?? organizerName,
        }
      }
    }
    return { email: 'misterzehar@gmail.com', firstName: 'équipe' }
  }

  type ExpRow = { id: string; title: string; date: string; venue_name: string; organizer_name: string }

  // ── J-7 : participant reminder ──────────────────────────────────────────────
  const exps7 = await fetchExps(dateWindow(7))
  for (const exp of exps7 as ExpRow[]) {
    const regs = await getRegs(exp.id)
    for (const reg of regs) {
      try {
        await sendReminderEmail({ to: reg.participant_email, firstName: reg.participant_first_name, experienceTitle: exp.title, experienceDate: exp.date, venueName: exp.venue_name, type: 'j7', experienceId: exp.id })
        sent++
      } catch {}
    }
  }

  // ── J-3 : organizer reminder ────────────────────────────────────────────────
  const exps3 = await fetchExps(dateWindow(3))
  for (const exp of exps3 as ExpRow[]) {
    const org = await getOrganizerEmail(exp.organizer_name)
    try {
      await sendOrganizerReminderEmail({ to: org.email, firstName: org.firstName, experienceTitle: exp.title, experienceDate: exp.date, type: 'j3', experienceId: exp.id })
      sent++
    } catch {}
  }

  // ── J-1 : participant + organizer ───────────────────────────────────────────
  const exps1 = await fetchExps(dateWindow(1))
  for (const exp of exps1 as ExpRow[]) {
    const regs = await getRegs(exp.id)
    for (const reg of regs) {
      try {
        await sendReminderEmail({ to: reg.participant_email, firstName: reg.participant_first_name, experienceTitle: exp.title, experienceDate: exp.date, venueName: exp.venue_name, type: 'j1', experienceId: exp.id })
        sent++
      } catch {}
    }
    const org = await getOrganizerEmail(exp.organizer_name)
    try {
      await sendOrganizerReminderEmail({ to: org.email, firstName: org.firstName, experienceTitle: exp.title, experienceDate: exp.date, type: 'j1', experienceId: exp.id })
      sent++
    } catch {}
  }

  // ── J+0 : day-of reminder ───────────────────────────────────────────────────
  const exps0 = await fetchExps(dateWindow(0))
  for (const exp of exps0 as ExpRow[]) {
    const regs = await getRegs(exp.id)
    for (const reg of regs) {
      try {
        await sendReminderEmail({ to: reg.participant_email, firstName: reg.participant_first_name, experienceTitle: exp.title, experienceDate: exp.date, venueName: exp.venue_name, type: 'j0', experienceId: exp.id })
        sent++
      } catch {}
    }
  }

  // ── J+1 : NPS email ────────────────────────────────────────────────────────
  const expsNps = await fetchExps(dateWindow(-1))
  for (const exp of expsNps as ExpRow[]) {
    const regs = await getRegs(exp.id)
    for (const reg of regs) {
      const { data: existing } = await supabase
        .from('nps_responses')
        .select('id')
        .eq('registration_id', reg.id)
        .maybeSingle()
      if (existing) continue
      try {
        await sendNpsEmail({ to: reg.participant_email, firstName: reg.participant_first_name, experienceTitle: exp.title, registrationId: reg.id })
        sent++
      } catch {}
    }
  }

  return NextResponse.json({ ok: true, sent })
}
