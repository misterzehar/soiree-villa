import Link from 'next/link'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getActorProfiles } from '@/lib/actors'
import { getCity } from '@/lib/city'
import { NavClient } from './nav-client'
import { CitySelector } from './city-selector'
import type { NavLink } from './nav-client'

const ADMIN_EMAIL = 'misterzehar@gmail.com'

type Props = {
  variant?: 'light' | 'dark'
  center?: React.ReactNode
}

const PUBLIC_NAV: NavLink[] = [
  { href: '/experiences', label: 'Soirées' },
  { href: '/lieux',       label: 'Lieux'   },
  { href: '/fournisseurs', label: 'Fournisseurs' },
]

export async function SiteHeader({ variant = 'light', center }: Props) {
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  const cookieStore = await cookies()
  const city = getCity(cookieStore)

  const isAdmin = user?.email === ADMIN_EMAIL

  const espaces: NavLink[] = []
  const inscriptions: NavLink[] = []

  if (user) {
    const profiles = await getActorProfiles(user.id)

    if (profiles.hasOrga)   espaces.push({ href: '/organisateur', label: 'Espace orga' })
    else                    inscriptions.push({ href: '/organisateur/inscription', label: 'Devenir organisateur' })

    if (profiles.hasLieu)   espaces.push({ href: '/lieu', label: 'Espace lieu' })
    else                    inscriptions.push({ href: '/lieu/inscription', label: 'Inscrire mon lieu' })

    if (profiles.hasFourn)  espaces.push({ href: '/fournisseur', label: 'Espace fournisseur' })
    else                    inscriptions.push({ href: '/fournisseur/inscription', label: 'Inscrire mon fournisseur' })
  }

  const isDark = variant === 'dark'
  const logoClass = isDark ? 'text-white' : 'text-text'
  const publicLinkClass = isDark
    ? 'text-white/65 hover:text-white text-sm transition-colors'
    : 'text-text-muted hover:text-text text-sm transition-colors'

  return (
    <div className="flex items-center gap-4">
      {/* Sélecteur ville */}
      <CitySelector initialCity={city} variant={variant} />

      {/* Logo */}
      <Link href="/" className={`font-display font-bold text-lg tracking-tight shrink-0 ${logoClass}`}>
        Soirée Villa
      </Link>

      {/* Liens publics — desktop seulement */}
      <nav className="hidden md:flex items-center gap-5 flex-1">
        {PUBLIC_NAV.map(link => (
          <Link key={link.href} href={link.href} className={publicLinkClass}>
            {link.label}
          </Link>
        ))}
      </nav>

      {center && <div className="flex-1 md:flex-none">{center}</div>}

      {/* Client : drawer mobile + nav auth desktop */}
      <NavClient
        variant={variant}
        isConnected={!!user}
        isAdmin={isAdmin}
        espaces={espaces}
        inscriptions={inscriptions}
        publicLinks={PUBLIC_NAV}
      />
    </div>
  )
}
