import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Charte & Conditions — Soirée Villa',
}

export default function ChartePage() {
  return (
    <main className="min-h-screen bg-bg px-4 pt-8 pb-20">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="font-display font-bold text-3xl text-text mb-2">
          Charte &amp; Conditions
        </h1>
        <p className="text-text-muted text-sm mb-8">
          Soirée Villa — Participants
        </p>

        {/* Politique d'annulation */}
        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-3">
            Politique d&apos;annulation
          </h2>
          <p className="text-text text-sm leading-relaxed">
            Annulation possible jusqu&apos;à <strong>48h avant l&apos;expérience</strong> — remboursement
            total garanti. Au-delà de ce délai, pas de remboursement sauf cas exceptionnel
            à discuter directement avec l&apos;organisateur. Pour annuler, réponds simplement
            à l&apos;email de confirmation reçu après ton inscription.
          </p>
        </section>

        {/* Charte participant */}
        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-1">
            Charte participant
          </h2>
          <p className="text-primary font-medium text-sm italic mb-4">
            &laquo;&nbsp;Tu es là pour vivre l&apos;expérience, pas la subir ni la casser.&nbsp;&raquo;
          </p>

          <p className="text-text-muted text-sm mb-4 leading-relaxed">
            Soirée Villa repose sur une sélection et un cadre clair. Chaque participant
            s&apos;engage à respecter ces 5 règles simples pour que l&apos;expérience soit réussie
            pour tout le monde.
          </p>

          <ol className="flex flex-col gap-4">
            {[
              {
                title: 'Jouer le jeu',
                body: "Participer activement à l'expérience — pas de retrait passif. Tu n'as pas à être parfait, juste présent.",
              },
              {
                title: 'Respecter les autres',
                body: "Aucun comportement oppressant, insistant ou déplacé. Chacun définit ses propres limites, elles sont respectées sans discussion.",
              },
              {
                title: 'Respecter le lieu',
                body: "Propreté, matériel, voisinage. On laisse le lieu dans l'état où on l'a trouvé.",
              },
              {
                title: 'Être discret',
                body: "Photos et vidéos uniquement si le format de l'expérience le prévoit explicitement. Demande avant de filmer.",
              },
              {
                title: 'Être ponctuel',
                body: "Arrivée dans le créneau annoncé. Un retard impacte tout le groupe — préviens si tu es bloqué.",
              },
            ].map(({ title, body }, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-text text-sm">{title}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Conséquences */}
        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-3">
            Modération
          </h2>
          <p className="text-text text-sm leading-relaxed">
            En cas de non-respect de la charte, Soirée Villa se réserve le droit d&apos;exclure
            un participant de l&apos;expérience en cours et de bloquer l&apos;accès aux prochaines
            expériences. La décision appartient à l&apos;organisateur en coordination avec
            Soirée Villa.
          </p>
        </section>

        {/* Signature */}
        <p className="text-text-muted text-xs text-center leading-relaxed">
          Ces règles s&apos;appliquent à toutes les expériences organisées via Soirée Villa.
          En cochant la case lors de ton inscription, tu confirmes les avoir lues et acceptées.
        </p>
      </div>
    </main>
  )
}
