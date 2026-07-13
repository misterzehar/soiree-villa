import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { WaitlistForm } from '@/components/landing/waitlist-form'
import { SiteHeader } from '@/components/site-header'
import { HeroAnimated } from '@/components/landing/hero-animated'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { getActorProfiles } from '@/lib/actors'
import { getCity } from '@/lib/city'
import { fetchTierData } from '@/lib/tier'
import { FALLBACK_EXPERIENCE, OBSESSION_DEFAULT } from '@/lib/fallback-image'
import type { ActorProfiles } from '@/lib/actors'
import type { PricingTier, Experience } from '@/types/experience'

export const dynamic = 'force-dynamic'

const HOW_IT_WORKS = [
  {
    step: 'Comprendre',
    title: '15 questions, ton style révélé',
    desc: "Le quiz \"Tu préfères ?\" cerne ta façon d'être en groupe. En moins d'une minute.",
  },
  {
    step: 'Vivre',
    title: 'Des soirées qui te matchent',
    desc: "On te propose des expériences animées, sélectionnées pour ton profil. Rien d'au hasard.",
  },
  {
    step: 'Oser',
    title: 'Des liens qui durent',
    desc: 'Chaque soirée suit un parcours en 3 actes. Tu repartiras avec de vraies rencontres.',
  },
]

const ACTS = [
  {
    number: '01',
    verb: 'Comprendre',
    tagline: 'Entrée',
    desc: "L'hôte installe le cadre. Tu observes, tu te mets en confiance. Personne n'est balancé dans le vide.",
  },
  {
    number: '02',
    verb: 'Vivre',
    tagline: 'Plat',
    desc: "Le groupe agit ensemble. Une activité, un défi, un moment concret. Le lien se tisse dans l'action.",
  },
  {
    number: '03',
    verb: 'Oser',
    tagline: 'Dessert',
    desc: 'La magie opère. Tu te livres un peu. Tu repartiras avec au moins une vraie rencontre.',
  },
]

export default async function HomePage() {
  const supabase = createServerSupabase()
  const cookieStore = await cookies()
  const city = getCity(cookieStore)
  const now = new Date().toISOString()

  const [
    { count: expCount },
    { count: lieuxCount },
    { count: fournisseursCount },
    { data: obsessionRaw },
    { data: upcomingCityExpsRaw },
  ] = await Promise.all([
    supabase.from('experiences').select('*', { count: 'exact', head: true }).eq('status', 'published').eq('city', city),
    supabase.from('lieux').select('*', { count: 'exact', head: true }).eq('is_approved', true).eq('city', city),
    supabase.from('fournisseurs').select('*', { count: 'exact', head: true }).eq('is_approved', true).eq('city', city),
    supabase
      .from('experiences')
      .select('id, title, description, date, venue_name, organizer_name, cover_image_url, pricing_tiers')
      .eq('status', 'published')
      .eq('is_obsession_of_week', true)
      .single(),
    supabase
      .from('experiences')
      .select('id, title, date, venue_name, cover_image_url, pricing_tiers')
      .eq('status', 'published')
      .eq('city', city)
      .gt('date', now)
      .order('date', { ascending: true })
      .limit(20),
  ])

  type ObsessionExp = {
    id: string; title: string; description: string; date: string
    venue_name: string; organizer_name: string; cover_image_url: string | null; pricing_tiers: PricingTier[]
  }
  const obsession = obsessionRaw as ObsessionExp | null

  function currentPrice(tiers: PricingTier[]): PricingTier | null {
    return tiers.find(t => t.quantity > 0) ?? tiers[0] ?? null
  }

  const upcomingCityExps = (upcomingCityExpsRaw ?? []) as Pick<Experience, 'id' | 'title' | 'date' | 'venue_name' | 'cover_image_url' | 'pricing_tiers'>[]
  const upcomingIds = upcomingCityExps.map(e => e.id)
  const { tiers: expTiers } = upcomingIds.length > 0
    ? await fetchTierData(supabase, upcomingIds)
    : { tiers: {} as Record<string, string> }
  const tierSExps = upcomingCityExps.filter(e => expTiers[e.id] === 'S').slice(0, 3)

  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  const profiles: ActorProfiles = user
    ? await getActorProfiles(user.id)
    : { hasOrga: false, hasLieu: false, hasFourn: false }

  const exp = expCount ?? 0
  const lieux = lieuxCount ?? 0
  const fournisseurs = fournisseursCount ?? 0

  const PRO_CARDS = [
    {
      role: 'Organisateur',
      desc: "Crée et anime des soirées structurées. Accède à notre réseau de lieux et fournisseurs.",
      href: profiles.hasOrga ? '/organisateur' : '/organisateur/inscription',
      label: profiles.hasOrga ? 'Accéder à mon espace' : 'Devenir organisateur',
      isRegistered: profiles.hasOrga,
    },
    {
      role: 'Lieu',
      desc: "Propose ton espace aux organisateurs. Visibilité immédiate auprès des créateurs d'événements.",
      href: profiles.hasLieu ? '/lieu' : '/lieu/inscription',
      label: profiles.hasLieu ? 'Accéder à mon espace' : 'Inscrire mon lieu',
      isRegistered: profiles.hasLieu,
    },
    {
      role: 'Prestataire',
      desc: 'DJ, traiteur, déco, animation — rejoins la marketplace et sois contacté directement.',
      href: profiles.hasFourn ? '/fournisseur' : '/fournisseur/inscription',
      label: profiles.hasFourn ? 'Accéder à mon espace' : 'Inscrire ma prestation',
      isRegistered: profiles.hasFourn,
    },
  ]

  return (
    <main id="main-content" className="bg-bg min-h-screen">

      {/* ════════════════════════════════════════
          HERO — bg-canvas, image plein écran
      ════════════════════════════════════════ */}
      <section className="relative flex flex-col min-h-[100svh] overflow-hidden">
        <Image
          src="/fallback-experience.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(12,11,18,0.55) 0%, rgba(12,11,18,0.35) 45%, rgba(12,11,18,0.85) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 68% 78%, rgb(var(--color-gold-rgb) / 0.08), transparent)',
          }}
        />
        <div aria-hidden className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent" />

        <nav className="relative z-10 px-6 pt-6 md:px-16 md:pt-8">
          <SiteHeader variant="dark" />
        </nav>

        <HeroAnimated />
      </section>

      {/* ════════════════════════════════════════
          OBSESSION DE LA SEMAINE — bg-canvas
      ════════════════════════════════════════ */}
      {obsession && (() => {
        const tier = currentPrice(obsession.pricing_tiers)
        const dateFmt = new Date(obsession.date).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long',
        })
        return (
          <section className="bg-canvas px-4 pt-2 pb-14 md:px-12 md:pb-20">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <Link href={`/experiences/${obsession.id}`} className="block group">
                  <div className="relative overflow-hidden">
                    <div className="relative w-full aspect-video overflow-hidden">
                      <Image
                        src={obsession.cover_image_url ?? OBSESSION_DEFAULT}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 768px) calc(100vw - 32px), 900px"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/30 to-transparent" />
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
                      <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase">
                        Obsession de la semaine
                      </p>
                      <div>
                        <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-white/55 mb-3 capitalize">
                          {dateFmt} · {obsession.venue_name}
                          {tier && ` · À partir de ${Math.round(tier.price_cents / 100)} €`}
                        </p>
                        <h2
                          className="font-display font-light text-white mb-6 leading-none text-balance"
                          style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)', letterSpacing: '-0.03em' }}
                        >
                          {obsession.title}
                        </h2>
                        <span className="inline-flex items-center gap-3 border border-white/20 text-white text-[11px] font-medium tracking-[0.12em] uppercase px-6 py-3 hover:bg-white/[0.07] transition-colors duration-300">
                          Réserver une place
                          <span aria-hidden className="text-gold tracking-normal normal-case">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          </section>
        )
      })()}

      {/* ════════════════════════════════════════
          COMMENT ÇA MARCHE — bg-bg
      ════════════════════════════════════════ */}
      <section className="bg-bg px-4 py-16 md:px-12 md:py-28">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="mb-16">
            <h2
              className="font-display font-light text-text text-balance"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
            >
              De 0 à ta meilleure soirée.
            </h2>
          </ScrollReveal>

          <div className="flex flex-col">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <ScrollReveal key={step} delay={i * 0.1}>
                <div className="flex items-start gap-6 md:gap-12">
                  <div className="flex flex-col items-center shrink-0">
                    <span
                      aria-hidden
                      className="font-display font-bold select-none"
                      style={{
                        fontSize: 'clamp(5rem, 12vw, 10rem)',
                        lineHeight: 0.88,
                        letterSpacing: '-0.04em',
                        WebkitTextStroke: '1.5px rgb(var(--color-border-rgb))',
                        color: 'transparent',
                        display: 'block',
                      } as React.CSSProperties}
                    >
                      {i + 1}
                    </span>
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="w-px h-12 bg-border mt-3" />
                    )}
                  </div>
                  <div className="pt-2 pb-12 md:pb-16">
                    <p className="text-gold text-[10px] font-medium tracking-[0.2em] uppercase mb-2">{step}</p>
                    <h3
                      className="font-display font-medium text-text mb-3"
                      style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', letterSpacing: '-0.02em' }}
                    >
                      {title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed max-w-xs md:max-w-sm">{desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          EXPLORER — bg-bg, catalogue éditorial
      ════════════════════════════════════════ */}
      <section className="bg-bg px-4 pb-16 md:px-12 md:pb-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="mb-10">
            <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-text-muted mb-2">Explorer</p>
            <h2
              className="font-display font-light text-text text-balance"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
            >
              Soirées, lieux et prestataires à {city}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {([
              {
                href: '/experiences',
                category: 'Soirées',
                title: exp > 0 ? `${exp} expérience${exp > 1 ? 's' : ''} disponible${exp > 1 ? 's' : ''}` : 'Bientôt disponibles',
                cta: 'Trouver ma soirée',
                image: '/explore-soirees.jpg',
                alt: 'Table dressée aux bougies pour un dîner intime',
              },
              {
                href: '/lieux',
                category: 'Lieux',
                title: lieux > 0 ? `${lieux} lieu${lieux > 1 ? 'x' : ''} partenaire${lieux > 1 ? 's' : ''}` : 'Lieux partenaires',
                cta: 'Explorer les lieux',
                image: '/explore-lieux.jpg',
                alt: 'Patio méditerranéen avec plantes en pot au coucher du soleil',
              },
              {
                href: '/fournisseurs',
                category: 'Prestataires',
                title: fournisseurs > 0 ? `${fournisseurs} prestataire${fournisseurs > 1 ? 's' : ''}` : 'DJ, traiteur, déco',
                cta: 'Voir la marketplace',
                image: '/explore-prestataires.jpg',
                alt: 'Table de mixage éclairée en gros plan',
              },
            ] as const).map((card, i) => (
              <ScrollReveal key={card.href} delay={i * 0.1}>
                <Link href={card.href} className="block group">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-border/30 mb-4">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 40px), 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-text-muted mb-2">
                    {card.category}
                  </p>
                  <p
                    className="font-display font-medium text-text mb-1 group-hover:text-gold transition-colors duration-200"
                    style={{ letterSpacing: '-0.01em' }}
                  >
                    {card.title}
                  </p>
                  <p className="text-[11px] tracking-[0.08em] uppercase text-text-muted group-hover:text-gold transition-colors duration-200 mt-3">
                    {card.cta} →
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TIER S — bg-canvas, mise en scène
      ════════════════════════════════════════ */}
      {tierSExps.length > 0 && (() => {
        return (
          <section className="bg-canvas px-4 py-14 md:px-12 md:py-20">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-gold text-[10px] font-medium tracking-[0.4em] uppercase mb-2">
                    Classement · Tier S
                  </p>
                  <h2
                    className="font-display font-light text-white text-balance"
                    style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', letterSpacing: '-0.03em' }}
                  >
                    Les meilleures soirées à {city}
                  </h2>
                </div>
                <Link
                  href="/tier-list"
                  className="text-[11px] tracking-[0.08em] uppercase text-white/50 hover:text-white/80 transition-colors duration-200 shrink-0 hidden sm:inline-flex sm:items-center py-2"
                >
                  Classement complet →
                </Link>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {tierSExps.map((exp, i) => {
                  const tier = (exp.pricing_tiers as PricingTier[]).find(t => t.quantity > 0) ?? (exp.pricing_tiers as PricingTier[])[0]
                  return (
                    <ScrollReveal key={exp.id} delay={i * 0.08}>
                      <Link href={`/experiences/${exp.id}`} className="block group">
                        <div className="relative aspect-video w-full overflow-hidden mb-4">
                          <Image
                            src={exp.cover_image_url ?? FALLBACK_EXPERIENCE}
                            alt=""
                            fill
                            sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 40px), 300px"
                            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          />
                        </div>
                        <p
                          className="font-display font-medium text-white text-sm group-hover:text-white/70 transition-colors duration-200 mb-1 line-clamp-2"
                          style={{ letterSpacing: '-0.01em' }}
                        >
                          {exp.title}
                        </p>
                        <p className="text-white/50 text-xs">
                          {new Date(exp.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {exp.venue_name}
                        </p>
                        {tier && (
                          <p className="mt-1.5 text-xs text-gold">
                            {Math.round(tier.price_cents / 100)} €
                          </p>
                        )}
                      </Link>
                    </ScrollReveal>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ════════════════════════════════════════
          LES 3 ACTES — bg-canvas (continue)
      ════════════════════════════════════════ */}
      <section className="bg-canvas px-4 py-20 md:px-12 md:py-28">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="mb-14">
            <h2
              className="font-display font-light text-white text-balance"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
            >
              Un parcours en 3 actes.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {ACTS.map(({ number, verb, tagline, desc }, i) => (
              <ScrollReveal key={verb} delay={i * 0.1}>
                <div>
                  <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/50 mb-4">
                    {number} · {tagline}
                  </p>
                  <div className="w-6 h-px bg-gold mb-5" />
                  <h3
                    className="font-display font-light text-white mb-4 text-balance"
                    style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', letterSpacing: '-0.025em' }}
                  >
                    {verb}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PARTENAIRES PRO — bg-bg
      ════════════════════════════════════════ */}
      <section className="bg-bg px-4 py-16 md:px-12 md:py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="mb-10">
            <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-text-muted mb-2">Partenaires</p>
            <h2
              className="font-display font-light text-text text-balance"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
            >
              Vous travaillez dans l&apos;événementiel ?
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-px md:bg-border">
            {PRO_CARDS.map((card, i) => (
              <ScrollReveal key={card.role} delay={i * 0.08}>
                <Link
                  href={card.href}
                  className="flex flex-col p-6 md:p-8 bg-bg border border-border md:border-0 hover:bg-surface transition-colors duration-300 group h-full"
                >
                  <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-text-muted mb-5">{card.role}</p>
                  <p className="text-text-muted text-sm leading-relaxed flex-1 mb-6">{card.desc}</p>
                  <p className="text-[11px] tracking-[0.08em] uppercase text-text group-hover:text-gold transition-colors duration-200">
                    {card.label} →
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          POUR QUI — bg-canvas, pull quote
      ════════════════════════════════════════ */}
      <section className="bg-canvas px-6 py-20 md:px-16 md:py-28">
        <div className="max-w-3xl">
          <ScrollReveal>
            <blockquote
              className="font-display font-light text-white leading-[1.2] text-balance"
              style={{ fontSize: 'clamp(1.35rem, 3.5vw, 2.25rem)', letterSpacing: '-0.025em' }}
            >
              Pour celles et ceux qui veulent{' '}
              <span className="text-gold">vraiment rencontrer du monde</span>
              {' '}— sans subir la soirée.
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA FINAL + WAITLIST — bg-bg
      ════════════════════════════════════════ */}
      <section className="bg-bg px-6 py-20 md:px-16 md:py-28">
        <div className="max-w-xl">
          <ScrollReveal>
            <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-text-muted mb-4">
              Lancement à {city}
            </p>
            <h2
              className="font-display font-light text-text mb-8 text-balance"
              style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)', letterSpacing: '-0.035em', lineHeight: 1.1 }}
            >
              Prêt·e à te découvrir ?
            </h2>
            <p className="text-text-muted text-sm leading-relaxed mb-10 max-w-sm">
              Fais le quiz, reçois ton profil social, rejoins une soirée à {city}.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-3 border border-text/20 text-text text-[11px] font-medium tracking-[0.12em] uppercase px-8 py-4 hover:bg-text/[0.04] focus-visible:outline-none focus-visible:border-text/60 transition-colors duration-300 mb-14"
            >
              Découvrir mon profil
              <span aria-hidden className="tracking-normal text-gold">→</span>
            </Link>

            <div className="border-t border-border pt-8">
              <p className="text-text-muted text-xs mb-5">
                Pas de quiz maintenant ? Laisse ton email — on te prévient dès qu&apos;une soirée est disponible.
              </p>
              <WaitlistForm />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER — bg-canvas, fermeture cinématique
      ════════════════════════════════════════ */}
      <footer className="bg-canvas border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-20 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link
                href="/"
                className="font-display font-medium text-white block mb-3"
                style={{ letterSpacing: '-0.02em' }}
              >
                Soirée Villa
              </Link>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1">
                Comprendre · Vivre · Oser
              </p>
              <p className="text-[10px] tracking-[0.1em] uppercase text-white/25">
                Nice — 2026
              </p>
            </div>

            {/* Explorer */}
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/50 mb-5">Explorer</p>
              <ul className="flex flex-col gap-3">
                {[
                  { href: '/experiences', label: 'Soirées' },
                  { href: '/lieux', label: 'Lieux' },
                  { href: '/fournisseurs', label: 'Prestataires' },
                  { href: '/tier-list', label: 'Classement' },
                  { href: '/marketplace', label: 'Marketplace' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="block py-1 text-white/40 text-xs hover:text-white/70 transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/50 mb-5">Pro</p>
              <ul className="flex flex-col gap-3">
                {[
                  { href: '/organisateur/inscription', label: 'Organisateur' },
                  { href: '/lieu/inscription', label: 'Lieu partenaire' },
                  { href: '/fournisseur/inscription', label: 'Prestataire' },
                  { href: '/marketplace', label: 'Marketplace' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="block py-1 text-white/40 text-xs hover:text-white/70 transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Légal */}
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/50 mb-5">Légal</p>
              <ul className="flex flex-col gap-3">
                {[
                  { href: '/charte-participant', label: 'Charte participant' },
                  { href: '/charte-organisateur', label: 'Charte organisateur' },
                  { href: '/mentions-legales', label: 'Mentions légales' },
                  { href: '/contact', label: 'Contact' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="block py-1 text-white/40 text-xs hover:text-white/70 transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 border-t border-white/10">
            <p className="text-white/30 text-[10px] tracking-[0.1em]">
              © 2026 Soirée Villa — Tous droits réservés
            </p>
            <a
              href="https://instagram.com/soireevilla"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 text-white/30 text-[10px] tracking-[0.1em] hover:text-white/60 transition-colors duration-200"
            >
              Instagram →
            </a>
          </div>
        </div>
      </footer>

    </main>
  )
}
