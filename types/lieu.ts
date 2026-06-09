export type Lieu = {
  id: string
  name: string
  slug: string
  address: string | null
  city: string
  capacity: number | null
  ambiance: string | null
  lieu_type: string
  photo_url: string | null
  axes_scores: Record<string, number>
  website_url: string | null
  is_approved: boolean
  claimed_by_user_id: string | null
  created_at: string
}
