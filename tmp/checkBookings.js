const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    include: { user: true }
  });
  console.log("Current Time:", now.toISOString());
  console.log("Bookings:", JSON.stringify(bookings, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
