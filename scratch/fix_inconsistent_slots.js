const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixInconsistentSlots() {
  try {
    console.log('Searching for inconsistent slots...');
    const slots = await prisma.slot.findMany({
      where: {
        available: true,
        bookings: {
          some: {
            status: { in: ['CONFIRMADA', 'PENDIENTE_PAGO', 'REALIZADA'] }
          }
        }
      },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMADA', 'PENDIENTE_PAGO', 'REALIZADA'] }
          }
        }
      }
    });

    console.log(`Found ${slots.length} inconsistent slots.`);

    for (const slot of slots) {
      console.log(`Fixing Slot ID: ${slot.id}, Time: ${slot.dateTime.toISOString()}`);
      await prisma.slot.update({
        where: { id: slot.id },
        data: { available: false }
      });
    }

    console.log('Fix completed successfully.');

  } catch (error) {
    console.error('Error during fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixInconsistentSlots();
