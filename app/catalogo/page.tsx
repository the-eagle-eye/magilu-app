'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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
  fotos: { id: string; path: string; esPrincipal: boolean }[]
}

export default function CatalogoPage() {
  const [shoes, setShoes] = useState<Shoe[]>([])
  const [allSizes, setAllSizes] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // Filters
  const [genero, setGenero] = useState('todos')
  const [eurSize, setEurSize] = useState('')

  // Config
  const [titulo, setTitulo] = useState('Catálogo MAGILU')
  const [incluirPrecio, setIncluirPrecio] = useState(true)
  const [incluirTallas, setIncluirTallas] = useState(true)
  const [soloDisponibles, setSoloDisponibles] = useState(true)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Fetch all distinct sizes (unaffected by eurSize filter)
  useEffect(() => {
    const params = new URLSearchParams({ tallas: '1' })
    if (soloDisponibles) params.set('estado', 'disponible')
    fetch(`/api/zapatos?${params}`)
      .then(r => r.json())
      .then((sizes: number[]) => setAllSizes(sizes))
  }, [soloDisponibles])

  const fetchShoes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (genero !== 'todos') params.set('genero', genero)
    if (eurSize) params.set('eurSize', eurSize)
    if (soloDisponibles) params.set('estado', 'disponible')
    const res = await fetch(`/api/zapatos?${params}`)
    const data: { shoes: Shoe[] } = await res.json()
    setShoes(data.shoes)
    setSelectedIds(new Set(data.shoes.map(s => s.id)))
    setLoading(false)
  }, [genero, eurSize, soloDisponibles])

  useEffect(() => { fetchShoes() }, [fetchShoes])

  function toggleShoe(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() { setSelectedIds(new Set(shoes.map(s => s.id))) }
  function clearAll() { setSelectedIds(new Set()) }

  async function generatePDF() {
    if (selectedIds.size === 0) {
      alert('Selecciona al menos un zapato')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/catalogo/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          titulo,
          incluirPrecio,
          incluirTallas,
        }),
      })
      if (!res.ok) throw new Error('Error al generar PDF')
      const blob = await res.blob()
      const filename = `${titulo.replace(/\s+/g, '_')}.pdf`
      const file = new File([blob], filename, { type: 'application/pdf' })

      // Use native share sheet on mobile (shows WhatsApp, iMessage, etc.)
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: titulo })
      } else {
        // Fallback: direct download on desktop
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      alert('Error al generar el catálogo')
    } finally {
      setGenerating(false)
    }
  }

  function copyWhatsApp() {
    const selected = shoes.filter(s => selectedIds.has(s.id))
    const lines = selected.map(s => {
      const precio = s.precioVenta ? `S/ ${s.precioVenta.toFixed(2)}` : ''
      const talla = `EUR ${s.eurSize}${s.usSize ? ` / US ${s.usSize}` : ''}`
      return `• ${s.marca} ${s.modelo} | ${talla}${precio ? ` | ${precio}` : ''}`
    })
    const msg = `${titulo}\n\n${lines.join('\n')}\n\n📦 Todos disponibles. Escríbeme para reservar.`
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }


  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catálogo PDF</h1>
        <p className="text-sm text-gray-400 mt-1">Genera un PDF profesional para compartir por WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Config + Actions */}
        <div className="space-y-4">

          {/* Configuración */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4">Configuración</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Título del catálogo
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={incluirPrecio} onChange={e => setIncluirPrecio(e.target.checked)}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm text-gray-700">Incluir precios en PDF</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={incluirTallas} onChange={e => setIncluirTallas(e.target.checked)}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm text-gray-700">Incluir tallas US/UK</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={soloDisponibles} onChange={e => setSoloDisponibles(e.target.checked)}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm text-gray-700">Solo disponibles</span>
              </label>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-4">Filtrar zapatos</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Género</label>
                <div className="flex gap-1">
                  {['todos', 'hombre', 'mujer', 'niño'].map(g => (
                    <button key={g} type="button" onClick={() => setGenero(g)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                        genero === g ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Talla EUR
                </label>
                <select
                  value={eurSize}
                  onChange={e => setEurSize(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Todas las tallas</option>
                  {allSizes.map(s => (
                    <option key={s} value={s}>EUR {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={generatePDF}
              disabled={generating || selectedIds.size === 0}
              className="w-full bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-amber-500 hover:text-black transition-colors disabled:opacity-40"
            >
              {generating ? 'Generando PDF...' : `📄 Descargar PDF (${selectedIds.size})`}
            </button>
            <button
              onClick={copyWhatsApp}
              disabled={selectedIds.size === 0}
              className="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-40"
            >
              {copied ? '✓ Mensaje copiado' : '💬 Copiar mensaje WhatsApp'}
            </button>
          </div>
        </div>

        {/* Right: Shoe selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">
                {selectedIds.size} de {shoes.length} seleccionados
              </p>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-amber-600 font-semibold hover:underline">
                  Todos
                </button>
                <span className="text-gray-300">|</span>
                <button onClick={clearAll} className="text-xs text-gray-400 font-semibold hover:underline">
                  Ninguno
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-gray-400">Cargando...</div>
            ) : shoes.length === 0 ? (
              <div className="py-20 text-center text-gray-400">No se encontraron zapatos</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {shoes.map(shoe => {
                  const foto = shoe.fotos.find(f => f.esPrincipal) ?? shoe.fotos[0]
                  const selected = selectedIds.has(shoe.id)
                  return (
                    <label
                      key={shoe.id}
                      className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors ${
                        selected ? 'bg-amber-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleShoe(shoe.id)}
                        className="w-4 h-4 accent-amber-500 shrink-0"
                      />
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {foto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={foto.path} alt={shoe.modelo} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">👟</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{shoe.modelo}</p>
                        <p className="text-xs text-gray-400">{shoe.marca} · EUR {shoe.eurSize}</p>
                      </div>
                      {shoe.precioVenta && (
                        <span className="text-sm font-bold text-gray-900 shrink-0">
                          S/ {shoe.precioVenta.toFixed(2)}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
