import Link from 'next/link'
import { createServerSupabase, createSupabaseServerClient } from '@/lib/supabase'

type Props = {
  /** 'light' (fond blanc/gris) ou 'dark' (fond sombre — hero landing) */
  variant?: 'light' | 'dark'
  /** Contenu optionnel à insérer entre le logo et les liens auth (ex : badge profil) */
  center?: React.ReactNode
}

export async function SiteHeader({ variant = 'light', center }: Props) {
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  let hasOrganizerProfile = false
  if (user) {
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('organizers')
      .select('id')
      .eq('user_id', user.id)
      .single()
    hasOrganizerProfile = !!data
  }

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
            {hasOrganizerProfile ? (
              <Link
                href="/organisateur"
                className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  isDark
                    ? 'bg-white/15 text-white hover:bg-white/25'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                Espace orga
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
