'use client'

import { useTransition } from 'react'

export function DeleteConfirmButton({
  action,
}: {
  action: () => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Supprimer définitivement cette soirée ? Cette action est irréversible.')) return
    startTransition(action)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs px-3 py-1.5 border border-error/30 text-error rounded-lg hover:bg-error/5 transition-colors disabled:opacity-50"
    >
      {isPending ? 'Suppression…' : 'Supprimer'}
    </button>
  )
}
