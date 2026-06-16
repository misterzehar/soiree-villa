import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Charte organisateur — Soirée Villa',
}

export default function CharteOrganisateurPage() {
  return (
    <main className="min-h-screen bg-bg px-4 pt-8 pb-20">
      <div className="max-w-md mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <h1 className="font-display font-bold text-3xl text-text mb-2">Charte organisateur</h1>
        <p className="text-text-muted text-sm mb-8">Soirée Villa — Organisateurs-hôtes</p>

        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-1">Ton rôle</h2>
          <p className="text-primary font-medium text-sm italic mb-4">
            &laquo;&nbsp;Tu n&apos;es pas un prestataire. Tu es un maître de cérémonie social.&nbsp;&raquo;
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            En tant qu&apos;organisateur-hôte sur Soirée Villa, tu conçois et animes des expériences sociales
            structurées. Tu assures la sécurité émotionnelle du groupe, tu gères le rythme de la soirée,
            tu facilites les connexions. Ce n&apos;est pas un simple événement : c&apos;est une expérience vécue.
          </p>
        </section>

        <section className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-text mb-3">Tes engagements</h2>
          <ol className="flex flex-col gap-4">
            {[
              { title: 'Respecter le programme annoncé', body: "L'expérience que tu publies correspond à ce que les participants vivront — thème, durée, activités. Pas de changements de dernière minute sans prévenir la communauté." },
              { title: 'Créer un cadre bienveillant', body: "Tu es responsable de l'ambiance. Si un participant ne respecte pas la charte, tu interviens ou tu exclus. Soirée Villa te soutient dans ces décisions." },
              { title: 'Assurer la ponctualité', body: "Tu arrives en avance, tu prépares l'espace, tu accueilles. Les participants comptent sur toi pour ouvrir la porte à l'heure." },
              { title: 'Communiquer en amont', body: "J-3 : envoie un message dans le chat pour confirmer les infos pratiques. J-1 : prépare ta liste d'inscrits et le check-in." },
              { title: 'Respecter la commission', body: "15 % de chaque inscription est reversé à Soirée Villa pour la plateforme, le support, et la mise en relation. Ce taux est fixe et accepté à l'inscription." },
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
          <h2 className="font-display font-semibold text-lg text-text mb-3">Sanctions</h2>
          <p className="text-text text-sm leading-relaxed">
            En cas de non-respect (annulation abusive, comportement inapproprié, fraude), Soirée Villa
            se réserve le droit de suspendre l&apos;accès à la plateforme et de retenir la commission.
            Les participants lésés seront remboursés intégralement.
          </p>
        </section>

        <p className="text-text-muted text-xs text-center leading-relaxed">
          En cochant la case lors de ton inscription, tu confirmes avoir lu et accepté cette charte.
        </p>
      </div>
    </main>
  )
}
