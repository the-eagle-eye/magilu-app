'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Shoe = {
  id: string
  modelo: string
  marca: string
  eurSize: number
  usSize: number | null
  ukSize: number | null
  color: string | null
  tipo: string
  genero: string
  precio: number | null
  precioVenta: number | null
  estado: string
  notas: string | null
  sku: string | null
  fotos: { id: string; path: string; esPrincipal: boolean; tipo: string }[]
}

const ESTADOS = ['todos', 'disponible', 'reservado', 'vendido']
const GENEROS = ['todos', 'hombre', 'mujer']
const PAGE_SIZE = 40

function InventarioPage() {
  const searchParams = useSearchParams()
  const [shoes, setShoes] = useState<Shoe[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [inputQ, setInputQ] = useState('')
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState('disponible')
  const [genero, setGenero] = useState('todos')
  const [talla, setTalla] = useState(() => searchParams.get('eurSize') ?? '')
  const [tallas, setTallas] = useState<number[]>([])
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetch('/api/zapatos?tallas=1').then(r => r.json()).then(setTallas)
  }, [])

  // Debounce search input 400ms
  useEffect(() => {
    const timer = setTimeout(() => setQ(inputQ), 400)
    return () => clearTimeout(timer)
  }, [inputQ])

  const fetchShoes = useCallback(async (append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)

    const currentOffset = append ? offset + PAGE_SIZE : 0
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (estado !== 'todos') params.set('estado', estado)
    if (genero !== 'todos') params.set('genero', genero)
    if (talla) params.set('eurSize', talla)
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String(currentOffset))

    const res = await fetch(`/api/zapatos?${params}`)
    const data = await res.json()

    if (append) {
      setShoes(prev => [...prev, ...data.shoes])
      setOffset(currentOffset)
    } else {
      setShoes(data.shoes)
      setOffset(0)
    }
    setTotal(data.total)
    setHasMore(data.hasMore)

    if (append) setLoadingMore(false)
    else setLoading(false)
  }, [q, estado, genero, talla, offset])

  // Reset and reload when filters change
  useEffect(() => {
    fetchShoes(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estado, genero, talla])

  async function downloadPhotos(shoe: Shoe) {
    const fotoZapato = shoe.fotos.filter(f => f.tipo === 'zapato')
    if (!fotoZapato.length) return
    setDownloadingId(shoe.id)
    for (let i = 0; i < fotoZapato.length; i++) {
      const foto = fotoZapato[i]
      try {
        const res = await fetch(foto.path)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const ext = foto.path.split('.').pop() ?? 'jpg'
        a.download = `${shoe.marca}_${shoe.modelo}_${i + 1}.${ext}`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 400))
      } catch {
        // skip failed photo
      }
    }
    setDownloadingId(null)
  }

  async function cambiarEstado(id: string, nuevoEstado: string) {
    await fetch(`/api/zapatos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    fetchShoes()
  }

  const estadoColor: Record<string, string> = {
    disponible: 'bg-emerald-100 text-emerald-700',
    reservado: 'bg-amber-100 text-amber-700',
    vendido: 'bg-red-100 text-red-600',
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">{total} pares</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <a
            href="/api/exportar/excel"
            className="px-4 py-2.5 rounded-md text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ↓ Excel
          </a>
          <Link
            href="/inventario/nuevo"
            className="bg-black text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-amber-400 hover:text-black transition-colors"
          >
            + Agregar
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar modelo, marca, color, SKU..."
          value={inputQ}
          onChange={e => setInputQ(e.target.value)}
          className="w-full sm:flex-1 border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <div className="flex gap-1 flex-wrap">
          {ESTADOS.map(e => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`px-3 py-2 rounded-md text-xs font-semibold capitalize transition-colors ${
                estado === e ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {GENEROS.map(g => (
            <button
              key={g}
              onClick={() => setGenero(g)}
              className={`px-3 py-2 rounded-md text-xs font-semibold capitalize transition-colors ${
                genero === g ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <select
          value={talla}
          onChange={e => setTalla(e.target.value)}
          className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors border focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            talla ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-600 border-gray-100 hover:bg-gray-200'
          }`}
        >
          <option value="" className="bg-white text-gray-900">Talla</option>
          {tallas.map((t: number) => (
            <option key={t} value={String(t)} className="bg-white text-gray-900">
              EUR {t}
            </option>
          ))}
        </select>
        {(inputQ || estado !== 'disponible' || genero !== 'todos' || talla) && (
          <button
            onClick={() => { setInputQ(''); setEstado('disponible'); setGenero('todos'); setTalla('') }}
            className="px-3 py-2 rounded-md text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : shoes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No se encontraron zapatos</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {shoes.map(shoe => {
            const fotoPrincipal = shoe.fotos.find(f => f.esPrincipal) ?? shoe.fotos[0]
            return (
              <div key={shoe.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Imagen */}
                <div className="relative aspect-square bg-stone-50 overflow-hidden">
                  {fotoPrincipal ? (
                    <Image
                      src={fotoPrincipal.path}
                      alt={shoe.modelo}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                      👟
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${estadoColor[shoe.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                    {shoe.estado}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-bold text-sm text-gray-900 truncate">{shoe.modelo}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{shoe.marca}</p>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                      EUR {shoe.eurSize}
                    </span>
                    {shoe.usSize && <span className="bg-gray-50 text-gray-500 text-[10px] px-2 py-0.5 rounded">US {shoe.usSize}</span>}
                  </div>

                  {shoe.precioVenta && (
                    <p className="text-sm font-bold text-gray-900 mt-2">S/ {shoe.precioVenta.toFixed(2)}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/inventario/${shoe.id}`}
                      className="flex-1 text-center text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-md transition-colors"
                    >
                      Editar
                    </Link>
                    <select
                      value={shoe.estado}
                      onChange={e => cambiarEstado(shoe.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-md px-1 py-1 focus:outline-none"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="reservado">Reservado</option>
                      <option value="vendido">Vendido</option>
                    </select>
                  </div>
                  {shoe.fotos.some(f => f.tipo === 'zapato') && (
                    <button
                      onClick={() => downloadPhotos(shoe)}
                      disabled={downloadingId === shoe.id}
                      className="w-full mt-2 text-xs font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 py-1.5 rounded-md transition-colors disabled:opacity-50"
                    >
                      {downloadingId === shoe.id ? 'Descargando...' : `↓ Descargar fotos (${shoe.fotos.filter(f => f.tipo === 'zapato').length})`}
                    </button>
                  )}

                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cargar más */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchShoes(true)}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-md text-sm font-semibold bg-black text-white hover:bg-amber-400 hover:text-black transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Cargando...' : `Cargar más (${total - shoes.length} restantes)`}
          </button>
        </div>
      )}
    </div>
  )
}

export default function InventarioPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Cargando...</div>}>
      <InventarioPage />
    </Suspense>
  )
}
