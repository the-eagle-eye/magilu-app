import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 503 })
  }

  const formData = await req.formData()
  const file = formData.get('imagen') as File
  if (!file?.size) {
    return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')
  const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp'

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Analiza esta etiqueta de zapato y extrae la información visible.
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, con estos campos (usa null si no se ve):
{
  "marca": string | null,
  "modelo": string | null,
  "sku": string | null,
  "eurSize": number | null,
  "usSize": number | null,
  "ukSize": number | null,
  "color": string | null,
  "genero": "hombre" | "mujer" | null
}

Notas:
- "marca" es la marca del zapato (ALDO, Clarks, Adidas, etc.)
- "modelo" es el nombre del modelo o número de artículo
- "sku" es el código de producto/referencia
- Los tamaños pueden aparecer como EUR/EU, US, UK — extrae solo el número
- Para género: si dice MEN/HOMME/CABALLERO → "hombre", WOMEN/FEMME/DAMA → "mujer"`,
          },
        ],
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const match = text.match(/\{[\s\S]*\}/)
    const data = JSON.parse(match?.[0] ?? text)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'No se pudo interpretar la respuesta', raw: text }, { status: 422 })
  }
}
