import { Suspense } from 'react'
import InventarioContent from './InventarioContent'

export default function InventarioPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Cargando...</div>}>
      <InventarioContent />
    </Suspense>
  )
}
