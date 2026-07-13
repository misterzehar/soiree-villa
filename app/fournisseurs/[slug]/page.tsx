import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Star, Check } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { FOURNISSEUR_CATEGORY_LABELS } from '@/types/fournisseur'
import { getFournisseurFallback } from '@/lib/fallback-image'
import type { Fournisseur } from '@/types/fournisseur'
import type { Review } from '@/types/review'
import { submitReview, submitContactRequest } from './actions'

export const dynamic = 'force-dynamic'

const AXIS_LABELS: Record<string, { low: string; high: string }> = {
  energy:    { low: 'Calme',        high: 'Dynamique'    },
  structure: { low: 'Libre',        high: 'Structuré'    },
  depth:     { low: 'Légèreté',     high: 'Profondeur'   },
  sociality: { low: 'Petit groupe', high: 'Grand groupe' },
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'fill-gold text-gold' : 'text-white/20'}`} />
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

  const heroSrc = f.photo_url ?? getFournisseurFallback(f.category)
  const categoryLabel = FOURNISSEUR_CATEGORY_LABELS[f.category] ?? f.category

  return (
    <main className="min-h-screen bg-bg">

      {/* ════════════════════════════════════════
          HERO PLEIN ÉCRAN
      ════════════════════════════════════════ */}
      <section className="relative h-[70svh] md:h-[80vh] overflow-hidden bg-canvas">

        <Image
          src={heroSrc}
          alt={f.name}
          fill
          priority
          className="object-cover"
        />

        {/* Gradient overlay bottom-heavy */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgb(12,11,18) 0%, rgba(12,11,18,0.65) 35%, rgba(12,11,18,0.1) 70%)',
          }}
        />

        {/* Retour */}
        <Link
          href="/fournisseurs"
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors duration-200 bg-black/25 backdrop-blur-sm px-3 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Tous les prestataires
        </Link>

        {/* Banners succès */}
        {(showContactBanner || showReviewBanner) && (
          <div className="absolute top-20 left-6 right-6 z-20 flex flex-col gap-2">
            {showContactBanner && (
              <div className="flex items-center gap-2 border border-gold/30 bg-gold/5 backdrop-blur-sm px-5 py-3">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <p className="text-gold/90 text-sm">Demande envoyée — réponse sous 48h maximum.</p>
              </div>
            )}
            {showReviewBanner && (
              <div className="flex items-center gap-2 border border-gold/30 bg-gold/5 backdrop-blur-sm px-5 py-3">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <p className="text-gold/90 text-sm">Avis envoyé — il apparaîtra après modération.</p>
              </div>
            )}
          </div>
        )}

        {/* Titre + rating en bas */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-8 pb-10 z-10">
          <div className="max-w-5xl mx-auto">
            <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-3">
              {categoryLabel}
            </p>
            <h1
              className="font-display font-light text-white leading-[1.05] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
            >
              {f.name}
            </h1>
            {avgRating !== null && (
              <div className="flex items-center gap-3 mt-4">
                <StarDisplay rating={Math.round(avgRating)} />
                <span className="text-white font-light text-sm">{avgRating}</span>
                <span className="text-white/50 text-xs">({reviews.length} avis)</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          DESCRIPTION + MÉTADONNÉES
      ════════════════════════════════════════ */}
      <section className="bg-canvas px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">

          {/* Gauche : description */}
          <div>
            <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-5">Le prestataire</p>
            <p
              className="font-display font-light leading-relaxed"
              style={{
                fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                color: f.description ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                fontStyle: f.description ? 'normal' : 'italic',
              }}
            >
              {f.description ?? 'Un prestataire qui s\'intègre à vos expériences.'}
            </p>
          </div>

          {/* Droite : métadonnées */}
          <div className="flex flex-col gap-8">

            <div>
              <p className="text-white/40 text-[10px] font-medium tracking-[0.3em] uppercase mb-2">Localisation</p>
              <p className="text-white/80 font-light text-base">{f.city}</p>
            </div>

            {f.price_range && (
              <div>
                <p className="text-white/40 text-[10px] font-medium tracking-[0.3em] uppercase mb-2">Fourchette de prix</p>
                <p className="text-white/80 font-light text-base">{f.price_range}</p>
              </div>
            )}

            {f.website_url && (
              <a
                href={f.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 border border-gold/60 text-gold text-sm font-medium tracking-[0.15em] uppercase px-6 py-3.5 hover:bg-gold/10 hover:border-gold focus-visible:outline-none transition-colors duration-300"
              >
                <ExternalLink className="w-4 h-4" />
                Contacter / Voir le portfolio
              </a>
            )}

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          LE PROFIL — axes scores
      ════════════════════════════════════════ */}
      <section className="bg-bg px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">

          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-4">Le profil</p>
          <h2
            className="font-display font-light text-text mb-12"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            Le profil prestataire
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {Object.entries(AXIS_LABELS).map(([axis, labels]) => {
              const score = f.axes_scores[axis] ?? 0
              const isHigh = score > 0
              return (
                <div key={axis}>
                  <div className="flex justify-between text-sm mb-3">
                    <span className={isHigh ? 'text-text-muted' : 'text-text'}>{labels.low}</span>
                    <span className={isHigh ? 'text-gold' : 'text-text-muted'}>{labels.high}</span>
                  </div>
                  <div className="h-[2px] bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gold"
                      style={isHigh ? { width: '75%', marginLeft: '25%' } : { width: '25%' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CE QU'ON EN DIT — avis
      ════════════════════════════════════════ */}
      <section className="bg-canvas px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">

          <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-4">
            Ce qu&apos;on en dit
          </p>
          <h2
            className="font-display font-light text-white mb-12"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
          >
            {reviews.length > 0 ? `${reviews.length} avis` : 'Les avis'}
          </h2>

          {reviews.length === 0 ? (
            <p className="text-white/50 text-lg italic">
              Pas encore d&apos;avis. Sois le premier à partager ton expérience.
            </p>
          ) : (
            <div className="flex flex-col">
              {reviews.map(r => (
                <div key={r.id} className="border-t border-white/10 py-8 first:border-t-0 first:pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm font-medium">{r.author_name}</span>
                    <StarDisplay rating={r.rating} />
                  </div>
                  <p className="text-white/30 text-[10px] font-medium tracking-[0.2em] uppercase mb-4">
                    {formatDate(r.created_at)}
                  </p>
                  {r.comment && (
                    <p className="text-white/80 text-base italic leading-relaxed max-w-[60ch]">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Laisser un avis */}
          {user ? (
            <details className="mt-12 group">
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer inline-flex items-center gap-2 text-white/50 hover:text-gold text-[11px] font-medium tracking-[0.3em] uppercase transition-colors duration-200">
                <span className="group-open:hidden">+ Laisser un avis</span>
                <span className="hidden group-open:inline">— Fermer</span>
              </summary>

              <form action={submitReview} className="mt-8 flex flex-col max-w-lg">
                <input type="hidden" name="fournisseurId" value={f.id} />
                <input type="hidden" name="slug" value={slug} />

                <div className="flex flex-col mb-8">
                  <label htmlFor="rating-fournisseur" className="text-white/50 text-[10px] font-medium tracking-[0.3em] uppercase mb-2">
                    Note
                  </label>
                  <select
                    id="rating-fournisseur"
                    name="rating"
                    required
                    className="w-full bg-transparent border-b border-white/20 focus:border-gold pb-3 text-white text-base focus:outline-none transition-colors duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">Sélectionner…</option>
                    <option value="5">★★★★★ — Excellent</option>
                    <option value="4">★★★★☆ — Très bien</option>
                    <option value="3">★★★☆☆ — Bien</option>
                    <option value="2">★★☆☆☆ — Moyen</option>
                    <option value="1">★☆☆☆☆ — Décevant</option>
                  </select>
                </div>

                <div className="flex flex-col mb-10">
                  <label htmlFor="comment-fournisseur" className="text-white/50 text-[10px] font-medium tracking-[0.3em] uppercase mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    id="comment-fournisseur"
                    name="comment"
                    rows={3}
                    placeholder="Partagez votre expérience…"
                    className="w-full bg-transparent border-b border-white/20 focus:border-gold px-0 py-3 text-white text-base placeholder:text-white/20 focus:outline-none transition-colors duration-200 resize-none rounded-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto inline-flex items-center justify-center border border-gold/60 bg-transparent text-gold font-medium tracking-[0.15em] uppercase text-sm px-8 py-4 hover:bg-gold/10 hover:border-gold focus-visible:outline-none transition-colors duration-300 rounded-none"
                >
                  Soumettre l&apos;avis
                </button>
                <p className="text-white/30 text-xs mt-4">L&apos;avis sera publié après modération.</p>
              </form>
            </details>
          ) : (
            <p className="mt-12 text-white/50 text-sm">
              <Link href="/connexion" className="text-gold underline hover:no-underline">
                Connectez-vous
              </Link>{' '}
              pour laisser un avis.
            </p>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════ */}
      <section id="contact" className="bg-bg px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-xl">

            <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-4">Contact</p>
            <h2
              className="font-display font-light text-text mb-3"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            >
              Demander un devis
            </h2>
            <p className="text-text-muted text-lg mb-12">
              Décrivez votre projet — nous vous mettons en relation sous 48h.
            </p>

            <form action={submitContactRequest} className="flex flex-col">
              <input type="hidden" name="fournisseurId" value={f.id} />
              <input type="hidden" name="slug" value={slug} />

              <div className="flex flex-col mb-8">
                <label htmlFor="senderName-fournisseur" className="text-text-muted text-[10px] font-medium tracking-[0.3em] uppercase mb-2">
                  Votre nom
                </label>
                <input
                  id="senderName-fournisseur"
                  type="text"
                  name="senderName"
                  required
                  defaultValue={user?.user_metadata?.first_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ''}`.trim()
                    : ''}
                  className="w-full bg-transparent border-b border-border/40 focus:border-gold px-0 py-3 text-text text-base placeholder:text-text-muted/30 focus:outline-none transition-colors duration-200 rounded-none"
                />
              </div>

              <div className="flex flex-col mb-8">
                <label htmlFor="senderEmail-fournisseur" className="text-text-muted text-[10px] font-medium tracking-[0.3em] uppercase mb-2">
                  Votre email
                </label>
                <input
                  id="senderEmail-fournisseur"
                  type="email"
                  name="senderEmail"
                  required
                  defaultValue={user?.email ?? ''}
                  className="w-full bg-transparent border-b border-border/40 focus:border-gold px-0 py-3 text-text text-base placeholder:text-text-muted/30 focus:outline-none transition-colors duration-200 rounded-none"
                />
              </div>

              <div className="flex flex-col mb-10">
                <label htmlFor="message-fournisseur" className="text-text-muted text-[10px] font-medium tracking-[0.3em] uppercase mb-2">
                  Votre projet
                </label>
                <textarea
                  id="message-fournisseur"
                  name="message"
                  required
                  rows={4}
                  placeholder="Date envisagée, type d'événement, budget indicatif…"
                  className="w-full bg-transparent border-b border-border/40 focus:border-gold px-0 py-3 text-text text-base placeholder:text-text-muted/30 focus:outline-none transition-colors duration-200 resize-none rounded-none"
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 border border-gold/60 bg-transparent text-gold font-medium tracking-[0.15em] uppercase text-sm px-8 py-5 hover:bg-gold/10 hover:border-gold focus-visible:outline-none transition-colors duration-300 rounded-none"
              >
                Demander un devis
                <span aria-hidden="true" className="tracking-normal normal-case">→</span>
              </button>
            </form>

          </div>
        </div>
      </section>

    </main>
  )
}
