import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Force publish all currently "Published" but "Scheduled" posts to NOW
  const result = await prisma.blogPost.updateMany({
    where: { 
      published: true,
      scheduledAt: { gte: new Date() }
    },
    data: { 
      scheduledAt: null // Remove scheduled date to show immediately
    }
  });
  console.log(`¡Hecho! ${result.count} artículos publicados ahora mismo.`);

  // 2. Generate 8 NEW technical articles for April's regular Monday/Thursday schedule
  const newAprilPosts = [
    {
      slug: "hipertrofia-pierna-tecnica-sentadilla-penta-pro",
      title: "Hipertrofia de Pierna: Técnica de Sentadilla Penta-Pro",
      category: "Entrenamiento",
      excerpt: "Desglose biomecánico sobre el posicionamiento de pies y rodillas para maximizar el cuadriceps en categorías Wellness y Bikini.",
      content: `
        <strong>Sentadilla Penta-Pro: El Estándar de la Academia</strong><br/><br/>
        La profundidad en la sentadilla no debe comprometer la estabilidad lumbar. En The Heels Academy defendemos el rango de movimiento completo con control cinético absoluto.<br/><br/>
        <strong>1. El 'Stance' Wellness</strong><br/>
        Para Wellness, buscamos un stance ligeramente más ancho que los hombros con las puntas hacia afuera 30 grados. Esto permite un reclutamiento mayor del glúteo mayor en la parte más profunda de la excéntrica.<br/><br/>
        <strong>2. Control de Tensión</strong><br/>
        No uses el rebote articular. La clave para la hipertrofia es la tensión mecánica constante durante los 4 segundos de bajada.<br/><br/>
        <strong>👠 DEBATE PRO:</strong> ¿Cuál es tu RM en sentadilla libre? ¡Compártelo con nosotras en el chat!
      `
    },
    {
      slug: "analisis-lacteo-dieta-culturismo-inflamacion",
      title: "Análisis del Lácteo: ¿Inflamación o Aliado?",
      category: "Nutrición",
      excerpt: "Estudiamos la ciencia tras el consumo de lácteos en fase de corte y prep escolar. ¿Realmente borran la definición?",
      content: `
        <strong>Mitos y Realidades del Lácteo</strong><br/><br/>
        Existe la creencia de que el lácteo 'engrosa la piel'. La ciencia Pro nos dice que si no hay intolerancia a la lactosa, la caseína y el suero son fuentes de proteína de altísimo valor biológico.<br/><br/>
        <strong>1. El factor Sodio</strong><br/>
        Muchos quesos o yogures procesados tienen sodio oculto que causa retención, no es el lácteo en sí, es el procesamiento.<br/><br/>
        <strong>2. Fermentados y Microbiota</strong><br/>
        En The Heels recomendamos el Kefir o yogur griego natural para mantener la salud intestinal durante el prep.<br/><br/>
        <strong>👠 DEBATE PRO:</strong> ¿Consumes lácteos en tu preparación o los retiras semanas antes? ¡Queremos saber tu método!
      `
    },
    {
      slug: "secretos-posing-wellness-transicion-gluteo-dominante",
      title: "Secretos de Posing Wellness: Transición Glúteo-Dominante",
      category: "Posing",
      excerpt: "Cómo mantener la tensión en el tren inferior durante todo el I-walk sin que parezca forzado.",
      content: `
        <strong>Dominio de la Cadera</strong><br/><br/>
        En Wellness, la fluidez no debe significar relajación. Cada paso del I-walk debe ser una exhibición de poder y redondez.<br/><br/>
        <strong>1. El Pivotaje Pro</strong><br/>
        Al girar hacia la pose posterior, el peso debe pivotar sobre el metatarso, manteniendo el glúteo en contracción isotónica.<br/><br/>
        <strong>2. Ángulo de Pelvis</strong><br/>
        Un ligero 'pelvic tilt' controlado puede acentuar la curva sin perder la línea de la cintura.<br/><br/>
        <strong>👠 DEBATE PRO:</strong> ¿Sientes que tus glúteos se relajan al caminar? ¡Pídenos consejos de técnica abajo!
      `
    },
    {
       slug: "suplementacion-nootropicos-concentracion-entrenamiento",
       title: "Nootrópicos: Maximiza la conexión mente-músculo",
       category: "Nutrición",
       excerpt: "Más allá de la cafeína. Cómo la Alpha-GPC y la Tirosina pueden mejorar tu rendimiento en sesiones de alta intensidad.",
       content: `
         <strong>Entrenamiento Cerebral</strong><br/><br/>
         El culturismo es una lucha mental. Los nootrópicos ayudan a mantener la intensidad cuando el glucógeno está bajo.<br/><br/>
         <strong>1. Alpha-GPC</strong><br/>
         Mejora la producción de acetilcolina, vital para la contracción muscular explosiva y la concentración sostenida.<br/><br/>
         <strong>2. L-Tirosina</strong><br/>
         Evita el 'crash' de dopamina después de entrenos pesados de pierna.<br/><br/>
         <strong>👠 DEBATE PRO:</strong> ¿Usas algún pre-entreno con nootrópicos o prefieres solo café? ¡Dinos cuál!
       `
    },
    {
       slug: "periodizacion-cardio-liss-vs-hiit-en-prep",
       title: "Periodización del Cardio: LISS vs HIIT en fase Pro",
       category: "Entrenamiento",
       excerpt: "Análisis sobre cuál es la mejor herramienta para quemar grasa preservando el tejido muscular ganado en off-season.",
       content: `
         <strong>Gestión de Energía</strong><br/><br/>
         No todo el cardio es igual. En The Heels priorizamos la recuperación del sistema nervioso.<br/><br/>
         <strong>1. El poder del LISS</strong><br/>
         Cardio de baja intensidad (caminar con pendiente) es superior para preservar el músculo ya que no compite con las vías de recuperación del entrenamiento de pesas.<br/><br/>
         <strong>2. El momento del HIIT</strong><br/>
         Reservado para periodos cortos de estancamiento metabólico por su alta demanda sistémica.<br/><br/>
         <strong>👠 DEBATE PRO:</strong> ¿Cuál es tu máquina de cardio favorita? ¿Cinta, elíptica o escalera?
       `
    },
    {
       slug: "psicologia-del-hambre-estrategias-fase-corte",
       title: "Psicología del Hambre: Estrategias en fase de corte",
       category: "Psicología",
       excerpt: "Cómo gestionar la ansiedad por la comida cuando las calorías bajan y la competición se acerca.",
       content: `
         <strong>Mente sobre Estómago</strong><br/><br/>
         El hambre es una señal química que una atleta de élite aprende a ignorar y a gestionar con inteligencia.<br/><br/>
         <strong>1. Alimentos de Alto Volumen</strong><br/>
         Vegetales de hoja verde y gelatinas sin azúcar son salvavidas para mantener la saciedad mecánica sin calorías.<br/><br/>
         <strong>2. El factor hidratación</strong><br/>
         A menudo, la señal de hambre es deshidratación leve. Beber agua con electrolitos puede calmar el sistema.<br/><br/>
         <strong>👠 DEBATE PRO:</strong> ¿Cuál es tu 'truco' secreto para no saltarte la dieta por hambre? ¡Ayuda a tus compañeras!
       `
    },
    {
       slug: "criterios-juzgamiento-posing-brazos-bikini",
       title: "Criterios de Juzgamiento: El Posing de Brazos en Bikini",
       category: "Posing",
       excerpt: "Cómo colocar las manos y los brazos para que no tapen los dorsales y resalten la elegancia frontal.",
       content: `
         <strong>Brazos de Pasarela</strong><br/><br/>
         Unos brazos mal colocados pueden arruinar tu V-taper. En Bikini, buscamos una 'V' fluida, no una 'X' agresiva de Figure.<br/><br/>
         <strong>1. El ángulo del Codo</strong><br/>
         Nunca bloquees el codo. Siempre una ligera flexión natural que proyecte el deltoides lateral.<br/><br/>
         <strong>2. Manos en la Cadera</strong><br/>
         La presión debe ser mínima. Solo un apoyo técnico para dirigir la mirada de los jueces hacia tu cintura.<br/><br/>
         <strong>👠 DEBATE PRO:</strong> ¿Te ves los brazos rígidos en las grabaciones? ¡Dinos cómo los entrenas!
       `
    },
    {
       slug: "madurez-muscular-clave-exito-categorias-master",
       title: "Madurez Muscular: El éxito en categorías Master",
       category: "Estructura",
       excerpt: "Por qué el tiempo bajo la barra es insustituible y cómo la densidad muscular se convierte en la ventaja competitiva.",
       content: `
         <strong>El tiempo es tu aliado</strong><br/><br/>
         La madurez muscular es esa dureza 'correosa' que solo dan los años de entrenamiento constante. Es lo que hace que una atleta Master brille frente a una joven con más volumen.<br/><br/>
         <strong>1. Densidad Post-Corte</strong><br/>
         Cualquiera puede secarse, pero solo una atleta con años de base mantiene la densidad rocosa cuando las grasas esenciales bajan.<br/><br/>
         <strong>2. Enfoque Técnicos</strong><br/>
         No se trata de mover más peso cada año, sino de moverlo mejor y con más conexión analítica.<br/><br/>
         <strong>👠 DEBATE PRO:</strong> ¿A qué edad empezaste a entrenar en serio? ¡Dinos si sientes que tu músculo es más 'denso' ahora!
       `
    }
  ];

  for (const post of newAprilPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { ...post, published: false },
      create: { ...post, published: false }
    });
  }
  console.log("8 Artículos NUEVOS de Abril generados como Borradores para tu calendario.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
