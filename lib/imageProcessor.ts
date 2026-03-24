import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

/**
 * Procesa una imagen de zapato para el catálogo PDF:
 * 1. Elimina el fondo (si @imgly/background-removal-node está disponible)
 * 2. Mejora brillo, contraste y nitidez con sharp
 * 3. Devuelve JPEG base64 listo para embeber en PDF
 */
export async function processShoeImage(filePath: string): Promise<string | null> {
  try {
    let inputBuffer = fs.readFileSync(filePath)

    // --- Paso 1: Eliminación de fondo ---
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { removeBackground } = require('@imgly/background-removal-node')
      const blob: Blob = await removeBackground(filePath)
      const arrayBuffer = await blob.arrayBuffer()
      inputBuffer = Buffer.from(arrayBuffer)
    } catch {
      // Si falla (sin modelo descargado, sin memoria, etc.) continúa sin eliminar fondo
    }

    // --- Paso 2: Mejoras con sharp ---
    const jpeg = await sharp(inputBuffer)
      // Recortar whitespace / fondo uniforme si quedó
      .trim({ threshold: 25 })
      // Normalizar niveles (auto-contraste)
      .normalize()
      // Mejorar vibrance / saturación suavemente
      .modulate({ saturation: 1.15, brightness: 1.02 })
      // Nitidez: sigma bajo = sutil pero efectivo
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 0.5 })
      // Ajuste de gamma para que los oscuros no se pierdan
      .gamma(1.1)
      // Fondo blanco para transparencias PNG (si se eliminó el fondo)
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      // Encuadrar con padding en fondo blanco
      .resize(500, 500, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer()

    return `data:image/jpeg;base64,${jpeg.toString('base64')}`
  } catch {
    return null
  }
}
