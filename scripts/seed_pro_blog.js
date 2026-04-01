const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧼 Limpiando base de datos para contenido Pro...');
  await prisma.blogPost.deleteMany({});

  const posts = [
    {
      title: "Dominio de la Pasarela: El Arte del Posing Bikini IFBB Pro",
      slug: "dominio-pasarela-posing-bikini-ifbb",
      category: "Masterclass",
      excerpt: "Un análisis técnico profundo sobre las transiciones, el control del core y la proyección escénica que separa a una amateur de una profesional.",
      content: `## El Arte de la Proyección Escénica

En el mundo del culturismo femenino, y específicamente en la categoría **Bikini**, el posing no es simplemente una serie de posturas; es una coreografía de confianza, elegancia y precisión técnica. Una atleta puede tener el mejor físico de la línea, pero si no sabe presentarlo, los jueces no podrán otorgarle la puntuación que merece.

### 1. El Control del Core (Vaca/Gato invertido)

El error más común en la tarima es la pérdida del control abdominal durante las transiciones. En la **IFBB Pro League**, se busca una cintura pequeña y compacta. 

*   **Técnica Clave:** Mantener una ligera succión (vacuum) constante sin que se note el esfuerzo respiratorio.
*   **El 'Flare' Dorsal:** No se trata de expandir como un Figure, sino de crear una ilusión de 'V-taper' que haga que la cintura parezca inexistente.

### 2. La Transición: El Momento Crítico

Los jueces están evaluando desde el momento en que pones un pie en la tarima (el T-Walk). Las transiciones deben ser fluidas, como si estuvieras flotando. Evita los movimientos robóticos. 

> "La transición es donde muestras tu personalidad. Si te ves rígida, transmites nerviosismo."

### 3. Puntos de Juzgamiento del Posing Frontal

*   **Apertura de cadera:** El ángulo debe ser exacto para resaltar el glúteo sin perder la simetría frontal.
*   **Colocación de manos:** Una mano en la cadera siempre debe buscar acentuar la curva, no esconderla.

Este es solo el comienzo de nuestra serie de Masterclass en **The Heels Academy**. La práctica diaria frente al espejo, grabándote constantemente, es el único camino hacia la perfección.`,
      published: true
    },
    {
      title: "Periodización Nutricional: Ciencia aplicada a la Preparación",
      slug: "periodizacion-nutricional-culturismo",
      category: "Nutrición",
      excerpt: "Cómo gestionar los macronutrientes desde la fase de off-season hasta la Peak Week para llegar con la máxima plenitud y dureza.",
      content: `## Más allá del Pavo y el Brócoli

La nutrición en el culturismo moderno ha evolucionado. Ya no se trata de sufrir por sufrir, sino de aplicar la ciencia para optimizar el rendimiento y la estética.

### La Fase de 'Prep' vs 'Off-Season'

Muchos atletas cometen el error de mantenerse demasiado cerca de su peso de competición durante todo el año. Esto limita las ganancias musculares. 

*   **Superávit Controlado:** En off-season, buscamos un entorno anabólico. Un 10-15% por encima de tus calorías de mantenimiento es suficiente para construir tejido sin ganar grasa excesiva.
*   **Déficit Progresivo:** Al entrar en fase de corte, la clave es la paciencia. Un déficit agresivo solo llevará a la pérdida de masa muscular y al 'flatness' (físico plano).

### El Papel de los Refeeds

Los **Refeeds** (recargas controladas de carbohidratos) no son 'cheat meals'. Son herramientas metabólicas enfocadas en:
1.  Restaurar los niveles de glucógeno.
2.  Regular la leptina para mantener el metabolismo activo.
3.  Proporcionar un respiro psicológico necesario.

### La Peak Week: La Semana de la Verdad

En la última semana, el juego cambia. La manipulación de sodio, potasio y agua es un arte delicado. **Nunca experimentes nada nuevo en la Peak Week.** Lo que te ha llevado allí es lo que te hará brillar.`,
      published: true
    },
    {
      title: "Reglamento IFBB 2026: Cambios clave en los Criterios de Puntuación",
      slug: "reglamento-ifbb-2026-cambios-puntuacion",
      category: "Reglamento",
      excerpt: "Actualización oficial sobre lo que los jueces buscan este año en las categorías de Posing y Bikini. Muscularidad vs Feminidad.",
      content: `## Nuevos Estándares en la Tarima

La IFBB ha emitido una circular técnica detallando los ajustes en el juzgamiento para la temporada 2026. Es vital que tanto entrenadores como atletas ajusten su preparación a estas directrices.

### Bikini: ¿Más músculo o más líneas?

Se ha observado una tendencia hacia una muscularidad excesiva en Bikini que cruza la línea hacia Wellness. Los jueces han sido claros:
*   **Bikinización:** Se priorizará el "look" de playa atlético. 
*   **Condicionamiento:** Se penalizará el exceso de venas (vascularidad) y el 'granulado' muscular extremo. Buscamos firmeza, no dureza de culturismo pesado.

### Wellness: El enfoque en el tren inferior

Para Wellness, el criterio sigue siendo el predominio del tren inferior (cuádriceps, glúteos y femorales), pero manteniendo la feminidad en el torso. 

> "Buscamos un físico en cascada: potente abajo, elegante arriba."

### Marcación de los Cuartos de Giro

Se pondrá especial énfasis en la **Simetría**. Si un brazo está más alto que otro o si la inclinación de la pelvis es asimétrica, la puntuación bajará drásticamente. En **The Heels**, analizamos cada uno de tus ángulos para que este reglamento trabaje a tu favor.`,
      published: true
    },
    {
      title: "Psicología de la Tarima: Dominando la Mente del Ganador",
      slug: "psicologia-tarima-mente-ganador",
      category: "Psicología",
      excerpt: "El 50% de la victoria se decide en la mente. Aprende a gestionar la ansiedad pre-competición y a proyectar dominio absoluto ante los jueces.",
      content: `## Mente de Hierro, Cuerpo de Oro

Puedes tener el físico perfecto, pero si tus ojos muestran miedo cuando los jueces te miran, has perdido. La proyección escénica nace de la psicología interna.

### El Estado de 'Flujo' (The Zone)

Los grandes campeones entran en un estado de túnel. Ya no oyen los gritos de la grada, solo sienten su respiración y su core. 

*   **Visualización:** Dedica 10 minutos al día a visualizar tu rutina completa. Imagina las luces, el olor del tinte, la música y, sobre todo, la sensación de la medalla en tu cuello.
*   **Anclajes:** Crea un gesto silencioso (un toque en la joya, una respiración profunda) que te devuelva a la calma antes de salir por el túnel.

### Manejo de la Ansiedad Pre-Show

La ansiedad es energía. Si la ves como "nervios", te frenará. Si la ves como "adrenalina para brillar", te impulsará. El cortisol es tu enemigo porque retiene agua subcutánea; mantener la calma no es solo psicológico, es **físico**.

En **The Heels Academy**, no solo entrenamos tus glúteos y tus poses; forjamos la mentalidad de una campeona. Tu viaje empieza en tu cabeza.`,
      published: true
    }
  ];

  for (const post of posts) {
    await prisma.blogPost.create({
      data: post
    });
  }

  console.log('✅ ¡Contenido de Élite inyectado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
