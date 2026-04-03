import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const extendedPosts = [
  {
    slug: "hipertrofia-pierna-tecnica-sentadilla-penta-pro",
    title: "Hipertrofia de Pierna: Técnica de Sentadilla Penta-Pro",
    category: "Entrenamiento",
    content: `
      <p><strong>Introducción a la Biomecánica del Tren Inferior</strong><br/>
      En el culturismo moderno, especialmente en las categorías Wellness y Bikini, la pierna no se entrena solo por tamaño, sino por forma y separación. La técnica 'Penta-Pro' es un protocolo de cinco pilares diseñado en The Heels Academy para maximizar el estímulo del cuádriceps preservando la integridad articular.</p>

      <h3>Pilar 1: El Control del Centro de Masas</h3>
      <p>La mayoría de las atletas de gimnasio cometen el error de dejar que la barra se desplace hacia adelante en la fase excéntrica. Esto traslada la tensión del cuádriceps a la espalda baja. Un pie con tres puntos de apoyo (talón, metatarso del primer y quinto dedo) es vital. La barra debe dibujar una línea vertical perfecta sobre el mediopié durante todo el recorrido.</p>

      <h3>Pilar 2: El 'Stance' Wellness vs Bikini</h3>
      <p><strong>Wellness:</strong> Buscamos un stance ligeramente más ancho que los hombros. Esto permite que la cadera baje entre los fémures, reclutando no solo el cuádriceps, sino también el glúteo mayor en estiramiento máximo (fase profunda). La abducción controlada de las rodillas es la clave aquí.<br/>
      <strong>Bikini:</strong> Un stance más estrecho prioriza el vasto lateral, creando esa curva exterior tan deseada en tarima.</p>

      <h3>Pilar 3: La Cadencia del Crecimiento (4-1-1-0)</h3>
      <p>La hipertrofia real ocurre bajo tensión mecánica. Nuestro protocolo exige:<br/>
      - 4 segundos de bajada controlada (Excéntrica).<br/>
      - 1 segundo de pausa activa en el punto más profundo.<br/>
      - 1 segundo de subida explosiva pero técnica.<br/>
      - 0 segundos de descanso en la parte superior para no perder la tensión.</p>

      <h3>Pilar 4: Profundidad y 'Butt Wink'</h3>
      <p>La profundidad es necesaria pero no a costa de la retroversión pélvica. Debes bajar hasta que tu pelvis empiece a rotar. En ese punto, has llegado al máximo estiramiento seguro del cuádriceps. Superar este punto sin movilidad de tobillo adecuada es la causa número uno de lesiones de disco entre atletas.</p>

      <h3>Pilar 5: Conexión Neuromuscular Analítica</h3>
      <p>No empujes el suelo, piensa en 'extender las rodillas'. Esta pequeña diferencia cognitiva cambia por completo el reclutamiento de fibras del vasto interno. La mente debe estar en el músculo objetivo desde la primera hasta la última repetición del set.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Cuántas veces a la semana estás entrenando pierna? ¿Sientes que el vasto lateral crece al mismo ritmo que el frontal? ¡Hablemos de proporciones abajo!</p>
      </div>
    `
  },
  {
    slug: "analisis-lacteo-dieta-culturismo-inflamacion",
    title: "Análisis del Lácteo: ¿Inflamación o Aliado?",
    category: "Nutrición",
    content: `
      <p><strong>El Dilema del Culturista: ¿Lácteos Sí o No?</strong><br/>
      Tradicionalmente, el lácteo ha sido el primer alimento en ser eliminado de la dieta de un preparador 'Old School'. Sin embargo, la ciencia moderna nos da una perspectiva mucho más matizada sobre el papel de la caseína y el suero en la retención de agua y la inflamación sistémica.</p>

      <h3>Sección 1: El Mito de la Piel Gruesa</h3>
      <p>Se dice que los lácteos 'engrosan la epidermis', dificultando la visión de la estriación muscular. La realidad es que, salvo que exista una intolerancia diagnosticada a la lactosa, no existe un mecanismo biológico que transforme el lácteo en grasa subcutánea de forma selectiva. La 'piel gruesa' suele ser el resultado de un consumo excesivo de sodio oculto en los quesos o de una sensibilidad digestiva que causa inflamación intestinal, no dérmica.</p>

      <h3>Sección 2: Valor Biológico y Síntesis Proteica</h3>
      <p>La proteína láctea tiene uno de los índices de digestibilidad más altos (PDCAAS = 1.00). La caseína es fundamental para periodos de ayuno prolongados (como el sueño), liberando aminoácidos de forma sostenida para evitar el catabolismo nocturno. Por otro lado, el suero es rico en Leucina, el aminoácido 'interruptor' que activa la vía mTOR de crecimiento muscular.</p>

      <h3>Sección 3: El factor Sodio y Fermentados</h3>
      <p>En The Heels Academy recomendamos encarecidamente el uso de lácteos fermentados (Kefir, Yogur Griego Natural) por una razón clave: la Microbiota. Un intestino sano absorbe mejor los nutrientes de toda la dieta. Durante una fase de prep, el estrés oxidativo es alto; los probióticos del lácteo fermentado son una barrera inmunológica esencial.</p>

      <h3>Protocolo en Fase de Corte</h3>
      <p>Recomendamos retirar los quesos altos en grasa no por la lactosa, sino por la densidad calórica. Sin embargo, mantener un yogur de alta calidad hasta las últimas semanas de preparación puede ayudar a controlar el cortisol mediante la salud intestinal. Solo en las últimas 72 horas (Peak Week) los retiraríamos para evitar cualquier posible inflamación residual antes del tinte.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Has notado cambios en tu digestión al retirar el queso o el yogur? ¡Comenta tu experiencia con los lácteos aquí debajo!</p>
      </div>
    `
  },
  {
    slug: "dominando-presencia-escenica-psicologia-tarima",
    title: "Dominando la Presencia Escénica: Psicología de la Tarima",
    category: "Preparación",
    content: `
      <p><strong>Más Allá de la Musculatura: El Poder del Aura</strong><br/>
      Puedes tener el mejor físico de la línea, pero si tu mirada no proyecta dominio, los jueces pasarán de largo. La psicología de tarima es lo que separa a las atletas talentosas de las verdaderas campeonas con estatus Pro.</p>

      <h3>El 'Anclaje' Psicológigo antes de Salir</h3>
      <p>Los minutos previos en el backstage son críticos. Los niveles de adrenalina pueden causar temblores musculares o falta de control en la sonrisa. En la Academia enseñamos técnicas de visualización activa: debes 'verte' ganando antes de pisar la primera baldosa del escenario. Esto se llama anclaje visual y auditivo.</p>

      <h3>Sección 1: El Contacto Visual Táctico</h3>
      <p>No mires a la nada. El contacto visual con los jueces debe ser intermitente pero seguro. Debes 'obligarles' a mirarte. Una mirada Pro dice: 'He trabajado más que nadie y este es mi momento'. Evita parpadear excesivamente bajo las luces potentes; entrena tu mirada fija en el espejo durante el posing.</p>

      <h3>Sección 2: La Micro-Sonrisa Dinámica</h3>
      <p>Una sonrisa forzada se nota a kilómetros de distancia y hace que tu rostro se vea tenso. Buscamos la 'sonrisa orgánica', conectada con la respiración diafragmática. Tu cara debe reflejar el disfrute del proceso. Si tu cara sufre, los jueces percibirán que tu físico está al límite del colapso.</p>

      <h3>Sección 3: Dominar el Espacio</h3>
      <p>Camina como si la tarima fuera tuya. El I-Walk es una danza de poder. Tus movimientos deben ser amplios pero fluidos. La psicología de dominio se expresa ocupando espacio físico y temporal: no corras en tus transiciones, marca cada pose medio segundo más de lo que crees necesario.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Qué es lo que más te pone nerviosa de la tarima? ¡Hablemos de miedos y cómo superarlos juntas!</p>
      </div>
    `
  }
];

async function main() {
  for (const post of extendedPosts) {
    await prisma.blogPost.update({
      where: { slug: post.slug },
      data: { content: post.content }
    });
  }
  console.log("Extendiendo los primeros reportes clave a nivel Masterclass.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
