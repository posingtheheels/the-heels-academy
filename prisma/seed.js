const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Plans
  const plans = [
    {
      name: "Clase Individual Online",
      description: "Clase de 30 min vía videollamada",
      price: 20,
      totalSessions: 1,
      type: "ONLINE",
      durationMinutes: 30,
    },
    {
      name: "Bono 5 Clases Online",
      description: "Bono de 5 clases de 30 min vía videollamada",
      price: 75,
      totalSessions: 5,
      type: "ONLINE",
      durationMinutes: 30,
    },
    {
      name: "Bono 10 Clases Online",
      description: "Bono de 10 clases de 30 min vía videollamada",
      price: 140,
      totalSessions: 10,
      type: "ONLINE",
      durationMinutes: 30,
    },
    {
      name: "Clase Individual Presencial",
      description: "Clase de 1h presencial",
      price: 35,
      totalSessions: 1,
      type: "PRESENCIAL",
      durationMinutes: 60,
    },
    {
      name: "Bono 5 Clases Presencial",
      description: "Bono de 5 clases de 1h presencial",
      price: 165,
      totalSessions: 5,
      type: "PRESENCIAL",
      durationMinutes: 60,
    },
    {
      name: "Bono 10 Clases Presencial",
      description: "Bono de 10 clases de 1h presencial",
      price: 300,
      totalSessions: 10,
      type: "PRESENCIAL",
      durationMinutes: 60,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.name.replace(/\s+/g, '-').toLowerCase() }, // Dummy unique ID for seeding
      update: plan,
      create: {
        ...plan,
        id: plan.name.replace(/\s+/g, '-').toLowerCase(),
      },
    });
  }

  // 2. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'posingtheheels@gmail.com';
  const hashedPassword = await bcrypt.hash('posingheels2024', 12); // Default password

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin The Heels',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
