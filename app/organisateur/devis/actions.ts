'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { QuotePDF } from '@/lib/pdf/quote-pdf'
import { sendQuoteEmail } from '@/lib/email'
import type { QuoteLineInput } from '@/types/quote'

export async function createQuote(formData: FormData): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name')
    .eq('user_id', user.id)
    .single()
  if (!organizer) return { error: 'Profil organisateur introuvable.' }

  const clientName  = formData.get('client_name')?.toString().trim() ?? ''
  const clientEmail = formData.get('client_email')?.toString().trim() ?? ''
  const eventDate   = formData.get('event_date')?.toString() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const linesJson   = formData.get('lines')?.toString() ?? '[]'

  let lines: QuoteLineInput[]
  try {
    lines = JSON.parse(linesJson)
  } catch {
    return { error: 'Format de données invalide.' }
  }

  if (!clientName || !clientEmail || !eventDate) {
    return { error: 'Nom du client, email et date sont obligatoires.' }
  }
  if (lines.length === 0) {
    return { error: 'Ajoutez au moins une ligne au devis (lieu ou prestataire).' }
  }

  const totalCents       = lines.reduce((s, l) => s + l.amountCents, 0)
  const platformFeeCents = Math.round(totalCents * 0.15)

  const { data: quote, error: qErr } = await supabase
    .from('quotes')
    .insert({
      organizer_id:       organizer.id,
      client_name:        clientName,
      client_email:       clientEmail,
      event_date:         eventDate,
      description:        description || null,
      total_cents:        totalCents,
      platform_fee_cents: platformFeeCents,
      status:             'draft',
      share_token:        crypto.randomUUID(),
    })
    .select('id')
    .single()

  if (qErr || !quote) return { error: qErr?.message ?? 'Erreur lors de la création.' }

  const lineRows = lines.map((l, i) => ({
    quote_id:       quote.id,
    line_type:      l.type,
    lieu_id:        l.lieuId ?? null,
    fournisseur_id: l.fournisseurId ?? null,
    label:          l.label,
    amount_cents:   l.amountCents,
    sort_order:     i,
  }))

  const { error: lErr } = await supabase.from('quote_lines').insert(lineRows)
  if (lErr) return { error: lErr.message }

  redirect(`/organisateur/devis/${quote.id}`)
}

export async function sendQuote(quoteId: string): Promise<{ error: string } | void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name')
    .eq('user_id', user.id)
    .single()
  if (!organizer) return { error: 'Organisateur introuvable.' }

  const { data: qData } = await supabase
    .from('quotes')
    .select('*, quote_lines(*)')
    .eq('id', quoteId)
    .eq('organizer_id', organizer.id)
    .single()

  if (!qData) return { error: 'Devis introuvable.' }
  if (!['draft', 'sent'].includes(qData.status)) {
    return { error: 'Ce devis ne peut plus être envoyé.' }
  }

  const lines = qData.quote_lines as Array<{
    id: string; line_type: string; lieu_id: string | null
    fournisseur_id: string | null; label: string; amount_cents: number; sort_order: number
  }>

  // ── Check disponibilité conflicts ────────────────────────────────────────
  const lieuIds        = lines.filter(l => l.lieu_id).map(l => l.lieu_id!)
  const fournisseurIds = lines.filter(l => l.fournisseur_id).map(l => l.fournisseur_id!)
  const allEntityIds   = [...lieuIds, ...fournisseurIds]

  if (allEntityIds.length > 0) {
    const { data: acceptedQuotes } = await supabase
      .from('quotes')
      .select('id')
      .eq('event_date', qData.event_date)
      .eq('status', 'accepted')
      .neq('id', quoteId)

    if (acceptedQuotes && acceptedQuotes.length > 0) {
      const acceptedIds = acceptedQuotes.map(q => q.id)
      const { data: conflicts } = await supabase
        .from('contracts')
        .select('recipient_name')
        .in('quote_id', acceptedIds)
        .in('recipient_id', allEntityIds)

      if (conflicts && conflicts.length > 0) {
        const names = conflicts.map(c => c.recipient_name).join(', ')
        return { error: `Conflit de disponibilité : ${names} ${conflicts.length > 1 ? 'sont déjà réservés' : 'est déjà réservé'} pour cette date.` }
      }
    }
  }

  // ── Generate PDF ─────────────────────────────────────────────────────────
  const sorted = [...lines].sort((a, b) => a.sort_order - b.sort_order)

  let pdfBuf: Buffer
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfEl: any = React.createElement(QuotePDF, {
      quoteId,
      clientName:    qData.client_name,
      clientEmail:   qData.client_email,
      eventDate:     qData.event_date,
      description:   qData.description ?? '',
      organizerName: organizer.display_name,
      lines:         sorted,
      totalCents:    qData.total_cents,
    })
    const stream = await renderToBuffer(pdfEl)
    pdfBuf = Buffer.isBuffer(stream) ? stream : Buffer.from(stream as unknown as ArrayBuffer)
  } catch (e) {
    return { error: `Erreur PDF : ${String(e)}` }
  }

  // ── Upload to Storage ────────────────────────────────────────────────────
  const storagePath = `quotes/${quoteId}/devis.pdf`
  await supabase.storage
    .from('quotes-pdf')
    .upload(storagePath, pdfBuf, { contentType: 'application/pdf', upsert: true })

  // ── Update quote ─────────────────────────────────────────────────────────
  await supabase
    .from('quotes')
    .update({ status: 'sent', pdf_path: storagePath })
    .eq('id', quoteId)

  // ── Send email to client (fire-and-forget) ───────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://soireevilla.fr'
  sendQuoteEmail({
    to:           qData.client_email,
    clientName:   qData.client_name,
    organizerName: organizer.display_name,
    eventDate:    qData.event_date,
    totalCents:   qData.total_cents,
    shareUrl:     `${baseUrl}/devis/${qData.share_token}`,
    pdfBuffer:    pdfBuf,
  }).catch(() => undefined)

  redirect(`/organisateur/devis/${quoteId}`)
}

export async function cancelQuote(quoteId: string): Promise<void> {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!organizer) return

  await supabase
    .from('quotes')
    .update({ status: 'cancelled' })
    .eq('id', quoteId)
    .eq('organizer_id', organizer.id)
    .in('status', ['draft', 'sent'])

  redirect('/organisateur/devis')
}
