import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const start = new Date('2026-04-27T00:00:00.000Z')
  const end = new Date('2026-04-27T23:59:59.000Z')

  const slots = await prisma.slot.findMany({
    where: {
      dateTime: {
        gte: start,
        lte: end
      }
    },
    include: {
      bookings: {
        include: {
          user: true
        }
      }
    }
  })

  console.log(JSON.stringify(slots, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
