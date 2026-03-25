import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getUploadDir } from '@/lib/upload-dir'

const RESTORE_SECRET = process.env.RESTORE_SECRET

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-restore-secret')
  if (!RESTORE_SECRET || secret !== RESTORE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const filename = req.headers.get('x-filename')
  if (!filename) {
    return NextResponse.json({ error: 'Missing x-filename header' }, { status: 400 })
  }

  const filePath = path.join(getUploadDir(), filename)
  await mkdir(path.dirname(filePath), { recursive: true })

  const data = await req.arrayBuffer()
  await writeFile(filePath, Buffer.from(data))

  return NextResponse.json({ ok: true, file: filename, written: data.byteLength })
}
