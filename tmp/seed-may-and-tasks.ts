import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const mayPosts = [
  {
    slug: "off-season-wellness-maximizando-ganancias-musculares",
    title: "Off-Season Wellness: Maximizando ganancias musculares",
    category: "Nutrición",
    excerpt: "Cómo gestionar el superávit calórico en Wellness para construir una base sólida sin comprometer la línea estética.",
    content: `
      <strong>La Importancia del Off-Season Inteligente</strong><br/><br/>
      En la categoría Wellness, el off-season es el momento de construir la hegemonía del tren inferior. No es una excusa para comer sin control, sino para nutrir el tejido nuevo.<br/><br/>
      
      <strong>1. Superávit Progresivo</strong><br/><br/>
      Buscamos un entorno anabólico constante. Un aumento del 10% sobre las calorías de mantenimiento suele ser el 'sweet spot' para ganar músculo minimizando la retención de grasa.<br/><br/>
      
      <strong>2. Reparto de Macros para el Crecimiento</strong><br/><br/>
      La proteína debe mantenerse estable (2.2g - 2.5g por kg), pero los carbohidratos son tu mejor aliado anabólico. Úsalos estratégicamente alrededor del entrenamiento de pierna.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Te cuesta subir de peso en off-season o eres de las que gana grasa con facilidad? ¡Hablemos de tipos de metabolismo abajo!
    `
  },
  {
    slug: "gluteos-3d-biomecanica-patada-polea",
    title: "Glúteos 3D: Biomecánica de la patada en polea",
    category: "Entrenamiento",
    excerpt: "Analizamos el ángulo exacto y la posición de la cadera para aislar el glúteo mayor y medio en polea.",
    content: `
      <strong>Optimización Mecánica</strong><br/><br/>
      La patada en polea es uno de los ejercicios más mal ejecutados. Para unos glúteos 3D, la clave es la alineación de las fibras musculares con la línea de tiro de la polea.<br/><br/>
      
      <strong>1. El ángulo de 30 grados</strong><br/><br/>
      No patees directamente hacia atrás. Una ligera abducción (30 grados hacia afuera) se alinea mejor con la anatomía del glúteo mayor superior y el glúteo medio.<br/><br/>
      
      <strong>2. Estabilización de la pelvis</strong><br/><br/>
      Si tu espalda baja se arquea al patear, estás perdiendo tensión. Mantén un core sólido y una ligera inclinación del tronco hacia adelante.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Prefieres hacer la patada con el pie estirado o apoyando la rodilla en un banco? ¡Cuéntanos tu truco!
    `
  },
  {
    slug: "checklist-peak-week-posing-maquillaje-tinte",
    title: "Checklist Peak Week: Posing, Maquillaje y Tinte",
    category: "Preparación",
    excerpt: "Los detalles estéticos que pueden subirte o bajarte del podio. La importancia de una imagen impecable.",
    content: `
      <strong>La Imagen de una Pro</strong><br/><br/>
      El día del show, cada detalle cuenta. El panel de jueces evalúa el 'Total Package', y esto incluye tu presentación estética completa.<br/><br/>
      
      <strong>1. El Tinte: La base del relieve</strong><br/><br/>
      Un tinte mal aplicado puede hacer que tus músculos se vean planos. Asegúrate de exfoliar la piel correctamente los días previos.<br/><br/>
      
      <strong>2. Maquillaje de Escenario</strong><br/><br/>
      Las luces de tarima son muy potentes y 'lavan' las facciones. El maquillaje debe ser más intenso que uno de noche convencional, resaltando pómulos y mirada.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Te maquillas tú misma para el show o confías en profesionales? ¡Hablemos de estética!
    `
  },
  {
    slug: "analisis-nutricional-pre-olympia-bikini-pro",
    title: "Análisis Nutricional Pre-Olympia: El look de las Top 5",
    category: "Nutrición",
    excerpt: "Estudiamos las tendencias de dieta y suplementación que están llevando a las atletas al escenario más importante del mundo.",
    content: `
      <strong>Tendencias del Olympia</strong><br/><br/>
      El estándar de Bikini ha evolucionado hacia un look con más plenitud (fullness). Estudiamos qué están haciendo las mejores para verse llenas pero rasgadas.<br/><br/>
      
      <strong>1. Carbohidratos vs Grasas</strong><br/><br/>
      Muchas Pro están optando por mantener hidratos más altos durante el prep para conservar el volumen muscular, sacrificando un poco de grasa en las últimas fases.<br/><br/>
      
      <strong>2. Manipulación de Sodio</strong><br/><br/>
      Ya no se corta el sodio como antes. Se mantiene estable para asegurar que el músculo tenga el 'pop' necesario en las comparativas bajo las luces.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Sigues a alguna atleta del Olympia en particular por su físico? ¡Dinos quién es tu referente!
    `
  }
];

async function main() {
  // 1. Create May posts
  for (const post of mayPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { ...post, published: false },
      create: { ...post, published: false }
    });
  }
  console.log("8 Artículos de Mayo generados como Borradores.");

  // 2. Create Monthly Admin Tasks (Avisos en calendario)
  const taskDates = [
    new Date('2026-04-23T10:00:00Z'),
    new Date('2026-05-23T10:00:00Z'),
    new Date('2026-06-23T10:00:00Z'),
    new Date('2026-07-23T10:00:00Z'),
    new Date('2026-08-23T10:00:00Z'),
    new Date('2026-09-23T10:00:00Z'),
    new Date('2026-10-23T10:00:00Z'),
    new Date('2026-11-23T10:00:00Z'),
    new Date('2026-12-23T10:00:00Z'),
  ];

  for (const date of taskDates) {
    await prisma.adminTask.create({
      data: {
        title: "📝 Blog Pro: Reportes listos",
        description: "Los artículos del próximo mes ya están generados. Entra en el panel de Blog para revisarlos y aprobarlos.",
        date: date
      }
    });
  }
  console.log("Tareas de aviso mensual creadas en el calendario.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
