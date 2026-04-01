const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Inyectando artículos Pro...');

  const posts = [
    {
      title: "Dominando la pasarela: Tips de Posing para Bikini Fitness NPC",
      slug: "posing-tips-bikini-fitness-npc",
      excerpt: "El posing es el 50% de tu puntuación. Descubre cómo proyectar confianza y destacar tus puntos fuertes frente al jurado de la IFBB.",
      content: `EL POSING: TU CARTA DE PRESENTACIÓN

En la categoría Bikini Fitness de la NPC, no solo se juzga el físico, sino la forma en que lo presentas. Aquí tienes 3 tips clave:

1. LA TRANSICIÓN FLUIDA
Evita los movimientos robóticos. Las transiciones entre la pose de frente y la de espalda deben ser suaves y femeninas. Practica frente al espejo hasta que parezca natural.

2. LA MIRADA Y CONFIANZA
Mantén el contacto visual con los jueces centrales. Una sonrisa genuina pero controlada transmite seguridad. Si pareces cómoda, los jueces se sentirán cómodos puntuándote.

3. EL CONTROL DEL CORE
Nunca relajes el abdomen, ni siquiera cuando caminas hacia la parte trasera del escenario. El control del core es lo que separa a una amateur de una Pro.

RECUERDA: Entrenar el posing es tan importante como entrenar las piernas.`,
      category: "Posing",
      image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "Cuenta atrás: Las últimas 4 semanas de preparación PRO",
      slug: "preparacion-pro-ultimas-semanas",
      excerpt: "Entramos en la 'Peak Week' antes de lo esperado. Aprende a gestionar el estrés y la nutrición en la recta final hacia la tarima.",
      content: `EL MOMENTO DE LA VERDAD: LA RECTA FINAL

Cuando faltan 4 semanas para competir, el juego cambia de lo físico a lo mental.

GESTIÓN DEL AGUA Y SODIO
No cometas el error de cortar el agua demasiado pronto. La hidratación es clave para mantener el volumen muscular. El corte de sodio debe ser progresivo y bajo supervisión.

NIVELES DE ENERGÍA
Es normal sentir fatiga extrema. El cardio en ayunas sigue siendo tu aliado, pero escucha a tu cuerpo para evitar lesiones que arruinen meses de trabajo.

EL DESCANSO ES ANABÓLICO
Duerme al menos 8 horas. El cortisol alto (por estrés o falta de sueño) hará que retengas líquidos y se nuble tu definición.

CONSEJO PRO: Confía en el proceso y en tu preparador. No hagas cambios de última hora por pánico.`,
      category: "Preparación",
      image: "https://images.unsplash.com/photo-1541534741688-6078c64b595d?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "Reglamento IFBB Pro 2026: Cambios clave en la puntuación",
      slug: "reglamento-ifbb-pro-2026",
      excerpt: "La federación ha actualizado los criterios de juzgamiento para premiar físicos más equilibrados. Entérate de lo que buscan los jueces este año.",
      content: `CAMBIOS EN EL CRITERIO DE JUZGAMIENTO

La IFBB Pro League ha emitido una circular para 2026 donde se enfatizan varios puntos:

1. EL EQUILIBRIO SOBRE EL VOLUMEN
Ya no se busca el físico más grande a cualquier costa. El equilibrio (Symmetry) y la proporción serán los factores determinantes en categorías como Wellness y Figure.

2. CONDICIÓN ATLÉTICA, NO EXTREMA
Se penalizará la delgadez extrema o el aspecto 'vaciado'. Los jueces buscan un aspecto saludable, vibrante y con tono muscular real.

3. PRESENTACIÓN EN EL ESCENARIO
El tiempo de la rutina individual se ha ajustado. Cada segundo cuenta para mostrar tu físico desde todos los ángulos requeridos.

ESTUDIA EL REGLAMENTO: Conocer las reglas te da una ventaja competitiva enorme.`,
      category: "Reglamento",
      image: "https://images.unsplash.com/photo-1574626003153-ac3882779836?q=80&w=1000&auto=format&fit=crop",
    }
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log('Inyección completada. Los artículos ya deben verse en el Dashboard.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
