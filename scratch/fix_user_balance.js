
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserBalance(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userPlans: {
          include: { bookings: true }
        }
      }
    });

    if (!user) {
      console.log(`Usuario ${email} no encontrado.`);
      return;
    }

    console.log(`Usuario encontrado: ${user.name}`);

    for (const userPlan of user.userPlans) {
      // Find all non-cancelled bookings for this plan
      const activeBookings = await prisma.booking.count({
        where: {
          userPlanId: userPlan.id,
          status: { not: 'CANCELADA' }
        }
      });

      console.log(`Plan ID: ${userPlan.id}`);
      console.log(`Balance actual: ${userPlan.usedSessions} usadas / ${userPlan.totalSessions} totales.`);
      console.log(`Reservas activas encontradas en DB: ${activeBookings}`);

      if (userPlan.usedSessions !== activeBookings) {
        console.log(`Corrigiendo balance a ${activeBookings} usadas...`);
        await prisma.userPlan.update({
          where: { id: userPlan.id },
          data: { usedSessions: activeBookings }
        });
        console.log('Balance corregido.');
      } else {
        console.log('El balance ya coincide con las reservas activas.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserBalance('conda20@gmail.com');
