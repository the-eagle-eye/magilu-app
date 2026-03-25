import sharp from 'sharp'

/**
 * Resize a shoe photo to the given dimensions using cover fit (fills the box, no white bars).
 */
export async function processShoeImage(
  filePath: string,
  width = 700,
  height = 700,
): Promise<string | null> {
  try {
    // Reject files smaller than 5 KB — likely corrupt or wrong file
    const { size } = await import('fs').then(fs => fs.promises.stat(filePath))
    if (size < 5000) return null

    const buffer = await sharp(filePath)
      .rotate()  // auto-rotate based on EXIF orientation
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer()
    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

/**
 * Resize a brand logo image (contain fit so the full logo is visible on white).
 */
export async function processEtiquetaImage(filePath: string): Promise<string | null> {
  try {
    const buffer = await sharp(filePath)
      .trim({ threshold: 30 })
      .resize(400, 200, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer()
    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}
