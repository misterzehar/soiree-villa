import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import { getCity } from '@/lib/city'
import { fetchTierData, TIER_CONFIG, type TierLabel } from '@/lib/tier'
import { SiteHeader } from '@/components/site-header'
import { TierListNav } from '@/components/tier-maker/tier-list-nav'
import type { Experience } from '@/types/experience'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tier List — Soirée Villa',
}


const TIER_ORDER: TierLabel[] = ['S', 'A', 'B', 'C', 'D']

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function TierListPage() {
  const cookieStore = await cookies()
  const city = getCity(cookieStore)
  const supabase = createServerSupabase()

  // Fetch past published experiences for the city
  const now = new Date().toISOString()
  const { data: expsRaw } = await supabase
    .from('experiences')
    .select('*')
    .eq('status', 'published')
    .eq('city', city)
    .lt('date', now)
    .order('date', { ascending: false })

  const experiences = (expsRaw ?? []) as Experience[]
  const expIds = experiences.map(e => e.id)

  const { tiers, rows } = await fetchTierData(supabase, expIds)

  // Group experiences by tier
  const byTier: Record<TierLabel, Experience[]> = { S: [], A: [], B: [], C: [], D: [] }
  for (const exp of experiences) {
    const tier = tiers[exp.id] ?? 'C'
    byTier[tier].push(exp)
  }

  // Score lookup for display
  const scoreMap: Record<string, number> = {}
  for (const r of rows) scoreMap[r.id] = Math.round(r.score * 100)

  const hasTiers = experiences.length > 0

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-24">

        <div className="mb-6">
          <SiteHeader />
        </div>

        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-text mb-1">
            Tier List — {city}
          </h1>
          <p className="text-text-muted text-sm">
            Classement des soirées passées · Score : NPS × 0.5 + remplissage × 0.3 + avis × 0.2
          </p>
        </div>

        <TierListNav active="algo" />

        {/* Légende des tiers */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TIER_ORDER.map(t => {
            const cfg = TIER_CONFIG[t]
            return (
              <span
                key={t}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color}`}
              >
                <span className="font-display font-bold">{t}</span>
                <span className="font-normal opacity-70">
                  {t === 'S' ? 'Top 10%' : t === 'A' ? '10–30%' : t === 'B' ? '30–60%' : t === 'C' ? '60–90%' : '90–100%'}
                </span>
              </span>
            )
          })}
        </div>

        {!hasTiers ? (
          <div className="bg-surface rounded-2xl p-8 text-center border border-border">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-display font-semibold text-text mb-1">Pas encore de soirées passées à {city}</p>
            <p className="text-text-muted text-sm">Le classement apparaîtra après les premières soirées.</p>
            <Link
              href="/experiences"
              className="inline-block mt-5 text-sm text-primary font-semibold hover:underline"
            >
              Voir les soirées à venir →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {TIER_ORDER.filter(t => byTier[t].length > 0).map(tier => {
              const cfg = TIER_CONFIG[tier]
              return (
                <section key={tier}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`font-display font-bold text-4xl ${cfg.color}`}>{tier}</span>
                    <div>
                      <p className="font-display font-semibold text-text">{cfg.label}</p>
                      <p className="text-text-muted text-xs">{byTier[tier].length} expérience{byTier[tier].length > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {byTier[tier].map(exp => {
                      const score = scoreMap[exp.id] ?? 0
                      return (
                        <Link
                          key={exp.id}
                          href={`/experiences/${exp.id}`}
                          className="bg-surface rounded-2xl overflow-hidden border border-border hover:shadow-md hover:border-primary/20 transition-all group"
                        >
                          {exp.cover_image_url ? (
                            <div className="aspect-video w-full overflow-hidden">
                              <img
                                src={exp.cover_image_url}
                                alt={exp.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className={`aspect-video w-full flex items-center justify-center text-5xl ${cfg.bg} border-b border-border`}>
                              <span className={`font-display font-bold opacity-20 ${cfg.color}`}>{tier}</span>
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <p className="font-display font-semibold text-text text-sm leading-snug group-hover:text-primary transition-colors flex-1">
                                {exp.title}
                              </p>
                              <span className={`shrink-0 font-display font-bold text-sm px-2 py-0.5 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                                {tier}
                              </span>
                            </div>
                            <p className="text-text-muted text-xs">{formatDate(exp.date)} · {exp.venue_name}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${cfg.color.replace('text-', 'bg-')}`} style={{ width: `${score}%` }} />
                              </div>
                              <span className="text-text-muted text-xs tabular-nums">{score}/100</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
