import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET() {
  const shoes = await prisma.shoe.findMany({
    orderBy: [{ marca: 'asc' }, { eurSize: 'asc' }, { modelo: 'asc' }],
  })

  const rows = shoes.map(s => ({
    Modelo: s.modelo,
    Marca: s.marca,
    'EUR': s.eurSize,
    'US': s.usSize ?? '',
    'UK': s.ukSize ?? '',
    Color: s.color ?? '',
    Tipo: s.tipo,
    Género: s.genero,
    'Precio Costo (S/)': s.precio ?? '',
    'Precio Venta (S/)': s.precioVenta ?? '',
    Estado: s.estado,
    SKU: s.sku ?? '',
    Notas: s.notas ?? '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 30 }, { wch: 20 }, { wch: 6 }, { wch: 6 }, { wch: 6 },
    { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 18 },
    { wch: 12 }, { wch: 15 }, { wch: 30 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="inventario_magilu.xlsx"',
    },
  })
}
