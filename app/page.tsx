import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getConvertedSizes } from '@/lib/sizeConversion'

export const dynamic = 'force-dynamic'

async function getStats() {
  const [total, disponible, reservado, vendido, byMarca, byTalla] = await Promise.all([
    prisma.shoe.count(),
    prisma.shoe.count({ where: { estado: 'disponible' } }),
    prisma.shoe.count({ where: { estado: 'reservado' } }),
    prisma.shoe.count({ where: { estado: 'vendido' } }),
    prisma.shoe.groupBy({ by: ['marca'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    prisma.shoe.groupBy({
      by: ['eurSize'],
      where: { estado: 'disponible' },
      _count: { id: true },
      orderBy: { eurSize: 'asc' },
    }),
  ])
  return { total, disponible, reservado, vendido, byMarca, byTalla }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    { label: 'Total pares', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50' },
    { label: 'Disponibles', value: stats.disponible, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Reservados', value: stats.reservado, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Vendidos', value: stats.vendido, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Resumen de tu inventario</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className={`${card.bg} rounded-xl p-5 border border-gray-100`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/inventario/nuevo"
          className="bg-black text-white rounded-xl p-5 flex items-center gap-4 hover:bg-amber-500 hover:text-black transition-colors group"
        >
          <span className="text-3xl">+</span>
          <div>
            <p className="font-bold">Agregar zapato</p>
            <p className="text-xs opacity-70">Registrar un nuevo par al inventario</p>
          </div>
        </Link>
        <Link
          href="/catalogo"
          className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 hover:border-amber-400 hover:shadow-md transition-all"
        >
          <span className="text-3xl">📄</span>
          <div>
            <p className="font-bold text-gray-900">Generar catálogo PDF</p>
            <p className="text-xs text-gray-400">Crear PDF por talla para enviar por WhatsApp</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por marca */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Pares por marca</h2>
          <div className="space-y-3">
            {stats.byMarca.map(row => (
              <div key={row.marca} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-40 truncate">{row.marca}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-2 rounded-full"
                    style={{ width: `${(row._count.id / stats.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-6 text-right">{row._count.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disponibles por talla */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Disponibles por talla</h2>
          <div className="flex flex-wrap gap-2">
            {stats.byTalla.map(row => {
              const us = getConvertedSizes(row.eurSize, 'hombre')?.us
              return (
                <Link
                  key={row.eurSize}
                  href={`/inventario?eurSize=${row.eurSize}`}
                  className="relative bg-amber-50 border border-amber-200 rounded-lg px-3 pt-4 pb-2 text-center min-w-[60px] hover:bg-amber-100 hover:border-amber-400 hover:shadow-sm transition-all"
                >
                  <span className="absolute top-1.5 right-1.5 bg-amber-400 text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {row._count.id}
                  </span>
                  <p className="text-[10px] font-semibold text-amber-600 leading-none mb-0.5">EUR</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{row.eurSize}</p>
                  {us && <p className="text-xs text-gray-400 mt-0.5">US {us}</p>}
                </Link>
              )
            })}
          </div>
          {stats.byTalla.length === 0 && (
            <p className="text-sm text-gray-400">No hay pares disponibles</p>
          )}
        </div>
      </div>
    </div>
  )
}
