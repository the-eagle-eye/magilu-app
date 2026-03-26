import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // DATABASE_URL is like "file:/app/prisma/data/prod.db"
  const dbUrl = process.env.DATABASE_URL ?? ''
  const dbPath = dbUrl.replace(/^file:/, '')

  if (!dbPath) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  }

  try {
    const file = await readFile(path.resolve(dbPath))
    const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="magilu-${date}.db"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Could not read database file' }, { status: 500 })
  }
}
