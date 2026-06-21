'use client'

import { useState, useCallback, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Loader2, Share2, Check } from 'lucide-react'
import { TierColumn } from './tier-column'
import { TierItemOverlay, type TierItemData } from './tier-item'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TierItem } from './tier-item'
import { saveTierList } from '@/app/tier-list/mienne/actions'
import { type TierCategory, type ItemsByTier, moveItem, emptyItemsByTier } from '@/lib/community-tier'
import { type TierLabel } from '@/lib/tier'

const TIERS: TierLabel[] = ['S', 'A', 'B', 'C', 'D']

function tierOfItem(items: ItemsByTier, id: string): TierLabel | null {
  for (const t of TIERS) {
    if (items[t]?.includes(id)) return t
  }
  return null
}

type Props = {
  category: TierCategory
  allItems: TierItemData[]
  initialItemsByTier: ItemsByTier
  publicUrl: string
}

export function TierMakerEditor({ category, allItems, initialItemsByTier, publicUrl }: Props) {
  const [itemsByTier, setItemsByTier] = useState<ItemsByTier>(initialItemsByTier)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const allClassifiedIds = new Set(TIERS.flatMap(t => itemsByTier[t] ?? []))
  const poolItems = allItems.filter(i => !allClassifiedIds.has(i.id))
  const activeItem = allItems.find(i => i.id === activeId) ?? null

  function getItemsForTier(tier: TierLabel): TierItemData[] {
    return (itemsByTier[tier] ?? [])
      .map(id => allItems.find(i => i.id === id))
      .filter((i): i is TierItemData => !!i)
  }

  const persist = useCallback((next: ItemsByTier) => {
    startTransition(async () => {
      await saveTierList(category, next)
    })
  }, [category])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const itemId = active.id as string
    let targetTier: TierLabel | null = null

    // Dropped on a column droppable (col-S, col-A, etc.)
    const overId = over.id as string
    if (overId.startsWith('col-')) {
      targetTier = overId.replace('col-', '') as TierLabel
    } else if (overId === 'pool') {
      targetTier = null
    } else {
      // Dropped on another item — place in same tier as that item
      targetTier = tierOfItem(itemsByTier, overId)
    }

    const currentTier = tierOfItem(itemsByTier, itemId)
    if (currentTier === targetTier) return

    const next = moveItem(itemsByTier, itemId, targetTier)
    setItemsByTier(next)
    persist(next)
  }

  function handleShare() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <p className="text-text-muted text-xs">
          {allItems.length - poolItems.length}/{allItems.length} classés
          {isPending && <span className="ml-2 text-primary">Sauvegarde…</span>}
        </p>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          {copied ? 'Lien copié !' : 'Partager'}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Tier rows */}
        <div className="flex flex-col gap-2 mb-6">
          {TIERS.map(tier => (
            <TierColumn
              key={tier}
              tier={tier}
              items={getItemsForTier(tier)}
            />
          ))}
        </div>

        {/* Pool — unclassified items */}
        <PoolDropZone items={poolItems} />

        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeItem ? <TierItemOverlay item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function PoolDropZone({ items }: { items: TierItemData[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'pool' })
  return (
    <div>
      <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
        Non classés ({items.length})
      </p>
      <div
        ref={setNodeRef}
        className={`rounded-2xl border-2 transition-colors p-2 min-h-[60px] ${
          isOver ? 'border-primary/40 bg-primary/5' : 'border-dashed border-border'
        }`}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {items.map(item => (
              <TierItem key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
        {items.length === 0 && (
          <p className="text-text-muted text-xs text-center py-3 pointer-events-none">
            Tous les éléments sont classés
          </p>
        )}
      </div>
    </div>
  )
}
