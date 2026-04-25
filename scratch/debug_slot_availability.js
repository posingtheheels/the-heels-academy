const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSlot() {
  try {
    const targetDate = new Date('2026-05-03T19:00:00+02:00'); // Assuming Spanish time
    console.log('Searching for slot at:', targetDate.toISOString());

    const slots = await prisma.slot.findMany({
      where: {
        dateTime: {
          gte: new Date('2026-05-03T00:00:00Z'),
          lte: new Date('2026-05-03T23:59:59Z')
        }
      },
      include: {
        bookings: true
      }
    });

    console.log('Slots found on May 3rd:', slots.length);
    slots.forEach(s => {
      console.log(`Slot ID: ${s.id}, Time: ${s.dateTime.toISOString()}, Available: ${s.available}, Bookings: ${s.bookings.length}`);
      s.bookings.forEach(b => {
        console.log(`  - Booking ID: ${b.id}, Status: ${b.status}`);
      });
    });

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSlot();
