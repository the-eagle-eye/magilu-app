import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getUploadDir } from '@/lib/upload-dir'
import sharp from 'sharp'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const formData = await req.formData()
  const fotoFiles = formData.getAll('fotos') as File[]

  const uploadDir = getUploadDir()
  await mkdir(uploadDir, { recursive: true })

  const existingCount = await prisma.shoePhoto.count({ where: { shoeId: id } })

  const created = []
  for (let i = 0; i < fotoFiles.length; i++) {
    const file = fotoFiles[i]
    if (!file.size) continue
    const rawBuffer = Buffer.from(await file.arrayBuffer())
    if (rawBuffer.length < 5000) continue
    const buffer = await sharp(rawBuffer)
      .rotate()
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer()
    const filename = `${id}-${Date.now()}-${i}.jpg`
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    const photo = await prisma.shoePhoto.create({
      data: {
        shoeId: id,
        path: `/uploads/${filename}`,
        tipo: 'zapato',
        esPrincipal: existingCount === 0 && i === 0,
      },
    })
    created.push(photo)
  }

  return NextResponse.json(created, { status: 201 })
}
