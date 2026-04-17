import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const bookings = await prisma.booking.findMany({
    where: {
      userId: 'cmo2hwu1g00006oj6lsoxwm26'
    },
    select: {
      id: true,
      dateTime: true,
      googleCalendarEventId: true,
      status: true
    }
  })
  console.log(JSON.stringify(bookings, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
