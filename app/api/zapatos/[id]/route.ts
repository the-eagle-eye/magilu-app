import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shoe = await prisma.shoe.findUnique({
    where: { id },
    include: { fotos: { orderBy: { esPrincipal: 'desc' } } },
  })
  if (!shoe) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(shoe)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const shoe = await prisma.shoe.update({
    where: { id },
    data: {
      modelo: body.modelo,
      marca: body.marca,
      eurSize: body.eurSize,
      usSize: body.usSize ?? null,
      ukSize: body.ukSize ?? null,
      color: body.color ?? null,
      tipo: body.tipo,
      genero: body.genero,
      precio: body.precio ?? null,
      precioVenta: body.precioVenta ?? null,
      estado: body.estado,
      notas: body.notas ?? null,
      sku: body.sku ?? null,
    },
    include: { fotos: true },
  })

  return NextResponse.json(shoe)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fotos = await prisma.shoePhoto.findMany({ where: { shoeId: id } })
  for (const foto of fotos) {
    try {
      await unlink(path.join(process.cwd(), 'public', foto.path))
    } catch {}
  }

  await prisma.shoe.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  if (body.estado) {
    const shoe = await prisma.shoe.update({
      where: { id },
      data: { estado: body.estado },
    })
    return NextResponse.json(shoe)
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}
