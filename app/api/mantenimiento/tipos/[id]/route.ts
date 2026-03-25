import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { nombre } = await req.json()
  if (!nombre?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }
  const tipo = await prisma.tipo.update({
    where: { id },
    data: { nombre: nombre.trim() },
  })
  return NextResponse.json(tipo)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.tipo.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
