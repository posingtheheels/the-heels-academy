const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Inyectando el Gran Artículo de Bienvenida...');

  const post = {
    title: "GUÍA DE ÉLITE: Las 5 Claves para un Posing Bikini Impecable",
    slug: "guia-elite-posing-bikini-ifbb",
    excerpt: "Novedad en The Heels: Aprende los secretos de la pasarela que te harán ganar puntos antes de apretar el primer músculo.",
    content: `¡BIENVENIDA A TU NUEVA BIBLIOTECA PRO! 💍✨

En la NPC y la IFBB Pro League, el físico es solo una parte de la ecuación. La forma en la que brillas bajo los focos determina si eres una finalista o una campeona.

LAS 5 CLAVES DEL ÉXITO:

1. LA POSTURA "GLASSLIFT": 💎
Imagina que un hilo invisible tira de tu coronilla hacia el techo. Mantener el cuello largo y los hombros relajados pero amplios es lo que da esa elegancia 'Pro'.

2. EL GLAMOUR WALK (EL CAMINAR): 🏎️👠
No es solo caminar, es desfilar. Tus pasos deben ser seguros y rítmicos. Evita dar botes innecesarios. Tus tacones son una extensión de tus piernas.

3. SONRISA "STAGE CONTROL": 🎭
Tu cara debe contar una historia de confianza absoluta. Ensaya tu sonrisa tanto como tus poses. Los jueces recompensan a la atleta que parece disfrutar del momento.

4. EL CONTROL DE LA ESPALDA (V-TAPER): 📐
En la pose de espalda, el secreto no es solo apretar el glúteo, sino expandir los dorsales para crear esa forma de V perfecta que resalta tu cintura.

5. LAS TRANSICIONES FLUIDAS: 🌊
El momento entre poses es donde más fallos se cometen. Una transición fluida oculta tus puntos débiles y resalta tu control corporal.

"EL POSING NO ES POSAR, ES ACTUAR." ✨🏆

Recuerda que cada lunes y jueves tendrás nuevo contenido técnico aquí mismo. ¡A por todas!`,
    category: "Masterclass",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1000&auto=format&fit=crop",
  };

  await prisma.blogPost.upsert({
    where: { slug: post.slug },
    update: post,
    create: post,
  });

  console.log('¡Artículo de Élite inyectado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
