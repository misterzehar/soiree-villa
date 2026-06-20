import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase'
import { checkAdminAccess } from './_lib/auth'
import { publishExperience, setObsessionOfWeek, clearObsessionOfWeek } from './actions'
import { saveAdminNotes } from './notes/actions'

export const dynamic = 'force-dynamic'

type RegistrationRow = {
  id: string
  participant_first_name: string
  participant_last_name: string
  participant_email: string
  participant_profile_id: string
  tier_id: string
  payment_status: string
  amount_paid_cents: number | null
  platform_fee_cents: number | null
  stripe_session_id: string | null
  created_at: string
  experiences: { title: string; date: string } | { title: string; date: string }[] | null
}

function firstExp<T>(e: T | T[] | null | undefined): T | null {
  if (!e) return null
  return Array.isArray(e) ? (e[0] ?? null) : e
}

type DraftExp = {
  id: string
  title: string
  date: string
  venue_name: string
  organizer_name: string
  capacity_max: number
  created_at: string
}

type UpcomingExp = {
  id: string
  title: string
  date: string
  venue_name: string
  organizer_name: string
  capacity_max: number
  capacity_current: number
}

type PaidReg = {
  amount_paid_cents: number | null
  platform_fee_cents: number | null
  experiences: { title: string; organizer_name: string } | { title: string; organizer_name: string }[] | null
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function fmtDT(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function euros(cents: number) {
  return `${Math.round(cents / 100).toLocaleString('fr-FR')} €`
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>
}) {
  const { token, status } = await searchParams

  const isAdmin = await checkAdminAccess(token)
  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted text-sm">403 — Accès refusé.</p>
      </main>
    )
  }

  const supabase = createServerSupabase()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const currentStatus = status === 'all' ? null : 'paid'

  const [
    { count: unreadContactsCount },
    { count: openBriefsCount },
    { count: sentQuotesCount },
    { data: upcomingData },
    { data: draftExpsData },
    { count: pendingReviewsCount },
    { count: pendingLieuxCount },
    { count: pendingFournsCount },
    { data: allPaidRegsRaw },
    { data: regs30dRaw },
    { count: onboardingCount },
    { data: publishedExpsRaw },
    { data: registrationsRaw },
    { data: notesRow },
    { data: npsScoresRaw },
    { data: publishedExpsForObsession },
    { data: npsDetailRaw },
    { data: waitlistCityRaw },
  ] = await Promise.all([
    supabase.from('contact_requests').select('id', { count: 'exact', head: true }).eq('is_read', false).eq('is_archived', false),
    supabase.from('briefs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('experiences')
      .select('id, title, date, venue_name, organizer_name, capacity_max, capacity_current')
      .eq('status', 'published')
      .gte('date', now.toISOString())
      .order('date', { ascending: true })
      .limit(10),
    supabase.from('experiences')
      .select('id, title, date, venue_name, organizer_name, capacity_max, created_at')
      .eq('status', 'draft')
      .order('created_at', { ascending: false }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('lieux').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('fournisseurs').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('registrations')
      .select('amount_paid_cents, platform_fee_cents, experiences(title, organizer_name)')
      .eq('payment_status', 'paid'),
    supabase.from('registrations')
      .select('amount_paid_cents')
      .eq('payment_status', 'paid')
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('onboarding_responses').select('id', { count: 'exact', head: true }),
    supabase.from('experiences').select('capacity_max, capacity_current').eq('status', 'published'),
    (() => {
      const base = supabase
        .from('registrations')
        .select('*, experiences(title, date)')
        .order('created_at', { ascending: false })
      return currentStatus === 'paid' ? base.eq('payment_status', 'paid') : base
    })(),
    supabase.from('admin_notes')
      .select('content')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle(),
    supabase.from('nps_responses').select('score'),
    supabase.from('experiences')
      .select('id, title, is_obsession_of_week')
      .eq('status', 'published')
      .order('date', { ascending: true }),
    supabase
      .from('nps_responses')
      .select('id, score, comment, created_at, registrations(experience_id, experiences(title))')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('waitlist_city').select('city'),
  ])

  // --- Derived stats ---
  const allPaidRegs   = (allPaidRegsRaw ?? []) as PaidReg[]
  const regs30d       = (regs30dRaw   ?? []) as { amount_paid_cents: number | null }[]
  const publishedExps = (publishedExpsRaw ?? []) as { capacity_max: number; capacity_current: number }[]
  const upcomingExps  = (upcomingData  ?? []) as UpcomingExp[]
  const draftExps     = (draftExpsData ?? []) as DraftExp[]
  const registrations = (registrationsRaw ?? []) as RegistrationRow[]

  const caBrutTotal = allPaidRegs.reduce((s, r) => s + (r.amount_paid_cents ?? 0), 0)
  const caBrut30d   = regs30d.reduce((s, r) => s + (r.amount_paid_cents ?? 0), 0)
  const commTotal   = allPaidRegs.reduce((s, r) => s + (r.platform_fee_cents ?? 0), 0)
  const paidCount   = allPaidRegs.length

  const tauxRemplissage = publishedExps.length > 0
    ? Math.round(publishedExps.reduce((s, e) => s + e.capacity_current / Math.max(e.capacity_max, 1), 0) / publishedExps.length * 100)
    : 0

  const tauxConversion = (onboardingCount ?? 0) > 0
    ? Math.round(paidCount / (onboardingCount!) * 100)
    : 0

  const expRevMap: Record<string, { title: string; rev: number }> = {}
  const orgRevMap: Record<string, number> = {}
  for (const r of allPaidRegs) {
    const exp   = firstExp(r.experiences)
    const title = exp?.title ?? 'Sans titre'
    const org   = exp?.organizer_name ?? 'Inconnu'
    if (!expRevMap[title]) expRevMap[title] = { title, rev: 0 }
    expRevMap[title].rev += r.amount_paid_cents ?? 0
    orgRevMap[org] = (orgRevMap[org] ?? 0) + (r.amount_paid_cents ?? 0)
  }
  const top5Exps = Object.values(expRevMap).sort((a, b) => b.rev - a.rev).slice(0, 5)
  const top5Orgs = Object.entries(orgRevMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const notesContent = (notesRow as { content: string } | null)?.content ?? ''

  // NPS score computation
  const npsScores = (npsScoresRaw ?? []) as { score: number }[]
  const npsTotal  = npsScores.length
  const npsScore  = npsTotal === 0 ? null : (() => {
    const promoters  = npsScores.filter(r => r.score >= 9).length
    const detractors = npsScores.filter(r => r.score <= 6).length
    return Math.round((promoters - detractors) / npsTotal * 100)
  })()

  type ObsessionExp = { id: string; title: string; is_obsession_of_week: boolean }
  const obsessionExps   = (publishedExpsForObsession ?? []) as ObsessionExp[]
  const currentObsession = obsessionExps.find(e => e.is_obsession_of_week)

  type NpsDetailRow = {
    id: string
    score: number
    comment: string | null
    created_at: string
    registrations: {
      experience_id: string
      experiences: { title: string } | { title: string }[] | null
    } | {
      experience_id: string
      experiences: { title: string } | { title: string }[] | null
    }[] | null
  }
  const npsDetail = (npsDetailRaw ?? []) as NpsDetailRow[]

  // Waitlist city counts
  const waitlistCities = (waitlistCityRaw ?? []) as { city: string }[]
  const waitlistByCity = waitlistCities.reduce<Record<string, number>>((acc, r) => {
    acc[r.city] = (acc[r.city] ?? 0) + 1
    return acc
  }, {})
  const waitlistTotal = waitlistCities.length

  function npsCategory(score: number): { label: string; color: string } {
    if (score >= 9) return { label: 'Promoteur',  color: 'text-success' }
    if (score >= 7) return { label: 'Passif',     color: 'text-warning' }
    return              { label: 'Détracteur', color: 'text-error'   }
  }

  function relativeDate(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60)   return 'à l\'instant'
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
    return `il y a ${Math.floor(diff / 86400)} jour${Math.floor(diff / 86400) > 1 ? 's' : ''}`
  }

  const q    = token ? `?token=${token}` : ''
  const qAnd = token ? `?token=${token}&` : '?'

  const TABS = [
    { id: 'o', letter: 'O', label: 'Opportunité' },
    { id: 'p', letter: 'P', label: 'Pratique' },
    { id: 'r', letter: 'R', label: 'Réfléchir' },
    { id: 'a', letter: 'A', label: 'Agir' },
    { id: 'h', letter: 'H', label: 'Hauteur' },
  ]

  return (
    <main className="min-h-screen bg-bg">

      {/* ── Sticky OPRAH nav ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-bg/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-1">
          {TABS.map(tab => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface text-sm font-medium transition-colors"
            >
              <span className="font-display font-bold text-primary">{tab.letter}</span>
              <span className="hidden sm:inline text-xs">— {tab.label}</span>
            </a>
          ))}
          <div className="flex-1" />
          <span className="text-xs text-text-muted hidden md:block">
            {paidCount} inscrits · {euros(caBrutTotal)} CA
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-6 pb-24">

        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-text">Soirée Villa — Back-office</h1>
          <p className="text-text-muted text-sm mt-1">OPRAH · Centre de pilotage · Nice MVP</p>
        </div>

        {/* ── O — Opportunité ─────────────────────────────────────────── */}
        <section id="o" className="scroll-mt-20 mb-14">
          <h2 className="font-display font-bold text-base text-text mb-0.5">O — Opportunité</h2>
          <p className="text-text-muted text-xs mb-5">Pipeline commercial actif</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href={`/admin/demandes${q}`}
              className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">📨</span>
                <span className={`font-bold text-xl ${(unreadContactsCount ?? 0) > 0 ? 'text-error' : 'text-text-muted'}`}>
                  {unreadContactsCount ?? 0}
                </span>
              </div>
              <p className="font-semibold text-sm text-text group-hover:text-primary transition-colors">Demandes non lues</p>
              <p className="text-text-muted text-xs mt-0.5">Contacts prestataires</p>
            </Link>

            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">📋</span>
                <span className={`font-bold text-xl ${(openBriefsCount ?? 0) > 0 ? 'text-warning' : 'text-text-muted'}`}>
                  {openBriefsCount ?? 0}
                </span>
              </div>
              <p className="font-semibold text-sm text-text">Briefs ouverts</p>
              <p className="text-text-muted text-xs mt-0.5">Appels d&apos;offres actifs</p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">📄</span>
                <span className={`font-bold text-xl ${(sentQuotesCount ?? 0) > 0 ? 'text-primary' : 'text-text-muted'}`}>
                  {sentQuotesCount ?? 0}
                </span>
              </div>
              <p className="font-semibold text-sm text-text">Devis envoyés</p>
              <p className="text-text-muted text-xs mt-0.5">En attente de réponse</p>
            </div>
          </div>

          {/* Waitlist multi-ville */}
          {waitlistTotal > 0 && (
            <div className="mt-6 bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-semibold text-sm text-text">
                  Liste d&apos;attente — expansion multi-ville
                </p>
                <span className="text-xs font-bold text-primary">{waitlistTotal} inscrits</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(waitlistByCity).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
                  <span key={city} className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                    {city}
                    <span className="font-bold">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── P — Pratique ────────────────────────────────────────────── */}
        <section id="p" className="scroll-mt-20 mb-14">
          <h2 className="font-display font-bold text-base text-text mb-0.5">P — Pratique</h2>
          <p className="text-text-muted text-xs mb-5">Prochaines soirées · tâches du jour</p>

          {/* Tâches */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Exps à publier',  count: draftExps.length,        href: '#p' },
              { label: 'Avis à modérer', count: pendingReviewsCount ?? 0, href: `/admin/avis${q}` },
              { label: 'Lieux',          count: pendingLieuxCount ?? 0,   href: `/admin/lieux${q}` },
              { label: 'Fournisseurs',   count: pendingFournsCount ?? 0,  href: `/admin/fournisseurs${q}` },
            ].map(t => (
              <Link
                key={t.label}
                href={t.href}
                className="bg-surface border border-border rounded-xl px-4 py-3 hover:border-primary/30 transition-colors text-center group"
              >
                <p className={`text-2xl font-bold mb-0.5 ${t.count > 0 ? 'text-error' : 'text-text-muted'}`}>
                  {t.count}
                </p>
                <p className="text-xs text-text-muted group-hover:text-text transition-colors">{t.label}</p>
              </Link>
            ))}
          </div>

          {/* Upcoming */}
          <h3 className="font-display font-semibold text-sm text-text mb-3">
            Soirées à venir ({upcomingExps.length})
          </h3>
          {upcomingExps.length === 0 ? (
            <p className="text-text-muted text-sm bg-surface rounded-xl px-4 py-3 mb-6">
              Aucune soirée programmée.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface mb-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted bg-bg text-left">
                    <th className="py-2.5 px-4 font-medium">Soirée</th>
                    <th className="py-2.5 px-4 font-medium">Date</th>
                    <th className="py-2.5 px-4 font-medium">Lieu</th>
                    <th className="py-2.5 px-4 font-medium">Organisateur</th>
                    <th className="py-2.5 px-4 font-medium">Remplissage</th>
                    <th className="py-2.5 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingExps.map(e => {
                    const fill = Math.round(e.capacity_current / Math.max(e.capacity_max, 1) * 100)
                    return (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-bg/50 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-text max-w-[160px] truncate">{e.title}</td>
                        <td className="py-2.5 px-4 text-text-muted text-xs whitespace-nowrap">{fmt(e.date)}</td>
                        <td className="py-2.5 px-4 text-text-muted text-xs max-w-[120px] truncate">{e.venue_name}</td>
                        <td className="py-2.5 px-4 text-text-muted text-xs max-w-[120px] truncate">{e.organizer_name}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${fill >= 80 ? 'bg-success' : fill >= 40 ? 'bg-warning' : 'bg-primary'}`}
                                style={{ width: `${fill}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-muted tabular-nums">
                              {e.capacity_current}/{e.capacity_max}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <Link
                            href={`/experiences/${e.id}`}
                            className="text-xs text-primary hover:underline whitespace-nowrap"
                          >
                            Voir →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Draft experiences to publish */}
          {draftExps.length > 0 && (
            <>
              <h3 className="font-display font-semibold text-sm text-text mb-3">
                ⏳ En attente de validation ({draftExps.length})
              </h3>
              <div className="flex flex-col gap-3">
                {draftExps.map(exp => (
                  <div
                    key={exp.id}
                    className="bg-surface border border-warning/30 rounded-xl p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-text">{exp.title}</p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {exp.organizer_name} · {exp.venue_name} · {fmtDT(exp.date)}
                      </p>
                      <p className="text-text-muted text-xs">
                        {exp.capacity_max} places · Soumis le {fmtDT(exp.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/experiences/${exp.id}`}
                        className="text-xs px-3 py-1.5 border border-border rounded-lg text-text-muted hover:text-text transition-colors"
                      >
                        Voir
                      </Link>
                      <form action={publishExperience}>
                        <input type="hidden" name="adminToken" value={token ?? ''} />
                        <input type="hidden" name="experienceId" value={exp.id} />
                        <button
                          type="submit"
                          className="text-xs px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 font-semibold transition-colors"
                        >
                          ✓ Publier
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── R — Réfléchir ────────────────────────────────────────────── */}
        <section id="r" className="scroll-mt-20 mb-14">
          <h2 className="font-display font-bold text-base text-text mb-0.5">R — Réfléchir</h2>
          <p className="text-text-muted text-xs mb-5">Indicateurs business</p>

          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'CA brut total',     value: euros(caBrutTotal),    sub: `${paidCount} inscriptions payées` },
              { label: 'CA brut (30j)',      value: euros(caBrut30d),      sub: 'Derniers 30 jours' },
              { label: 'Commission (15%)',   value: euros(commTotal),      sub: 'Reversé organisateurs = CA − comm.' },
              { label: 'Taux remplissage',   value: `${tauxRemplissage}%`, sub: `${publishedExps.length} soirées publiées` },
            ].map(card => (
              <div key={card.label} className="bg-surface border border-border rounded-2xl p-5">
                <p className="text-text-muted text-xs mb-1">{card.label}</p>
                <p className="font-display font-bold text-2xl text-text">{card.value}</p>
                <p className="text-text-muted text-xs mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-2xl p-5">
              <p className="text-text-muted text-xs mb-1">Conversion onboarding → inscrit</p>
              <p className="font-display font-bold text-2xl text-text">{tauxConversion}%</p>
              <p className="text-text-muted text-xs mt-1">
                {onboardingCount ?? 0} onboardings · {paidCount} inscrits payants
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5">
              <p className="text-text-muted text-xs mb-1">NPS (% promoteurs − détracteurs)</p>
              <p className={`font-display font-bold text-2xl ${npsScore === null ? 'text-text-muted' : npsScore >= 50 ? 'text-success' : npsScore >= 0 ? 'text-warning' : 'text-error'}`}>
                {npsScore === null ? '—' : `${npsScore > 0 ? '+' : ''}${npsScore}`}
              </p>
              <p className="text-text-muted text-xs mt-1">{npsTotal} réponse{npsTotal !== 1 ? 's' : ''} · ≥9 promoteur · ≤6 détracteur</p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5">
              <p className="text-text-muted text-xs mb-1">Coût d&apos;acquisition (CAC)</p>
              <p className="font-display font-bold text-2xl text-text-muted">—</p>
              <p className="text-text-muted text-xs mt-1">Saisie manuelle à venir</p>
            </div>
          </div>

          {/* Derniers retours NPS */}
          <div className="mb-8">
            <h3 className="font-display font-semibold text-sm text-text mb-3">
              Derniers retours NPS ({npsTotal})
            </h3>
            {npsDetail.length === 0 ? (
              <p className="text-text-muted text-sm bg-surface border border-border rounded-xl px-4 py-3">
                Aucun retour pour le moment.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {npsDetail.map(row => {
                  const cat = npsCategory(row.score)
                  const reg = Array.isArray(row.registrations) ? (row.registrations[0] ?? null) : row.registrations
                  const exp = reg ? (Array.isArray(reg.experiences) ? (reg.experiences[0] ?? null) : reg.experiences) : null
                  const expTitle = exp?.title ?? '—'
                  return (
                    <div
                      key={row.id}
                      className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                    >
                      {/* Score badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-display font-bold text-2xl tabular-nums ${cat.color}`}>
                          {row.score}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          row.score >= 9
                            ? 'border-success/30 bg-success/10 text-success'
                            : row.score >= 7
                            ? 'border-warning/30 bg-warning/10 text-warning'
                            : 'border-error/30 bg-error/10 text-error'
                        }`}>
                          {cat.label}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-text text-sm font-medium truncate">{expTitle}</p>
                        {row.comment ? (
                          <p className="text-text-muted text-xs italic mt-0.5 line-clamp-2">{row.comment}</p>
                        ) : (
                          <p className="text-text-muted text-xs mt-0.5">Pas de commentaire</p>
                        )}
                      </div>

                      {/* Date */}
                      <p className="text-text-muted text-xs shrink-0 whitespace-nowrap">
                        {relativeDate(row.created_at)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top 5 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-display font-semibold text-sm text-text mb-3">Top 5 soirées / CA</h3>
              {top5Exps.length === 0 ? (
                <p className="text-text-muted text-sm">Aucune inscription payée.</p>
              ) : (
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                  {top5Exps.map((e, i) => (
                    <div
                      key={e.title}
                      className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted w-4 shrink-0">{i + 1}.</span>
                        <span className="text-sm text-text truncate max-w-[180px]">{e.title}</span>
                      </div>
                      <span className="text-sm font-semibold text-text tabular-nums shrink-0">{euros(e.rev)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-display font-semibold text-sm text-text mb-3">Top 5 organisateurs / CA</h3>
              {top5Orgs.length === 0 ? (
                <p className="text-text-muted text-sm">Aucune inscription payée.</p>
              ) : (
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                  {top5Orgs.map(([org, rev], i) => (
                    <div
                      key={org}
                      className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted w-4 shrink-0">{i + 1}.</span>
                        <span className="text-sm text-text truncate max-w-[180px]">{org}</span>
                      </div>
                      <span className="text-sm font-semibold text-text tabular-nums shrink-0">{euros(rev)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Registrations table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm text-text">Inscriptions</h3>
              <div className="flex gap-2">
                <Link
                  href={`/admin${qAnd}status=paid#r`}
                  className={[
                    'text-xs px-3 py-1.5 rounded-full transition-colors',
                    currentStatus === 'paid'
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border text-text-muted hover:text-text',
                  ].join(' ')}
                >
                  Payées
                </Link>
                <Link
                  href={`/admin${qAnd}status=all#r`}
                  className={[
                    'text-xs px-3 py-1.5 rounded-full transition-colors',
                    currentStatus === null
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border text-text-muted hover:text-text',
                  ].join(' ')}
                >
                  Toutes
                </Link>
              </div>
            </div>

            {registrations.length === 0 ? (
              <p className="text-text-muted text-sm">Aucune inscription.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-surface">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-text-muted bg-bg text-left">
                      <th className="py-2.5 px-4 font-medium">Expérience</th>
                      <th className="py-2.5 px-4 font-medium">Date exp.</th>
                      <th className="py-2.5 px-4 font-medium">Participant</th>
                      <th className="py-2.5 px-4 font-medium">Email</th>
                      <th className="py-2.5 px-4 font-medium">Profil</th>
                      <th className="py-2.5 px-4 font-medium">Palier</th>
                      <th className="py-2.5 px-4 font-medium">Statut</th>
                      <th className="py-2.5 px-4 font-medium">Montant</th>
                      <th className="py-2.5 px-4 font-medium">Commission</th>
                      <th className="py-2.5 px-4 font-medium">Stripe</th>
                      <th className="py-2.5 px-4 font-medium">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(r => {
                      const exp = firstExp(r.experiences)
                      return (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-bg/50 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-text max-w-[160px] truncate">
                          {exp?.title ?? '—'}
                        </td>
                        <td className="py-2.5 px-4 text-text-muted text-xs whitespace-nowrap">
                          {exp?.date ? fmtDT(exp.date) : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-text whitespace-nowrap">
                          {r.participant_first_name} {r.participant_last_name}
                        </td>
                        <td className="py-2.5 px-4 text-text-muted text-xs">{r.participant_email}</td>
                        <td className="py-2.5 px-4 text-text-muted text-xs">{r.participant_profile_id}</td>
                        <td className="py-2.5 px-4 text-text-muted text-xs">{r.tier_id}</td>
                        <td className="py-2.5 px-4">
                          <span className={[
                            'text-xs font-semibold px-2 py-0.5 rounded-full',
                            r.payment_status === 'paid'     ? 'bg-success/15 text-success' :
                            r.payment_status === 'failed'   ? 'bg-error/10 text-error'     :
                            r.payment_status === 'refunded' ? 'bg-warning/15 text-warning'  :
                                                              'bg-border text-text-muted',
                          ].join(' ')}>
                            {r.payment_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-text whitespace-nowrap">
                          {r.amount_paid_cents != null ? `${Math.round(r.amount_paid_cents / 100)} €` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-text-muted text-xs whitespace-nowrap">
                          {r.platform_fee_cents != null ? `${Math.round(r.platform_fee_cents / 100)} €` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-text-muted text-xs font-mono">
                          {r.stripe_session_id ? `${r.stripe_session_id.slice(0, 18)}…` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-text-muted text-xs whitespace-nowrap">
                          {fmtDT(r.created_at)}
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── A — Agir ──────────────────────────────────────────────────── */}
        <section id="a" className="scroll-mt-20 mb-14">
          <h2 className="font-display font-bold text-base text-text mb-0.5">A — Agir</h2>
          <p className="text-text-muted text-xs mb-5">Modération · exports · outils</p>

          {/* Obsession de la semaine */}
          <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
            <h3 className="font-display font-semibold text-sm text-text mb-1">⭐ Obsession de la semaine</h3>
            <p className="text-text-muted text-xs mb-4">
              {currentObsession
                ? `Actuellement : ${currentObsession.title}`
                : 'Aucune expérience mise en avant.'}
            </p>
            <form action={setObsessionOfWeek} className="flex gap-2 items-end">
              <input type="hidden" name="adminToken" value={token ?? ''} />
              <div className="flex-1">
                <select
                  name="experienceId"
                  required
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text bg-bg focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Choisir une expérience…</option>
                  {obsessionExps.map(e => (
                    <option key={e.id} value={e.id} selected={e.is_obsession_of_week}>
                      {e.title}{e.is_obsession_of_week ? ' ⭐' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shrink-0"
              >
                Définir
              </button>
              {currentObsession && (
                <form action={clearObsessionOfWeek}>
                  <input type="hidden" name="adminToken" value={token ?? ''} />
                  <button
                    type="submit"
                    className="px-4 py-2.5 border border-border text-text-muted text-sm rounded-xl hover:text-text transition-colors shrink-0"
                  >
                    Effacer
                  </button>
                </form>
              )}
            </form>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                href:   `/admin/lieux${q}`,
                emoji:  '🏠',
                title:  'Lieux',
                sub:    `${pendingLieuxCount ?? 0} en attente`,
                urgent: (pendingLieuxCount ?? 0) > 0,
              },
              {
                href:   `/admin/fournisseurs${q}`,
                emoji:  '🎵',
                title:  'Fournisseurs',
                sub:    `${pendingFournsCount ?? 0} en attente`,
                urgent: (pendingFournsCount ?? 0) > 0,
              },
              {
                href:   `/admin/avis${q}`,
                emoji:  '💬',
                title:  'Avis',
                sub:    `${pendingReviewsCount ?? 0} à modérer`,
                urgent: (pendingReviewsCount ?? 0) > 0,
              },
              {
                href:   `/admin/demandes${q}`,
                emoji:  '📨',
                title:  'Demandes contact',
                sub:    `${unreadContactsCount ?? 0} non lues`,
                urgent: (unreadContactsCount ?? 0) > 0,
              },
              {
                href:   `/admin/matching${q}`,
                emoji:  '📊',
                title:  'Matching debug',
                sub:    '6 axes · 20 profils',
                urgent: false,
              },
              {
                href:   `/admin/export-comptable${q}`,
                emoji:  '📥',
                title:  'Export comptable',
                sub:    'CSV inscriptions payées',
                urgent: false,
              },
              {
                href:   '/experiences',
                emoji:  '✨',
                title:  'Expériences',
                sub:    'Liste publique',
                urgent: false,
              },
              {
                href:   '/marketplace',
                emoji:  '🛒',
                title:  'Marketplace',
                sub:    'Lieux & prestataires',
                urgent: false,
              },
            ].map(card => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-surface border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/25 transition-all group flex flex-col gap-2"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{card.emoji}</span>
                  {card.urgent && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-error/10 text-error">!</span>
                  )}
                </div>
                <p className="font-display font-semibold text-text text-sm group-hover:text-primary transition-colors">
                  {card.title}
                </p>
                <p className="text-text-muted text-xs">{card.sub}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── H — Hauteur ──────────────────────────────────────────────── */}
        <section id="h" className="scroll-mt-20 mb-14">
          <h2 className="font-display font-bold text-base text-text mb-0.5">H — Hauteur</h2>
          <p className="text-text-muted text-xs mb-5">Vision globale · notes · backlog</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* KPI MVP */}
            <div className="bg-surface border border-border rounded-2xl p-5">
              <h3 className="font-display font-semibold text-sm text-text mb-5">KPIs MVP — Nice</h3>
              <div className="flex flex-col gap-5">
                {[
                  { label: '50 onboardings complétés',  current: onboardingCount ?? 0, target: 50 },
                  { label: '20 inscriptions payées',    current: paidCount,            target: 20 },
                  { label: '1 soirée IRL organisée',    current: Math.min(publishedExps.length, 1), target: 1 },
                ].map(kpi => {
                  const pct  = Math.min(Math.round((kpi.current / kpi.target) * 100), 100)
                  const done = pct >= 100
                  return (
                    <div key={kpi.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-text-muted">{kpi.label}</span>
                        <span className={done ? 'text-success font-semibold' : 'text-text-muted'}>
                          {done ? '✓ Atteint' : `${kpi.current}/${kpi.target}`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${done ? 'bg-success' : 'bg-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-muted">NPS ≥ 50</span>
                    <span className={npsScore === null ? 'text-text-muted' : npsScore >= 50 ? 'text-success font-semibold' : 'text-text-muted'}>
                      {npsScore === null ? `— (${npsTotal} réponse${npsTotal !== 1 ? 's' : ''})` : `${npsScore > 0 ? '+' : ''}${npsScore}/100`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    {npsScore !== null && (
                      <div
                        className={`h-full rounded-full transition-all ${npsScore >= 50 ? 'bg-success' : 'bg-warning'}`}
                        style={{ width: `${Math.max(0, Math.min(100, npsScore + 100) / 2)}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* V1.5 checklist */}
            <div className="bg-surface border border-border rounded-2xl p-5">
              <h3 className="font-display font-semibold text-sm text-text mb-4">Backlog V1.5</h3>
              <ul className="flex flex-col gap-3">
                {[
                  'App mobile native (iOS + Android)',
                  'IA générative pour recommandations',
                  'Multi-langue (FR / EN)',
                  'TOTP / 2FA pour accès admin',
                  'Tier List participante (gamification avancée)',
                  'Communications de masse (newsletters)',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-text-muted">
                    <span className="w-4 h-4 rounded border border-border flex-shrink-0 mt-px" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin notes */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5">
              <h3 className="font-display font-semibold text-sm text-text mb-3">Notes internes</h3>
              <form action={saveAdminNotes} className="flex flex-col gap-3">
                <input type="hidden" name="adminToken" value={token ?? ''} />
                <textarea
                  name="content"
                  rows={6}
                  defaultValue={notesContent}
                  placeholder="Objectifs de la semaine, points de vigilance, idées, décisions en attente…"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary resize-y font-mono"
                />
                <button
                  type="submit"
                  className="self-end px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Sauvegarder
                </button>
              </form>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}
