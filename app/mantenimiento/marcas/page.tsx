'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type Marca = { id: string; nombre: string; logoPath: string | null }

const field = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'
const label = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [editing, setEditing] = useState<Marca | null>(null)
  const [nombre, setNombre] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch('/api/mantenimiento/marcas')
    setMarcas(await res.json())
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setNombre('')
    setPreview(null)
    setFile(null)
    setShowForm(true)
  }

  function openEdit(m: Marca) {
    setEditing(m)
    setNombre(m.nombre)
    setPreview(m.logoPath ? m.logoPath : null)
    setFile(null)
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false)
    setEditing(null)
    setNombre('')
    setPreview(null)
    setFile(null)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function save() {
    if (!nombre.trim()) return
    setLoading(true)
    const fd = new FormData()
    fd.append('nombre', nombre.trim())
    if (file) fd.append('logo', file)

    const url = editing
      ? `/api/mantenimiento/marcas/${editing.id}`
      : '/api/mantenimiento/marcas'
    const method = editing ? 'PUT' : 'POST'

    const res = await fetch(url, { method, body: fd })
    if (res.ok) {
      await load()
      cancel()
    }
    setLoading(false)
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar esta marca?')) return
    await fetch(`/api/mantenimiento/marcas/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Marcas</h1>
          <p className="text-sm text-gray-500 mt-0.5">El logo se usa en el catálogo PDF</p>
        </div>
        {!showForm && (
          <button
            onClick={openNew}
            className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Nueva marca
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-base font-bold mb-4">{editing ? 'Editar marca' : 'Nueva marca'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Nombre</label>
              <input
                className={field}
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Adidas"
                autoFocus
              />
            </div>
            <div>
              <label className={label}>Logo (foto para catálogo)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 hover:border-amber-400 hover:text-amber-500 transition-colors text-left"
              >
                {file ? file.name : 'Seleccionar imagen…'}
              </button>
            </div>
          </div>

          {preview && (
            <div className="mt-4 flex items-center gap-3">
              <div className="w-32 h-16 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                <Image
                  src={preview}
                  alt="preview"
                  width={128}
                  height={64}
                  className="object-contain w-full h-full"
                  unoptimized
                />
              </div>
              <span className="text-xs text-gray-400">Vista previa del logo</span>
            </div>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={save}
              disabled={loading || !nombre.trim()}
              className="bg-black text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              onClick={cancel}
              className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {marcas.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No hay marcas registradas</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marcas.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-20 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {m.logoPath ? (
                  <Image
                    src={m.logoPath}
                    alt={m.nombre}
                    width={80}
                    height={48}
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs text-gray-300 font-bold uppercase tracking-wide">
                    {m.nombre.slice(0, 3)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{m.nombre}</p>
                <p className="text-xs text-gray-400">{m.logoPath ? 'Con logo' : 'Sin logo'}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => openEdit(m)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => remove(m.id)}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
