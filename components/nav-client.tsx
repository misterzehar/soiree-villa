'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'

export type NavLink = { href: string; label: string }

export type NavClientProps = {
  variant: 'light' | 'dark'
  isConnected: boolean
  isAdmin?: boolean
  espaces: NavLink[]
  inscriptions: NavLink[]
  publicLinks: NavLink[]
}

// ─── Dropdown réutilisable ────────────────────────────────────────────────────

function Dropdown({
  label,
  items,
  buttonClass,
  panelClass,
  itemClass,
}: {
  label: string
  items: NavLink[]
  buttonClass: string
  panelClass: string
  itemClass: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (items.length === 1) {
    return (
      <Link href={items[0].href} className={buttonClass}>
        {items[0].label}
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 ${buttonClass}`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute right-0 top-full mt-2 w-52 rounded-xl shadow-lg border overflow-hidden z-50 ${panelClass}`}>
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors ${itemClass}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function NavClient({ variant, isConnected, isAdmin, espaces, inscriptions, publicLinks }: NavClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isDark = variant === 'dark'

  const textClass = isDark
    ? 'text-white/70 hover:text-white text-sm transition-colors'
    : 'text-text-muted hover:text-text text-sm transition-colors'

  const primaryBtnClass = `text-sm font-semibold px-3 py-1.5 rounded-full transition-colors ${
    isDark ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-primary/10 text-primary hover:bg-primary/20'
  }`

  const outlineBtnClass = `text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
    isDark ? 'border-white/30 text-white hover:bg-white/10' : 'border-primary/30 text-primary hover:bg-primary/5'
  }`

  const dropdownPanel = 'bg-bg border-border'
  const dropdownItem = 'text-text hover:bg-surface'

  // ── Desktop right-side layout ─────────────────────────────────────────────

  function renderDesktopAuth() {
    if (!isConnected) {
      return (
        <Link
          href="/connexion"
          className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            isDark
              ? 'border-white/30 text-white hover:bg-white/10'
              : 'border-border text-text-muted hover:text-text hover:border-text-muted'
          }`}
        >
          Connexion
        </Link>
      )
    }

    return (
      <>
        {isAdmin && (
          <Link
            href="/admin"
            className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
              isDark ? 'bg-warning/20 text-warning hover:bg-warning/30' : 'bg-warning/10 text-warning hover:bg-warning/20'
            }`}
          >
            🔧 Admin
          </Link>
        )}
        <Link href="/compte" className={textClass}>Mon compte</Link>

        {/* Espaces existants */}
        {espaces.length === 1 && (
          <Link href={espaces[0].href} className={primaryBtnClass}>
            {espaces[0].label}
          </Link>
        )}
        {espaces.length > 1 && (
          <Dropdown
            label="Mes espaces"
            items={espaces}
            buttonClass={primaryBtnClass}
            panelClass={dropdownPanel}
            itemClass={dropdownItem}
          />
        )}

        {/* Inscriptions manquantes */}
        {inscriptions.length === 1 && (
          <Link href={inscriptions[0].href} className={outlineBtnClass}>
            {inscriptions[0].label}
          </Link>
        )}
        {inscriptions.length > 1 && (
          <Dropdown
            label={espaces.length === 0 ? 'Devenir partenaire' : 'Devenir partenaire'}
            items={inscriptions}
            buttonClass={outlineBtnClass}
            panelClass={dropdownPanel}
            itemClass={dropdownItem}
          />
        )}
      </>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Desktop auth nav */}
      <nav className="hidden md:flex items-center gap-2 shrink-0">
        {renderDesktopAuth()}
      </nav>

      {/* Mobile burger */}
      <button
        className={`md:hidden p-2 rounded-xl transition-colors ${
          isDark ? 'text-white hover:bg-white/10' : 'text-text hover:bg-surface'
        }`}
        onClick={() => setDrawerOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-text/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-bg shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <span className="font-display font-bold text-text">Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-0.5">
              {/* Liens publics */}
              {publicLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className="text-text text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-surface transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {isConnected ? (
                <>
                  <div className="h-px bg-border my-3" />

                  <Link
                    href="/compte"
                    onClick={() => setDrawerOpen(false)}
                    className="text-text text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-surface transition-colors"
                  >
                    Mon compte
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setDrawerOpen(false)}
                      className="text-warning text-sm font-bold px-3 py-2.5 rounded-xl hover:bg-warning/5 transition-colors"
                    >
                      🔧 Admin
                    </Link>
                  )}

                  {espaces.map(e => (
                    <Link
                      key={e.href}
                      href={e.href}
                      onClick={() => setDrawerOpen(false)}
                      className="text-primary text-sm font-semibold px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      {e.label}
                    </Link>
                  ))}

                  {inscriptions.length > 0 && (
                    <>
                      {espaces.length > 0 && <div className="h-px bg-border my-2" />}
                      {inscriptions.map(i => (
                        <Link
                          key={i.href}
                          href={i.href}
                          onClick={() => setDrawerOpen(false)}
                          className="text-text-muted text-sm px-3 py-2.5 rounded-xl hover:bg-surface transition-colors"
                        >
                          {i.label}
                        </Link>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="h-px bg-border my-3" />
                  <Link
                    href="/connexion"
                    onClick={() => setDrawerOpen(false)}
                    className="text-text text-sm font-semibold px-3 py-2.5 rounded-xl hover:bg-surface transition-colors"
                  >
                    Connexion
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
