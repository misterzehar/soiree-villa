import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users, ExternalLink, Star } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import type { Lieu } from '@/types/lieu'
import type { Review } from '@/types/review'
import { submitReview, submitContactRequest } from './actions'

export const dynamic = 'force-dynamic'

const AXIS_LABELS: Record<string, { low: string; high: string; icon: string }> = {
  energy:    { low: 'Calme',       high: 'Dynamique',   icon: '⚡' },
  structure: { low: 'Libre',       high: 'Structuré',   icon: '🗂' },
  depth:     { low: 'Légèreté',    high: 'Profondeur',  icon: '💎' },
  sociality: { low: 'Intimiste',   high: 'Grand groupe',icon: '👥' },
}

const LIEU_TYPE_LABELS: Record<string, string> = {
  salle: 'Salle', rooftop: 'Rooftop', plein_air: 'Plein air',
  bar: 'Bar', restaurant: 'Restaurant', atelier: 'Atelier', autre: 'Autre',
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'fill-warning text-warning' : 'text-border'}`} />
      ))}
    </span>
  )
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function LieuFichePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ contact?: string; review?: string }>
}) {
  const { slug } = await params
  const { contact, review } = await searchParams
  const showContactBanner = contact === 'sent'
  const showReviewBanner  = review === 'sent'
  const supabase = createServerSupabase()

  const [{ data: lieuData }, authClient] = await Promise.all([
    supabase.from('lieux').select('*').eq('slug', slug).eq('is_approved', true).single(),
    createSupabaseServerClient(),
  ])

  if (!lieuData) notFound()
  const lieu = lieuData as Lieu

  const { data: { user } } = await authClient.auth.getUser()

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('target_type', 'lieu')
    .eq('target_id', lieu.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const reviews = (reviewsData ?? []) as Review[]
  const avgRating = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
    : null

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">

        <Link
          href="/lieux"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tous les lieux
        </Link>

        {showContactBanner && (
          <div className="mb-4 bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 text-sm font-medium text-center">
            ✓ Demande envoyée — réponse sous 48h maximum.
          </div>
        )}
        {showReviewBanner && (
          <div className="mb-4 bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 text-sm font-medium text-center">
            ✓ Avis envoyé — il apparaîtra après modération.
          </div>
        )}

        {lieu.photo_url && (
          <img
            src={lieu.photo_url}
            alt={lieu.name}
            className="w-full h-48 object-cover rounded-2xl mb-5"
          />
        )}

        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="font-display font-bold text-2xl text-text">{lieu.name}</h1>
          <span className="text-xs bg-bg border border-border rounded-full px-2.5 py-1 text-text-muted shrink-0">
            {LIEU_TYPE_LABELS[lieu.lieu_type] ?? lieu.lieu_type}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-text-muted text-sm mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {lieu.city}{lieu.address ? ` · ${lieu.address}` : ''}
          </span>
          {lieu.capacity && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {lieu.capacity} personnes max
            </span>
          )}
        </div>

        {avgRating !== null && (
          <div className="flex items-center gap-2 mb-4">
            <StarDisplay rating={Math.round(avgRating)} />
            <span className="text-text font-semibold text-sm">{avgRating}</span>
            <span className="text-text-muted text-xs">({reviews.length} avis)</span>
          </div>
        )}

        {lieu.ambiance && (
          <p className="text-text-muted text-sm italic mb-5">{lieu.ambiance}</p>
        )}

        {/* Profil axes */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <h2 className="font-display font-semibold text-base text-text mb-4">Profil du lieu</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(AXIS_LABELS).map(([axis, labels]) => {
              const score = lieu.axes_scores[axis] ?? 0
              const isHigh = score > 0
              return (
                <div key={axis} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{labels.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-text-muted mb-1">
                      <span>{labels.low}</span>
                      <span>{labels.high}</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${isHigh ? 75 : 25}%`, marginLeft: isHigh ? '25%' : undefined }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {lieu.website_url && (
          <a
            href={lieu.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ExternalLink className="w-4 h-4" />
            Visiter le site
          </a>
        )}

        {/* Formulaire de contact */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <h2 className="font-display font-semibold text-base text-text mb-1">Demande de contact</h2>
          <p className="text-text-muted text-xs mb-4">Intéressé par ce lieu ? Envoyez un message directement.</p>
          <form action={submitContactRequest} className="flex flex-col gap-3">
            <input type="hidden" name="lieuId" value={lieu.id} />
            <input type="hidden" name="slug" value={slug} />
            <input
              type="text"
              name="senderName"
              required
              placeholder="Votre nom"
              defaultValue={user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ''}`.trim() : ''}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
            <input
              type="email"
              name="senderEmail"
              required
              placeholder="Votre email"
              defaultValue={user?.email ?? ''}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Décrivez votre projet (date, nombre de personnes, type d'événement…)"
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
            />
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold text-sm py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Envoyer la demande
            </button>
          </form>
        </div>

        {/* Avis */}
        <div className="mb-2">
          <h2 className="font-display font-semibold text-base text-text mb-3">
            Avis ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <p className="text-text-muted text-sm mb-4">Pas encore d&apos;avis pour ce lieu.</p>
          ) : (
            <div className="flex flex-col gap-3 mb-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-surface rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-text">{r.author_name}</span>
                    <StarDisplay rating={r.rating} />
                  </div>
                  <p className="text-text-muted text-xs mb-1">{formatDate(r.created_at)}</p>
                  {r.comment && <p className="text-text text-sm leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {user ? (
            <details className="bg-surface rounded-2xl shadow-sm overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-primary list-none hover:bg-bg/50 transition-colors">
                + Laisser un avis
              </summary>
              <form action={submitReview} className="px-5 pb-5 flex flex-col gap-3">
                <input type="hidden" name="lieuId" value={lieu.id} />
                <input type="hidden" name="slug" value={slug} />
                <div>
                  <label className="block text-xs text-text-muted mb-1">Note (1-5)</label>
                  <select
                    name="rating"
                    required
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                  >
                    <option value="">Sélectionner…</option>
                    <option value="5">★★★★★ — Excellent</option>
                    <option value="4">★★★★☆ — Très bien</option>
                    <option value="3">★★★☆☆ — Bien</option>
                    <option value="2">★★☆☆☆ — Moyen</option>
                    <option value="1">★☆☆☆☆ — Décevant</option>
                  </select>
                </div>
                <textarea
                  name="comment"
                  rows={3}
                  placeholder="Partagez votre expérience (optionnel)"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Soumettre l'avis
                </button>
                <p className="text-text-muted text-xs text-center">L&apos;avis sera publié après modération.</p>
              </form>
            </details>
          ) : (
            <p className="text-text-muted text-xs">
              <Link href="/connexion" className="text-primary hover:underline">Connectez-vous</Link>{' '}
              pour laisser un avis.
            </p>
          )}
        </div>

      </div>
    </main>
  )
}
