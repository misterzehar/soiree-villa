import type { FournisseurCategory } from './fournisseur'

export type BriefStatus = 'draft' | 'open' | 'selected' | 'closed'
export type OfferStatus = 'submitted' | 'shortlisted' | 'selected' | 'rejected'

export type Brief = {
  id: string
  organizer_id: string
  target_type: 'lieu' | 'fournisseur'
  target_category: FournisseurCategory | null
  city: string
  event_date: string
  expires_at: string
  title: string
  description: string
  budget_estimate_cents: number | null
  status: BriefStatus
  created_at: string
}

export type Offer = {
  id: string
  brief_id: string
  responder_id: string
  responder_type: 'lieu' | 'fournisseur'
  responder_name: string
  amount_cents: number
  platform_fee_cents: number
  message: string
  status: OfferStatus
  created_at: string
}

export const BRIEF_STATUS_LABELS: Record<BriefStatus, { label: string; color: string }> = {
  draft:    { label: 'Brouillon',     color: 'bg-border text-text-muted'      },
  open:     { label: 'Ouvert',        color: 'bg-success/15 text-success'     },
  selected: { label: 'Sélectionné',   color: 'bg-primary/10 text-primary'     },
  closed:   { label: 'Clôturé',       color: 'bg-border text-text-muted'      },
}

export const OFFER_STATUS_LABELS: Record<OfferStatus, { label: string; color: string }> = {
  submitted:   { label: 'Envoyée',          color: 'bg-border text-text-muted'     },
  shortlisted: { label: 'Présélectionnée',  color: 'bg-warning/15 text-warning'    },
  selected:    { label: 'Retenue ✓',        color: 'bg-success/15 text-success'    },
  rejected:    { label: 'Non retenue',      color: 'bg-error/10 text-error'        },
}
