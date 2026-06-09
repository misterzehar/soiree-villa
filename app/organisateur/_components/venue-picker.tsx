'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import type { Lieu } from '@/types/lieu'

type Props = {
  lieux: Lieu[]
  defaultVenueId?: string | null
  defaultVenueName?: string
}

export function VenuePicker({ lieux, defaultVenueId, defaultVenueName = '' }: Props) {
  const defaultLieu = defaultVenueId ? lieux.find(l => l.id === defaultVenueId) : null

  const [selected, setSelected] = useState<Lieu | null>(defaultLieu ?? null)
  const [search, setSearch] = useState('')
  const [showList, setShowList] = useState(false)
  const [manualName, setManualName] = useState(defaultLieu ? '' : defaultVenueName)
  const [useManual, setUseManual] = useState(!defaultLieu)

  const filtered = search.length >= 1
    ? lieux.filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
    : lieux.slice(0, 8)

  function selectLieu(lieu: Lieu) {
    setSelected(lieu)
    setUseManual(false)
    setSearch('')
    setShowList(false)
  }

  function clearSelection() {
    setSelected(null)
    setUseManual(true)
    setSearch('')
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden field for venue_id */}
      <input type="hidden" name="venueId" value={selected?.id ?? ''} />

      {selected ? (
        // Lieu sélectionné depuis la BDD
        <div className="flex items-center gap-3 bg-bg border border-primary/40 rounded-xl px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-text text-sm font-medium">{selected.name}</p>
            <p className="text-text-muted text-xs">
              {selected.city}{selected.address ? ` · ${selected.address}` : ''}
              {selected.capacity ? ` · ${selected.capacity} pers.` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="text-text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-bg"
            title="Changer de lieu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Recherche ou saisie manuelle
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un lieu référencé…"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowList(true) }}
              onFocus={() => setShowList(true)}
              className="w-full border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors"
            />
          </div>

          {showList && filtered.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden bg-bg shadow-sm">
              {filtered.map(lieu => (
                <button
                  key={lieu.id}
                  type="button"
                  onClick={() => selectLieu(lieu)}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface transition-colors border-b border-border/50 last:border-0"
                >
                  <p className="text-text text-sm font-medium">{lieu.name}</p>
                  <p className="text-text-muted text-xs">{lieu.city}{lieu.capacity ? ` · ${lieu.capacity} pers.` : ''}</p>
                </button>
              ))}
            </div>
          )}

          {/* Fallback : saisie libre du nom */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-muted text-xs">
              Ou saisissez un nom de lieu manuellement
              <span className="ml-1 text-text-muted">(si non référencé)</span>
            </label>
            <input
              type="text"
              name="venueName"
              value={manualName}
              onChange={e => { setManualName(e.target.value); setUseManual(true) }}
              placeholder="Ex : La terrasse du Port"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-text-muted transition-colors"
            />
          </div>
        </div>
      )}

      {/* Quand lieu sélectionné depuis BDD, on passe aussi venueName pour le fallback serveur */}
      {selected && (
        <input type="hidden" name="venueName" value={selected.name} />
      )}
    </div>
  )
}
