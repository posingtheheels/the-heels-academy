import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const masterclassPosts = [
  {
    slug: "enfoque-gluteo-femoral-tie-in-perfecto",
    content: `
      <p><strong>El Santo Grial del Tren Inferior: El Tie-in</strong><br/>
      En el culturismo femenino, la unión entre el glúteo mayor y el bíceps femoral (conocido como 'Tie-in') es uno de los criterios con más peso en las comparativas de espaldas. Lograr esa separación nítida sin perder la redondez es un arte técnico que requiere más que simplemente hacer peso muerto.</p>

      <h3>Mecánica del Aislamiento Glúteo-Femoral</h3>
      <p>Para conseguir un tie-in profundo, debemos enfocarnos en la fase de estiramiento del glúteo bajo y la fase de acortamiento del femoral superior. Muchos atletas sobreentrenan el glúteo medio pero olvidan la importancia de la hipertrofia del origen del bíceps femoral en la tuberosidad isquiática.</p>

      <h3>Sección 1: Protocolo de Entrenamiento 'Tie-in'</h3>
      <p>Nuestro protocolo recomendado en The Heels incluye:<br/>
      <strong>1. Hip Thrust con Isometría:</strong> Mantener 2 segundos de contracción máxima en la parte superior para densificar la base del glúteo.<br/>
      <strong>2. Peso Muerto Rumano con Posicionamiento Elevado:</strong> Usar una pequeña elevación en las punteras para reclutar más fibras del femoral superior.<br/>
      <strong>3. Curl Femoral Sentado:</strong> Es el único ejercicio que permite el estiramiento máximo del femoral bajo carga controlada.</p>

      <h3>Sección 2: La Variable de la Retención Interna</h3>
      <p>A menudo, el tie-in no se ve no por falta de músculo, sino por una fina capa de retención de agua intermuscular. Esto se combate con un manejo preciso del equilibrio Sodio/Potasio y evitando alimentos inflamatorios que causen edema en la zona de la cadera.</p>

      <h3>Sección 3: El Posing como Herramienta de Separación</h3>
      <p>Aprender a 'abrir' los femorales en la pose posterior es vital. Al rotar los talones hacia adentro y presionar hacia afuera con las rodillas sin despegar los pies, creas una tensión lateral que ayuda a que el corte del tie-in sea mucho más visible ante los jueces.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Notas que pierdes el corte del tie-in cuando subes las grasas en la dieta? ¡Dinos cómo gestionas tu definición en esa zona rebelde!</p>
      </div>
    `
  },
  {
    slug: "hipertrofia-figure-hombros-3d",
    content: `
      <p><strong>La Estructura en 'V': El Hombro como Pilar de Figure</strong><br/>
      En la categoría Figure, la anchura clavicular y la redondez del deltoides lateral son innegociables. Sin unos hombros 3D, la ilusión de la cintura pequeña se rompe. Aquí analizamos los protocolos de alta densidad que utilizamos en la Academia.</p>

      <h3>Biomecánica del Deltoides en Tres Dimensiones</h3>
      <p>El deltoides no es un solo músculo. Para ese aspecto 3D, el enfoque debe estar en los tres 'cabezales', pero con especial énfasis en el lateral para crear anchura y el posterior para crear profundidad lateral.</p>

      <h3>Sección 1: Dropsets Mecánicos de Elevación Lateral</h3>
      <p>El deltoides responde extraordinariamente bien al estrés metabólico. Recomendamos nuestro protocolo 10-10-10:<br/>
      - 10 repeticiones pesadas con mancuerna perfectamente controladas.<br/>
      - 10 repeticiones con un 30% menos de peso con máximo control de fase excéntrica.<br/>
      - 10 repeticiones finales parciales en el punto de máxima tensión.<br/>
      Realizar esto 3 veces por semana es el camino más rápido hacia la forma de 'coco'.</p>

      <h3>Sección 2: La Importancia del Deltoides Posterior</h3>
      <p>Un error común es descuidar la parte trasera del hombro. Sin ella, la pose de perfil se ve plana. Incluye 'Face Pulls' y 'Reverse Flys' con el pecho apoyado para evitar las trampas con el romboides y el trapecio.</p>

      <h3>Sección 3: Nutrición para la Plenitud Muscular</h3>
      <p>Para que el hombro se vea 'redondo', el músculo debe estar lleno de glucógeno. Durante el prep, es la primera zona que tiende a verse plana. Gestionar los 'refeeds' de carbohidratos es una técnica avanzada para evaluar cómo responde tu deltoides antes de salir a tarima.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Entrenas hombros en una sesión dedicada o los doblas con otros grupos? ¡Compártenos tu split de entrenamiento!</p>
      </div>
    `
  },
  {
    slug: "gestion-cortisol-peak-week-culturismo",
    content: `
      <p><strong>El Cortisol: El Enemigo Invisible de la Peak Week</strong><br/>
      Llegas a la última semana increíble, y de repente, el día del show te ves 'tapada'. En un 90% de los casos, no es fallo en los macros, es un pico de cortisol. El estrés emocional y el sobreentrenamiento activan la hormona aldosterona, que retiene sodio y agua fuera de la célula muscular.</p>

      <h3>Protocolo de Control Sistémico</h3>
      <p>En The Heels Academy, priorizamos la calma y el descanso tanto como el cardio en esta fase. No se trata de trabajar más duro, sino de llegar al escenario en un estado de equilibrio fisiológico.</p>

      <h3>Sección 1: Suplementación Estratégica Antiestrés</h3>
      <p>Recomendamos el uso de adaptógenos controlados:<br/>
      - <strong>Ashwagandha KSM-66:</strong> Para regular la respuesta suprarrenal por la noche.<br/>
      - <strong>Magnesio Bisglicinato:</strong> Esencial para la relajación muscular profunda y el control del sistema nervioso periférico.</p>

      <h3>Sección 2: El Factor 'Sueño'</h3>
      <p>Diferentes estudios muestran que dormir menos de 6 horas en Peak Week puede arruinar tu puesta a punto al 100%. Sin sueño reparador, no hay excreción de agua subcutánea eficiente. Tu cuerpo interpretará la falta de sueño como una amenaza y retendrá líquidos por supervivencia.</p>

      <h3>Sección 3: Carga de Hidratos Sin Estrés</h3>
      <p>La carga debe ser progresiva y tranquila. Las cargas agresivas de última hora pueden estresar el sistema digestivo, causando distensión abdominal y picos de cortisol por malestar. Come alimentos conocidos que sepas que digieres perfectamente.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Cómo gestionas los nervios los días previos al show? ¿Crees que te afecta a la retención de líquidos? ¡Debatamos abajo!</p>
      </div>
    `
  }
];

async function main() {
  for (const post of masterclassPosts) {
    await prisma.blogPost.update({
      where: { slug: post.slug },
      data: { content: post.content }
    });
  }
  console.log("Dossieres técnicos ampliados con éxito.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
