import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { submitNps } from './actions'

export const dynamic = 'force-dynamic'

export default async function NpsPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ merci?: string; error?: string }>
}) {
  const [{ token }, sp] = await Promise.all([params, searchParams])
  const supabase = createServerSupabase()

  const { data: reg } = await supabase
    .from('registrations')
    .select('id, participant_first_name, experiences(title)')
    .eq('id', token)
    .eq('payment_status', 'paid')
    .single()

  if (!reg) notFound()

  const expTitle = (() => {
    const e = reg.experiences
    return (Array.isArray(e) ? e[0] : e)?.title ?? 'la soirée'
  })()

  const { data: existing } = await supabase
    .from('nps_responses')
    .select('id')
    .eq('registration_id', token)
    .maybeSingle()

  if (existing || sp.merci === '1') {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-4">💛</div>
          <h1 className="font-display font-bold text-2xl text-text mb-2">Merci !</h1>
          <p className="text-text-muted text-sm leading-relaxed">
            Ton retour a bien été enregistré. Il nous aide à améliorer chaque expérience.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <p className="text-primary text-xs font-semibold uppercase tracking-wide mb-2">
            Soirée Villa
          </p>
          <h1 className="font-display font-bold text-2xl text-text mb-2">
            Comment s&apos;est passé{' '}
            <span className="text-primary">{expTitle}</span> ?
          </h1>
          <p className="text-text-muted text-sm">
            30 secondes, ça aide vraiment.
          </p>
        </div>

        {sp.error === '1' && (
          <div className="bg-error/5 border border-error/20 rounded-xl px-4 py-3 mb-2">
            <p className="text-error text-sm">Une erreur s&apos;est produite. Merci de réessayer.</p>
          </div>
        )}

        <form action={submitNps} className="flex flex-col gap-6">
          <input type="hidden" name="registrationId" value={token} />

          {/* NPS score 0-10 */}
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <p className="text-text text-sm font-medium mb-1">
              De 0 à 10, tu recommanderais Soirée Villa à un ami ?
            </p>
            <p className="text-text-muted text-xs mb-4">0 = pas du tout · 10 = absolument</p>

            <div className="grid grid-cols-11 gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <label
                  key={i}
                  className="cursor-pointer"
                >
                  <input
                    type="radio"
                    name="score"
                    value={i}
                    required
                    className="sr-only peer"
                  />
                  <div className="h-10 flex items-center justify-center rounded-lg text-sm font-semibold border border-border text-text-muted bg-bg peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-colors hover:border-primary/50">
                    {i}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Commentaire */}
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <label className="block text-text text-sm font-medium mb-2">
              Un mot sur l&apos;expérience ?
              <span className="text-text-muted font-normal ml-1">(optionnel)</span>
            </label>
            <textarea
              name="comment"
              rows={3}
              placeholder="Ce qui t'a plu, surpris, ou ce qu'on pourrait améliorer…"
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white font-display font-semibold py-4 rounded-2xl hover:bg-primary/90 transition-colors"
          >
            Envoyer mon retour
          </button>

          <p className="text-text-muted text-xs text-center">
            Tes réponses sont anonymes et ne sont vues que par l&apos;équipe Soirée Villa.
          </p>
        </form>
      </div>
    </main>
  )
}
