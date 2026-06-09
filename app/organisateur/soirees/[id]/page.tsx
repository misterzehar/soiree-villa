import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, TrendingUp, CheckCircle, Circle, Pencil } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/pricing'
import { depublishExperience, deleteExperience } from './actions'
import { DeleteConfirmButton } from '../../_components/delete-confirm-button'
import type { Experience, PricingTier } from '@/types/experience'

type RegRow = {
  id: string
  participant_first_name: string
  participant_last_name: string
  participant_email: string
  tier_id: string
  amount_paid_cents: number | null
  payment_status: string
  checked_in: boolean
  checked_in_at: string | null
  created_at: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TIER_LABELS: Record<string, string> = {
  early: 'Early bird', standard: 'Standard', last: 'Last chance',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:     { label: 'En attente de validation', color: 'bg-warning/15 text-warning' },
  published: { label: 'Publiée',                  color: 'bg-success/15 text-success' },
  sold_out:  { label: 'Complet',                  color: 'bg-primary/10 text-primary' },
  past:      { label: 'Passée',                   color: 'bg-border text-text-muted'  },
}

export default async function ManageSoireePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string }>
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const justUpdated = sp.updated === '1'

  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur')

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id, display_name, commission_rate')
    .eq('user_id', user.id)
    .single()

  if (!organizer) redirect('/organisateur/inscription')

  const { data: expData } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', id)
    .eq('organizer_id', organizer.id)
    .single()

  if (!expData) notFound()

  const experience = expData as Experience

  const { data: regData } = await supabase
    .from('registrations')
    .select(
      'id, participant_first_name, participant_last_name, participant_email, tier_id, amount_paid_cents, payment_status, checked_in, checked_in_at, created_at',
    )
    .eq('experience_id', id)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: true })

  const registrations = (regData ?? []) as RegRow[]

  const totalBrut = registrations.reduce((s, r) => s + (r.amount_paid_cents ?? 0), 0)
  const commission = Math.round(totalBrut * Number(organizer.commission_rate))
  const totalNet = totalBrut - commission
  const checkedInCount = registrations.filter(r => r.checked_in).length
  const canDelete = registrations.length === 0

  // Server action inline pour check-in
  async function handleCheckIn(formData: FormData) {
    'use server'
    const regId = formData.get('regId')?.toString()
    const currentCheckedIn = formData.get('checkedIn') === 'true'
    if (!regId) return
    const supa = createServerSupabase()
    await supa
      .from('registrations')
      .update({
        checked_in: !currentCheckedIn,
        checked_in_at: !currentCheckedIn ? new Date().toISOString() : null,
      })
      .eq('id', regId)
    revalidatePath(`/organisateur/soirees/${id}`)
  }

  // Server action inline pour dépublication
  async function handleDepublish() {
    'use server'
    await depublishExperience(id)
  }

  // Server action inline pour suppression
  async function handleDelete() {
    'use server'
    await deleteExperience(id)
  }

  const statusMeta = STATUS_LABELS[experience.status] ?? STATUS_LABELS.draft

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">

        <Link
          href="/organisateur"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        {/* Bannière succès après save */}
        {justUpdated && (
          <div className="mb-4 bg-success/10 border border-success/25 rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success shrink-0" />
            <p className="text-success text-sm font-medium">Soirée mise à jour avec succès.</p>
          </div>
        )}

        {/* Header soirée */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="font-display font-bold text-lg text-text leading-snug flex-1">
              {experience.title}
            </h1>
            <Link
              href={`/organisateur/soirees/${id}/edit`}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>
          <p className="text-text-muted text-sm capitalize mb-1">{formatDate(experience.date)}</p>
          <p className="text-text-muted text-xs">{experience.venue_name}</p>

          {experience.status === 'draft' && (
            <p className="mt-3 text-warning text-xs bg-warning/5 border border-warning/20 rounded-xl px-3 py-2 leading-relaxed">
              ⏳ En attente de validation — tu seras notifié par email dès publication.
            </p>
          )}

          {/* Actions dépublier / supprimer */}
          <div className="mt-4 pt-4 border-t border-border flex gap-2 flex-wrap">
            {experience.status === 'published' && (
              <form action={handleDepublish}>
                <button
                  type="submit"
                  className="text-xs px-3 py-1.5 border border-warning/40 text-warning rounded-lg hover:bg-warning/5 transition-colors"
                >
                  Dépublier
                </button>
              </form>
            )}
            {canDelete && experience.status !== 'past' && (
              <DeleteConfirmButton action={handleDelete} />
            )}
            {!canDelete && (
              <p className="text-text-muted text-xs self-center">
                Suppression impossible — des inscriptions payées existent.
              </p>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-surface rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-text-muted mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">Inscrits payés</span>
            </div>
            <p className="font-display font-bold text-2xl text-text">
              {registrations.length}
              <span className="text-base text-text-muted font-normal">/{experience.capacity_max}</span>
            </p>
            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${experience.capacity_max > 0
                    ? Math.min(100, (registrations.length / experience.capacity_max) * 100)
                    : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="bg-surface rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-text-muted mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs">Revenu net (85%)</span>
            </div>
            <p className="font-display font-bold text-2xl text-success">
              {Math.round(totalNet / 100)}&nbsp;<span className="text-base">€</span>
            </p>
            <p className="text-text-muted text-xs mt-1">
              Brut : {Math.round(totalBrut / 100)}&nbsp;€
            </p>
          </div>
        </div>

        {/* Check-in progress */}
        {registrations.length > 0 && (
          <div className="bg-surface rounded-2xl px-4 py-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm text-text font-medium">Check-in</span>
            </div>
            <span className="text-sm text-text-muted">
              {checkedInCount}&nbsp;/&nbsp;{registrations.length}
            </span>
          </div>
        )}

        {/* Liste des inscrits */}
        <section>
          <h2 className="font-display font-semibold text-base text-text mb-3">
            Participants ({registrations.length})
          </h2>

          {registrations.length === 0 ? (
            <div className="bg-surface rounded-2xl p-6 text-center">
              <p className="text-text-muted text-sm">Aucune inscription payée pour le moment.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {registrations.map((reg, i) => (
                <div
                  key={reg.id}
                  className={`bg-surface rounded-2xl px-4 py-3 flex items-center gap-3 transition-opacity ${reg.checked_in ? 'opacity-60' : ''}`}
                >
                  <span className="text-text-muted text-xs w-5 shrink-0 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text text-sm">
                      {reg.participant_first_name} {reg.participant_last_name}
                      {reg.checked_in && (
                        <span className="ml-2 text-xs text-success font-normal">✓ présent</span>
                      )}
                    </p>
                    <p className="text-text-muted text-xs truncate">{reg.participant_email}</p>
                    <span className="text-xs text-text-muted">
                      {TIER_LABELS[reg.tier_id] ?? reg.tier_id}
                      {reg.amount_paid_cents != null && ` · ${formatPrice(reg.amount_paid_cents)}`}
                    </span>
                  </div>
                  <form action={handleCheckIn}>
                    <input type="hidden" name="regId" value={reg.id} />
                    <input type="hidden" name="checkedIn" value={String(reg.checked_in)} />
                    <button
                      type="submit"
                      title={reg.checked_in ? 'Annuler le check-in' : 'Marquer comme présent'}
                      className="p-2 rounded-xl hover:bg-bg transition-colors"
                    >
                      {reg.checked_in
                        ? <CheckCircle className="w-5 h-5 text-success" />
                        : <Circle className="w-5 h-5 text-border hover:text-text-muted" />}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
