import Link from "next/link";
import { Sparkles, User, Calendar } from "lucide-react";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { SiteHeader } from "@/components/site-header";

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

export default function HomePage() {
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
