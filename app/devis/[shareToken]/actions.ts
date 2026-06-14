'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import {
  sendQuoteAcceptedEmail,
  sendContractConfirmedEmail,
  sendQuoteRejectedEmail,
} from '@/lib/email'

export async function acceptQuote(shareToken: string): Promise<{ error: string } | void> {
  const supabase = createServerSupabase()

  const { data: qData } = await supabase
    .from('quotes')
    .select('*, quote_lines(*)')
    .eq('share_token', shareToken)
    .single()

  if (!qData) return { error: 'Devis introuvable.' }
  if (qData.status !== 'sent') return { error: 'Ce devis ne peut plus être accepté.' }

  // Update quote
  await supabase
    .from('quotes')
    .update({ status: 'accepted' })
    .eq('id', qData.id)

  // Insert contracts for each line
  type RawLine = {
    id: string; line_type: string; lieu_id: string | null;
    fournisseur_id: string | null; label: string; amount_cents: number
  }
  const lines = qData.quote_lines as RawLine[]

  const contractRows = lines.map(l => ({
    quote_id:          qData.id,
    recipient_type:    l.line_type,
    recipient_id:      (l.lieu_id ?? l.fournisseur_id)!,
    recipient_name:    l.label,
    amount_cents:      l.amount_cents,
    platform_fee_cents: Math.round(l.amount_cents * 0.15),
  }))

  if (contractRows.length > 0) {
    await supabase.from('contracts').insert(contractRows)
  }

  // ── Notify organizer ─────────────────────────────────────────────────────
  const { data: organizer } = await supabase
    .from('organizers')
    .select('display_name, user_id')
    .eq('id', qData.organizer_id)
    .single()

  if (organizer) {
    const { data: { user: orgUser } } = await supabase.auth.admin.getUserById(organizer.user_id)
    if (orgUser?.email) {
      sendQuoteAcceptedEmail({
        to:           orgUser.email,
        organizerName: organizer.display_name,
        clientName:   qData.client_name,
        eventDate:    qData.event_date,
        totalCents:   qData.total_cents,
        quoteId:      qData.id,
      }).catch(() => undefined)
    }
  }

  // ── Notify each prestataire ──────────────────────────────────────────────
  for (const contract of contractRows) {
    try {
      let claimedByUserId: string | null = null
      if (contract.recipient_type === 'lieu') {
        const { data: lieu } = await supabase
          .from('lieux')
          .select('claimed_by_user_id')
          .eq('id', contract.recipient_id)
          .single()
        claimedByUserId = lieu?.claimed_by_user_id ?? null
      } else {
        const { data: fo } = await supabase
          .from('fournisseurs')
          .select('claimed_by_user_id')
          .eq('id', contract.recipient_id)
          .single()
        claimedByUserId = fo?.claimed_by_user_id ?? null
      }

      if (claimedByUserId) {
        const { data: { user: pUser } } = await supabase.auth.admin.getUserById(claimedByUserId)
        if (pUser?.email) {
          sendContractConfirmedEmail({
            to:            pUser.email,
            recipientName: contract.recipient_name,
            clientName:    qData.client_name,
            eventDate:     qData.event_date,
            amountCents:   contract.amount_cents,
            platformFeeCents: contract.platform_fee_cents,
          }).catch(() => undefined)
        }
      }
    } catch {
      // Prestataire might not have a claimed account — skip silently
    }
  }

  redirect(`/devis/${shareToken}`)
}

export async function rejectQuote(shareToken: string): Promise<{ error: string } | void> {
  const supabase = createServerSupabase()

  const { data: qData } = await supabase
    .from('quotes')
    .select('id, organizer_id, client_name, event_date, status')
    .eq('share_token', shareToken)
    .single()

  if (!qData) return { error: 'Devis introuvable.' }
  if (qData.status !== 'sent') return { error: 'Ce devis ne peut plus être refusé.' }

  await supabase
    .from('quotes')
    .update({ status: 'rejected' })
    .eq('id', qData.id)

  // Notify organizer
  const { data: organizer } = await supabase
    .from('organizers')
    .select('display_name, user_id')
    .eq('id', qData.organizer_id)
    .single()

  if (organizer) {
    const { data: { user: orgUser } } = await supabase.auth.admin.getUserById(organizer.user_id)
    if (orgUser?.email) {
      sendQuoteRejectedEmail({
        to:           orgUser.email,
        organizerName: organizer.display_name,
        clientName:   qData.client_name,
        eventDate:    qData.event_date,
        quoteId:      qData.id,
      }).catch(() => undefined)
    }
  }

  redirect(`/devis/${shareToken}`)
}
