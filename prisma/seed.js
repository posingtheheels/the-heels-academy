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
      where: { id: plan.name.replace(/\s+/g, '-').toLowerCase() },
      update: plan,
      create: {
        ...plan,
        id: plan.name.replace(/\s+/g, '-').toLowerCase(),
      },
    });
  }

  // 2. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'posingtheheels@gmail.com';
  const hashedPassword = await bcrypt.hash('posingheels2024', 12);

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

  // 3. Create initial Blog Posts
  const blogPosts = [
    {
      title: "GUÍA DE ÉLITE: Las 5 Claves para un Posing Bikini Impecable",
      slug: "guia-elite-posing-bikini-ifbb",
      excerpt: "Aprende los secretos de la pasarela que te harán ganar puntos antes de completar tu primera pose.",
      content: "¡BIENVENIDA A TU NUEVA BIBLIOTECA PRO! 💍✨\n\nEn la NPC y la IFBB Pro League, el físico es solo una parte de la ecuación. La forma en la que brillas bajo los focos determina si eres una finalista o una campeona.\n\nLAS 5 CLAVES DEL ÉXITO:\n\n1. LA POSTURA 'GLASSLIFT': 💎\nImagina que un hilo invisible tira de tu coronilla hacia el techo. Mantener el cuello largo y los hombros relajados pero amplios es lo que da esa elegancia 'Pro'.\n\n2. EL GLAMOUR WALK (EL CAMINAR): 🏎️👠\nNo es solo caminar, es desfilar. Tus pasos deben ser seguros y rítmicos. Evita dar botes innecesarios. Tus tacones son una extensión de tus piernas.\n\n3. SONRISA 'STAGE CONTROL': 🎭\nTu cara debe contar una historia de confianza absoluta. Ensaya tu sonrisa tanto como tus poses. Los jueces recompensan a la atleta que parece disfrutar del momento.\n\n4. EL CONTROL DE LA ESPALDA (V-TAPER): 📐\nEn la pose de espalda, el secreto no es solo apretar el glúteo, sino expandir los dorsales para crear esa forma de V perfecta que resalta tu cintura.\n\n5. LAS TRANSICIONES FLUIDAS: 🌊\nEl momento entre poses es donde más fallos se cometen. Una transición fluida oculta tus puntos débiles y resalta tu control corporal.\n\n\"EL POSING NO ES POSAR, ES ACTUAR.\" ✨🏆\n\nRecuerda que cada lunes y jueves tendrás nuevo contenido técnico aquí mismo. ¡A por todas!",
      category: "Masterclass",
      image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1000&auto=format&fit=crop",
    },
    {
       title: "Dominando la pasarela: Tips de Posing para Bikini Fitness NPC",
       slug: "posing-tips-bikini-fitness-npc",
       excerpt: "El posing es el 50% de tu puntuación. Descubre cómo proyectar confianza.",
       content: "Tips avanzados de Posing para la categoría Bikini Fitness...",
       category: "Posing",
       image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1000&auto=format&fit=crop",
    },
    {
       title: "Cuenta atrás: Las últimas 4 semanas de preparación PRO",
       slug: "preparacion-pro-ultimas-semanas",
       excerpt: "Aprende a gestionar el estrés y la nutrición en la recta final hacia la tarima.",
       content: "Gestionando el agua y el sodio...",
       category: "Preparación",
       image: "https://images.unsplash.com/photo-1541534741688-6078c64b595d?q=80&w=1000&auto=format&fit=crop",
    },
    {
       title: "Reglamento IFBB Pro 2026: Cambios clave en la puntuación",
       slug: "reglamento-ifbb-pro-2026",
       excerpt: "La federación ha actualizado los criterios de juzgamiento. Entérate de todo.",
       content: "Actualizaciones del reglamento 2026...",
       category: "Reglamento",
       image: "https://images.unsplash.com/photo-1574626003153-ac3882779836?q=80&w=1000&auto=format&fit=crop",
    }
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

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
