'use client'

import { useEffect, useState } from 'react'

type Tipo = { id: string; nombre: string }

const field = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400'
const label = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

export default function TiposPage() {
  const [tipos, setTipos] = useState<Tipo[]>([])
  const [editing, setEditing] = useState<Tipo | null>(null)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const res = await fetch('/api/mantenimiento/tipos')
    setTipos(await res.json())
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setNombre('')
    setShowForm(true)
  }

  function openEdit(t: Tipo) {
    setEditing(t)
    setNombre(t.nombre)
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false)
    setEditing(null)
    setNombre('')
  }

  async function save() {
    if (!nombre.trim()) return
    setLoading(true)
    const url = editing ? `/api/mantenimiento/tipos/${editing.id}` : '/api/mantenimiento/tipos'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.trim() }),
    })
    if (res.ok) {
      await load()
      cancel()
    }
    setLoading(false)
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este tipo?')) return
    await fetch(`/api/mantenimiento/tipos/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tight">Tipos</h1>
        {!showForm && (
          <button
            onClick={openNew}
            className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Nuevo tipo
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-base font-bold mb-4">{editing ? 'Editar tipo' : 'Nuevo tipo'}</h2>
          <div>
            <label className={label}>Nombre</label>
            <input
              className={field}
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Zapatilla"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && save()}
            />
          </div>
          <div className="flex gap-2 mt-4">
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
      {tipos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No hay tipos registrados</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
          {tipos.map(t => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm font-semibold">{t.nombre}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => openEdit(t)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => remove(t.id)}
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
