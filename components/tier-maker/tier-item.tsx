'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

export type TierItemData = {
  id: string
  name: string
  photo: string | null
  subtitle?: string
}

type Props = {
  item: TierItemData
  disabled?: boolean
}

export function TierItem({ item, disabled }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-bg border border-border rounded-xl px-2 py-1.5 select-none ${isDragging ? 'shadow-lg z-50' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing text-text-muted hover:text-text transition-colors shrink-0 p-0.5"
        aria-label="Déplacer"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {item.photo ? (
        <img
          src={item.photo}
          alt={item.name}
          className="w-8 h-8 rounded-lg object-cover shrink-0"
          draggable={false}
        />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-sm">
          {item.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text leading-tight truncate">{item.name}</p>
        {item.subtitle && (
          <p className="text-[10px] text-text-muted truncate">{item.subtitle}</p>
        )}
      </div>
    </div>
  )
}

/** Overlay version (shown while dragging, no ref/transform needed) */
export function TierItemOverlay({ item }: { item: TierItemData }) {
  return (
    <div className="flex items-center gap-2 bg-bg border border-primary shadow-xl rounded-xl px-2 py-1.5 opacity-90 pointer-events-none">
      <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0" />
      {item.photo ? (
        <img src={item.photo} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-sm">
          {item.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text leading-tight truncate">{item.name}</p>
        {item.subtitle && <p className="text-[10px] text-text-muted truncate">{item.subtitle}</p>}
      </div>
    </div>
  )
}
