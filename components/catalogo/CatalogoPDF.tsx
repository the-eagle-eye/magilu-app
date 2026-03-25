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
const RED      = '#dc2626'
const YELLOW   = '#FFE033'

// ─── A4 dimensions ────────────────────────────────────────────────────────────
const PAGE_W        = 595
const PAGE_H        = 842

// ─── Product page layout (1 shoe per page) ────────────────────────────────────
const HEADER_H      = 90    // black header: brand box only
const IMG_GRID_H    = 612   // 3-image section
const PROD_FOOTER_H = 130   // white footer: name + price + size + WA button
// 90 + 612 + 130 = 832 (10pt buffer under 842)

const IMG_LEFT_W    = Math.floor(PAGE_W * 0.40)  // 238pt
const IMG_RIGHT_W   = PAGE_W - IMG_LEFT_W          // 357pt
const IMG_SMALL_H   = IMG_GRID_H / 2               // 260pt each

// ─── Cover page helpers ───────────────────────────────────────────────────────
const MINI_H        = 32

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
  imageData: string | null    // principal → right col (large)
  imageData2: string | null   // secondary → top-left small
  imageData3: string | null   // tertiary → bottom-left small
  etiquetaData: string | null // brand logo for header white box
}

type Props = {
  shoes: ShoeWithImage[]
  titulo: string
  incluirPrecio: boolean
  incluirTallas: boolean
  whatsapp: string
  brands: string[]
  previewImages: string[]
}

const S = StyleSheet.create({
  page: { backgroundColor: WHITE, fontFamily: 'Helvetica' },

  // ── Cover Page (Caratula) ─────────────────────────────────────────────────
  coverPage: {
    backgroundColor: BLACK,
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    position: 'relative',
  },
  coverTopArea: {
    paddingTop: 48,
    paddingHorizontal: 44,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  coverCatLabel: {
    fontSize: 72,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: 4,
    lineHeight: 1,
  },
  coverYear: {
    fontSize: 72,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    letterSpacing: 4,
    lineHeight: 1,
    marginTop: 2,
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    letterSpacing: 2,
    marginTop: 10,
    fontFamily: 'Helvetica',
  },
  coverCardArea: {
    paddingHorizontal: 44,
    marginTop: 36,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverBrandCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    width: 220,
  },
  coverBrandCardTitle: {
    fontSize: 7,
    color: GRAY,
    letterSpacing: 2,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  coverBrandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  coverBrandItem: {
    width: '50%',
    paddingVertical: 4,
    paddingRight: 4,
  },
  coverBrandText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    letterSpacing: 0.5,
  },
  coverBadge: {
    backgroundColor: GOLD,
    borderRadius: 44,
    width: 88,
    height: 88,
    marginLeft: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadgePct: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    lineHeight: 1,
  },
  coverBadgeLbl: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    letterSpacing: 1,
  },
  coverImgRow: {
    flexDirection: 'row',
    height: 360,
    marginTop: 28,
    gap: 4,
  },
  coverImgItem: {
    flex: 1,
    height: 360,
    objectFit: 'cover',
  },
  coverBottomStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBottomText: {
    fontSize: 11,
    color: '#9ca3af',
    letterSpacing: 6,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Product page (1 per shoe) ─────────────────────────────────────────────
  productPage: { backgroundColor: WHITE, fontFamily: 'Helvetica', flexDirection: 'column' },

  prodHeader: {
    backgroundColor: BLACK,
    height: HEADER_H,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  brandBox: {
    backgroundColor: WHITE,
    borderRadius: 8,
    width: 240,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandImg: { width: '100%', height: '100%', objectFit: 'contain' },
  brandTxtFallback: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: BLACK, letterSpacing: 2 },

  priceBadge: {
    backgroundColor: YELLOW,
    borderRadius: 16,
    width: 150,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBadgeTxt: { fontSize: 36, fontFamily: 'Helvetica-Bold', color: BLACK, lineHeight: 1 },

  imgGrid: { flexDirection: 'row', height: IMG_GRID_H },
  imgLeft: { width: IMG_LEFT_W, flexDirection: 'column' },
  imgSmallA: {
    width: IMG_LEFT_W,
    height: IMG_GRID_H / 2,
    backgroundColor: GRAY_LT,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  imgSmallB: { width: IMG_LEFT_W, height: IMG_GRID_H / 2, backgroundColor: GRAY_LT },
  imgRight: {
    width: IMG_RIGHT_W,
    height: IMG_GRID_H,
    backgroundColor: GRAY_LT,
    borderLeftWidth: 1,
    borderLeftColor: BORDER,
  },
  imgFill: { width: '100%', height: '100%', objectFit: 'cover' },

  prodFooter: {
    height: PROD_FOOTER_H,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  prodFooterLeft: {
    width: '60%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  prodFooterRight: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodModelo: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: BLACK, marginBottom: 8 },
  prodTalla:  { fontSize: 17, color: GRAY, marginBottom: 14 },
  prodWaBtn: {
    backgroundColor: GREEN,
    borderRadius: 7,
    paddingVertical: 11,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodWaBtnTxt: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: WHITE, letterSpacing: 0.3 },
})

function CaratulaPDFPage({
  titulo,
  brands,
  previewImages,
  totalShoes,
}: {
  titulo: string
  brands: string[]
  previewImages: string[]
  totalShoes: number
}) {
  const year = new Date().getFullYear().toString()

  return (
    <Page size="A4" style={S.page}>
      <View style={S.coverPage}>

        <View style={S.coverTopArea}>
          <View>
            <Text style={S.coverCatLabel}>CATALOGO</Text>
            <Text style={S.coverYear}>{year}</Text>
            <Text style={S.coverSubtitle}>{titulo.toUpperCase()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', paddingTop: 8 }}>
            <Text style={{ fontSize: 9, color: '#6b7280', letterSpacing: 2 }}>
              {totalShoes} MODELOS
            </Text>
          </View>
        </View>

        <View style={S.coverImgRow}>
          {previewImages.map((src, idx) => (
            <Image key={idx} src={src} style={S.coverImgItem} />
          ))}
        </View>

        <View style={S.coverBottomStrip}>
          <Text style={S.coverBottomText}>LIQUIDACION</Text>
        </View>

      </View>
    </Page>
  )
}

function ShoePage({ shoe, incluirPrecio, incluirTallas, whatsapp }: {
  shoe: ShoeWithImage
  incluirPrecio: boolean
  incluirTallas: boolean
  whatsapp: string
}) {
  const msg = encodeURIComponent(
    `Hola MAGILU! Me interesa el modelo *${shoe.modelo}* (${shoe.marca}) talla EUR ${shoe.eurSize}. Esta disponible?`
  )
  const waUrl = `https://wa.me/${whatsapp}?text=${msg}`

  const tallaParts = [`TALLA: ${shoe.eurSize}`]
  if (shoe.usSize) tallaParts.push(`US: ${shoe.usSize}`)
  const tallaStr = tallaParts.join(' / ')

  return (
    <Page size="A4" style={S.productPage}>

      {/* BLACK HEADER: brand logo box only */}
      <View style={S.prodHeader}>
        <View style={S.brandBox}>
          {shoe.etiquetaData
            ? <Image src={shoe.etiquetaData} style={S.brandImg} />
            : <Text style={S.brandTxtFallback}>{shoe.marca.toUpperCase()}</Text>
          }
        </View>
      </View>

      {/* 3-IMAGE GRID: 2 small left + 1 main right */}
      <View style={S.imgGrid}>
        <View style={S.imgLeft}>
          <View style={S.imgSmallA}>
            {(shoe.imageData2 ?? shoe.imageData)
              ? <Image src={(shoe.imageData2 ?? shoe.imageData)!} style={S.imgFill} />
              : null}
          </View>
          <View style={S.imgSmallB}>
            {(shoe.imageData3 ?? shoe.imageData)
              ? <Image src={(shoe.imageData3 ?? shoe.imageData)!} style={S.imgFill} />
              : null}
          </View>
        </View>
        <View style={S.imgRight}>
          {shoe.imageData
            ? <Image src={shoe.imageData} style={S.imgFill} />
            : null}
        </View>
      </View>

      {/* WHITE FOOTER: model name + size + WhatsApp left | price right */}
      <View style={S.prodFooter}>
        {/* Left: model name + size + WhatsApp */}
        <View style={S.prodFooterLeft}>
          <Text style={S.prodModelo}>{shoe.modelo.toUpperCase()}</Text>
          {incluirTallas && (
            <Text style={S.prodTalla}>{tallaStr}</Text>
          )}
          {whatsapp ? (
            <Link src={waUrl} style={{ textDecoration: 'none' }}>
              <View style={S.prodWaBtn}>
                <Text style={S.prodWaBtnTxt}>Comprar por WhatsApp</Text>
              </View>
            </Link>
          ) : (
            <View style={S.prodWaBtn}>
              <Text style={S.prodWaBtnTxt}>Comprar por WhatsApp</Text>
            </View>
          )}
        </View>
        {/* Right: price badge */}
        <View style={S.prodFooterRight}>
          {incluirPrecio && shoe.precioVenta && (
            <View style={S.priceBadge}>
              <Text style={S.priceBadgeTxt}>S/ {shoe.precioVenta.toFixed(0)}</Text>
            </View>
          )}
        </View>
      </View>

    </Page>
  )
}

export function CatalogoPDF({ shoes, titulo, incluirPrecio, incluirTallas, whatsapp, brands, previewImages }: Props) {
  return (
    <Document title={titulo} author="MAGILU">

      {/* Page 1: Cover (Caratula) */}
      <CaratulaPDFPage
        titulo={titulo}
        brands={brands}
        previewImages={previewImages}
        totalShoes={shoes.length}
      />

      {/* 1 full page per shoe — skip if no images loaded */}
      {shoes.filter(s => !!s.imageData).map(shoe => (
        <ShoePage
          key={shoe.id}
          shoe={shoe}
          incluirPrecio={incluirPrecio}
          incluirTallas={incluirTallas}
          whatsapp={whatsapp}
        />
      ))}

    </Document>
  )
}
