import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  StyleSheet,
} from '@react-pdf/renderer'

const BLACK    = '#0a0a0a'
const GOLD     = '#c8973a'
const GOLD_LT  = '#e8b55a'
const WHITE    = '#ffffff'
const GRAY     = '#6b7280'
const GRAY_LT  = '#f3f4f6'
const BORDER   = '#e5e7eb'
const GREEN    = '#16a34a'
const GREEN_LT = '#dcfce7'
const RED      = '#dc2626'

// ─── Layout (A4 = 595 × 842 pt) ──────────────────────────────────────────────
const PAGE_H    = 842
const COVER_H   = 100
const MINI_H    = 32
const DIV_H     = 3
const FOOTER_H  = 40
const PAD_H     = 12   // padding horizontal del grid
const PAD_T     = 10
const PAD_B     = 10
const ROW_GAP   = 10
const COL_GAP   = 10
const ROWS      = 2
const COLS      = 2
const PER_PAGE  = ROWS * COLS

// Altura disponible para 2 filas (primera página)
const AVAIL = PAGE_H - COVER_H - DIV_H - FOOTER_H - PAD_T - PAD_B
const ROW_H = (AVAIL - ROW_GAP) / ROWS   // ≈ 319

// Cuerpo de card:
//  price_block: 6(padV) + 6(padV) + 14(price) = 26
//  info_block: 8(padT) + 10(modelo) + 2 + 8(marca) + 5 + 9(talla) + 7 + 22(wa_btn) + 8(padB) = 79
// total body ≈ 105
const CARD_BODY_H = 108
const IMAGE_H     = Math.floor(ROW_H - CARD_BODY_H)  // ≈ 211

const CARD_W = (595 - PAD_H * 2 - COL_GAP) / 2   // ≈ 280
// ─────────────────────────────────────────────────────────────────────────────

type ShoeWithImage = {
  id: string
  modelo: string
  marca: string
  eurSize: number
  usSize: number | null
  ukSize: number | null
  color: string | null
  tipo: string
  genero: string
  precio: number | null
  precioVenta: number | null
  estado: string
  notas: string | null
  sku: string | null
  imageData: string | null
}

type Props = {
  shoes: ShoeWithImage[]
  titulo: string
  incluirPrecio: boolean
  incluirTallas: boolean
  whatsapp: string
}

const S = StyleSheet.create({
  page: { backgroundColor: WHITE, fontFamily: 'Helvetica' },

  cover: {
    backgroundColor: BLACK,
    height: COVER_H,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandName: { fontSize: 34, fontFamily: 'Helvetica-Bold', color: GOLD, letterSpacing: 5 },
  brandTagline: { fontSize: 7, color: '#9ca3af', letterSpacing: 3, marginTop: 3 },
  catTitle: { fontSize: 9, color: GOLD_LT, fontFamily: 'Helvetica-Bold', letterSpacing: 2, textAlign: 'right' },
  catCount: { fontSize: 7, color: '#6b7280', textAlign: 'right', marginTop: 2, letterSpacing: 1 },

  miniHeader: {
    backgroundColor: BLACK, height: MINI_H,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 22, justifyContent: 'space-between',
  },
  divider: { height: DIV_H, backgroundColor: GOLD },

  grid: {
    paddingHorizontal: PAD_H,
    paddingTop: PAD_T,
    paddingBottom: PAD_B,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  card: {
    width: CARD_W,
    height: ROW_H,
    backgroundColor: WHITE,
    borderRadius: 7,
    border: `1 solid ${BORDER}`,
    overflow: 'hidden',
    marginBottom: ROW_GAP,
  },

  // ── Imagen ──────────────────────────────────────────────────────────────────
  imageBox: { width: '100%', height: IMAGE_H, backgroundColor: GRAY_LT },
  img: { width: '100%', height: '100%', objectFit: 'contain' },
  noImg: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

  // ── Bloque de precio (debajo de la imagen, encima del cuerpo) ───────────────
  priceBlock: {
    backgroundColor: BLACK,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Precio simple
  priceSimple: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: GOLD },

  // Antes / Ahora
  antesRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  antesWrap: { position: 'relative' },
  antesText: { fontSize: 9, color: '#9ca3af' },
  tacho: {
    position: 'absolute',
    height: 1,
    backgroundColor: RED,
    top: '50%',
    left: 0,
    right: 0,
  },
  ahoraWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  ahoraLabel: { fontSize: 7, color: GOLD_LT, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  ahoraPrice: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: GOLD },

  // ── Cuerpo de card ──────────────────────────────────────────────────────────
  body: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 8 },
  modelo: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 2 },
  marca:  { fontSize: 7, color: GRAY, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5 },

  // Talla en formato limpio: "Talla 38.5  (US 8 / UK 5.5)"
  tallaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  tallaChip: {
    backgroundColor: '#fef3c7',
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    border: `0.5 solid #fde68a`,
    marginRight: 5,
  },
  tallaChipTxt: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400e' },
  tallaExtra: { fontSize: 8, color: GRAY },

  // ── Botón WhatsApp ──────────────────────────────────────────────────────────
  waBtn: {
    backgroundColor: GREEN,
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  waBtnTxt: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: WHITE, letterSpacing: 0.3 },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: FOOTER_H, backgroundColor: BLACK,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 24,
  },
  footerBrand: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: GOLD, letterSpacing: 3 },
  footerNote: { fontSize: 6, color: '#9ca3af', textAlign: 'right', lineHeight: 1.6 },
})

function PriceBlock({ precio, precioVenta }: { precio: number | null; precioVenta: number | null }) {
  if (!precioVenta) return <View style={{ height: 0 }} />

  const tieneAntes = precio != null

  return (
    <View style={S.priceBlock}>
      {tieneAntes ? (
        // Antes / Ahora
        <View style={S.antesRow}>
          <View style={S.antesWrap}>
            <Text style={S.antesText}>S/ {precio!.toFixed(2)}</Text>
            <View style={S.tacho} />
          </View>
        </View>
      ) : (
        <View />
      )}
      <View style={S.ahoraWrap}>
        {tieneAntes && <Text style={S.ahoraLabel}>AHORA</Text>}
        <Text style={S.ahoraPrice}>S/ {precioVenta.toFixed(2)}</Text>
      </View>
    </View>
  )
}

function TallaLine({ eurSize, usSize, ukSize }: { eurSize: number; usSize: number | null; ukSize: number | null }) {
  const extras: string[] = []
  if (usSize) extras.push(`US ${usSize}`)
  if (ukSize) extras.push(`UK ${ukSize}`)
  const extraStr = extras.length ? `  (${extras.join(' / ')})` : ''

  return (
    <View style={S.tallaRow}>
      <View style={S.tallaChip}>
        <Text style={S.tallaChipTxt}>EUR {eurSize}</Text>
      </View>
      {extraStr ? <Text style={S.tallaExtra}>{extraStr}</Text> : null}
    </View>
  )
}

function Card({ shoe, incluirPrecio, incluirTallas, whatsapp, marginRight }: {
  shoe: ShoeWithImage
  incluirPrecio: boolean
  incluirTallas: boolean
  whatsapp: string
  marginRight?: number
}) {
  const msg = encodeURIComponent(
    `Hola MAGILU! Me interesa el modelo *${shoe.modelo}* (${shoe.marca}) talla EUR ${shoe.eurSize}. ¿Está disponible?`
  )
  const waUrl = `https://wa.me/${whatsapp}?text=${msg}`

  return (
    <View style={[S.card, marginRight ? { marginRight } : {}]}>
      {/* Imagen */}
      <View style={S.imageBox}>
        {shoe.imageData
          ? <Image src={shoe.imageData} style={S.img} />
          : <View style={S.noImg}><Text style={{ fontSize: 20, color: '#d1d5db' }}>—</Text></View>
        }
      </View>

      {/* Precio debajo de la imagen */}
      {incluirPrecio && <PriceBlock precio={shoe.precio} precioVenta={shoe.precioVenta} />}

      {/* Info */}
      <View style={S.body}>
        <Text style={S.modelo}>{shoe.modelo}</Text>
        <Text style={S.marca}>{shoe.marca}</Text>

        {incluirTallas && (
          <TallaLine eurSize={shoe.eurSize} usSize={shoe.usSize} ukSize={shoe.ukSize} />
        )}

        {/* CTA WhatsApp */}
        {whatsapp ? (
          <Link src={waUrl} style={{ textDecoration: 'none' }}>
            <View style={S.waBtn}>
              <Text style={S.waBtnTxt}>Comprar por WhatsApp</Text>
            </View>
          </Link>
        ) : (
          <View style={[S.waBtn, { backgroundColor: GREEN }]}>
            <Text style={S.waBtnTxt}>Comprar por WhatsApp</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export function CatalogoPDF({ shoes, titulo, incluirPrecio, incluirTallas, whatsapp }: Props) {
  const chunks: ShoeWithImage[][] = []
  for (let i = 0; i < shoes.length; i += PER_PAGE) {
    chunks.push(shoes.slice(i, i + PER_PAGE))
  }

  return (
    <Document title={titulo} author="MAGILU">
      {chunks.map((chunk, pageIdx) => (
        <Page key={pageIdx} size="A4" style={S.page}>

          {pageIdx === 0 ? (
            <>
              <View style={S.cover}>
                <View>
                  <Text style={S.brandName}>MAGILU</Text>
                  <Text style={S.brandTagline}>PREMIUM FOOTWEAR</Text>
                </View>
                <View>
                  <Text style={S.catTitle}>{titulo.toUpperCase()}</Text>
                  <Text style={S.catCount}>{shoes.length} MODELOS DISPONIBLES</Text>
                </View>
              </View>
              <View style={S.divider} />
            </>
          ) : (
            <>
              <View style={S.miniHeader}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: GOLD, letterSpacing: 3 }}>MAGILU</Text>
                <Text style={{ fontSize: 7, color: '#9ca3af', letterSpacing: 1 }}>{titulo.toUpperCase()}</Text>
              </View>
              <View style={S.divider} />
            </>
          )}

          <View style={S.grid}>
            {chunk.map((shoe, i) => (
              <Card
                key={shoe.id}
                shoe={shoe}
                incluirPrecio={incluirPrecio}
                incluirTallas={incluirTallas}
                whatsapp={whatsapp}
                marginRight={i % COLS === 0 ? COL_GAP : 0}
              />
            ))}
          </View>

          <View style={S.footer}>
            <Text style={S.footerBrand}>MAGILU</Text>
            <Text style={S.footerNote}>{'Consultas y pedidos por WhatsApp\nMagilu Premium Footwear'}</Text>
          </View>

        </Page>
      ))}
    </Document>
  )
}
