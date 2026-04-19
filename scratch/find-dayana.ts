import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      email: 'conda20@gmail.com'
    },
    include: {
      bookings: {
        include: {
          slot: true
        }
      }
    }
  })

  console.log(JSON.stringify(user, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
