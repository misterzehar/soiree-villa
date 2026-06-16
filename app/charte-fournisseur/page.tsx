import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Charte prestataire — Soirée Villa',
}

export default function CharteFournisseurPage() {
  return (
    <main className="min-h-screen bg-bg px-4 pt-8 pb-20">
      <div className="max-w-md mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="font-display font-bold text-3xl text-text mb-2">Charte prestataire</h1>
        <p className="text-text-muted text-sm mb-8">Soirée Villa — Fournisseurs & prestataires</p>

        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-1">Votre rôle</h2>
          <p className="text-primary font-medium text-sm italic mb-4">
            &laquo;&nbsp;Vous êtes un acteur de l&apos;expérience, pas un simple fournisseur.&nbsp;&raquo;
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            En rejoignant la marketplace Soirée Villa, vous entrez dans un écosystème d&apos;expériences sociales
            soigneusement sélectionnées. Votre prestation contribue directement à la qualité de la soirée —
            votre professionnalisme impacte le ressenti de tous les participants.
          </p>
        </section>

        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-3">Vos engagements</h2>
          <ol className="flex flex-col gap-4">
            {[
              { title: 'Profil honnête et à jour', body: "Votre description, vos photos et votre fourchette de prix reflètent fidèlement votre offre actuelle. Vous mettez à jour votre profil en cas de changement." },
              { title: 'Réactivité aux demandes', body: "Vous répondez aux demandes de contact dans un délai de 48h ouvrées. Une absence de réponse répétée peut entraîner un déréférencement temporaire." },
              { title: 'Respect des engagements pris', body: "Si vous acceptez une mission via Soirée Villa, vous la menez à bien dans les conditions convenues. Toute annulation de votre part doit être signalée 7 jours à l'avance minimum." },
              { title: 'Qualité de prestation', body: "Votre prestation respecte les standards annoncés. Les organisateurs peuvent laisser des avis qui impactent votre visibilité sur la plateforme." },
              { title: 'Confidentialité', body: "Les informations des organisateurs et participants obtenus via Soirée Villa ne sont pas utilisées à des fins commerciales extérieures." },
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
            Soirée Villa se réserve le droit de suspendre ou retirer un prestataire de la marketplace
            en cas de non-respect de cette charte, d&apos;avis négatifs répétés ou de pratiques commerciales
            incompatibles avec nos valeurs.
          </p>
        </section>

        <p className="text-text-muted text-xs text-center leading-relaxed">
          En cochant la case lors de votre inscription, vous confirmez avoir lu et accepté cette charte.
        </p>
      </div>
    </main>
  )
}
