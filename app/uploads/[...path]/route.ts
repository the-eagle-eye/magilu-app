import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jpge: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const filePath = path.join(process.cwd(), 'public', 'uploads', ...segments)

  try {
    const file = await readFile(filePath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const contentType = MIME[ext] ?? 'application/octet-stream'
    return new NextResponse(file, { headers: { 'Content-Type': contentType } })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
