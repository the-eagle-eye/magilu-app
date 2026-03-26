'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/inventario', label: 'Inventario' },
  { href: '/catalogo', label: 'Catálogo PDF' },
]

const mantenimiento = [
  { href: '/mantenimiento/marcas', label: 'Marcas' },
  { href: '/mantenimiento/tipos', label: 'Tipos' },
]

export default function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [mtOpen, setMtOpen] = useState(false)

  if (path === '/login' || path === '/tienda') return null

  const isMt = path.startsWith('/mantenimiento')

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

            {/* Mantenimiento dropdown */}
            <div className="relative">
              <button
                onClick={() => setMtOpen(!mtOpen)}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isMt
                    ? 'bg-amber-400 text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Mantenimiento
                <span className="text-[10px] opacity-70">{mtOpen ? '▲' : '▼'}</span>
              </button>
              {mtOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[140px] z-50">
                  {mantenimiento.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMtOpen(false)}
                      className={`block px-4 py-2 text-sm font-medium transition-colors ${
                        path.startsWith(item.href)
                          ? 'bg-amber-50 text-amber-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right: sign out + mobile hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="hidden md:block text-xs text-white/30 hover:text-white/60 transition-colors tracking-widest uppercase"
            >
              Salir
            </button>
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
            <div className="mt-1 border-t border-white/10 pt-2">
              <p className="px-3 text-[10px] text-white/30 uppercase tracking-widest mb-1">Mantenimiento</p>
              {mantenimiento.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-all mt-1 ${
                    path.startsWith(item.href)
                      ? 'bg-amber-400 text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
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
