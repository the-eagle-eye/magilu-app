import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'
import { getUploadDir } from '@/lib/upload-dir'

const BRANDS_DIR = path.join(process.cwd(), 'brands')

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const formData = await req.formData()
  const nombre = (formData.get('nombre') as string)?.trim()
  const file = formData.get('logo') as File | null

  if (!nombre) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  const existing = await prisma.marca.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  let logoPath = existing.logoPath

  if (file && file.size > 0) {
    // Remove old file
    if (existing.logoPath) {
      const oldAbs = path.join(getUploadDir(), existing.logoPath.replace(/^\/uploads\//, ''))
      if (fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs)
    }

    const uploadsDir = getUploadDir('marcas')
    fs.mkdirSync(uploadsDir, { recursive: true })
    fs.mkdirSync(BRANDS_DIR, { recursive: true })

    const ext = path.extname(file.name).toLowerCase() || '.jpg'
    const fileName = `${Date.now()}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    fs.writeFileSync(path.join(uploadsDir, fileName), buffer)
    logoPath = `/uploads/marcas/${fileName}`

    const normalized = nombre.toLowerCase().replace(/\s+/g, '_')
    fs.writeFileSync(path.join(BRANDS_DIR, `${normalized}${ext}`), buffer)
  }

  const marca = await prisma.marca.update({
    where: { id },
    data: { nombre, logoPath },
  })
  return NextResponse.json(marca)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.marca.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  if (existing.logoPath) {
    const abs = path.join(getUploadDir(), existing.logoPath.replace(/^\/uploads\//, ''))
    if (fs.existsSync(abs)) fs.unlinkSync(abs)
  }

  await prisma.marca.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
