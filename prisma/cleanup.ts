import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const photos = await prisma.shoePhoto.deleteMany()
  const shoes = await prisma.shoe.deleteMany()

  console.log(`Deleted ${photos.count} photos and ${shoes.count} shoes.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
