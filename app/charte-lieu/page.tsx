import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Charte lieu — Soirée Villa',
}

export default function CharteLieuPage() {
  return (
    <main className="min-h-screen bg-bg px-4 pt-8 pb-20">
      <div className="max-w-md mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="font-display font-bold text-3xl text-text mb-2">Charte lieu</h1>
        <p className="text-text-muted text-sm mb-8">Soirée Villa — Lieux partenaires</p>

        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-1">Votre rôle</h2>
          <p className="text-primary font-medium text-sm italic mb-4">
            &laquo;&nbsp;Votre espace devient le décor d&apos;une expérience humaine.&nbsp;&raquo;
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            En référençant votre lieu sur Soirée Villa, vous acceptez d&apos;accueillir des groupes de participants
            dans un cadre bienveillant et adapté aux expériences sociales. Votre espace contribue directement
            à la qualité de l&apos;expérience vécue.
          </p>
        </section>

        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-3">Vos engagements</h2>
          <ol className="flex flex-col gap-4">
            {[
              { title: 'Exactitude des informations', body: "Les données publiées (capacité, adresse, équipements, photos) reflètent fidèlement la réalité du lieu. Toute modification significative doit être signalée." },
              { title: 'Disponibilité confirmée', body: "Lorsqu'un organisateur réserve votre espace via Soirée Villa, vous garantissez la disponibilité pour la date convenue." },
              { title: 'Accueil adapté', body: "Votre lieu est propre, accessible et prêt à l'heure convenue. Vous disposez des équipements annoncés (mobilier, sono, etc.)." },
              { title: 'Respect de la vie privée', body: "Les informations personnelles des participants ne sont pas utilisées à des fins commerciales extérieures à la prestation." },
              { title: 'Tarification transparente', body: "Les prix communiqués sont définitifs. Aucun frais supplémentaire ne peut être facturé sans accord préalable de l'organisateur." },
            ].map(({ title, body }, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="font-semibold text-text text-sm">{title}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-3">Modération</h2>
          <p className="text-text text-sm leading-relaxed">
            Soirée Villa se réserve le droit de retirer un lieu de la plateforme en cas de non-conformité
            aux informations publiées, d&apos;avis négatifs répétés ou de comportement incompatible avec
            nos valeurs. Les réservations existantes sont honorées ou remboursées.
          </p>
        </section>

        <p className="text-text-muted text-xs text-center leading-relaxed">
          En cochant la case lors de votre inscription, vous confirmez avoir lu et accepté cette charte.
        </p>
      </div>
    </main>
  )
}
