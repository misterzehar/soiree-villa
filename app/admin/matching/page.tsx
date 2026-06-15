import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import { QUESTIONS } from '@/constants/onboarding-questions'
import { PROFILES } from '@/constants/profiles'
import { matchScore } from '@/lib/matching'
import type { AxesTarget, Profile } from '@/constants/profiles'

export const dynamic = 'force-dynamic'

// ── Types ────────────────────────────────────────────────────────────────────

type DbResponse = {
  id: string
  session_id: string
  computed_profile: string | null
  axes_scores: Record<string, number> | null
  answers: Array<{ q: number; choice: 'A' | 'B' }> | null
  created_at: string
}

type StatRow = {
  computed_profile: string | null
  axes_scores: Record<string, number> | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const AXES_ORDER = ['energy', 'structure', 'depth', 'sociality', 'cerebrale', 'creativite'] as const

const AXIS_META: Record<string, { emoji: string; short: string }> = {
  energy:     { emoji: '🔋', short: 'Énergie'    },
  structure:  { emoji: '📋', short: 'Structure'  },
  depth:      { emoji: '💎', short: 'Profondeur' },
  sociality:  { emoji: '👥', short: 'Socialité'  },
  cerebrale:  { emoji: '🧠', short: 'Cérébrale'  },
  creativite: { emoji: '🎨', short: 'Créativité' },
}

function toAxesTarget(raw: Record<string, number> | null): AxesTarget | null {
  if (!raw || !('energy' in raw)) return null
  function clamp(v: number | undefined): -1 | 0 | 1 {
    const n = v ?? 0
    return n > 0 ? 1 : n < 0 ? -1 : 0
  }
  return {
    energy:     clamp(raw.energy),
    structure:  clamp(raw.structure),
    depth:      clamp(raw.depth),
    sociality:  clamp(raw.sociality),
    cerebrale:  clamp(raw.cerebrale),
    creativite: clamp(raw.creativite),
  }
}

function axisChip(value: number | undefined) {
  const v = value ?? 0
  const color = v === 1 ? 'bg-success/15 text-success' : v === -1 ? 'bg-error/10 text-error' : 'bg-border text-text-muted'
  const label = v === 1 ? '+1' : v === -1 ? '-1' : ' 0'
  return { color, label }
}

function formatDt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminMatchingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted text-sm">403 — Accès refusé.</p>
      </main>
    )
  }

  const supabase = createServerSupabase()

  // Fetch top 30 responses with full detail + up to 1000 for stats
  const [{ data: recentRaw }, { data: allRaw }] = await Promise.all([
    supabase
      .from('onboarding_responses')
      .select('id, session_id, computed_profile, axes_scores, answers, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('onboarding_responses')
      .select('computed_profile, axes_scores')
      .order('created_at', { ascending: false })
      .limit(1000),
  ])

  const recent = (recentRaw ?? []) as DbResponse[]
  const all    = (allRaw ?? []) as StatRow[]

  // ── Pre-compute per-row profile scores ───────────────────────────────────
  type RowWithScores = {
    row: DbResponse
    sessionAxes: AxesTarget | null
    profileScores: Array<{ profile: Profile; score: number }>
  }

  const rowsWithScores: RowWithScores[] = recent.map(row => {
    const sessionAxes = toAxesTarget(row.axes_scores)
    const profileScores = sessionAxes
      ? PROFILES.map(p => ({ profile: p, score: matchScore(sessionAxes, p.axes_target) }))
          .sort((a, b) => b.score - a.score)
      : []
    return { row, sessionAxes, profileScores }
  })

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalSessions = all.length

  const profileDist: Record<string, number> = {}
  for (const r of all) {
    if (r.computed_profile) {
      profileDist[r.computed_profile] = (profileDist[r.computed_profile] ?? 0) + 1
    }
  }
  const profileDistSorted = Object.entries(profileDist)
    .sort(([, a], [, b]) => b - a)

  const axisDist: Record<string, { pos: number; zero: number; neg: number }> = {}
  for (const ax of AXES_ORDER) axisDist[ax] = { pos: 0, zero: 0, neg: 0 }

  for (const r of all) {
    if (!r.axes_scores) continue
    for (const ax of AXES_ORDER) {
      const v = r.axes_scores[ax] ?? 0
      if (v > 0)      axisDist[ax].pos++
      else if (v < 0) axisDist[ax].neg++
      else            axisDist[ax].zero++
    }
  }

  const baseUrl = `/admin/matching?token=${token}`

  return (
    <main className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href={`/admin?token=${token}`}
              className="text-text-muted text-xs hover:text-text transition-colors"
            >
              ← Admin
            </Link>
            <h1 className="font-display font-bold text-2xl text-text mt-1">
              Debug Matching
            </h1>
            <p className="text-text-muted text-sm">
              {totalSessions} session{totalSessions > 1 ? 's' : ''} · 20 questions · 20 profils · 6 axes
            </p>
          </div>
        </div>

        {/* ── Section 1 : 20 Questions ──────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="font-display font-semibold text-lg text-text mb-3">
            🎯 20 questions
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left text-text-muted bg-bg">
                  <th className="py-2.5 px-4 font-medium w-10">#</th>
                  <th className="py-2.5 px-4 font-medium w-40">Axe</th>
                  <th className="py-2.5 px-4 font-medium">Option A (+1)</th>
                  <th className="py-2.5 px-4 font-medium">Option B (-1)</th>
                </tr>
              </thead>
              <tbody>
                {QUESTIONS.map(q => {
                  const meta = AXIS_META[q.axis]
                  return (
                    <tr key={q.id} className="border-b border-border/50 hover:bg-bg/50 transition-colors">
                      <td className="py-2 px-4 text-text-muted font-mono text-xs">{q.id}</td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{meta.emoji}</span>
                          <span className="text-xs font-medium text-text">{meta.short}</span>
                        </span>
                      </td>
                      <td className="py-2 px-4 text-text text-xs leading-snug max-w-xs">
                        <span className="text-success font-semibold mr-1.5">[+1]</span>
                        {q.optionA.label}
                      </td>
                      <td className="py-2 px-4 text-text text-xs leading-snug max-w-xs">
                        <span className="text-error font-semibold mr-1.5">[-1]</span>
                        {q.optionB.label}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 2 : 20 Profils ───────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="font-display font-semibold text-lg text-text mb-3">
            🧬 20 profils — cibles 6D
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left text-text-muted bg-bg">
                  <th className="py-2.5 px-4 font-medium">Profil</th>
                  <th className="py-2.5 px-4 font-medium max-w-xs">Tagline</th>
                  {AXES_ORDER.map(ax => (
                    <th key={ax} className="py-2.5 px-3 font-medium text-center whitespace-nowrap">
                      {AXIS_META[ax].emoji}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROFILES.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-bg/50 transition-colors">
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span className="font-medium text-text text-xs">
                        {p.emoji} {p.name}
                      </span>
                      <div className="text-text-muted text-[10px] font-mono mt-0.5">{p.id}</div>
                    </td>
                    <td className="py-2 px-4 text-text-muted text-xs max-w-xs">
                      {p.tagline.length > 60 ? p.tagline.slice(0, 60) + '…' : p.tagline}
                    </td>
                    {AXES_ORDER.map(ax => {
                      const { color, label } = axisChip(p.axes_target[ax])
                      return (
                        <td key={ax} className="py-2 px-3 text-center">
                          <span className={`inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${color}`}>
                            {label}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 3 : Dernières évaluations ────────────────────────── */}
        <section className="mb-10">
          <h2 className="font-display font-semibold text-lg text-text mb-3">
            🔍 Dernières évaluations (top {recent.length})
          </h2>

          {recent.length === 0 ? (
            <p className="text-text-muted text-sm">Aucune session enregistrée.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {rowsWithScores.map(({ row, sessionAxes, profileScores }) => {
                const retainedProfile = PROFILES.find(p => p.id === row.computed_profile)
                const answers = row.answers ?? []

                return (
                  <details
                    key={row.id}
                    className="bg-surface border border-border rounded-xl overflow-hidden group"
                  >
                    <summary className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-bg/50 transition-colors list-none select-none">
                      {/* Toggle indicator */}
                      <span className="text-text-muted text-xs font-mono w-3 shrink-0 group-open:rotate-90 transition-transform inline-block">▶</span>

                      {/* Date */}
                      <span className="text-text-muted text-xs whitespace-nowrap shrink-0">
                        {formatDt(row.created_at)}
                      </span>

                      {/* Session ID */}
                      <span className="text-text-muted font-mono text-[10px] shrink-0">
                        {row.session_id.slice(0, 8)}…
                      </span>

                      {/* Retained profile */}
                      <span className="font-medium text-text text-xs whitespace-nowrap shrink-0">
                        {retainedProfile ? `${retainedProfile.emoji} ${retainedProfile.name}` : (row.computed_profile ?? '—')}
                      </span>

                      {/* Axes chips */}
                      {sessionAxes ? (
                        <div className="flex gap-1 flex-wrap">
                          {AXES_ORDER.map(ax => {
                            const { color, label } = axisChip(sessionAxes[ax])
                            return (
                              <span key={ax} className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${color}`}>
                                {AXIS_META[ax].emoji}{label}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-text-muted text-xs">(axes non disponibles)</span>
                      )}
                    </summary>

                    {/* Expanded detail */}
                    <div className="border-t border-border px-4 py-4 bg-bg/30">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* Réponses */}
                        <div>
                          <h3 className="font-semibold text-text text-xs uppercase tracking-wide mb-2 text-text-muted">
                            Réponses ({answers.length})
                          </h3>
                          {answers.length === 0 ? (
                            <p className="text-text-muted text-xs">Non disponibles.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-1">
                              {answers
                                .slice()
                                .sort((a, b) => a.q - b.q)
                                .map(ans => {
                                  const q = QUESTIONS.find(x => x.id === ans.q)
                                  const meta = q ? AXIS_META[q.axis] : null
                                  const chosenLabel = q ? (ans.choice === 'A' ? q.optionA.label : q.optionB.label) : '?'
                                  const chosenValue = q ? (ans.choice === 'A' ? q.optionA.value : q.optionB.value) : 0
                                  return (
                                    <div key={ans.q} className="flex items-start gap-1.5 bg-surface rounded-lg px-2.5 py-1.5">
                                      <span className="text-text-muted font-mono text-[10px] shrink-0 mt-0.5">Q{ans.q}</span>
                                      <span className="text-[10px] shrink-0">{meta?.emoji}</span>
                                      <span className="text-text text-[10px] leading-snug flex-1 min-w-0 truncate" title={chosenLabel}>
                                        {chosenLabel}
                                      </span>
                                      <span className={`text-[10px] font-bold font-mono shrink-0 ${chosenValue === 1 ? 'text-success' : 'text-error'}`}>
                                        {chosenValue === 1 ? '+1' : '-1'}
                                      </span>
                                    </div>
                                  )
                                })}
                            </div>
                          )}
                        </div>

                        {/* Scores par profil */}
                        <div>
                          <h3 className="font-semibold text-text text-xs uppercase tracking-wide mb-2 text-text-muted">
                            Scores profils ({profileScores.length})
                          </h3>
                          {profileScores.length === 0 ? (
                            <p className="text-text-muted text-xs">Axes non disponibles — impossible de calculer.</p>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {profileScores.map(({ profile, score }, rank) => {
                                const isRetained = profile.id === row.computed_profile
                                return (
                                  <div
                                    key={profile.id}
                                    className={[
                                      'flex items-center gap-2 px-2.5 py-1.5 rounded-lg',
                                      isRetained ? 'bg-primary/10 border border-primary/25' : 'bg-surface',
                                    ].join(' ')}
                                  >
                                    <span className="text-text-muted font-mono text-[10px] w-4 shrink-0 text-right">
                                      {rank + 1}
                                    </span>
                                    <span className="text-[11px] shrink-0">{profile.emoji}</span>
                                    <span className={`text-[11px] flex-1 min-w-0 truncate font-medium ${isRetained ? 'text-primary' : 'text-text'}`}>
                                      {profile.name}
                                      {isRetained && <span className="ml-1 text-[9px] font-bold">✓ RETENU</span>}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${score >= 80 ? 'bg-success' : score >= 60 ? 'bg-primary' : 'bg-text-muted/40'}`}
                                          style={{ width: `${score}%` }}
                                        />
                                      </div>
                                      <span className={`font-mono text-[10px] font-bold w-8 text-right ${score >= 80 ? 'text-success' : score >= 60 ? 'text-primary' : 'text-text-muted'}`}>
                                        {score}%
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </details>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Section 4 : Stats ────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="font-display font-semibold text-lg text-text mb-4">
            📊 Stats — {totalSessions} session{totalSessions > 1 ? 's' : ''} analysées
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Distribution des profils */}
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm text-text mb-4">
                Distribution des profils retournés
              </h3>
              {profileDistSorted.length === 0 ? (
                <p className="text-text-muted text-sm">Aucune donnée.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {profileDistSorted.map(([profileId, count]) => {
                    const profile = PROFILES.find(p => p.id === profileId)
                    const pct = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
                    return (
                      <div key={profileId} className="flex items-center gap-2">
                        <span className="text-sm w-4 shrink-0">{profile?.emoji ?? '?'}</span>
                        <span className="text-text text-xs flex-1 min-w-0 truncate">
                          {profile?.name ?? profileId}
                        </span>
                        <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-text-muted font-mono text-[11px] w-10 text-right shrink-0">
                          {count}×
                        </span>
                        <span className="text-text-muted font-mono text-[11px] w-8 text-right shrink-0">
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Distribution par axe */}
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm text-text mb-4">
                Distribution par axe (sessions avec axes 6D)
              </h3>
              <div className="flex flex-col gap-3">
                {AXES_ORDER.map(ax => {
                  const { pos, zero, neg } = axisDist[ax]
                  const total = pos + zero + neg
                  const pctPos  = total > 0 ? Math.round((pos  / total) * 100) : 0
                  const pctZero = total > 0 ? Math.round((zero / total) * 100) : 0
                  const pctNeg  = total > 0 ? Math.round((neg  / total) * 100) : 0
                  return (
                    <div key={ax}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-text">
                          {AXIS_META[ax].emoji} {AXIS_META[ax].short}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">
                          {total} sessions
                        </span>
                      </div>
                      {/* Stacked bar */}
                      <div className="flex h-4 rounded-full overflow-hidden gap-px">
                        <div
                          className="bg-error/70 flex items-center justify-center transition-all"
                          style={{ width: `${pctNeg}%` }}
                          title={`-1 : ${neg} (${pctNeg}%)`}
                        >
                          {pctNeg >= 12 && (
                            <span className="text-white text-[9px] font-bold">{pctNeg}%</span>
                          )}
                        </div>
                        <div
                          className="bg-border/80 flex items-center justify-center transition-all"
                          style={{ width: `${pctZero}%` }}
                          title={`0 : ${zero} (${pctZero}%)`}
                        >
                          {pctZero >= 12 && (
                            <span className="text-text-muted text-[9px] font-bold">{pctZero}%</span>
                          )}
                        </div>
                        <div
                          className="bg-success/70 flex items-center justify-center transition-all"
                          style={{ width: `${pctPos}%` }}
                          title={`+1 : ${pos} (${pctPos}%)`}
                        >
                          {pctPos >= 12 && (
                            <span className="text-white text-[9px] font-bold">{pctPos}%</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted mt-0.5 font-mono">
                        <span className="text-error">-1 : {neg}</span>
                        <span>0 : {zero}</span>
                        <span className="text-success">+1 : {pos}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-[10px] text-text-muted">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-error/70 inline-block" /> -1 pôle négatif</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-border/80 inline-block" /> 0 neutre</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-success/70 inline-block" /> +1 pôle positif</span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}
