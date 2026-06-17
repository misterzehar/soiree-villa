import Link from "next/link";
import { Sparkles, User, Calendar, MapPin } from "lucide-react";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { SiteHeader } from "@/components/site-header";
import { createServerSupabase, createSupabaseServerClient } from "@/lib/supabase";
import { getActorProfiles } from "@/lib/actors";
import type { ActorProfiles } from "@/lib/actors";
import type { PricingTier } from "@/types/experience";

export const dynamic = 'force-dynamic'

// ─── Données statiques ───────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    icon: Sparkles,
    step: "Étape 1",
    title: "15 mini-questions",
    desc: "Format \"Tu préfères ?\" — rapide, ludique, sans créer de compte.",
  },
  {
    icon: User,
    step: "Étape 2",
    title: "Ton profil social révélé",
    desc: "Explorateur Festif, Connecteur Social, Cérébral Curieux… l'un des 6 archétypes.",
  },
  {
    icon: Calendar,
    step: "Étape 3",
    title: "Des soirées qui te matchent",
    desc: "Des expériences animées, sélectionnées pour ton style. Mémorables.",
  },
];

const ACTS = [
  {
    number: "01",
    verb: "Comprendre",
    desc: "Tu observes, tu te mets en confiance. L'hôte pose le cadre et installe l'ambiance.",
  },
  {
    number: "02",
    verb: "Vivre",
    desc: "Tu agis, tu partages quelque chose de concret. Le groupe prend vie autour d'une activité.",
  },
  {
    number: "03",
    verb: "Oser",
    desc: "Tu te livres, tu crées du vrai lien. La magie opère dans ce moment hors du temps.",
  },
];

const EXPERIENCES_PREVIEW = [
  {
    label: "Blind test rooftop",
    ambiance: "Festif · Grand groupe",
    tag: "Nice",
    cardClass: "bg-primary/8",
    accentClass: "text-primary",
  },
  {
    label: "Atelier dégustation",
    ambiance: "Intimiste · Curieux",
    tag: "Nice",
    cardClass: "bg-accent/8",
    accentClass: "text-accent",
  },
  {
    label: "Cercle de parole",
    ambiance: "Authentique · Profond",
    tag: "Nice",
    cardClass: "bg-secondary/8",
    accentClass: "text-secondary",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = createServerSupabase()

  // Compteurs publics + obsession de la semaine
  const [
    { count: expCount },
    { count: lieuxCount },
    { count: fournisseursCount },
    { data: obsessionRaw },
  ] = await Promise.all([
    supabase.from('experiences').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('lieux').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('fournisseurs').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase
      .from('experiences')
      .select('id, title, description, date, venue_name, organizer_name, cover_image_url, pricing_tiers')
      .eq('status', 'published')
      .eq('is_obsession_of_week', true)
      .single(),
  ])

  type ObsessionExp = {
    id: string
    title: string
    description: string
    date: string
    venue_name: string
    organizer_name: string
    cover_image_url: string | null
    pricing_tiers: PricingTier[]
  }
  const obsession = obsessionRaw as ObsessionExp | null

  // Tarif courant (premier tier avec des places — logique simplifiée pour landing)
  function currentPrice(tiers: PricingTier[]): PricingTier | null {
    return tiers.find(t => t.quantity > 0) ?? tiers[0] ?? null
  }

  // Profils de l'utilisateur connecté (pour la section "Tu es un pro?")
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  const profiles: ActorProfiles = user
    ? await getActorProfiles(user.id)
    : { hasOrga: false, hasLieu: false, hasFourn: false }

  const exp = expCount ?? 0
  const lieux = lieuxCount ?? 0
  const fournisseurs = fournisseursCount ?? 0

  const EXPLORE_CARDS = [
    {
      href: '/experiences',
      icon: '🎉',
      title: 'Soirées',
      desc: exp > 0
        ? `${exp} expérience${exp > 1 ? 's' : ''} animée${exp > 1 ? 's' : ''} disponible${exp > 1 ? 's' : ''} à Nice`
        : 'Bientôt disponibles à Nice',
    },
    {
      href: '/lieux',
      icon: '🏠',
      title: 'Lieux',
      desc: lieux > 0
        ? `${lieux} lieu${lieux > 1 ? 'x' : ''} partenaire${lieux > 1 ? 's' : ''} — du rooftop au loft industriel`
        : 'Lieux partenaires à Nice',
    },
    {
      href: '/fournisseurs',
      icon: '🎵',
      title: 'Fournisseurs',
      desc: fournisseurs > 0
        ? `${fournisseurs} prestataire${fournisseurs > 1 ? 's' : ''} : DJ, traiteur, déco, animation`
        : 'DJ, traiteur, déco, animation',
    },
  ]

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
      desc: "Propose ton espace aux organisateurs. Visibilité immédiate auprès des créateurs d'événements.",
      href: profiles.hasLieu ? '/lieu' : '/lieu/inscription',
      label: profiles.hasLieu ? 'Accéder à mon espace →' : 'Inscrire mon lieu',
      isRegistered: profiles.hasLieu,
    },
    {
      icon: '🎵',
      role: 'Fournisseur',
      desc: 'DJ, traiteur, décoration, animation — rejoins la marketplace et sois contacté directement.',
      href: profiles.hasFourn ? '/fournisseur' : '/fournisseur/inscription',
      label: profiles.hasFourn ? 'Accéder à mon espace →' : 'Inscrire ma prestation',
      isRegistered: profiles.hasFourn,
    },
  ]

  return (
    <main className="bg-bg min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col min-h-screen overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-text via-text/90 to-text/80"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_40%,rgba(74,108,247,0.35),transparent)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_70%_60%,rgba(255,122,89,0.2),transparent)]"
        />

        <nav className="relative z-10 px-6 pt-6 md:px-12 md:pt-8">
          <SiteHeader variant="dark" />
        </nav>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pb-20 text-center md:px-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-5">
            Comprendre · Vivre · Oser
          </p>

          <h1 className="font-display font-bold text-4xl md:text-5xl text-white max-w-2xl leading-tight mb-5">
            Des soirées pensées pour{" "}
            <span className="text-accent">ton style social.</span>
          </h1>

          <p className="text-lg text-white/70 max-w-md mb-10 leading-relaxed">
            On te matche avec des expériences animées qui te ressemblent.
            Plus de soirées subies.
          </p>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-base px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-150"
          >
            Découvre ton style
            <span aria-hidden>→</span>
          </Link>

          <p className="mt-4 text-sm text-white/40">
            15 questions · Moins d'une minute · Gratuit
          </p>
        </div>

        <div aria-hidden className="relative z-10 flex justify-center pb-8 text-white/30 text-xs animate-bounce">
          ↓
        </div>
      </section>

      {/* ── OBSESSION DE LA SEMAINE ──────────────────────────────────────── */}
      {obsession && (() => {
        const tier = currentPrice(obsession.pricing_tiers)
        const dateFmt = new Date(obsession.date).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long',
        })
        const shortDesc = obsession.description.length > 200
          ? obsession.description.slice(0, 197) + '…'
          : obsession.description

        return (
          <section className="px-6 py-12 md:px-12 md:py-16 bg-primary/5 border-y border-primary/10">
            <div className="max-w-4xl mx-auto">

              {/* Badge */}
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-sm">
                  ⭐ Obsession de la semaine
                </span>
              </div>

              <div className="bg-surface rounded-3xl overflow-hidden shadow-md border border-primary/10">

                {/* Cover image */}
                {obsession.cover_image_url && (
                  <div className="relative w-full aspect-[16/7] overflow-hidden">
                    <img
                      src={obsession.cover_image_url}
                      alt={obsession.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-text/40 to-transparent" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 md:p-8">
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-text mb-3 leading-tight">
                    {obsession.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
                    <span className="flex items-center gap-1.5 text-text-muted text-sm capitalize">
                      <Calendar className="w-4 h-4 shrink-0 text-primary" />
                      {dateFmt}
                    </span>
                    <span className="flex items-center gap-1.5 text-text-muted text-sm">
                      <MapPin className="w-4 h-4 shrink-0 text-primary" />
                      {obsession.venue_name}
                    </span>
                    <span className="text-text-muted text-sm">
                      par <span className="font-medium text-text">{obsession.organizer_name}</span>
                    </span>
                  </div>

                  <p className="text-text-muted text-sm leading-relaxed mb-6">{shortDesc}</p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {tier && (
                      <div>
                        <p className="text-text-muted text-xs mb-0.5">{tier.label}</p>
                        <p className="font-display font-bold text-2xl text-primary">
                          {Math.round(tier.price_cents / 100)} €
                        </p>
                      </div>
                    )}
                    <Link
                      href={`/experiences/${obsession.id}`}
                      className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-base px-7 py-3.5 rounded-full shadow hover:shadow-md hover:scale-[1.02] transition-all duration-150"
                    >
                      Je participe →
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )
      })()}

      {/* ── EXPLORER ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-12 md:py-20 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Explorer
          </p>
          <h2 className="font-display font-bold text-3xl text-text mb-2">
            Tout ce que propose Soirée Villa
          </h2>
          <p className="text-text-muted text-sm">Soirées, lieux et prestataires à Nice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXPLORE_CARDS.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col gap-3 group"
            >
              <span className="text-3xl">{card.icon}</span>
              <div className="flex-1">
                <p className="font-display font-semibold text-lg text-text group-hover:text-primary transition-colors">
                  {card.title}
                </p>
                <p className="text-text-muted text-sm mt-1 leading-relaxed">{card.desc}</p>
              </div>
              <p className="text-primary text-sm font-semibold">Explorer →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:px-12 md:py-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Le principe
          </p>
          <h2 className="font-display font-bold text-3xl text-text mb-3">
            Comment ça marche ?
          </h2>
          <p className="text-text-muted max-w-sm mx-auto">
            En trois étapes, tu passes de « je sais pas quoi faire » à « j'y vais. »
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
            <div
              key={step}
              className="flex-1 bg-surface rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-primary" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{step}</p>
              <h3 className="font-display font-semibold text-lg text-text mb-2">{title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LES 3 ACTES ───────────────────────────────────────────────────── */}
      <section className="bg-text text-white px-6 py-16 md:px-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
              Notre signature
            </p>
            <h2 className="font-display font-bold text-3xl text-white mb-3">
              Un parcours en 3 actes
            </h2>
            <p className="text-white/60 max-w-sm mx-auto text-base">
              On ne te jette pas à l'eau. Chaque soirée suit un rythme naturel.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-10 md:gap-8">
            {ACTS.map(({ number, verb, desc }) => (
              <div key={verb} className="flex-1">
                <p className="font-mono text-sm text-white/20 mb-2 tabular-nums">{number}</p>
                <h3 className="font-display font-bold text-2xl text-white mb-3">{verb}</h3>
                <div className="w-8 h-0.5 bg-primary mb-4" />
                <p className="text-white/65 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CE QU'ON ORGANISE ─────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:px-12 md:py-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Les expériences
          </p>
          <h2 className="font-display font-bold text-3xl text-text mb-3">
            Ce qu'on organise
          </h2>
          <p className="text-text-muted max-w-sm mx-auto">
            Du blind test au cercle de parole — toujours animé, toujours connecté.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {EXPERIENCES_PREVIEW.map(({ label, ambiance, tag, cardClass, accentClass }) => (
            <div
              key={label}
              className={`flex-1 rounded-2xl border border-border overflow-hidden ${cardClass}`}
            >
              <div className="h-44 w-full flex items-center justify-center">
                <span className={`font-display font-bold text-5xl opacity-15 ${accentClass}`}>✦</span>
              </div>
              <div className="px-5 py-4 bg-surface/80">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-display font-semibold text-text">{label}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 ${accentClass}`}>
                    {tag}
                  </span>
                </div>
                <p className="text-xs text-text-muted">{ambiance}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TU ES UN PRO ? ────────────────────────────────────────────────── */}
      <section className="bg-surface border-y border-border px-6 py-16 md:px-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
              Partenaires
            </p>
            <h2 className="font-display font-bold text-3xl text-text mb-3">
              Tu es un pro ?
            </h2>
            <p className="text-text-muted max-w-sm mx-auto">
              Rejoins Soirée Villa — organisateurs, lieux et prestataires bienvenus.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {PRO_CARDS.map(card => (
              <Link
                key={card.role}
                href={card.href}
                className={`flex-1 rounded-2xl border p-6 transition-all duration-200 group hover:shadow-md ${
                  card.isRegistered
                    ? 'border-success/30 bg-success/5 hover:border-success/50'
                    : 'border-border bg-bg hover:border-primary/30'
                }`}
              >
                <span className="text-3xl mb-3 block">{card.icon}</span>
                <p className="font-display font-semibold text-lg text-text mb-2">{card.role}</p>
                <p className="text-text-muted text-sm mb-4 leading-relaxed">{card.desc}</p>
                <p className={`text-sm font-semibold transition-colors ${
                  card.isRegistered
                    ? 'text-success'
                    : 'text-primary group-hover:text-primary/80'
                }`}>
                  {card.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POUR QUI ──────────────────────────────────────────────────────── */}
      <section className="bg-primary/5 border-y border-border px-6 py-14 md:px-12">
        <p className="font-display font-semibold text-xl md:text-2xl text-text text-center max-w-xl mx-auto leading-snug">
          Pour celles et ceux qui veulent rencontrer du monde{" "}
          <span className="text-primary">sans subir la soirée.</span>
        </p>
      </section>

      {/* ── CTA FINAL + WAITLIST ───────────────────────────────────────────── */}
      <section className="px-6 py-16 md:px-12 md:py-24 max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
          Lancement à Nice
        </p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-text mb-4">
          Prêt·e à te découvrir ?
        </h2>
        <p className="text-text-muted mb-10 text-base max-w-sm mx-auto">
          Fais le quiz, reçois ton profil social, rejoins une expérience à Nice.
        </p>

        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-base px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-150 mb-12"
        >
          Découvre ton style
          <span aria-hidden>→</span>
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
          Pas envie de faire le quiz maintenant ? Laisse ton email, on te prévient
          dès qu'une soirée est disponible.
        </p>
        <WaitlistForm />
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-8 md:px-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <span className="font-display font-semibold text-text">Soirée Villa</span>
          <div className="flex items-center gap-6">
            <Link href="/charte" className="hover:text-text transition-colors">Charte</Link>
            <Link href="/legal" className="hover:text-text transition-colors">Mentions légales</Link>
            <a
              href="https://instagram.com/soireevilla"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors"
            >
              Instagram
            </a>
          </div>
          <span>© 2026 Soirée Villa</span>
        </div>
      </footer>
    </main>
  );
}
