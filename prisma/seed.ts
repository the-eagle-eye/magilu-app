import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const shoes = [
  // ── ESTUDIO — Hombre ──────────────────────────────────────────────
  { modelo: 'OMONO-100', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: null, notas: 'ZAP HO SP BASIC' },
  { modelo: 'COELIN-100', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: '16959661', notas: null },
  { modelo: 'HERON-001', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: null, tipo: 'Oxford', genero: 'hombre', sku: '16196045', notas: null },
  { modelo: 'FRESHH_H-967', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: 'Gris', tipo: 'Sneaker', genero: 'hombre', sku: null, notas: null },
  { modelo: 'MCENROE-410', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '16450041', notas: null },
  { modelo: 'MCENROE-100', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: null, notas: 'Sticker Falabella 48' },
  { modelo: 'SENECA-410', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: 'Navy', tipo: 'Zapato casual', genero: 'hombre', sku: null, notas: 'ZAP HO SP BASIC' },
  { modelo: 'LENKOV-201', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: 'Oscuro', tipo: 'Zapato casual', genero: 'hombre', sku: null, notas: 'Made in India' },
  { modelo: 'LENKOV-201', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: 'Oscuro', tipo: 'Zapato casual', genero: 'hombre', sku: null, notas: '2do par mismo modelo' },
  { modelo: 'ORLOVOFLEXX-004', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Beige', tipo: 'Sandalia', genero: 'hombre', sku: '16742125', notas: 'Made in India' },
  { modelo: 'IMPALLA-001', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Negro', tipo: 'Sneaker', genero: 'hombre', sku: null, notas: null },
  { modelo: 'GRAND COURT GW9252', marca: 'Adidas', eurSize: 44, usSize: 10, ukSize: 9.5, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: null, notas: null },
  { modelo: 'MOTIONX-100', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: '16762127', notas: 'Made in Vietnam' },
  { modelo: 'JOURNEY-271', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: 'Beige', tipo: 'Mocasín', genero: 'hombre', sku: null, notas: 'ZAP HO DR BASIC' },
  { modelo: 'MTL72SNEAKER-M-300', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Verde', tipo: 'Sneaker', genero: 'hombre', sku: '17146041', notas: null },
  { modelo: 'BANNED', marca: 'Beverly Hills Polo Club', eurSize: 44, usSize: null, ukSize: 11, color: 'Navy', tipo: 'Zapatilla', genero: 'hombre', sku: null, notas: 'Made in PRC' },
  { modelo: 'KYRO-252', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Taupe', tipo: 'Sandalia', genero: 'hombre', sku: '17154416', notas: 'Made in Vietnam' },
  { modelo: 'TINOS-001', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: null, tipo: 'Zapato casual', genero: 'hombre', sku: '16641100', notas: null },
  { modelo: 'SEATIDE-270', marca: 'ALDO', eurSize: 45, usSize: 11, ukSize: null, color: null, tipo: 'Sandalia', genero: 'hombre', sku: null, notas: null },
  { modelo: 'SUNNYSIDE-230', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: null, tipo: 'Sandalia', genero: 'hombre', sku: '17042969', notas: null },
  { modelo: 'CITYWALK-220', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '16088037', notas: null },
  { modelo: 'CITYWALK-220', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '16088037', notas: '2do par' },
  { modelo: 'GORDO-410', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Navy', tipo: 'Zapatilla', genero: 'hombre', sku: '17358870', notas: null },
  { modelo: 'SEAFARER-252', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: null, tipo: 'Mocasín', genero: 'hombre', sku: '16960282', notas: null },
  { modelo: 'KARSON-220', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '16845711', notas: null },
  { modelo: 'MAPSTONE LACE', marca: 'Clarks', eurSize: 43, usSize: 10, ukSize: 9, color: 'Tan', tipo: 'Oxford', genero: 'hombre', sku: null, notas: 'Falabella S/499.90' },
  { modelo: 'OCEANWIND-101', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: null, color: null, tipo: 'Mocasín', genero: 'hombre', sku: '17042927', notas: null },
  { modelo: 'UPTOWN-125', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: '16960475', notas: null },
  { modelo: 'CITYWALK-115', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '16811069', notas: null },
  { modelo: 'LUTON-100', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: '16811806', notas: 'Made in Morocco' },
  { modelo: 'NUNEZ-220', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: 'Cognac', tipo: 'Mocasín', genero: 'hombre', sku: '17316508', notas: null },
  { modelo: 'AALTO-009', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: null, color: null, tipo: 'Oxford', genero: 'hombre', sku: '16510118', notas: null },
  { modelo: 'ZELASIEN-220', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: null, tipo: 'Oxford', genero: 'hombre', sku: '17045474', notas: null },
  { modelo: 'LIDO-001', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: null, color: 'Negro', tipo: 'Zapatilla', genero: 'hombre', sku: '16863080', notas: null },
  { modelo: 'SEBERG-IN-001', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: null, tipo: 'Sandalia', genero: 'hombre', sku: '16795891', notas: 'Made in India' },
  { modelo: 'WHIDDON STEP', marca: 'Clarks', eurSize: 43, usSize: 10, ukSize: 9, color: 'Dark Tan', tipo: 'Oxford', genero: 'hombre', sku: null, notas: 'Falabella S/379.90' },
  { modelo: 'FINESPEC-237', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: null, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '16947539', notas: null },
  { modelo: 'CLARKSPRO LACE', marca: 'Clarks', eurSize: 43, usSize: 10, ukSize: 9, color: 'Negro', tipo: 'Oxford', genero: 'hombre', sku: null, notas: 'Falabella S/449.90' },
  { modelo: 'LUCA-410', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '16190826', notas: null },
  { modelo: 'ARDEN-008', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: 'Negro', tipo: 'Zapatilla', genero: 'hombre', sku: '16937095', notas: null },
  { modelo: 'POKER-008', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '17043151', notas: null },
  { modelo: 'LIDO-001', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: 'Negro', tipo: 'Zapatilla', genero: 'hombre', sku: '16863080', notas: '2do par' },

  // ── SALA — Hombre ─────────────────────────────────────────────────
  { modelo: 'WILDBROOK-164', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: '17043340', notas: null },
  { modelo: 'WILDBROOK-164', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: '17043340', notas: '2do par' },
  { modelo: 'WILDBROOK-164', marca: 'ALDO', eurSize: 42.5, usSize: 9.5, ukSize: 8.5, color: 'Blanco', tipo: 'Zapatilla', genero: 'hombre', sku: '17043312', notas: null },
  { modelo: 'MUSKER-201', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: 'Oscuro', tipo: 'Mocasín', genero: 'hombre', sku: '17215201', notas: null },
  { modelo: 'MUSKER-201', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: 'Oscuro', tipo: 'Mocasín', genero: 'hombre', sku: '17215201', notas: '2do par' },
  { modelo: 'CEDRIC-900', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: 'Marrón', tipo: 'Oxford', genero: 'hombre', sku: '17153283', notas: null },
  { modelo: 'SEAFARER-252', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: null, tipo: 'Mocasín', genero: 'hombre', sku: '16960280', notas: null },
  { modelo: 'GORDO-410', marca: 'ALDO', eurSize: 44, usSize: 11, ukSize: 10, color: 'Navy', tipo: 'Zapatilla', genero: 'hombre', sku: '17258670', notas: null },
  { modelo: 'GORDO-410', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: 'Navy', tipo: 'Zapatilla', genero: 'hombre', sku: '17258665', notas: null },
  { modelo: 'GORDO-410', marca: 'ALDO', eurSize: 39, usSize: 7, ukSize: 6, color: 'Navy', tipo: 'Zapatilla', genero: 'hombre', sku: '17258647', notas: null },
  { modelo: 'FINESPEC-220', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '16281618', notas: null },
  { modelo: 'STEPUP-100', marca: 'ALDO', eurSize: 43, usSize: 10, ukSize: 9, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '17043043', notas: null },
  { modelo: 'CLUBMTL-200', marca: 'ALDO', eurSize: 46, usSize: 13, ukSize: 12, color: 'Marrón', tipo: 'Zapatilla', genero: 'hombre', sku: '17138900', notas: null },
  { modelo: 'LIONEL-201', marca: 'ALDO', eurSize: 43.5, usSize: 10.5, ukSize: 9.5, color: 'Oscuro', tipo: 'Mocasín', genero: 'hombre', sku: '17258962', notas: null },
  { modelo: 'MAGNUS-101', marca: 'ALDO', eurSize: 45, usSize: 12, ukSize: 11, color: null, tipo: 'Zapatilla', genero: 'hombre', sku: '16644119', notas: null },

  // ── SALA — Mujer ─────────────────────────────────────────────────
  { modelo: 'DROIN-253', marca: 'ALDO', eurSize: 38, usSize: 7.5, ukSize: 5, color: null, tipo: 'Sandalia', genero: 'mujer', sku: null, notas: 'Falabella OFERTA S/174.95' },
  { modelo: 'WILDBREEZE-690', marca: 'ALDO', eurSize: 37, usSize: 6.5, ukSize: 4, color: null, tipo: 'Sandalia', genero: 'mujer', sku: '17120944', notas: null },
  { modelo: 'ZAIDEN-100', marca: 'ALDO', eurSize: 40, usSize: 7.5, ukSize: 6.5, color: 'Blanco', tipo: 'Zapatilla', genero: 'mujer', sku: '17256136', notas: null },
  { modelo: 'HARLIE-001', marca: 'ALDO', eurSize: 38.5, usSize: 8, ukSize: 5.5, color: null, tipo: 'Zapato', genero: 'mujer', sku: '17047821', notas: null },
  { modelo: 'JANNY-201', marca: 'ALDO', eurSize: 38.5, usSize: 8, ukSize: 5.5, color: 'Beige', tipo: 'Sandalia', genero: 'mujer', sku: '17110692', notas: null },
  { modelo: 'TRISTIN-200', marca: 'ALDO', eurSize: 40, usSize: 7.5, ukSize: 6.5, color: null, tipo: 'Zapatilla', genero: 'mujer', sku: '17145566', notas: null },
  { modelo: 'TRISTIN-200', marca: 'ALDO', eurSize: 40, usSize: 7.5, ukSize: 6.5, color: null, tipo: 'Zapatilla', genero: 'mujer', sku: '17145566', notas: '2do par' },
  { modelo: 'STESSY2.0-680', marca: 'ALDO', eurSize: 37, usSize: 6.5, ukSize: 4, color: null, tipo: 'Stiletto', genero: 'mujer', sku: '16750957', notas: 'Falabella OFERTA S/329.90' },
  { modelo: 'Modelo 1758', marca: 'Christian Lau', eurSize: 39, usSize: null, ukSize: null, color: 'Negro', tipo: 'Zapato', genero: 'mujer', sku: null, notas: 'Zapato uniforme' },
  { modelo: 'TESSINA-340', marca: 'ALDO', eurSize: 37.5, usSize: 7, ukSize: 4.5, color: null, tipo: 'Sandalia', genero: 'mujer', sku: '17142628', notas: null },
  { modelo: 'BEACHWALK-711', marca: 'ALDO', eurSize: 37.5, usSize: 5, ukSize: 4.5, color: null, tipo: 'Sandalia', genero: 'mujer', sku: '17052649', notas: null },
]

async function main() {
  console.log('🌱 Seeding database with', shoes.length, 'shoes...')

  // Borrar datos existentes
  await prisma.shoePhoto.deleteMany()
  await prisma.shoe.deleteMany()

  for (const shoe of shoes) {
    await prisma.shoe.create({ data: shoe })
  }

  console.log('✅ Seed complete:', shoes.length, 'pares importados')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
