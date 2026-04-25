
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSlotsTypeForDates(dates, newType) {
  try {
    for (const dateStr of dates) {
      console.log(`Buscando slots para el día: ${dateStr}...`);
      
      const startOfDay = new Date(`${dateStr}T00:00:00Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59Z`);

      // Find slots for this day
      const slots = await prisma.slot.findMany({
        where: {
          dateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          available: true,
        },
      });

      console.log(`Encontrados ${slots.length} slots disponibles para el ${dateStr}.`);

      if (slots.length > 0) {
        const ids = slots.map(s => s.id);
        
        // Update the slots
        const updated = await prisma.slot.updateMany({
          where: { id: { in: ids } },
          data: { type: newType }
        });

        console.log(`Actualizados ${updated.count} slots del día ${dateStr} a modalidad ${newType}.`);
      }
    }
  } catch (error) {
    console.error('Error durante la actualización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const datesToUpdate = ['2026-05-19', '2026-05-20'];
updateSlotsTypeForDates(datesToUpdate, 'ONLINE');
