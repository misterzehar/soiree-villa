import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, Users, TrendingUp, FileText } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/pricing'
import type { PricingTier } from '@/types/experience'

type OrgExp = {
  id: string
  title: string
  date: string
  status: string
  capacity_max: number
  capacity_current: number
  pricing_tiers: PricingTier[]
}

type RegStat = {
  experience_id: string
  amount_paid_cents: number | null
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:     { label: 'En attente',  color: 'bg-warning/15 text-warning' },
  published: { label: 'Publiée',     color: 'bg-success/15 text-success' },
  sold_out:  { label: 'Complet',     color: 'bg-primary/10 text-primary' },
  past:      { label: 'Passée',      color: 'bg-border text-text-muted' },
}

export default async function OrganisateurPage() {
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur')

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name, bio, organizer_type, city, is_approved, commission_rate')
    .eq('user_id', user.id)
    .single()

  if (!organizer) redirect('/organisateur/inscription')

  const { data: exps } = await supabase
    .from('experiences')
    .select('id, title, date, status, capacity_max, capacity_current, pricing_tiers')
    .eq('organizer_id', organizer.id)
    .order('date', { ascending: false })
    .limit(30)

  const experiences = (exps ?? []) as OrgExp[]
  const expIds = experiences.map(e => e.id)

  const { data: regData } = expIds.length > 0
    ? await supabase
        .from('registrations')
        .select('experience_id, amount_paid_cents')
        .in('experience_id', expIds)
        .eq('payment_status', 'paid')
    : { data: [] }

  const regs = (regData ?? []) as RegStat[]

  // KPIs
  const totalRevenueBrut = regs.reduce((s, r) => s + (r.amount_paid_cents ?? 0), 0)
  const totalCommission = Math.round(totalRevenueBrut * Number(organizer.commission_rate))
  const totalNet = totalRevenueBrut - totalCommission
  const totalInscrits = regs.length

  // Revenus par expérience
  const revenueByExp: Record<string, number> = {}
  for (const r of regs) {
    revenueByExp[r.experience_id] = (revenueByExp[r.experience_id] ?? 0) + (r.amount_paid_cents ?? 0)
  }

  const upcoming = experiences.filter(e => e.status === 'published' || e.status === 'draft')
  const past = experiences.filter(e => e.status === 'past' || e.status === 'sold_out')

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-xs text-text-muted hover:text-text transition-colors">
              ← Soirée Villa
            </Link>
            <h1 className="font-display font-bold text-xl text-text mt-1">
              {organizer.display_name}
            </h1>
            <p className="text-text-muted text-xs capitalize">
              {organizer.organizer_type} · {organizer.city}
              {!organizer.is_approved && (
                <span className="ml-2 text-warning">· En attente de validation</span>
              )}
            </p>
          </div>
          <Link
            href="/organisateur/nouvelle-soiree"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle
          </Link>
        </div>

        {/* KPIs */}
        {totalInscrits > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-surface rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-text-muted mb-1">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs">Inscrits</span>
              </div>
              <p className="font-display font-bold text-xl text-text">{totalInscrits}</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-text-muted mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs">CA brut</span>
              </div>
              <p className="font-display font-bold text-xl text-text">
                {Math.round(totalRevenueBrut / 100)}&nbsp;€
              </p>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-text-muted mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs">Net</span>
              </div>
              <p className="font-display font-bold text-xl text-success">
                {Math.round(totalNet / 100)}&nbsp;€
              </p>
            </div>
          </div>
        )}

        {/* Soirées à venir / draft */}
        <section className="mb-6">
          <h2 className="font-display font-semibold text-base text-text mb-3">
            Soirées à venir
          </h2>
          {upcoming.length === 0 ? (
            <div className="bg-surface rounded-2xl p-6 text-center">
              <p className="text-text-muted text-sm mb-4">
                Tu n&apos;as pas encore de soirée publiée.
              </p>
              <Link
                href="/organisateur/nouvelle-soiree"
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Créer ma première soirée
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map(exp => {
                const status = STATUS_LABELS[exp.status] ?? STATUS_LABELS.draft
                const revenue = revenueByExp[exp.id] ?? 0
                const tauxRemplissage = exp.capacity_max > 0
                  ? Math.round((exp.capacity_current / exp.capacity_max) * 100)
                  : 0
                return (
                  <Link
                    key={exp.id}
                    href={`/organisateur/soirees/${exp.id}`}
                    className="bg-surface rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                        {exp.status === 'draft' && (
                          <span className="text-xs text-text-muted">Validation admin requise</span>
                        )}
                      </div>
                      <p className="font-display font-semibold text-text text-sm leading-snug truncate">
                        {exp.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-text-muted text-xs">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDateShort(exp.date)}
                        </span>
                        <span className="text-text-muted text-xs">
                          <Users className="w-3 h-3 inline mr-1" />
                          {exp.capacity_current}/{exp.capacity_max}
                          {' '}({tauxRemplissage}%)
                        </span>
                      </div>
                    </div>
                    {revenue > 0 && (
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-text text-sm">
                          {Math.round(revenue / 100)}&nbsp;€
                        </p>
                        <p className="text-text-muted text-xs">brut</p>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Soirées passées */}
        {past.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-base text-text mb-3">
              Soirées passées
            </h2>
            <div className="flex flex-col gap-2">
              {past.map(exp => {
                const revenue = revenueByExp[exp.id] ?? 0
                return (
                  <Link
                    key={exp.id}
                    href={`/organisateur/soirees/${exp.id}`}
                    className="bg-surface rounded-2xl p-4 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-text text-sm">{exp.title}</p>
                      <p className="text-text-muted text-xs">{formatDateShort(exp.date)}</p>
                    </div>
                    {revenue > 0 && (
                      <span className="text-text-muted text-sm">
                        {Math.round(revenue / 100)}&nbsp;€
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Appels d'offres */}
        <section className="mb-6">
          <Link
            href="/organisateur/briefs"
            className="flex items-center justify-between bg-surface rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-text-muted" />
              <div>
                <p className="font-display font-semibold text-text text-sm">Appels d&apos;offres</p>
                <p className="text-text-muted text-xs">Recherchez un lieu ou un prestataire</p>
              </div>
            </div>
            <span className="text-primary text-sm font-semibold shrink-0">Voir →</span>
          </Link>
        </section>

        {/* Commission info */}
        <p className="text-text-muted text-xs text-center mt-8 leading-relaxed">
          Commission Soirée Villa : {Math.round(Number(organizer.commission_rate) * 100)}%.
          Reversement mensuel par virement. Questions : contact@soireevilla.fr
        </p>

      </div>
    </main>
  )
}
