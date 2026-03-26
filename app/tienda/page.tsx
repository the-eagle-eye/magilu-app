import { prisma } from '@/lib/prisma'
import { getConvertedSizes } from '@/lib/sizeConversion'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function TiendaPage() {
  const shoes = await prisma.shoe.findMany({
    where: { estado: 'disponible' },
    include: { fotos: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-black text-white px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">MAGILU</h1>
        <p className="text-xs text-white/50 mt-0.5">Calzado disponible</p>
      </header>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {shoes.length === 0 ? (
          <p className="text-center text-gray-400 mt-20">No hay productos disponibles en este momento.</p>
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
                        src={`/uploads/${mainPhoto.path}`}
                        alt={shoe.modelo}
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

                    {/* Sizes */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-medium">
                        EUR {shoe.eurSize}
                      </span>
                      {sizes?.us && (
                        <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-medium">
                          US {sizes.us}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    {shoe.precio != null && (
                      <p className="text-base font-bold text-gray-900 mt-2">
                        S/ {shoe.precio.toFixed(2)}
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
