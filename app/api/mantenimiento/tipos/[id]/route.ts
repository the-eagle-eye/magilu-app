import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { nombre } = await req.json()
  if (!nombre?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }
  const tipo = await prisma.tipo.update({
    where: { id: params.id },
    data: { nombre: nombre.trim() },
  })
  return NextResponse.json(tipo)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.tipo.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
