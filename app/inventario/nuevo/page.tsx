'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getConvertedSizes } from '@/lib/sizeConversion'

export default function NuevoZapatoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [marcas, setMarcas] = useState<string[]>([])
  const [tipos, setTipos] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/mantenimiento/marcas').then(r => r.json()).then((data: { nombre: string }[]) => {
      const nombres = data.map((m) => m.nombre)
      setMarcas(nombres)
      setForm(f => ({ ...f, marca: f.marca || nombres[0] || '' }))
    })
    fetch('/api/mantenimiento/tipos').then(r => r.json()).then((data: { nombre: string }[]) => {
      const nombres = data.map((t) => t.nombre)
      setTipos(nombres)
      setForm(f => ({ ...f, tipo: f.tipo || nombres[0] || '' }))
    })
  }, [])

  // Fotos del zapato (van al catálogo)
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])

  // Foto de etiqueta (código/info del zapato)
  const [etiquetaPreview, setEtiquetaPreview] = useState<string | null>(null)
  const [etiquetaFile, setEtiquetaFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    modelo: '',
    marca: '',
    eurSize: '',
    usSize: '',
    ukSize: '',
    color: '',
    tipo: 'Zapatilla',
    genero: 'hombre',
    precio: '',
    precioVenta: '',
    estado: 'disponible',
    notas: '',
    sku: '',
  })

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

  function handleGeneroChange(value: string) {
    const eur = parseFloat(form.eurSize)
    const converted = !isNaN(eur) ? getConvertedSizes(eur, value) : null
    setForm(f => ({
      ...f,
      genero: value,
      usSize: converted ? String(converted.us) : f.usSize,
      ukSize: converted ? String(converted.uk) : f.ukSize,
    }))
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return
    setFiles(prev => [...prev, ...selected])
    selected.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  function removePhoto(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleEtiqueta(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEtiquetaFile(file)
    setExtractError(null)

    const reader = new FileReader()
    reader.onload = ev => setEtiquetaPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Extraer datos con IA
    setExtracting(true)
    try {
      const fd = new FormData()
      fd.append('imagen', file)
      const res = await fetch('/api/ia/etiqueta', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setExtractError(data.error ?? 'Error al procesar la etiqueta')
        return
      }

      setForm(f => {
        const eur = (data.eurSize ?? parseFloat(f.eurSize)) || null
        const genero = data.genero ?? f.genero
        const converted = eur ? getConvertedSizes(eur, genero) : null
        return {
          ...f,
          modelo:      data.modelo   ?? f.modelo,
          marca:       marcas.find(m => m.toLowerCase() === data.marca?.toLowerCase()) ?? f.marca,
          eurSize:     eur != null   ? String(eur) : f.eurSize,
          usSize:      data.usSize   ? String(data.usSize)  : converted ? String(converted.us)  : f.usSize,
          ukSize:      data.ukSize   ? String(data.ukSize)  : converted ? String(converted.uk)  : f.ukSize,
          color:       data.color    ?? f.color,
          genero,
          sku:         data.sku      ?? f.sku,
        }
      })
    } catch {
      setExtractError('No se pudo conectar con el servicio de IA')
    } finally {
      setExtracting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const fd = new FormData()
    fd.append('modelo', form.modelo)
    fd.append('marca', form.marca)
    fd.append('eurSize', form.eurSize)
    if (form.usSize) fd.append('usSize', form.usSize)
    if (form.ukSize) fd.append('ukSize', form.ukSize)
    if (form.color) fd.append('color', form.color)
    fd.append('tipo', form.tipo)
    fd.append('genero', form.genero)
    if (form.precio) fd.append('precio', form.precio)
    if (form.precioVenta) fd.append('precioVenta', form.precioVenta)
    fd.append('estado', form.estado)
    if (form.notas) fd.append('notas', form.notas)
    if (form.sku) fd.append('sku', form.sku)
    files.forEach(f => fd.append('fotos', f))
    if (etiquetaFile) fd.append('etiqueta', etiquetaFile)

    const res = await fetch('/api/zapatos', { method: 'POST', body: fd })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => router.push('/inventario'), 2000)
    } else {
      alert('Error al guardar el zapato')
      setSaving(false)
    }
  }

  const field = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'
  const label = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {saved && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold">
          <span>✓</span>
          <span>Zapato guardado correctamente — volviendo al inventario...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/inventario" className="text-gray-400 hover:text-gray-700 text-sm">← Inventario</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">Agregar zapato</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Foto de etiqueta */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-700">Foto de etiqueta</h2>
              <p className="text-xs text-gray-400 mt-0.5">La etiqueta pegada dentro o debajo del zapato con el código y talla.</p>
            </div>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-medium">Opcional</span>
          </div>
          <div className="flex items-start gap-4">
            {etiquetaPreview ? (
              <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 group shrink-0">
                <Image src={etiquetaPreview} alt="Etiqueta" fill className="object-cover" />
                {extracting && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-[10px] font-semibold animate-pulse">Leyendo...</span>
                  </div>
                )}
                {!extracting && (
                  <button
                    type="button"
                    onClick={() => { setEtiquetaPreview(null); setEtiquetaFile(null); setExtractError(null) }}
                    className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ✕ Quitar
                  </button>
                )}
              </div>
            ) : (
              <label className="w-32 h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors text-gray-400 hover:text-amber-500 shrink-0">
                <span className="text-xl">🏷️</span>
                <span className="text-[10px] mt-1 text-center px-2">Subir etiqueta</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleEtiqueta} />
              </label>
            )}
            <div className="text-xs text-gray-400 space-y-1.5">
              {extracting ? (
                <p className="text-amber-600 font-semibold">Analizando etiqueta con IA...</p>
              ) : extractError ? (
                <p className="text-red-500">{extractError}</p>
              ) : etiquetaPreview ? (
                <p className="text-emerald-600 font-semibold">✓ Datos extraídos. Revisa y corrige si es necesario.</p>
              ) : (
                <>
                  <p>Fotografía la etiqueta interior del zapato.</p>
                  <p>La IA leerá automáticamente el <strong className="text-gray-600">modelo</strong>, <strong className="text-gray-600">talla EUR</strong> y <strong className="text-gray-600">código</strong>.</p>
                  <p className="text-gray-300 font-mono text-[10px]">Ej: ALDO · 13196541 · EUR 43</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fotos del zapato */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-700">Fotos del zapato</h2>
              <p className="text-xs text-gray-400 mt-0.5">Las fotos que aparecen en el catálogo PDF y en el inventario.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                <Image src={src} alt="" fill className="object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[9px] font-bold text-center py-0.5">
                    PRINCIPAL
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors text-gray-400 hover:text-amber-500">
              <span className="text-2xl">+</span>
              <span className="text-[10px] mt-1">Agregar</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-3">La primera foto será la principal en el catálogo. Puedes subir múltiples ángulos.</p>
        </div>

        {/* Datos principales */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Información del calzado</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <label className={label}>Modelo *</label>
              <input
                required
                type="text"
                placeholder="ej. Air Max 90"
                value={form.modelo}
                onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                className={field}
              />
            </div>

            <div>
              <label className={label}>Marca *</label>
              <select
                value={form.marca}
                onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}
                className={field}
              >
                {marcas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className={label}>Género *</label>
              <div className="flex gap-2">
                {['hombre', 'mujer'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGeneroChange(g)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                      form.genero === g ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={label}>Talla EUR *</label>
              <input
                required
                type="number"
                step="0.5"
                placeholder="ej. 43"
                value={form.eurSize}
                onChange={e => handleEurChange(e.target.value)}
                className={field}
              />
            </div>

            <div>
              <label className={label}>Talla US</label>
              <input
                type="number"
                step="0.5"
                value={form.usSize}
                onChange={e => setForm(f => ({ ...f, usSize: e.target.value }))}
                className={`${field} bg-gray-50`}
                placeholder="Auto-calculado"
              />
            </div>

            <div>
              <label className={label}>Talla UK</label>
              <input
                type="number"
                step="0.5"
                value={form.ukSize}
                onChange={e => setForm(f => ({ ...f, ukSize: e.target.value }))}
                className={`${field} bg-gray-50`}
                placeholder="Auto-calculado"
              />
            </div>

            <div>
              <label className={label}>Color</label>
              <input
                type="text"
                placeholder="ej. Negro, Café, Blanco"
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className={field}
              />
            </div>

            <div>
              <label className={label}>Tipo</label>
              <select
                value={form.tipo}
                onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                className={field}
              >
                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className={label}>SKU</label>
              <input
                type="text"
                placeholder="Código interno"
                value={form.sku}
                onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                className={field}
              />
            </div>

            <div>
              <label className={label}>Estado</label>
              <select
                value={form.estado}
                onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                className={field}
              >
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>

          </div>
        </div>

        {/* Precios */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-1">Precios</h2>
          <p className="text-xs text-gray-400 mb-4">Si ingresas ambos, el PDF mostrará el precio anterior tachado y el precio de venta destacado.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Precio anterior / referencia (S/)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.precio}
                onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                className={field}
              />
            </div>
            <div>
              <label className={label}>Precio venta (S/)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.precioVenta}
                onChange={e => setForm(f => ({ ...f, precioVenta: e.target.value }))}
                className={field}
              />
              {form.precio && form.precioVenta && (
                <p className="text-xs text-emerald-600 mt-1 font-semibold">
                  Margen: S/ {(parseFloat(form.precioVenta) - parseFloat(form.precio)).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Notas</h2>
          <textarea
            rows={3}
            placeholder="Condición, detalles especiales, procedencia..."
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            className={`${field} resize-none`}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <Link
            href="/inventario"
            className="flex-1 text-center py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-amber-500 hover:text-black transition-colors disabled:opacity-50"
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar zapato'}
          </button>
        </div>

      </form>
    </div>
  )
}
