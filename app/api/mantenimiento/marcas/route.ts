import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

const BRANDS_DIR = path.join(process.cwd(), 'brands')

export async function GET() {
  const marcas = await prisma.marca.findMany({ orderBy: { nombre: 'asc' } })
  return NextResponse.json(marcas)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const nombre = (formData.get('nombre') as string)?.trim()
  const file = formData.get('logo') as File | null

  if (!nombre) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  let logoPath: string | null = null

  if (file && file.size > 0) {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'marcas')
    fs.mkdirSync(uploadsDir, { recursive: true })
    fs.mkdirSync(BRANDS_DIR, { recursive: true })

    const ext = path.extname(file.name).toLowerCase() || '.jpg'
    const fileName = `${Date.now()}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    fs.writeFileSync(path.join(uploadsDir, fileName), buffer)
    logoPath = `/uploads/marcas/${fileName}`

    // Mirror to /brands/ so the catalog PDF picks it up automatically
    const normalized = nombre.toLowerCase().replace(/\s+/g, '_')
    fs.writeFileSync(path.join(BRANDS_DIR, `${normalized}${ext}`), buffer)
  }

  const marca = await prisma.marca.create({ data: { nombre, logoPath } })
  return NextResponse.json(marca, { status: 201 })
}
