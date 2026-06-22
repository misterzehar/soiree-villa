import Link from 'next/link'
import { cookies } from 'next/headers'
import { Heart, Users, Zap } from 'lucide-react'
import { WaitlistForm } from '@/components/landing/waitlist-form'
import { SiteHeader } from '@/components/site-header'
import { HeroAnimated } from '@/components/landing/hero-animated'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { getActorProfiles } from '@/lib/actors'
import { getCity } from '@/lib/city'
import { fetchTierData, TIER_CONFIG } from '@/lib/tier'
import type { ActorProfiles } from '@/lib/actors'
import type { PricingTier, Experience } from '@/types/experience'

export const dynamic = 'force-dynamic'

const HOW_IT_WORKS = [
  {
    icon: Heart,
    step: 'Comprendre',
    title: '15 questions, ton style révélé',
    desc: 'Le quiz "Tu préfères ?" cerne ta façon d\'être en groupe. En moins d\'une minute.',
  },
  {
    icon: Users,
    step: 'Vivre',
    title: 'Des soirées qui te matchent',
    desc: 'On te propose des expériences animées, sélectionnées pour ton profil. Rien d\'au hasard.',
  },
  {
    icon: Zap,
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
    desc: 'Le groupe agit ensemble. Une activité, un défi, un moment concret. Le lien se tisse dans l\'action.',
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
      icon: '🎩',
      role: 'Organisateur',
      desc: 'Crée et anime des soirées structurées. Accède à notre réseau de lieux et fournisseurs.',
      href: profiles.hasOrga ? '/organisateur' : '/organisateur/inscription',
      label: profiles.hasOrga ? 'Accéder à mon espace →' : 'Devenir organisateur',
      isRegistered: profiles.hasOrga,
    },
    {
      icon: '🏠',
      role: 'Lieu',
      desc: 'Propose ton espace aux organisateurs. Visibilité immédiate auprès des créateurs d\'événements.',
      href: profiles.hasLieu ? '/lieu' : '/lieu/inscription',
      label: profiles.hasLieu ? 'Accéder à mon espace →' : 'Inscrire mon lieu',
      isRegistered: profiles.hasLieu,
    },
    {
      icon: '🎵',
      role: 'Fournisseur',
      desc: 'DJ, traiteur, déco, animation — rejoins la marketplace et sois contacté directement.',
      href: profiles.hasFourn ? '/fournisseur' : '/fournisseur/inscription',
      label: profiles.hasFourn ? 'Accéder à mon espace →' : 'Inscrire ma prestation',
      isRegistered: profiles.hasFourn,
    },
  ]

  return (
    <main className="bg-bg min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col min-h-screen overflow-hidden">
        {/* Cinematic background — rooftop crépuscule placeholder */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, #0d0d1a 0%, #1a1030 35%, #2a1a3e 55%, #0a1520 100%)',
          }}
        />
        {/* Atmospheric overlays */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_25%_40%,rgba(74,108,247,0.22),transparent)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_75%_65%,rgba(255,122,89,0.15),transparent)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_50%_85%,rgba(162,89,255,0.1),transparent)]" />
        {/* Bottom fade to bg */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent" />

        <nav className="relative z-10 px-6 pt-6 md:px-12 md:pt-8">
          <SiteHeader variant="dark" />
        </nav>

        <HeroAnimated />

        <div aria-hidden className="relative z-10 flex justify-center pb-8 text-white/20 text-xs animate-bounce">↓</div>
      </section>

      {/* ── OBSESSION DE LA SEMAINE ──────────────────────────────────────── */}
      {obsession && (() => {
        const tier = currentPrice(obsession.pricing_tiers)
        const dateFmt = new Date(obsession.date).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long',
        })
        return (
          <section className="px-4 py-12 md:px-12 md:py-16 max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-border group cursor-pointer">
                {/* Full-bleed image */}
                {obsession.cover_image_url ? (
                  <div className="relative w-full aspect-[16/7] overflow-hidden">
                    <img
                      src={obsession.cover_image_url}
                      alt={obsession.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient overlay — text at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>
                ) : (
                  <div className="relative w-full aspect-[16/7] overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d1a6e 50%, #4A6CF7 100%)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}

                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                      ⭐ Obsession de la semaine
                    </span>
                    {tier && (
                      <span className="bg-white/10 backdrop-blur-md text-white font-display font-bold text-lg px-3 py-1 rounded-xl border border-white/20">
                        {Math.round(tier.price_cents / 100)} €
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-2 capitalize">{dateFmt} · {obsession.venue_name}</p>
                    <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-3 leading-tight">
                      {obsession.title}
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-xl line-clamp-2">
                      {obsession.description}
                    </p>
                    <Link
                      href={`/experiences/${obsession.id}`}
                      className="inline-flex items-center gap-2 bg-white text-text font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/90 transition-colors duration-200"
                    >
                      Réserve ta place →
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>
        )
      })()}

      {/* ── EXPLORER ─────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 md:px-12 md:py-20 max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Explorer</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text mb-2">
            Tout Soirée Villa à {city}
          </h2>
          <p className="text-text-muted text-base">Soirées animées, lieux et prestataires partenaires</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              href: '/experiences',
              emoji: '🎉',
              title: 'Soirées',
              desc: exp > 0 ? `${exp} expérience${exp > 1 ? 's' : ''} disponible${exp > 1 ? 's' : ''}` : 'Bientôt disponibles',
              cta: 'Trouver ma soirée',
            },
            {
              href: '/lieux',
              emoji: '🏠',
              title: 'Lieux',
              desc: lieux > 0 ? `${lieux} lieu${lieux > 1 ? 'x' : ''} partenaire${lieux > 1 ? 's' : ''}` : 'Lieux partenaires',
              cta: 'Explorer les lieux',
            },
            {
              href: '/fournisseurs',
              emoji: '🎵',
              title: 'Fournisseurs',
              desc: fournisseurs > 0 ? `${fournisseurs} prestataire${fournisseurs > 1 ? 's' : ''}` : 'DJ, traiteur, déco',
              cta: 'Voir la marketplace',
            },
          ].map((card, i) => (
            <ScrollReveal key={card.href} delay={i * 0.08}>
              <Link
                href={card.href}
                className="relative flex flex-col gap-4 bg-surface border border-border rounded-2xl p-6 overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 group h-full"
              >
                {/* Glassmorphism hover tint */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/4 group-hover:to-transparent transition-all duration-500 rounded-2xl" />
                <span className="relative text-4xl">{card.emoji}</span>
                <div className="relative flex-1">
                  <p className="font-display font-semibold text-xl text-text group-hover:text-primary transition-colors duration-200 mb-1">
                    {card.title}
                  </p>
                  <p className="text-text-muted text-sm leading-relaxed">{card.desc}</p>
                </div>
                <p className="relative text-primary text-sm font-semibold group-hover:gap-2 transition-all">{card.cta} →</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── TIER S BANDEAU ───────────────────────────────────────────────── */}
      {tierSExps.length > 0 && (() => {
        const cfg = TIER_CONFIG['S']
        return (
          <section className="px-4 py-12 md:px-12 border-y border-border bg-surface">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal className="flex items-end justify-between mb-6 gap-4">
                <div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border mb-2 ${cfg.bg} ${cfg.color}`}>
                    <span className="font-display">S</span> Tier — Top 10%
                  </span>
                  <h2 className="font-display font-bold text-2xl text-text">Les meilleures soirées à {city}</h2>
                </div>
                <Link href="/tier-list" className="text-sm text-primary font-semibold hover:underline shrink-0 hidden sm:block">
                  Classement complet →
                </Link>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tierSExps.map((exp, i) => {
                  const tier = (exp.pricing_tiers as PricingTier[]).find(t => t.quantity > 0) ?? (exp.pricing_tiers as PricingTier[])[0]
                  return (
                    <ScrollReveal key={exp.id} delay={i * 0.08}>
                      <Link
                        href={`/experiences/${exp.id}`}
                        className="block bg-bg rounded-2xl overflow-hidden border border-border hover:shadow-md hover:border-primary/20 transition-all group"
                      >
                        {exp.cover_image_url ? (
                          <div className="aspect-video w-full overflow-hidden">
                            <img src={exp.cover_image_url} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className={`aspect-video w-full flex items-center justify-center ${cfg.bg}`}>
                            <span className={`font-display font-bold text-5xl opacity-20 ${cfg.color}`}>S</span>
                          </div>
                        )}
                        <div className="p-4">
                          <p className="font-display font-semibold text-text text-sm group-hover:text-primary transition-colors mb-1">{exp.title}</p>
                          <p className="text-text-muted text-xs">{new Date(exp.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {exp.venue_name}</p>
                          {tier && <p className={`mt-2 text-sm font-bold ${cfg.color}`}>{Math.round(tier.price_cents / 100)} €</p>}
                        </div>
                      </Link>
                    </ScrollReveal>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────────────── */}
      <section className="px-4 py-16 md:px-12 md:py-24 max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Comment ça marche</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text mb-3">
            De 0 à ta meilleure soirée.
          </h2>
          <p className="text-text-muted text-base max-w-sm mx-auto">
            Trois étapes, moins de 60 secondes pour la première.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }, i) => (
            <ScrollReveal key={step} delay={i * 0.1}>
              <div className="flex flex-col gap-4 p-6 bg-surface rounded-2xl border border-border h-full hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">{step}</p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-text mb-2 leading-snug">{title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── LES 3 ACTES ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-20 md:px-12 md:py-28"
        style={{ background: 'linear-gradient(160deg, #0d0d1a 0%, #1a0f2e 50%, #0f1a2e 100%)' }}
      >
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_50%,rgba(74,108,247,0.15),transparent)]" />
        <div className="relative max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Notre signature</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
              Un parcours en 3 actes.
            </h2>
            <p className="text-white/50 text-base max-w-sm mx-auto">
              On ne te jette pas à l'eau. Chaque soirée suit un rythme naturel.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {ACTS.map(({ number, verb, tagline, desc }, i) => (
              <ScrollReveal key={verb} delay={i * 0.1}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-white/20 tabular-nums">{number}</span>
                    <span className="text-white/40 text-xs uppercase tracking-widest">{tagline}</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white">{verb}</h3>
                  <div className="w-8 h-px bg-primary" />
                  <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TU ES UN PRO ? ────────────────────────────────────────────────── */}
      <section className="px-4 py-16 md:px-12 md:py-24 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Partenaires</p>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-text mb-3">Tu es un pro ?</h2>
            <p className="text-text-muted text-base max-w-sm mx-auto">
              Rejoins Soirée Villa — organisateurs, lieux et prestataires bienvenus.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRO_CARDS.map((card, i) => (
              <ScrollReveal key={card.role} delay={i * 0.08}>
                <Link
                  href={card.href}
                  className={`flex flex-col p-6 rounded-2xl border transition-all duration-200 group hover:shadow-md h-full ${
                    card.isRegistered ? 'border-success/30 bg-success/5 hover:border-success/50' : 'border-border bg-bg hover:border-primary/30'
                  }`}
                >
                  <span className="text-3xl mb-4 block">{card.icon}</span>
                  <p className="font-display font-semibold text-lg text-text mb-2">{card.role}</p>
                  <p className="text-text-muted text-sm mb-5 leading-relaxed flex-1">{card.desc}</p>
                  <p className={`text-sm font-semibold transition-colors ${card.isRegistered ? 'text-success' : 'text-primary group-hover:text-primary/80'}`}>
                    {card.label}
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── POUR QUI ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-14 md:px-12 bg-primary/5 border-b border-border">
        <ScrollReveal>
          <p className="font-display font-semibold text-xl md:text-3xl text-text text-center max-w-2xl mx-auto leading-snug">
            Pour celles et ceux qui veulent{' '}
            <span className="text-primary">vraiment rencontrer du monde</span>
            {' '}— sans subir la soirée.
          </p>
        </ScrollReveal>
      </section>

      {/* ── CTA FINAL + WAITLIST ───────────────────────────────────────────── */}
      <section className="px-4 py-20 md:px-12 md:py-28 max-w-2xl mx-auto text-center">
        <ScrollReveal>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Lancement à {city}</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text mb-4">
            Prêt·e à te découvrir ?
          </h2>
          <p className="text-text-muted mb-10 text-base max-w-sm mx-auto">
            Fais le quiz, reçois ton profil social, rejoins une soirée à {city}.
          </p>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-primary text-white font-display font-semibold text-base px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 mb-12"
          >
            Découvre ton style →
          </Link>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-bg px-4 text-sm text-text-muted">ou</span>
            </div>
          </div>

          <p className="text-sm text-text-muted mb-4">
            Pas de quiz maintenant ? Laisse ton email — on te prévient dès qu'une soirée est disponible.
          </p>
          <WaitlistForm />
        </ScrollReveal>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="font-display font-bold text-lg text-text block mb-2">
                Soirée Villa
              </Link>
              <p className="text-text-muted text-xs leading-relaxed">
                Comprendre · Vivre · Oser
              </p>
              <p className="text-text-muted text-xs mt-2">Nice — 2026</p>
            </div>

            {/* Explorer */}
            <div>
              <p className="text-xs font-bold text-text uppercase tracking-widest mb-4">Explorer</p>
              <ul className="flex flex-col gap-2.5">
                {[
                  { href: '/experiences', label: 'Soirées' },
                  { href: '/lieux', label: 'Lieux' },
                  { href: '/fournisseurs', label: 'Fournisseurs' },
                  { href: '/tier-list', label: 'Tier List' },
                  { href: '/marketplace', label: 'Marketplace' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-text-muted text-sm hover:text-text transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div>
              <p className="text-xs font-bold text-text uppercase tracking-widest mb-4">Pro</p>
              <ul className="flex flex-col gap-2.5">
                {[
                  { href: '/organisateur/inscription', label: 'Devenir organisateur' },
                  { href: '/lieu/inscription', label: 'Inscrire mon lieu' },
                  { href: '/fournisseur/inscription', label: 'Inscrire ma prestation' },
                  { href: '/marketplace', label: 'Accéder à la marketplace' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-text-muted text-sm hover:text-text transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Légal */}
            <div>
              <p className="text-xs font-bold text-text uppercase tracking-widest mb-4">Légal</p>
              <ul className="flex flex-col gap-2.5">
                {[
                  { href: '/charte-participant', label: 'Charte participant' },
                  { href: '/charte-organisateur', label: 'Charte organisateur' },
                  { href: '/mentions-legales', label: 'Mentions légales' },
                  { href: '/contact', label: 'Contact' },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-text-muted text-sm hover:text-text transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-border">
            <p className="text-text-muted text-xs">© 2026 Soirée Villa — Tous droits réservés</p>
            <a
              href="https://instagram.com/soireevilla"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted text-xs hover:text-text transition-colors"
            >
              Instagram →
            </a>
          </div>
        </div>
      </footer>

    </main>
  )
}
