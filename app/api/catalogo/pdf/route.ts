import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { CatalogoPDF } from '@/components/catalogo/CatalogoPDF'
import path from 'path'
import fs from 'fs'
import { processShoeImage, processEtiquetaImage } from '@/lib/imageProcessor'

const BRANDS_DIR = path.join(process.cwd(), 'brands')

/** Finds a brand logo file by normalizing the marca name to a filename. */
function getBrandLogoPath(marca: string): string | null {
  const normalized = marca.trim().toLowerCase().replace(/\s+/g, '_')
  for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
    const filePath = path.join(BRANDS_DIR, `${normalized}${ext}`)
    if (fs.existsSync(filePath)) return filePath
  }
  return null
}

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

  // Deduplicar: mismo marca+modelo+talla → conservar el primero
  const seen = new Set<string>()
  const uniqueShoes = shoes.filter(shoe => {
    const key = `${shoe.marca.trim().toLowerCase()}::${shoe.modelo.trim().toLowerCase()}::${shoe.eurSize}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Dimensiones por slot (2× resolución de los pt del PDF)
  // Main (right col): 357 × 570 pt → 714 × 1140 px
  // Small (left col): 238 × 285 pt → 476 × 570 px
  const shoesWithImages = await Promise.all(uniqueShoes.map(async shoe => {
    const productPhotos = shoe.fotos
      .filter(f => f.tipo !== 'etiqueta')
      .sort((a, b) => (b.esPrincipal ? 1 : 0) - (a.esPrincipal ? 1 : 0))

    const toPath = (p?: typeof productPhotos[0]) =>
      p ? path.join(process.cwd(), 'public', p.path) : null

    const brandLogoPath = getBrandLogoPath(shoe.marca)

    const [imageData, imageData2, imageData3, etiquetaData] = await Promise.all([
      toPath(productPhotos[0]) ? processShoeImage(toPath(productPhotos[0])!, 714, 1140) : Promise.resolve(null),
      toPath(productPhotos[1]) ? processShoeImage(toPath(productPhotos[1])!, 476, 570) : Promise.resolve(null),
      toPath(productPhotos[2]) ? processShoeImage(toPath(productPhotos[2])!, 476, 570) : Promise.resolve(null),
      brandLogoPath ? processEtiquetaImage(brandLogoPath) : Promise.resolve(null),
    ])

    return { ...shoe, imageData, imageData2, imageData3, etiquetaData }
  }))

  // Drop shoes with no valid main image — they would produce blank pages
  const validShoes = shoesWithImages.filter(s => !!s.imageData)
  validShoes.forEach(s => console.log(`[catalogo/pdf] Including: ${s.marca} ${s.modelo}`))
  shoesWithImages
    .filter(s => !s.imageData)
    .forEach(s => console.warn(`[catalogo/pdf] Skipped (no image): ${s.marca} ${s.modelo} (${s.id})`))

  const brands = [...new Set(validShoes.map(s => s.marca))].sort()

  // Load preview images from /images/ folder
  const imagesDir = path.join(process.cwd(), 'images')
  const previewImages: string[] = fs.existsSync(imagesDir)
    ? fs.readdirSync(imagesDir)
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .sort()
        .map(f => {
          const buf = fs.readFileSync(path.join(imagesDir, f))
          const ext = path.extname(f).slice(1).toLowerCase().replace('jpg', 'jpeg')
          return `data:image/${ext};base64,${buf.toString('base64')}`
        })
    : []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(CatalogoPDF as any, {
    shoes: validShoes,
    titulo,
    incluirPrecio,
    incluirTallas,
    whatsapp,
    brands,
    previewImages,
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
