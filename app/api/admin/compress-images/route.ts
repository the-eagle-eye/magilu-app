import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { getUploadDir } from '@/lib/upload-dir'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const photos = await prisma.shoePhoto.findMany({ select: { id: true, path: true, tipo: true } })
  const uploadDir = getUploadDir()

  let processed = 0
  let skipped = 0
  const errors: string[] = []

  for (const photo of photos) {
    // photo.path is like /uploads/filename.jpg — strip the /uploads/ prefix
    const filename = photo.path.replace(/^\/uploads\//, '')
    const filepath = path.join(uploadDir, filename)

    try {
      const raw = await readFile(filepath)

      // Skip if already small (already compressed)
      if (raw.length < 200 * 1024) { skipped++; continue }

      const compressed = await sharp(raw)
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer()

      // Only overwrite if we actually made it smaller
      if (compressed.length >= raw.length) { skipped++; continue }

      await writeFile(filepath, compressed)
      processed++
    } catch {
      errors.push(photo.path)
    }
  }

  return NextResponse.json({ processed, skipped, errors, total: photos.length })
}
