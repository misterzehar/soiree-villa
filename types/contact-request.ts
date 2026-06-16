export type ContactRequestTargetType = 'lieu' | 'fournisseur'

export type ContactRequest = {
  id: string
  target_type: ContactRequestTargetType
  target_id: string
  sender_name: string
  sender_email: string
  message: string
  is_read: boolean
  is_archived: boolean
  created_at: string
}
