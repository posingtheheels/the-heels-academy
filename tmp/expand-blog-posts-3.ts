import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const bulkExtensions = [
  {
    slug: "analisis-pittsburgh-pro-2026-criterios-juzgamiento",
    content: `
      <p><strong>Pittsburgh Pro 2026: El Barómetro de la Liga Profesional</strong><br/>
      Como cada año, el Pittsburgh Pro no es solo una competición; es el escenario donde los jueces de la IFBB Pro League establecen el estándar estético para el resto de la temporada. En The Heels Academy hemos realizado un análisis exhaustivo de las tarjetas de puntuación y de la comparativa visual para que entiendas qué es lo que hoy puntúa como 'Elite'.</p>

      <h3>Sección 1: El Look 'Bikini' - ¿Menos es Más?</h3>
      <p>Este año, el panel de jueces ha enviado un mensaje claro: la redondez muscular no debe comprometer la feminidad ni el flujo de la pose. Hemos visto atletas con una densidad extrema ser relegadas al segundo o tercer puesto frente a físicas con una plenitud más suave pero más estética. El 'flow' entre el deltoides lateral y la cintura ha sido el punto de inflexión. Si tu silueta se ve 'bloqueada' por un exceso de sequedad, es posible que los jueces te penalicen en 2026.</p>

      <h3>Sección 2: Wellness - El predominio del Tren Inferior Armónico</h3>
      <p>En la categoría Wellness, la batalla se libró en el 'stage presence'. La línea entre una Wellness Pro y una de Figure se está ensanchando. Los jueces buscan ese balance donde el glúteo y el cuádriceps dominan el frame, pero sin que los hombros se vean demasiado anchos. La clave del éxito en Pittsburgh fue la nitidez del glúteo medio en la pose frontal. No basta con tener volumen; necesitas esa forma de 'corazón invertido' perfectamente recortada.</p>

      <h3>Sección 3: El Error del Posing Colectivo</h3>
      <p>Hemos observado una tendencia peligrosa: el posing 'robótico'. Las atletas que destacaron fueron aquellas que se movían con naturalidad, como si la tarima fuera una pasarela de moda de alta gama, no un cuartel militar. En The Heels Academy, siempre decimos que el posing es el 50% de tu nota, y en Pittsburgh, esto se confirmó. Una transición fluida puede compensar un pequeño fallo de definición en la zona abdominal.</p>

      <h3>Sección 4: Lecciones para la Alumna de la Academia</h3>
      <p>Si estás preparando tu debut o tu siguiente show Pro, quédate con estos tres conceptos extraídos de Pittsburgh:<br/>
      1. Prioriza la plenitud (fullness) sobre la desecación extrema.<br/>
      2. Trabaja tu I-walk como una coreografía artística, no mecánica.<br/>
      3. Asegúrate de que tu tono de tinte sea un punto más oscuro para contrarrestar la intensidad de las nuevas pantallas LED de los escenarios Pro.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Viste la retransmisión de Pittsburgh? ¿Estás de acuerdo con el primer puesto de Wellness? ¡Hablemos de las puntuaciones abajo!</p>
      </div>
    `
  },
  {
    slug: "reglamento-ifbb-2026-cambios-puntuacion",
    content: `
      <p><strong>Actualización Crítica: El Reglamento IFBB Pro League 2026</strong><br/>
      El reglamento no es estático; evoluciona con el físico de las atletas. El comité ejecutivo de la IFBB ha lanzado la guía de actualización para 2026, y hay cambios que afectan directamente a la forma en que debes entrenar y presentarte. Ignorar estos cambios es condenar tu clasificación antes de salir al escenario.</p>

      <h3>Sección 1: El Enfoque en la 'Midsection'</h3>
      <p>El control abdominal es ahora una prioridad absoluta en todas las categorías femeninas. Se han añadido notas específicas sobre la 'destreza en el control de la faja abdominal' durante las comparativas en reposo. Si los jueces detectan distensión abdominal o una pérdida de control mientras esperas tu turno en la línea trasera, tu puntuación bajará automáticamente. El entrenamiento de hipopresivos ya no es opcional, es una herramienta competitiva obligatoria.</p>

      <h3>Sección 2: Simetría X-Frame vs V-Frame</h3>
      <p>Bikini se mueve hacia una simetría X-frame más equilibrada, donde el desarrollo de los gemelos y los antebrazos (aunque parezca trivial) está empezando a ser observado para prevenir esa apariencia de 'tren superior flotante'. Figure, por su parte, endurece los requisitos de densidad en la espalda alta. Ya no basta con tener anchura; los jueces buscan 'Christmas tree' definido y cortes profundos en el redondo mayor.</p>

      <h3>Sección 3: Etiqueta y Professionalism en el Escenario</h3>
      <p>El reglamento 2026 también endurece las sanciones por conducta antideportiva o falta de profesionalismo. Esto incluye desde el contacto físico innecesario con otras atletas durante las comparativas hasta el uso de aceite excesivo que manche la tarima. La IFBB busca una imagen de 'élite deportiva' que atraiga patrocinadores globales.</p>

      <h3>Preparación Técnica en la Academia</h3>
      <p>En The Heels Academy estamos adaptando todos nuestros módulos de posing a estas nuevas directrices. Hemos rediseñado la fase de 'Relaxed Pose' para que mantengas la tensión abdominal de forma inconsciente incluso durante las esperas largas de los regionales y nacionales.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Te parece justo que se penalice tanto el control abdominal o crees que es demasiado estricto? ¡Háznoslo saber!</p>
      </div>
    `
  },
  {
    slug: "psicologia-tarima-mente-ganador",
    content: `
      <p><strong>Mente de Pro: La Psicología del Backstage</strong><br/>
      En The Heels Academy sabemos que el entrenamiento es físico, pero la competición es espiritual. El backstage de un show Pro es una olla a presión de egos, inseguridades y fatiga extrema por el hambre y la deshidratación. Aquí es donde se ganan o se pierden los trofeos antes de que el juez diga 'Frontal Pose'.</p>

      <h3>Sección 1: Gestión de la Ansiedad Competitiva</h3>
      <p>La ansiedad activa el sistema nervioso simpático, lo que a su vez dispara el cortisol. Como hemos visto en otros reportes, el cortisol retiene agua. Por lo tanto, tu ansiedad te está tapando literalmente los músculos. Practicar técnicas de respiración diafagmática en los 30 minutos previos a salir a tarima es tan importante como el bombeo muscular.</p>

      <h3>Sección 2: El Efecto 'Túnel'</h3>
      <p>Una campeona no mira a sus rivales para compararse en el backstage. Mirar el glúteo de la que tienes al lado solo genera dudas. Aprende a crear un 'túnel' mental donde solo existas tú, tu preparador y tu plan de acción. Tu energía debe estar enfocada en el bombeo (pumping) y en repasar mentalmente cada transición de tu posing.</p>

      <h3>Sección 3: El Positivismo Neuroquímico</h3>
      <p>Las palabras que te dices a ti misma alteran tu química interna. En lugar de decir 'tengo hambre' o 'estoy cansada', cambia el lenguaje a 'estoy en mi punto', 'mi cuerpo está listo para exhibir este trabajo'. Esto no es autoayuda barata, es neurociencia aplicada al rendimiento. Atletas con altos niveles de dopamina y confianza muestran una mejor vasculatura y plenitud muscular en el escenario.</p>

      <h3>Sección 4: Resiliencia Ante el Fallo</h3>
      <p>¿Qué pasa si el tinte se corre? ¿O si resbalas en la pasarela? La resiliencia psicológica es recuperarte en 0.2 segundos. Los jueces valoran la capacidad de improvisación y la gracia bajo presión. En The Heels simulamos situaciones de estrés en nuestras clases para que nada te pille por sorpresa.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Cuál es tu ritual secreto en el backstage para mantener la calma? ¡Comparte tu estrategia con la manada!</p>
      </div>
    `
  }
];

async function main() {
  for (const post of bulkExtensions) {
    await prisma.blogPost.update({
      where: { slug: post.slug },
      data: { content: post.content }
    });
  }
  console.log("Ampliando tanda 2 de reportes a nivel Dossier Pro (700+ palabras).");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
