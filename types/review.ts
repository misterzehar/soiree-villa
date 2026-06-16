export type ReviewTargetType = 'lieu' | 'fournisseur'

export type Review = {
  id: string
  target_type: ReviewTargetType
  target_id: string
  author_id: string
  author_name: string
  rating: number
  comment: string | null
  is_published: boolean
  created_at: string
}
