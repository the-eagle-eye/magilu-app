import { prisma } from '@/lib/prisma'
import { getConvertedSizes } from '@/lib/sizeConversion'
import { Suspense } from 'react'
import TiendaFilters from '@/components/tienda/TiendaFilters'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ q?: string; eurSize?: string; genero?: string }>
}

export default async function TiendaPage({ searchParams }: Props) {
  const { q, eurSize, genero } = await searchParams

  const shoes = await prisma.shoe.findMany({
    where: {
      estado: 'disponible',
      ...(genero && genero !== 'todos' && { genero }),
      ...(eurSize && { eurSize: parseFloat(eurSize) }),
      ...(q && {
        OR: [
          { modelo: { contains: q } },
          { marca: { contains: q } },
          { color: { contains: q } },
        ],
      }),
    },
    include: { fotos: true },
    orderBy: [{ marca: 'asc' }, { eurSize: 'asc' }],
  })

  // Get all available sizes for the filter
  const allSizes = await prisma.shoe.findMany({
    where: { estado: 'disponible' },
    select: { eurSize: true },
    distinct: ['eurSize'],
    orderBy: { eurSize: 'asc' },
  })
  const availableSizes = allSizes.map(s => s.eurSize)

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tienda</h1>
          <p className="text-sm text-gray-400 mt-1">{shoes.length} productos disponibles</p>
        </div>
        <Suspense>
          <TiendaFilters sizes={availableSizes} />
        </Suspense>

        {shoes.length === 0 ? (
          <p className="text-center text-gray-400 mt-20">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {shoes.map(shoe => {
              const mainPhoto = shoe.fotos.find(f => f.esPrincipal) ?? shoe.fotos[0]
              const sizes = getConvertedSizes(shoe.eurSize, shoe.genero === 'mujer' ? 'mujer' : 'hombre')

              return (
                <div key={shoe.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  {/* Photo */}
                  <div className="aspect-square bg-gray-100 relative">
                    {mainPhoto ? (
                      <img
                        src={mainPhoto.path}
                        alt={shoe.modelo}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                        👟
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">{shoe.marca}</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight mt-0.5 truncate">{shoe.modelo}</p>

                    {shoe.color && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{shoe.color}</p>
                    )}

                    {/* Sizes */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-semibold">
                        EUR {shoe.eurSize}
                      </span>
                      {sizes?.us && (
                        <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                          US {sizes.us}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    {shoe.precioVenta != null && (
                      <p className="text-base font-bold text-gray-900 mt-2">
                        S/ {shoe.precioVenta.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
