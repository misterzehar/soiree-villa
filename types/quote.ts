export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'cancelled'

export type Quote = {
  id: string
  organizer_id: string
  client_name: string
  client_email: string
  event_date: string
  description: string | null
  total_cents: number
  platform_fee_cents: number
  status: QuoteStatus
  share_token: string
  pdf_path: string | null
  created_at: string
  updated_at: string
}

export type QuoteLine = {
  id: string
  quote_id: string
  line_type: 'lieu' | 'fournisseur'
  lieu_id: string | null
  fournisseur_id: string | null
  label: string
  amount_cents: number
  sort_order: number
  created_at: string
}

export type Contract = {
  id: string
  quote_id: string
  recipient_type: 'lieu' | 'fournisseur'
  recipient_id: string
  recipient_name: string
  amount_cents: number
  platform_fee_cents: number
  accepted_at: string
  created_at: string
}

export type QuoteLineInput = {
  type: 'lieu' | 'fournisseur'
  lieuId: string | null
  fournisseurId: string | null
  label: string
  amountCents: number
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, { label: string; color: string }> = {
  draft:     { label: 'Brouillon', color: 'bg-border text-text-muted' },
  sent:      { label: 'Envoyé',    color: 'bg-primary/10 text-primary' },
  accepted:  { label: 'Accepté',   color: 'bg-success/15 text-success' },
  rejected:  { label: 'Refusé',    color: 'bg-error/10 text-error' },
  cancelled: { label: 'Annulé',    color: 'bg-border text-text-muted' },
}
