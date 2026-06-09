import Link from 'next/link'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'

type Props = {
  /** 'light' (fond blanc/gris) ou 'dark' (fond sombre — hero landing) */
  variant?: 'light' | 'dark'
  /** Contenu optionnel à insérer entre le logo et les liens auth (ex : badge profil) */
  center?: React.ReactNode
}

type ActorProfile = 'organisateur' | 'lieu' | 'fournisseur' | null

async function getActorProfile(userId: string): Promise<ActorProfile> {
  const supabase = createServerSupabase()
  const [{ data: orga }, { data: lieu }, { data: fourn }] = await Promise.all([
    supabase.from('organizers').select('id').eq('user_id', userId).single(),
    supabase.from('lieux').select('id').eq('claimed_by_user_id', userId).single(),
    supabase.from('fournisseurs').select('id').eq('claimed_by_user_id', userId).single(),
  ])
  if (orga) return 'organisateur'
  if (lieu) return 'lieu'
  if (fourn) return 'fournisseur'
  return null
}

const ACTOR_LINKS: Record<Exclude<ActorProfile, null>, { href: string; label: string }> = {
  organisateur: { href: '/organisateur',  label: 'Espace orga'        },
  lieu:         { href: '/lieu',          label: 'Espace lieu'         },
  fournisseur:  { href: '/fournisseur',   label: 'Espace fournisseur'  },
}

export async function SiteHeader({ variant = 'light', center }: Props) {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()

  const actor = user ? await getActorProfile(user.id) : null

  const isDark = variant === 'dark'
  const logoClass = isDark ? 'text-white' : 'text-text'
  const linkClass = isDark
    ? 'text-white/70 hover:text-white text-sm transition-colors'
    : 'text-text-muted hover:text-text text-sm transition-colors'

  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/" className={`font-display font-bold text-lg tracking-tight ${logoClass}`}>
        Soirée Villa
      </Link>

      {center && <div className="flex-1">{center}</div>}

      <nav className="flex items-center gap-2 shrink-0">
        {user ? (
          <>
            <Link href="/compte" className={linkClass}>
              Mon compte
            </Link>
            {actor ? (
              <Link
                href={ACTOR_LINKS[actor].href}
                className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  isDark
                    ? 'bg-white/15 text-white hover:bg-white/25'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {ACTOR_LINKS[actor].label}
              </Link>
            ) : (
              <Link
                href="/organisateur/inscription"
                className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  isDark
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-primary/30 text-primary hover:bg-primary/5'
                }`}
              >
                Devenir orga
              </Link>
            )}
          </>
        ) : (
          <Link
            href="/connexion"
            className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              isDark
                ? 'border-white/30 text-white hover:bg-white/10'
                : 'border-border text-text-muted hover:text-text hover:border-text-muted'
            }`}
          >
            Connexion
          </Link>
        )}
      </nav>
    </div>
  )
}
