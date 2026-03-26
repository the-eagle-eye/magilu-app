'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Props = {
  sizes: number[]
}

const GENEROS = ['todos', 'hombre', 'mujer']

export default function TiendaFilters({ sizes }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const eurSize = searchParams.get('eurSize') ?? ''
  const genero = searchParams.get('genero') ?? 'todos'

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'todos') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/tienda?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-col gap-3">
      {/* Search */}
      <input
        type="text"
        placeholder="Buscar modelo, marca, color..."
        defaultValue={q}
        onChange={e => update('q', e.target.value)}
        className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Género */}
        <div className="flex gap-1">
          {GENEROS.map(g => (
            <button
              key={g}
              onClick={() => update('genero', g)}
              className={`px-3 py-2 rounded-md text-xs font-semibold capitalize transition-colors ${
                genero === g ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Talla */}
        {sizes.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => update('eurSize', '')}
              className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                !eurSize ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {sizes.map(s => (
              <button
                key={s}
                onClick={() => update('eurSize', String(s))}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  eurSize === String(s) ? 'bg-amber-400 text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
