'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { joinCityWaitlist } from '@/app/waitlist-city/actions'

export function CityWaitlistForm({ city }: { city: string }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await joinCityWaitlist(fd)
      if (res?.error) setError(res.error)
      else setSuccess(true)
    })
  }

  if (success) {
    return (
      <p className="text-success text-sm font-medium">
        ✓ Inscrit·e ! On te prévient dès que Soirée Villa arrive à {city}.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input type="hidden" name="city" value={city} />
      <input
        type="email"
        name="email"
        required
        placeholder="ton@email.fr"
        className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm text-text bg-bg placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
      />
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors shrink-0"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Me prévenir'}
      </button>
      {error && <p className="text-error text-xs mt-1 sm:col-span-2">{error}</p>}
    </form>
  )
}
