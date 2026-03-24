import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { id, photoId } = await params
  const body = await req.json()

  if (body.esPrincipal) {
    await prisma.shoePhoto.updateMany({
      where: { shoeId: id },
      data: { esPrincipal: false },
    })
    const photo = await prisma.shoePhoto.update({
      where: { id: photoId },
      data: { esPrincipal: true },
    })
    return NextResponse.json(photo)
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { id, photoId } = await params
  const photo = await prisma.shoePhoto.findUnique({ where: { id: photoId } })
  if (!photo) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  try {
    await unlink(path.join(process.cwd(), 'public', photo.path))
  } catch {}

  await prisma.shoePhoto.delete({ where: { id: photoId } })

  if (photo.esPrincipal) {
    const next = await prisma.shoePhoto.findFirst({ where: { shoeId: id } })
    if (next) {
      await prisma.shoePhoto.update({ where: { id: next.id }, data: { esPrincipal: true } })
    }
  }

  return NextResponse.json({ ok: true })
}
