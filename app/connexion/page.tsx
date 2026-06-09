'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, Mail } from 'lucide-react'
import { sendMagicLink } from '@/app/auth/actions'

export default function ConnexionPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/compte'
  const hasError = searchParams.get('error') === 'lien_invalide'

  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState(hasError ? 'Lien expiré ou invalide — demandes-en un nouveau.' : '')
  const [sentEmail, setSentEmail] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const formData = new FormData(e.currentTarget)
    formData.set('redirect', redirect)
    const email = formData.get('email')?.toString() ?? ''

    const result = await sendMagicLink(formData)
    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
    } else {
      setSentEmail(email)
      setStatus('sent')
    }
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        <Link href="/" className="block text-center font-display font-bold text-xl text-text mb-8">
          Soirée Villa
        </Link>

        {status === 'sent' ? (
          <div className="bg-surface rounded-2xl shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-success" />
            </div>
            <h1 className="font-display font-bold text-xl text-text mb-2">
              Vérifie ta boîte mail
            </h1>
            <p className="text-text-muted text-sm leading-relaxed mb-1">
              On a envoyé un lien de connexion à
            </p>
            <p className="font-semibold text-text text-sm mb-4">{sentEmail}</p>
            <p className="text-text-muted text-xs leading-relaxed">
              Clique sur le lien dans l&apos;email pour te connecter.
              Pas de mot de passe — c&apos;est ça la magie.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-5 text-primary text-sm hover:underline"
            >
              Utiliser un autre email
            </button>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl shadow-sm p-8">
            <h1 className="font-display font-bold text-2xl text-text mb-1">
              Connexion
            </h1>
            <p className="text-text-muted text-sm mb-6">
              Pas de mot de passe — on t&apos;envoie un lien magique par email.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-text text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="ton@email.com"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors"
                />
              </div>

              {errorMsg && (
                <p className="text-error text-sm bg-error/5 border border-error/20 rounded-xl px-4 py-3">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-display font-semibold py-3.5 rounded-xl transition-colors"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Recevoir mon lien de connexion
                  </>
                )}
              </button>
            </form>

            <p className="text-text-muted text-xs text-center mt-5 leading-relaxed">
              Première fois ? Un compte est créé automatiquement.
              <br />
              En continuant, tu acceptes la{' '}
              <Link href="/charte" className="text-primary hover:underline">charte Soirée Villa</Link>.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
