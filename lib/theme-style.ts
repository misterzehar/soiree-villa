/**
 * Theme styles for the 6 official soirée themes.
 * Returns Tailwind class sets — no hex values in components.
 */

export type ThemeSlug =
  | 'mysterieuse-classe'
  | 'sensuelle-elegante'
  | 'performances-invites'
  | 'humaine-genante-drole'
  | 'comme-dans-une-telereality'
  | 'libre-hors-norme'

export type ThemeStyle = {
  label:        string
  emoji:        string
  // Card badge
  badgeBg:      string   // Tailwind bg-* class
  badgeText:    string   // Tailwind text-* class
  // Card accent line / border
  accentBorder: string
  // Card background tint
  cardTint:     string
  // Gradient for fallback cover
  gradient:     string
}

const THEMES: Record<ThemeSlug, ThemeStyle> = {
  'mysterieuse-classe': {
    label:        'Mystérieuse & Classe',
    emoji:        '🌙',
    badgeBg:      'bg-secondary/15',
    badgeText:    'text-secondary',
    accentBorder: 'border-gold/40',
    cardTint:     'bg-secondary/5',
    gradient:     'from-[#1a0533] via-secondary/40 to-gold/20',
  },
  'sensuelle-elegante': {
    label:        'Sensuelle & Élégante',
    emoji:        '🌹',
    badgeBg:      'bg-wine/15',
    badgeText:    'text-wine',
    accentBorder: 'border-wine/30',
    cardTint:     'bg-wine/5',
    gradient:     'from-wine/60 via-[#e8c8c8]/40 to-[#f5e6e6]/20',
  },
  'performances-invites': {
    label:        'Performances & Invités surprises',
    emoji:        '🎭',
    badgeBg:      'bg-burgundy/15',
    badgeText:    'text-burgundy',
    accentBorder: 'border-gold/50',
    cardTint:     'bg-burgundy/5',
    gradient:     'from-[#1a0000] via-burgundy/50 to-gold/30',
  },
  'humaine-genante-drole': {
    label:        'Humaine, Gênante & Drôle',
    emoji:        '😬',
    badgeBg:      'bg-terracotta/15',
    badgeText:    'text-terracotta',
    accentBorder: 'border-terracotta/30',
    cardTint:     'bg-terracotta/5',
    gradient:     'from-terracotta/50 via-accent/20 to-[#f5ede0]/30',
  },
  'comme-dans-une-telereality': {
    label:        'Comme dans une téléréalité',
    emoji:        '📺',
    badgeBg:      'bg-electric/10',
    badgeText:    'text-primary',
    accentBorder: 'border-electric/40',
    cardTint:     'bg-electric/5',
    gradient:     'from-[#0a0020] via-electric/25 to-secondary/30',
  },
  'libre-hors-norme': {
    label:        'Libre & Hors-norme',
    emoji:        '⚡',
    badgeBg:      'bg-acid/15',
    badgeText:    'text-text',
    accentBorder: 'border-acid/50',
    cardTint:     'bg-acid/5',
    gradient:     'from-[#0d0d0d] via-acid/30 to-secondary/20',
  },
}

export function getThemeStyle(theme: string | null | undefined): ThemeStyle | null {
  if (!theme) return null
  return THEMES[theme as ThemeSlug] ?? null
}

export { THEMES }
