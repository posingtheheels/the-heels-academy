import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const slot = await prisma.slot.findUnique({
    where: {
      id: 'cmo1jw1730004mclin4qsykpz'
    },
    include: {
      bookings: true
    }
  })

  console.log(JSON.stringify(slot, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
