import Link from 'next/link'

const TABS = [
  { href: '/tier-list',                              label: 'Algo',        desc: 'Score NPS + remplissage' },
  { href: '/tier-list/mienne',                       label: 'Ma liste',    desc: 'Drag & drop personnel'   },
  { href: '/tier-list/communaute/experiences-all',   label: 'Communauté',  desc: 'Vote collectif'          },
]

export function TierListNav({ active }: { active: 'algo' | 'mienne' | 'communaute' }) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map((tab, i) => {
        const isActive =
          (i === 0 && active === 'algo') ||
          (i === 1 && active === 'mienne') ||
          (i === 2 && active === 'communaute')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-primary text-white border-primary'
                : 'bg-surface border-border text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
            <span className="block text-[10px] font-normal opacity-70 mt-0.5">{tab.desc}</span>
          </Link>
        )
      })}
    </div>
  )
}
