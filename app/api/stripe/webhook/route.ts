import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase'
import { sendConfirmationEmail } from '@/lib/email'
import type { Experience } from '@/types/experience'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { registration_id, experience_id } = session.metadata ?? {}

    if (!registration_id || !experience_id) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const supabase = createServerSupabase()

    // ── Mise à jour de la Registration ───────────────────────────────────
    const amountPaid = session.amount_total ?? 0
    const platformFeeCents = Math.round(amountPaid * 0.15)

    await supabase
      .from('registrations')
      .update({
        payment_status: 'paid',
        amount_paid_cents: amountPaid,
        platform_fee_cents: platformFeeCents,
      })
      .eq('id', registration_id)

    // ── Incrément atomique de capacity_current ───────────────────────────
    await supabase.rpc('increment_experience_capacity', { exp_id: experience_id })

    // ── Récupère les données pour l'email ────────────────────────────────
    const { data: reg } = await supabase
      .from('registrations')
      .select('participant_first_name, participant_email, tier_id, amount_paid_cents')
      .eq('id', registration_id)
      .single()

    const { data: exp } = await supabase
      .from('experiences')
      .select('title, date, venue_name')
      .eq('id', experience_id)
      .single()

    if (reg && exp) {
      const experience = exp as Pick<Experience, 'title' | 'date' | 'venue_name'>

      const tierLabels: Record<string, string> = {
        early: 'Early bird',
        standard: 'Standard',
        last: 'Last chance',
      }

      await sendConfirmationEmail({
        to: reg.participant_email,
        firstName: reg.participant_first_name,
        experienceTitle: experience.title,
        experienceDate: experience.date,
        venueName: experience.venue_name,
        tierLabel: tierLabels[reg.tier_id] ?? reg.tier_id,
        amountPaidCents: reg.amount_paid_cents ?? session.amount_total ?? 0,
        experienceId: experience_id,
        stripeSessionId: session.id,
      })
    }
  }

  return NextResponse.json({ received: true })
}
