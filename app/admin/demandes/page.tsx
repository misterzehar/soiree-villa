import Link from 'next/link'
import { Mail, MailOpen } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase'
import { checkAdminAccess } from '../_lib/auth'
import type { ContactRequest } from '@/types/contact-request'

export const dynamic = 'force-dynamic'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

type RequestWithTarget = ContactRequest & {
  targetName: string
}

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

  const supabase = createServerSupabase()

  const [{ data: requestsData }, { data: lieuxData }, { data: fournsData }] = await Promise.all([
    supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('lieux').select('id, name'),
    supabase.from('fournisseurs').select('id, name'),
  ])

  const lieuxMap = Object.fromEntries((lieuxData ?? []).map(l => [l.id, l.name]))
  const fournsMap = Object.fromEntries((fournsData ?? []).map(f => [f.id, f.name]))

  const requests: RequestWithTarget[] = ((requestsData ?? []) as ContactRequest[]).map(r => ({
    ...r,
    targetName: r.target_type === 'lieu' ? (lieuxMap[r.target_id] ?? r.target_id) : (fournsMap[r.target_id] ?? r.target_id),
  }))

  const unread = requests.filter(r => !r.is_read)
  const archived = requests.filter(r => r.is_archived)
  const active = requests.filter(r => !r.is_archived)

  const backHref = token ? `/admin?token=${token}` : '/admin'

  return (
    <main className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto">

        <Link href={backHref} className="text-text-muted text-xs hover:text-text transition-colors">
          ← Admin
        </Link>

        <div className="flex items-baseline justify-between mt-2 mb-6">
          <h1 className="font-display font-bold text-2xl text-text">📨 Demandes de contact</h1>
          <p className="text-text-muted text-sm">
            {unread.length} non lues · {archived.length} archivées
          </p>
        </div>

        {/* Toutes les demandes actives */}
        <section className="mb-8">
          <h2 className="font-display font-semibold text-base text-text mb-3">
            Demandes actives ({active.length})
          </h2>

          {active.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-6 text-center">
              <p className="text-text-muted text-sm">Aucune demande de contact.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted bg-bg">
                    <th className="py-2.5 px-4 font-medium"></th>
                    <th className="py-2.5 px-4 font-medium">Expéditeur</th>
                    <th className="py-2.5 px-4 font-medium">Cible</th>
                    <th className="py-2.5 px-4 font-medium">Message</th>
                    <th className="py-2.5 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {active.map(r => (
                    <tr key={r.id} className={`border-b border-border/50 transition-colors ${r.is_read ? 'hover:bg-bg/50' : 'bg-primary/5 hover:bg-primary/10'}`}>
                      <td className="py-2 px-4">
                        {r.is_read
                          ? <MailOpen className="w-3.5 h-3.5 text-text-muted" />
                          : <Mail className="w-3.5 h-3.5 text-primary" />
                        }
                      </td>
                      <td className="py-2 px-4">
                        <p className="text-text text-xs font-medium">{r.sender_name}</p>
                        <a href={`mailto:${r.sender_email}`} className="text-primary text-xs hover:underline">{r.sender_email}</a>
                      </td>
                      <td className="py-2 px-4">
                        <p className="text-text text-xs font-medium">{r.targetName}</p>
                        <p className="text-text-muted text-xs capitalize">{r.target_type}</p>
                      </td>
                      <td className="py-2 px-4 text-text-muted text-xs max-w-xs">
                        <p className="line-clamp-2">{r.message}</p>
                      </td>
                      <td className="py-2 px-4 text-text-muted text-xs whitespace-nowrap">{formatDate(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
