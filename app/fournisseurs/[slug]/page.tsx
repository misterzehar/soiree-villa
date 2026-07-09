import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Star } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import { getFournisseurFallback } from '@/lib/fallback-image'
import type { Fournisseur } from '@/types/fournisseur'
import type { Review } from '@/types/review'
import { submitReview, submitContactRequest } from './actions'

export const dynamic = 'force-dynamic'

const AXIS_LABELS: Record<string, { low: string; high: string; icon: string }> = {
  energy:    { low: 'Calme',       high: 'Dynamique',   icon: '⚡' },
  structure: { low: 'Libre',       high: 'Structuré',   icon: '🗂' },
  depth:     { low: 'Légèreté',    high: 'Profondeur',  icon: '💎' },
  sociality: { low: 'Petit groupe',high: 'Grand groupe',icon: '👥' },
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

export default async function FournisseurFichePage({
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

  const [{ data: fData }, authClient] = await Promise.all([
    supabase.from('fournisseurs').select('*').eq('slug', slug).eq('is_approved', true).single(),
    createSupabaseServerClient(),
  ])

  if (!fData) notFound()
  const f = fData as Fournisseur

  const { data: { user } } = await authClient.auth.getUser()

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('target_type', 'fournisseur')
    .eq('target_id', f.id)
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
          href="/fournisseurs"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tous les prestataires
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

        <img
          src={f.photo_url ?? getFournisseurFallback(f.category)}
          alt={f.name}
          className="w-full h-40 object-cover rounded-2xl mb-5"
        />

        <p className="text-primary text-xs font-semibold uppercase tracking-wide mb-1">
          {FOURNISSEUR_CATEGORY_LABELS[f.category]}
        </p>
        <h1 className="font-display font-bold text-2xl text-text mb-1">{f.name}</h1>
        <p className="text-text-muted text-sm mb-2">{f.city}</p>

        {avgRating !== null && (
          <div className="flex items-center gap-2 mb-4">
            <StarDisplay rating={Math.round(avgRating)} />
            <span className="text-text font-semibold text-sm">{avgRating}</span>
            <span className="text-text-muted text-xs">({reviews.length} avis)</span>
          </div>
        )}

        {f.description && (
          <p className="text-text text-sm leading-relaxed mb-5">{f.description}</p>
        )}

        {f.price_range && (
          <div className="bg-surface rounded-2xl px-5 py-4 mb-5">
            <p className="text-text-muted text-xs mb-1">Fourchette de prix</p>
            <p className="text-text font-semibold">💰 {f.price_range}</p>
          </div>
        )}

        {/* Profil axes */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <h2 className="font-display font-semibold text-base text-text mb-4">Profil prestataire</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(AXIS_LABELS).map(([axis, labels]) => {
              const score = f.axes_scores[axis] ?? 0
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
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${isHigh ? 75 : 25}%`, marginLeft: isHigh ? '25%' : undefined }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {f.website_url && (
          <a
            href={f.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ExternalLink className="w-4 h-4" />
            Contacter / Voir le portfolio
          </a>
        )}

        {/* Formulaire de contact */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <h2 className="font-display font-semibold text-base text-text mb-1">Demande de contact</h2>
          <p className="text-text-muted text-xs mb-4">Intéressé par ce prestataire ? Envoyez un message directement.</p>
          <form action={submitContactRequest} className="flex flex-col gap-3">
            <input type="hidden" name="fournisseurId" value={f.id} />
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
              placeholder="Décrivez votre projet (date, type d'événement, budget indicatif…)"
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
            <p className="text-text-muted text-sm mb-4">Pas encore d&apos;avis pour ce prestataire.</p>
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
                <input type="hidden" name="fournisseurId" value={f.id} />
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
                  Soumettre l&apos;avis
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
