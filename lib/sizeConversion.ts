// EUR → US / UK para hombre y mujer
const menSizes: Record<number, { us: number; uk: number }> = {
  39: { us: 6, uk: 5.5 },
  39.5: { us: 6.5, uk: 6 },
  40: { us: 7, uk: 6.5 },
  40.5: { us: 7.5, uk: 7 },
  41: { us: 8, uk: 7.5 },
  41.5: { us: 8.5, uk: 8 },
  42: { us: 9, uk: 8.5 },
  42.5: { us: 9.5, uk: 9 },
  43: { us: 10, uk: 9.5 },
  43.5: { us: 10.5, uk: 10 },
  44: { us: 11, uk: 10.5 },
  44.5: { us: 11.5, uk: 11 },
  45: { us: 12, uk: 11.5 },
  45.5: { us: 12.5, uk: 12 },
  46: { us: 13, uk: 12.5 },
  47: { us: 14, uk: 13 },
}

const womenSizes: Record<number, { us: number; uk: number }> = {
  35: { us: 5, uk: 2.5 },
  35.5: { us: 5.5, uk: 3 },
  36: { us: 6, uk: 3.5 },
  36.5: { us: 6.5, uk: 4 },
  37: { us: 6.5, uk: 4 },
  37.5: { us: 7, uk: 4.5 },
  38: { us: 7.5, uk: 5 },
  38.5: { us: 8, uk: 5.5 },
  39: { us: 8.5, uk: 6 },
  40: { us: 9, uk: 6.5 },
  40.5: { us: 9.5, uk: 7 },
  41: { us: 10, uk: 7.5 },
}

export function getConvertedSizes(eur: number, genero: string) {
  const table = genero === 'mujer' ? womenSizes : menSizes
  return table[eur] ?? null
}

export function formatSize(size: number | null | undefined): string {
  if (size == null) return '—'
  return size % 1 === 0 ? String(size) : String(size)
}
