'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getConvertedSizes } from '@/lib/sizeConversion'

type ShoePhoto = { id: string; path: string; esPrincipal: boolean }

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
  fotos: ShoePhoto[]
}

export default function EditarZapatoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [shoe, setShoe] = useState<Shoe | null>(null)
  const [loading, setLoading] = useState(true)
  const [marcas, setMarcas] = useState<string[]>([])
  const [tipos, setTipos] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/mantenimiento/marcas').then(r => r.json()).then((data: { nombre: string }[]) => {
      setMarcas(data.map(m => m.nombre))
    })
    fetch('/api/mantenimiento/tipos').then(r => r.json()).then((data: { nombre: string }[]) => {
      setTipos(data.map(t => t.nombre))
    })
  }, [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    modelo: '',
    marca: '',
    eurSize: '',
    usSize: '',
    ukSize: '',
    color: '',
    tipo: '',
    genero: '',
    precioVenta: '',
    estado: '',
    notas: '',
    sku: '',
  })

  const fetchShoe = useCallback(async () => {
    const res = await fetch(`/api/zapatos/${id}`)
    const data: Shoe = await res.json()
    setShoe(data)
    setForm({
      modelo: data.modelo,
      marca: data.marca,
      eurSize: String(data.eurSize),
      usSize: data.usSize != null ? String(data.usSize) : '',
      ukSize: data.ukSize != null ? String(data.ukSize) : '',
      color: data.color ?? '',
      tipo: data.tipo,
      genero: data.genero,
      precioVenta: data.precioVenta != null ? String(data.precioVenta) : '',
      estado: data.estado,
      notas: data.notas ?? '',
      sku: data.sku ?? '',
    })
    setLoading(false)
  }, [id])

  useEffect(() => { fetchShoe() }, [fetchShoe])

  function handleEurChange(value: string) {
    const eur = parseFloat(value)
    const converted = !isNaN(eur) ? getConvertedSizes(eur, form.genero) : null
    setForm(f => ({
      ...f,
      eurSize: value,
      usSize: converted ? String(converted.us) : '',
      ukSize: converted ? String(converted.uk) : '',
    }))
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return
    setNewFiles(prev => [...prev, ...selected])
    selected.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setNewPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  async function setPrincipal(photoId: string) {
    await fetch(`/api/zapatos/${id}/fotos/${photoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ esPrincipal: true }),
    })
    fetchShoe()
  }

  async function deletePhoto(photoId: string) {
    await fetch(`/api/zapatos/${id}/fotos/${photoId}`, { method: 'DELETE' })
    fetchShoe()
  }

  async function downloadAllPhotos() {
    if (!shoe?.fotos.length) return
    setDownloading(true)
    for (let i = 0; i < shoe.fotos.length; i++) {
      const foto = shoe.fotos[i]
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
        // Small delay so browser doesn't block multiple downloads
        await new Promise(r => setTimeout(r, 400))
      } catch {
        // skip failed photo
      }
    }
    setDownloading(false)
  }

  async function uploadNewPhotos(shoeId: string) {
    if (!newFiles.length) return
    const fd = new FormData()
    newFiles.forEach(f => fd.append('fotos', f))
    await fetch(`/api/zapatos/${shoeId}/fotos`, { method: 'POST', body: fd })
    setNewFiles([])
    setNewPreviews([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await fetch(`/api/zapatos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelo: form.modelo,
        marca: form.marca,
        eurSize: parseFloat(form.eurSize),
        usSize: form.usSize ? parseFloat(form.usSize) : null,
        ukSize: form.ukSize ? parseFloat(form.ukSize) : null,
        color: form.color || null,
        tipo: form.tipo,
        genero: form.genero,
        precioVenta: form.precioVenta ? parseFloat(form.precioVenta) : null,
        estado: form.estado,
        notas: form.notas || null,
        sku: form.sku || null,
      }),
    })

    await uploadNewPhotos(id)
    await fetchShoe()
    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push('/inventario'), 2000)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este zapato? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    await fetch(`/api/zapatos/${id}`, { method: 'DELETE' })
    router.push('/inventario')
  }

  const fieldCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

  if (loading) return <div className="p-6 text-center text-gray-400">Cargando...</div>
  if (!shoe) return <div className="p-6 text-center text-gray-400">Zapato no encontrado</div>

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {saved && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold">
          <span>✓</span>
          <span>Cambios guardados — volviendo al inventario...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/inventario" className="text-gray-400 hover:text-gray-700 text-sm">← Inventario</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900 truncate">{shoe.modelo}</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Fotos existentes */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700">Fotos</h2>
            {shoe.fotos.length > 0 && (
              <button
                type="button"
                onClick={downloadAllPhotos}
                disabled={downloading}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {downloading ? 'Descargando...' : '↓ Descargar fotos'}
              </button>
            )}
          </div>

          {shoe.fotos.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {shoe.fotos.map(foto => (
                <div key={foto.id} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 group"
                  style={{ borderColor: foto.esPrincipal ? '#c8973a' : '#e5e7eb' }}>
                  <Image src={foto.path} alt="" fill className="object-contain p-1" />
                  {foto.esPrincipal && (
                    <span className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[9px] font-bold text-center py-0.5">
                      PRINCIPAL
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    {!foto.esPrincipal && (
                      <button
                        type="button"
                        onClick={() => setPrincipal(foto.id)}
                        className="text-[10px] text-white bg-amber-500 rounded px-2 py-0.5"
                      >
                        Principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deletePhoto(foto.id)}
                      className="text-[10px] text-white bg-red-500 rounded px-2 py-0.5"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nuevas fotos */}
          <div className="flex flex-wrap gap-3">
            {newPreviews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-dashed border-amber-300">
                <Image src={src} alt="" fill className="object-contain p-1" />
                <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-bold rounded px-1">Nueva</span>
              </div>
            ))}
            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors text-gray-400 hover:text-amber-500">
              <span className="text-2xl">+</span>
              <span className="text-[10px] mt-1">Agregar</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </label>
          </div>
        </div>

        {/* Datos principales */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Información</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <label className={labelCls}>Modelo *</label>
              <input required type="text" value={form.modelo}
                onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                className={fieldCls} />
            </div>

            <div>
              <label className={labelCls}>Marca *</label>
              <select value={form.marca}
                onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}
                className={fieldCls}>
                {form.marca && !marcas.includes(form.marca) && (
                  <option value={form.marca}>{form.marca}</option>
                )}
                {marcas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Género</label>
              <div className="flex gap-2">
                {['hombre', 'mujer', 'niño'].map(g => (
                  <button key={g} type="button"
                    onClick={() => setForm(f => ({ ...f, genero: g }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                      form.genero === g ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Talla EUR *</label>
              <input required type="number" inputMode="decimal" step="0.5" value={form.eurSize}
                onChange={e => handleEurChange(e.target.value)}
                className={fieldCls} />
            </div>

            <div>
              <label className={labelCls}>Talla US</label>
              <input type="number" inputMode="decimal" step="0.5" value={form.usSize}
                onChange={e => setForm(f => ({ ...f, usSize: e.target.value }))}
                className={`${fieldCls} bg-gray-50`} />
            </div>

            <div>
              <label className={labelCls}>Talla UK</label>
              <input type="number" inputMode="decimal" step="0.5" value={form.ukSize}
                onChange={e => setForm(f => ({ ...f, ukSize: e.target.value }))}
                className={`${fieldCls} bg-gray-50`} />
            </div>

            <div>
              <label className={labelCls}>Color</label>
              <input type="text" value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className={fieldCls} />
            </div>

            <div>
              <label className={labelCls}>Tipo</label>
              <select value={form.tipo}
                onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                className={fieldCls}>
                {form.tipo && !tipos.includes(form.tipo) && (
                  <option value={form.tipo}>{form.tipo}</option>
                )}
                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>SKU</label>
              <input type="text" value={form.sku}
                onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                className={fieldCls} />
            </div>

            <div>
              <label className={labelCls}>Estado</label>
              <select value={form.estado}
                onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                className={fieldCls}>
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>

          </div>
        </div>

        {/* Precios */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Precio venta</h2>
          <div>
            <label className={labelCls}>Precio venta (S/)</label>
            <input type="number" inputMode="decimal" step="0.01" value={form.precioVenta}
              onChange={e => setForm(f => ({ ...f, precioVenta: e.target.value }))}
              className={fieldCls} placeholder="0.00" />
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Notas</h2>
          <textarea rows={3} value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            className={`${fieldCls} resize-none`}
            placeholder="Condición, detalles especiales..." />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <Link href="/inventario"
            className="flex-1 text-center py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-amber-500 hover:text-black transition-colors disabled:opacity-50">
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

      </form>
    </div>
  )
}
