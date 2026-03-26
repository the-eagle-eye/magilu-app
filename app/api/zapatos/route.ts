import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getUploadDir } from '@/lib/upload-dir'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const marca = searchParams.get('marca')
  const estado = searchParams.get('estado')
  const genero = searchParams.get('genero')
  const eurSize = searchParams.get('eurSize')
  const q = searchParams.get('q')
  const tallas = searchParams.get('tallas')

  if (tallas) {
    const rows = await prisma.shoe.findMany({
      select: { eurSize: true },
      distinct: ['eurSize'],
      orderBy: { eurSize: 'asc' },
    })
    return NextResponse.json(rows.map(r => r.eurSize))
  }

  const shoes = await prisma.shoe.findMany({
    where: {
      ...(marca && { marca }),
      ...(estado && { estado }),
      ...(genero && { genero }),
      ...(eurSize && { eurSize: parseFloat(eurSize) }),
      ...(q && {
        OR: [
          { modelo: { contains: q } },
          { marca: { contains: q } },
          { color: { contains: q } },
          { sku: { contains: q } },
        ],
      }),
    },
    include: { fotos: true },
    orderBy: [{ marca: 'asc' }, { eurSize: 'asc' }, { modelo: 'asc' }],
  })

  return NextResponse.json(shoes)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const modelo = formData.get('modelo') as string
  const marca = formData.get('marca') as string
  const eurSize = parseFloat(formData.get('eurSize') as string)
  const usSize = formData.get('usSize') ? parseFloat(formData.get('usSize') as string) : null
  const ukSize = formData.get('ukSize') ? parseFloat(formData.get('ukSize') as string) : null
  const color = (formData.get('color') as string) || null
  const tipo = (formData.get('tipo') as string) || 'Zapatilla'
  const genero = (formData.get('genero') as string) || 'hombre'
  const precio = formData.get('precio') ? parseFloat(formData.get('precio') as string) : null
  const precioVenta = formData.get('precioVenta') ? parseFloat(formData.get('precioVenta') as string) : null
  const estado = (formData.get('estado') as string) || 'disponible'
  const notas = (formData.get('notas') as string) || null
  const sku = (formData.get('sku') as string) || null

  const shoe = await prisma.shoe.create({
    data: { modelo, marca, eurSize, usSize, ukSize, color, tipo, genero, precio, precioVenta, estado, notas, sku },
  })

  const uploadDir = getUploadDir()
  await mkdir(uploadDir, { recursive: true })

  // Guardar fotos del zapato
  const fotoFiles = formData.getAll('fotos') as File[]
  for (let i = 0; i < fotoFiles.length; i++) {
    const file = fotoFiles[i]
    if (!file.size) continue
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${shoe.id}-${Date.now()}-${i}-${file.name.replace(/\s/g, '_')}`
    await writeFile(path.join(uploadDir, filename), buffer)
    await prisma.shoePhoto.create({
      data: { shoeId: shoe.id, path: `/uploads/${filename}`, tipo: 'zapato', esPrincipal: i === 0 },
    })
  }

  // Guardar foto de etiqueta (si viene)
  const etiquetaFile = formData.get('etiqueta') as File | null
  if (etiquetaFile?.size) {
    const buffer = Buffer.from(await etiquetaFile.arrayBuffer())
    const filename = `${shoe.id}-etiqueta-${Date.now()}-${etiquetaFile.name.replace(/\s/g, '_')}`
    await writeFile(path.join(uploadDir, filename), buffer)
    await prisma.shoePhoto.create({
      data: { shoeId: shoe.id, path: `/uploads/${filename}`, tipo: 'etiqueta', esPrincipal: false },
    })
  }

  return NextResponse.json(shoe, { status: 201 })
}
