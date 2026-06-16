import Link from 'next/link'
import { checkAdminAccess } from '../_lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminDemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  const isAdmin = await checkAdminAccess(token)
  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted text-sm">403 — Accès refusé.</p>
      </main>
    )
  }

  const backHref = token ? `/admin?token=${token}` : '/admin'

  return (
    <main className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto">
        <Link href={backHref} className="text-text-muted text-xs hover:text-text transition-colors">
          ← Admin
        </Link>
        <h1 className="font-display font-bold text-2xl text-text mt-2 mb-1">📨 Demandes orphelines</h1>
        <p className="text-text-muted text-sm mb-8">
          Briefs d&apos;appels d&apos;offres sans réponse depuis +7 jours.
        </p>
        <div className="bg-surface rounded-xl border border-border p-10 text-center">
          <p className="text-2xl mb-3">🚧</p>
          <p className="font-semibold text-text text-sm mb-1">Module en construction</p>
          <p className="text-text-muted text-xs">Disponible en Phase 8 — Appels d&apos;offres V2.</p>
        </div>
      </div>
    </main>
  )
}
