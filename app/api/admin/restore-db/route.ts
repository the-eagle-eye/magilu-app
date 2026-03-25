import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const RESTORE_SECRET = process.env.RESTORE_SECRET

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-restore-secret')

  if (!RESTORE_SECRET || secret !== RESTORE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbPath = (process.env.DATABASE_URL ?? 'file:/app/data/db/prod.db').replace('file:', '')
  await mkdir(path.dirname(dbPath), { recursive: true })

  const data = await req.arrayBuffer()
  await writeFile(dbPath, Buffer.from(data))

  return NextResponse.json({ ok: true, written: data.byteLength, path: dbPath })
}
