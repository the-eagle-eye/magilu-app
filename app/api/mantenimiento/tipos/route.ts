import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tipos = await prisma.tipo.findMany({ orderBy: { nombre: 'asc' } })
  return NextResponse.json(tipos)
}

export async function POST(req: NextRequest) {
  const { nombre } = await req.json()
  if (!nombre?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }
  const tipo = await prisma.tipo.create({ data: { nombre: nombre.trim() } })
  return NextResponse.json(tipo, { status: 201 })
}
