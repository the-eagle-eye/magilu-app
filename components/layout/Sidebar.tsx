'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/inventario', label: 'Inventario' },
  { href: '/catalogo', label: 'Catálogo PDF' },
]

export default function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  if (path === '/login') return null

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-black border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-2 shrink-0">
            <span className="font-black text-lg tracking-[5px] text-white leading-none">MAGILU</span>
            <span className="hidden sm:block text-[9px] tracking-[2px] text-amber-400 font-semibold uppercase">Calzado · Premium</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(item => {
              const active = item.href === '/' ? path === '/' : path.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    active
                      ? 'bg-amber-400 text-black'
                      : 'text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: sign out + mobile hamburger */}
          <div className="flex items-center gap-3">
            <form action="/api/auth/signout" method="POST" className="hidden md:block">
              <button className="text-xs text-white/30 hover:text-white/60 transition-colors tracking-widest uppercase">
                Salir
              </button>
            </form>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-white text-xl leading-none p-1"
            >
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {open && (
          <div className="md:hidden bg-black border-t border-white/10 px-4 pb-4">
            {nav.map(item => {
              const active = item.href === '/' ? path === '/' : path.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-all mt-1 ${
                    active
                      ? 'bg-amber-400 text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <form action="/api/auth/signout" method="POST" className="mt-3 px-3">
              <button className="text-xs text-white/30 hover:text-white/60 transition-colors tracking-widest uppercase">
                Cerrar sesión
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  )
}
