import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'
import { ExperienceForm } from '../../_components/experience-form'
import { updateExperience } from '../actions'
import type { Experience } from '@/types/experience'
import type { ExperienceInitialData } from '../../_components/experience-form'

function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function experienceToInitialData(exp: Experience): ExperienceInitialData {
  const tierMap = Object.fromEntries(exp.pricing_tiers.map(t => [t.id, t]))
  return {
    title:           exp.title,
    description:     exp.description,
    venueName:       exp.venue_name,
    venueAmbiance:   exp.venue_ambiance,
    date:            toDatetimeLocal(exp.date),
    durationMinutes: exp.duration_minutes,
    menuSocial: {
      entree:  { label: exp.menu_social.entree.label,  description: exp.menu_social.entree.description,  durationMinutes: exp.menu_social.entree.duration_minutes  },
      plat:    { label: exp.menu_social.plat.label,    description: exp.menu_social.plat.description,    durationMinutes: exp.menu_social.plat.duration_minutes    },
      dessert: { label: exp.menu_social.dessert.label, description: exp.menu_social.dessert.description, durationMinutes: exp.menu_social.dessert.duration_minutes },
    },
    earlyQty:          tierMap.early?.quantity   ?? 0,
    earlyPriceCents:   tierMap.early?.price_cents ?? 0,
    standardQty:       tierMap.standard?.quantity   ?? 0,
    standardPriceCents: tierMap.standard?.price_cents ?? 0,
    lastQty:           tierMap.last?.quantity   ?? 0,
    lastPriceCents:    tierMap.last?.price_cents ?? 0,
    compatibleProfiles: exp.compatible_profiles,
  }
}

export default async function EditSoireePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) redirect('/connexion?redirect=/organisateur')

  const supabase = createServerSupabase()

  const { data: organizer } = await supabase
    .from('organizers')
    .select('id')
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
  const initialData = experienceToInitialData(experience)

  // Bind l'ID à l'action serveur (pattern Next.js App Router)
  const boundUpdate = updateExperience.bind(null, id)

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4 pt-6 pb-20">

        <Link
          href={`/organisateur/soirees/${id}`}
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la gestion
        </Link>

        <h1 className="font-display font-bold text-2xl text-text mb-1">
          Modifier la soirée
        </h1>
        <p className="text-text-muted text-sm mb-6 leading-relaxed">
          Les modifications sont enregistrées immédiatement.
          {experience.status === 'published' && (
            <span className="block mt-1 text-warning">
              ⚠️ Cette soirée est publiée — les changements de prix ou de capacité sont visibles immédiatement.
            </span>
          )}
        </p>

        <ExperienceForm
          action={boundUpdate}
          initialData={initialData}
          submitLabel="Enregistrer les modifications"
        />

      </div>
    </main>
  )
}
