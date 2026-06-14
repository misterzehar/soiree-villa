'use client'

import { useState, useTransition } from 'react'
import { createQuote } from '../../actions'
import { FOURNISSEUR_CATEGORY_LABELS, type FournisseurCategory } from '@/types/fournisseur'
import type { QuoteLineInput } from '@/types/quote'

type LieuOption       = { id: string; name: string; city: string }
type FournisseurOption = { id: string; name: string; city: string; category: FournisseurCategory }

type FoLine = {
  tempId:        string
  category:      FournisseurCategory | ''
  fournisseurId: string
  label:         string
  amountInput:   string
}

const CATEGORIES = Object.keys(FOURNISSEUR_CATEGORY_LABELS) as FournisseurCategory[]

const inputCls = 'w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm placeholder:text-text-muted outline-none focus:border-primary/40 transition-colors'
const inputSmCls = 'w-full bg-bg border border-border rounded-xl px-3 py-2 text-text text-sm outline-none focus:border-primary/40 transition-colors'

export function QuoteComposer({ lieux, fournisseurs }: {
  lieux:         LieuOption[]
  fournisseurs:  FournisseurOption[]
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Lieu line
  const [lieuId,      setLieuId]      = useState('')
  const [lieuLabel,   setLieuLabel]   = useState('')
  const [lieuAmount,  setLieuAmount]  = useState('')

  // Fournisseur lines
  const [foLines, setFoLines] = useState<FoLine[]>([])

  function addFoLine() {
    setFoLines(prev => [...prev, {
      tempId: `fo-${Date.now()}`, category: '', fournisseurId: '', label: '', amountInput: '',
    }])
  }

  function removeFoLine(tempId: string) {
    setFoLines(prev => prev.filter(l => l.tempId !== tempId))
  }

  function updateFoLine(tempId: string, field: keyof FoLine, value: string) {
    setFoLines(prev => prev.map(l => {
      if (l.tempId !== tempId) return l
      if (field === 'category') {
        return { ...l, category: value as FournisseurCategory, fournisseurId: '', label: '' }
      }
      if (field === 'fournisseurId' && value) {
        const found = fournisseurs.find(f => f.id === value)
        return { ...l, fournisseurId: value, label: found?.name ?? '' }
      }
      return { ...l, [field]: value }
    }))
  }

  // Real-time total
  const total = (lieuId && lieuAmount ? (parseFloat(lieuAmount) || 0) : 0)
    + foLines.reduce((s, l) => s + (parseFloat(l.amountInput) || 0), 0)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const lines: QuoteLineInput[] = []

    if (lieuId && lieuAmount && parseFloat(lieuAmount) > 0) {
      const found = lieux.find(l => l.id === lieuId)
      lines.push({
        type:          'lieu',
        lieuId,
        fournisseurId: null,
        label:         lieuLabel || found?.name || 'Lieu',
        amountCents:   Math.round(parseFloat(lieuAmount) * 100),
      })
    }

    for (const fl of foLines) {
      const amt = parseFloat(fl.amountInput) || 0
      if (fl.fournisseurId && amt > 0) {
        lines.push({
          type:          'fournisseur',
          lieuId:        null,
          fournisseurId: fl.fournisseurId,
          label:         fl.label || 'Prestataire',
          amountCents:   Math.round(amt * 100),
        })
      }
    }

    const fd = new FormData(e.currentTarget)
    fd.set('lines', JSON.stringify(lines))

    startTransition(async () => {
      const result = await createQuote(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Client */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <h2 className="font-display font-semibold text-base text-text mb-4">Client</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Nom du client *</label>
            <input name="client_name" required type="text" placeholder="Marie Dupont" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email du client *</label>
            <input name="client_email" required type="email" placeholder="marie@exemple.fr" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Soirée */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <h2 className="font-display font-semibold text-base text-text mb-4">Soirée</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Date de l&apos;événement *</label>
            <input name="event_date" required type="date" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Description <span className="text-text-muted font-normal">(optionnel)</span></label>
            <textarea name="description" rows={3} placeholder="Thème, ambiance, demandes spécifiques…" className={`${inputCls} resize-none`} />
          </div>
        </div>
      </div>

      {/* Lieu */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <h2 className="font-display font-semibold text-base text-text mb-4">Lieu</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Choisir un lieu</label>
            <select
              value={lieuId}
              onChange={(e) => {
                const id = e.target.value
                setLieuId(id)
                setLieuLabel(lieux.find(l => l.id === id)?.name ?? '')
              }}
              className={inputCls}
            >
              <option value="">— Aucun lieu —</option>
              {lieux.map(l => (
                <option key={l.id} value={l.id}>{l.name} · {l.city}</option>
              ))}
            </select>
            {lieux.length === 0 && (
              <p className="text-text-muted text-xs mt-1.5">Aucun lieu approuvé disponible.</p>
            )}
          </div>

          {lieuId && (
            <>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Libellé sur le devis</label>
                <input
                  type="text"
                  value={lieuLabel}
                  onChange={(e) => setLieuLabel(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Montant (€) *</label>
                <input
                  type="number"
                  value={lieuAmount}
                  onChange={(e) => setLieuAmount(e.target.value)}
                  min="1" step="10" placeholder="0"
                  className={inputCls}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Prestataires */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-base text-text">Prestataires</h2>
          <button
            type="button"
            onClick={addFoLine}
            className="text-xs text-primary font-semibold px-3 py-1.5 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
          >
            + Ajouter
          </button>
        </div>

        {foLines.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-3">Aucun prestataire ajouté.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {foLines.map(fl => {
              const filtered = fl.category
                ? fournisseurs.filter(f => f.category === fl.category)
                : []

              return (
                <div key={fl.tempId} className="border border-border rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text">Prestataire</span>
                    <button
                      type="button"
                      onClick={() => removeFoLine(fl.tempId)}
                      className="text-xs text-error hover:text-error/70 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Catégorie *</label>
                    <select
                      value={fl.category}
                      onChange={(e) => updateFoLine(fl.tempId, 'category', e.target.value)}
                      required
                      className={inputSmCls}
                    >
                      <option value="">— Catégorie —</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{FOURNISSEUR_CATEGORY_LABELS[c]}</option>
                      ))}
                    </select>
                  </div>

                  {fl.category && (
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">Prestataire *</label>
                      <select
                        value={fl.fournisseurId}
                        onChange={(e) => updateFoLine(fl.tempId, 'fournisseurId', e.target.value)}
                        required
                        className={inputSmCls}
                      >
                        <option value="">— Sélectionner —</option>
                        {filtered.map(f => (
                          <option key={f.id} value={f.id}>{f.name} · {f.city}</option>
                        ))}
                      </select>
                      {filtered.length === 0 && (
                        <p className="text-text-muted text-xs mt-1">Aucun prestataire approuvé dans cette catégorie.</p>
                      )}
                    </div>
                  )}

                  {fl.fournisseurId && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">Libellé sur le devis</label>
                        <input
                          type="text"
                          value={fl.label}
                          onChange={(e) => updateFoLine(fl.tempId, 'label', e.target.value)}
                          className={inputSmCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">Montant (€) *</label>
                        <input
                          type="number"
                          value={fl.amountInput}
                          onChange={(e) => updateFoLine(fl.tempId, 'amountInput', e.target.value)}
                          required min="1" step="10" placeholder="0"
                          className={inputSmCls}
                        />
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Total */}
      {total > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-xs mb-0.5">Total TTC</p>
              <p className="font-display font-bold text-2xl text-text">{total.toFixed(0)} €</p>
            </div>
            <div className="text-right">
              <p className="text-text-muted text-xs">Commission 15 %</p>
              <p className="text-text-muted text-sm font-semibold">{(total * 0.15).toFixed(0)} €</p>
              <p className="text-success text-xs font-semibold">Net : {(total * 0.85).toFixed(0)} €</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error/5 border border-error/20 rounded-xl p-4">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
      >
        {isPending ? 'Création en cours…' : 'Créer le devis'}
      </button>
    </form>
  )
}
