'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TierItem, type TierItemData } from './tier-item'
import { TIER_CONFIG, type TierLabel } from '@/lib/tier'

type Props = {
  tier: TierLabel
  items: TierItemData[]
  isOver?: boolean
}

export function TierColumn({ tier, items }: Props) {
  const cfg = TIER_CONFIG[tier]
  const { setNodeRef, isOver } = useDroppable({ id: `col-${tier}` })

  return (
    <div className="flex gap-2">
      {/* Tier label badge */}
      <div className={`shrink-0 w-10 flex items-start justify-center pt-2`}>
        <span className={`font-display font-bold text-xl ${cfg.color}`}>{tier}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[56px] rounded-xl border-2 transition-colors p-1.5 flex flex-col gap-1.5 ${
          isOver
            ? `border-primary/50 ${cfg.bg}`
            : `border-dashed border-border`
        }`}
      >
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map(item => (
            <TierItem key={item.id} item={item} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <p className="text-text-muted text-[10px] text-center py-2 pointer-events-none">
            Glisse ici
          </p>
        )}
      </div>
    </div>
  )
}
