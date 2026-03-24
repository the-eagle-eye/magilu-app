import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { CatalogoPDF } from '@/components/catalogo/CatalogoPDF'
import path from 'path'
import { processShoeImage } from '@/lib/imageProcessor'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { ids, titulo, incluirPrecio, incluirTallas } = body as {
    ids: string[]
    titulo: string
    incluirPrecio: boolean
    incluirTallas: boolean
  }

  const whatsapp = process.env.WHATSAPP_NUMBER ?? ''

  if (!ids?.length) {
    return NextResponse.json({ error: 'No se especificaron zapatos' }, { status: 400 })
  }

  const shoes = await prisma.shoe.findMany({
    where: { id: { in: ids } },
    include: { fotos: { orderBy: { esPrincipal: 'desc' } } },
    orderBy: [{ marca: 'asc' }, { eurSize: 'asc' }, { modelo: 'asc' }],
  })

  // Procesar imágenes: eliminar fondo + mejoras visuales con sharp
  const shoesWithImages = await Promise.all(shoes.map(async shoe => {
    const foto = shoe.fotos.find(f => f.esPrincipal && f.tipo !== 'etiqueta')
      ?? shoe.fotos.find(f => f.tipo !== 'etiqueta')
    let imageData: string | null = null
    if (foto) {
      const filePath = path.join(process.cwd(), 'public', foto.path)
      imageData = await processShoeImage(filePath)
    }
    return { ...shoe, imageData }
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(CatalogoPDF as any, {
    shoes: shoesWithImages,
    titulo,
    incluirPrecio,
    incluirTallas,
    whatsapp,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(element as any)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${titulo.replace(/\s+/g, '_')}.pdf"`,
    },
  })
}
