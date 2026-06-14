import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PROFILES } from '@/constants/profiles'
import type { ProfileId, AxesTarget } from '@/constants/profiles'

const AXIS_META: Record<string, { label: string; positive: string; negative: string }> = {
  energy:     { label: 'Énergie',      positive: 'Extraverti',    negative: 'Introverti'     },
  structure:  { label: 'Structure',    positive: 'Structuré',     negative: 'Spontané'       },
  depth:      { label: 'Profondeur',   positive: 'Profond',       negative: 'Léger'          },
  sociality:  { label: 'Socialité',    positive: 'Grand groupe',  negative: 'Petit comité'   },
  cerebrale:  { label: 'Cérébrale',    positive: 'Analytique',    negative: 'Instinctif'     },
  creativite: { label: 'Créativité',   positive: 'Créatif',       negative: 'Conventionnel'  },
}

const AXES_ORDER = ['energy', 'structure', 'depth', 'sociality', 'cerebrale', 'creativite'] as const

export default async function ResultPage() {
  const cookieStore = await cookies()
  const profileId = cookieStore.get('sv_profile')?.value as ProfileId | undefined

  if (!profileId) redirect('/onboarding')

  const profile = PROFILES.find(p => p.id === profileId)
  if (!profile) redirect('/onboarding')

  // User's actual normalized axes (from cookie) or fallback to profile target
  let userAxes: AxesTarget = profile.axes_target
  const axesCookieRaw = cookieStore.get('sv_axes')?.value
  if (axesCookieRaw) {
    try {
      const parsed = JSON.parse(axesCookieRaw)
      if ('energy' in parsed) userAxes = parsed as AxesTarget
    } catch { /* fallback to profile target */ }
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center px-4 pt-10 pb-20">
      <div className="w-full max-w-md">
        <p className="text-center text-text-muted text-sm font-medium tracking-wide uppercase mb-6">
          Ton profil social
        </p>

        {/* Profile card */}
        <div className="bg-surface rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
          <div className="p-7">
            <div className="text-6xl mb-4 text-center">{profile.emoji}</div>
            <h1 className="font-display font-bold text-2xl text-center text-text mb-2">
              {profile.name}
            </h1>
            <p className="text-text-muted text-sm text-center leading-relaxed mb-5">
              {profile.tagline}
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {profile.traits.map(trait => (
                <span key={trait} className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  {trait}
                </span>
              ))}
            </div>
            <p className="text-text text-sm leading-relaxed border-t border-border pt-5">
              {profile.description}
            </p>
          </div>
        </div>

        {/* Axes — 6D */}
        <div className="bg-surface rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="font-display font-semibold text-sm text-text-muted uppercase tracking-wide mb-4">
            Tes 6 axes
          </h2>
          <div className="flex flex-col gap-3">
            {AXES_ORDER.map(ax => {
              const meta  = AXIS_META[ax]
              const value = userAxes[ax] // -1, 0, or 1
              const label = value === 1 ? meta.positive : value === -1 ? meta.negative : 'Neutre'
              const width = value === 1 ? 'w-full' : value === -1 ? 'w-1/4' : 'w-1/2'

              return (
                <div key={ax}>
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>{meta.label}</span>
                    <span className="font-semibold text-primary">{label}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all ${width}`} />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted/60 mt-0.5">
                    <span>{meta.negative}</span>
                    <span>{meta.positive}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Matches */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8">
          <p className="text-text text-sm leading-relaxed">
            <span className="font-semibold">Tu matches avec :</span> des organisateurs{' '}
            <span className="text-primary">{profile.matchesWith.organizers}</span>, des lieux{' '}
            <span className="text-primary">{profile.matchesWith.venues}</span>.
          </p>
        </div>

        <Link
          href="/experiences"
          className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-display font-semibold py-4 rounded-2xl shadow-md transition-colors duration-150"
        >
          Voir les expériences pour moi
        </Link>

        <Link
          href="/onboarding"
          className="block w-full text-center text-text-muted text-sm mt-4 py-2 hover:text-text transition-colors"
        >
          Refaire le quiz
        </Link>
      </div>
    </main>
  )
}
