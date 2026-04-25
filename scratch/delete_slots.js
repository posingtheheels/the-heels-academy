
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteSlotsForDates(dates) {
  try {
    for (const dateStr of dates) {
      console.log(`Buscando slots para el día: ${dateStr}...`);
      
      // Define the start and end of the day in UTC
      // Dates are in 2026
      const startOfDay = new Date(`${dateStr}T00:00:00Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59Z`);

      // Find slots for this day
      const slots = await prisma.slot.findMany({
        where: {
          dateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          available: true, // Only available ones as requested
        },
      });

      console.log(`Encontrados ${slots.length} slots disponibles para el ${dateStr}.`);

      if (slots.length > 0) {
        const ids = slots.map(s => s.id);
        
        // Delete associated bookings (if any, though they should be available)
        await prisma.booking.deleteMany({
          where: { slotId: { in: ids } },
        });

        // Delete the slots
        const deleted = await prisma.slot.deleteMany({
          where: { id: { in: ids } },
        });

        console.log(`Eliminados ${deleted.count} slots del día ${dateStr}.`);
      }
    }
  } catch (error) {
    console.error('Error durante el borrado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const datesToDelete = ['2026-05-18', '2026-05-21'];
deleteSlotsForDates(datesToDelete);
