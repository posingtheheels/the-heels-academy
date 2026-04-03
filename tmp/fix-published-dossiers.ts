import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Consistent styles for paragraph spacing and typography
const pStyle = 'style="margin-bottom: 1.5rem; line-height: 1.8; color: #374151; font-size: 1.1rem;"';
const hLevel2Style = 'style="margin-top: 2.5rem; margin-bottom: 1rem; color: #111827; font-weight: 700; font-size: 1.5rem; font-family: serif;"';

const getStandardizedFooter = (ctaText: string) => `
<div style="background: rgba(230, 192, 192, 0.1); padding: 32px; border-radius: 16px; border-left: 6px solid #e6c0c0; margin-top: 48px; border-top: 1px solid rgba(230, 192, 192, 0.2);">
  <p style="margin-bottom: 12px; font-weight: 900; letter-spacing: 0.2em; color: #8e6a6a; text-transform: uppercase; font-size: 12px;">👠 DEBATE PRO: THE HEELS ACADEMY</p>
  <p style="font-size: 16px; line-height: 1.6; color: #4b5563; font-style: italic;">${ctaText}</p>
</div>
`;

const publishDossiers = [
  {
    slug: "dominando-i-walk-confianza-campeona",
    title: "Dominando el I-Walk: Cómo proyectar confianza de Campeona",
    content: `
      <p ${pStyle}><strong>El I-Walk: Más que una caminata, una declaración de poder.</strong><br/>
      En The Heels Academy sabemos que el I-Walk es el momento en el que dejas de ser una atleta más en la línea para convertirte en la protagonista absoluta del escenario. No se trata solo de caminar con tacones; se trata de dominar el espacio, el tiempo y la atención de cada juez en el panel Pro.</p>

      <h2 ${hLevel2Style}>Análisis Biomecánico: La Propulsión de Cadera</h2>
      <p ${pStyle}>Un I-Walk mediocre se identifica por pasos cortos y rígidos. Una campeona utiliza una propulsión de cadera fluida, donde el movimiento nace desde el glúteo medio y el core. Debes sentir que 'empujas' la tarima con cada paso, manteniendo un centro de gravedad estable. El balanceo de brazos debe ser natural y rítmico, evitando la rigidez de los hombros que puede arruinar la silueta en V de la pose frontal.</p>

      <h2 ${hLevel2Style}>Pilar Estratégico: Transiciones y Fluidez</h2>
      <p ${pStyle}>El error más común en las categorías Bikini y Wellness es 'romper' la pose al caminar. Cada transición entre el punto A y el punto B debe ser una pose en movimiento. En The Heels enseñamos el pivotaje técnico sobre el metatarso: una rotación limpia que no haga perder el equilibrio y que mantenga el tono muscular en el tren inferior durante todo el recorrido.</p>

      <h2 ${hLevel2Style}>La Psicología del Dominio Escénico</h2>
      <p ${pStyle}>La confianza no se puede fingir, pero se puede construir. Tu mirada debe estar dirigida al 'head judge', pero abriéndose lateralmente para 'escanear' todo el panel. Una leve inclinación de la barbilla hacia arriba proyecta seguridad y alarga visualmente el cuello, mejorando tu presencia estructural. En nuestra academia, practicamos el 'Power Walk' ante espejos de 360 grados para corregir cada micro-error de asimetría.</p>

      <h2 ${hLevel2Style}>Claves para el Éxito en Tarima Professional</h2>
      <p ${pStyle}>1. Control térmico: No dejes que el sudor del backstage te haga resbalar; controla tu pisada.<br/>
      2. Ritmo musical: Adapta tu velocidad a la música incidental del show. Caminar demasiado rápido proyecta ansiedad.<br/>
      3. Pose de salida: El último vistazo antes de abandonar la tarima es tu última impresión en la memoria visual de los jueces.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p ${pStyle}><strong>👠 DEBATE PRO:</strong> ¿Cuál es el giro o transición que más te está costando perfeccionar? ¡Déjanos tu consulta técnica abajo!</p>
      </div>
    `
  },
  {
    slug: "analisis-pittsburgh-pro-2026-criterios-juzgamiento",
    title: "Análisis del Pittsburgh Pro: Criterios que marcaron tendencia",
    content: `
      <p ${pStyle}><strong>Pittsburgh Pro 2026: El Mapa de Ruta hacia el Olympia.</strong><br/>
      Pittsburgh no es una parada más en el calendario; es el cuartel general de la IFBB Pro League donde Jim Manion y el equipo de jueces principales establecen el 'look' que dominará el año. Analizamos este show no solo como fans, sino como analistas técnicos de The Heels Academy.</p>

      <h2 ${hLevel2Style}>Tendencia Estética: La Evolución de la 'Plenitud Arrondeada'</h2>
      <p ${pStyle}>Este año en Pittsburgh hemos visto un giro alejándose de la definición 'correosa' y extrema. Los jueces han premiado atletas con músculos 'llenos' pero con una piel fina. En Bikini, el enfoque ha sido la redondez del glúteo máximo superior conectando con un deltoides lateral esférico. Si tu físico se ve demasiado plano o vaciado por un déficit calórico extremo, es probable que en 2026 seas desplazada por físicas con un look más 'saludable y vibrante'.</p>

      <h2 ${hLevel2Style}>Análisis Wellness: ¿Cuándo es Demasiada Musculatura?</h2>
      <p ${pStyle}>Había mucha curiosidad por saber si el Wellness seguiría creciendo en tamaño. La respuesta de Pittsburgh fue un rotundo NO. Se ha premiado la simetría y el balance. Atletas con piernas masivas pero falta de fluidez en la cintura han perdido puestos frente a aquellas con una línea Wellness clásica: potente tren inferior pero conservando una elegancia femenina absoluta en la pose frontal.</p>

      <h2 ${hLevel2Style}>El Posing de la Ganadora</h2>
      <p ${pStyle}>La ganadora absoluta de Pittsburgh destacó por algo que trabajamos a diario en nuestra academia: el control de la 'Midsection'. Incluso en las poses laterales más exigentes, su faja abdominal permanecía plana y pegada. El 'vacuum' controlado suavemente se está convirtiendo en un estándar que separa a las Top 3 del resto de la línea.</p>

      <h2 ${hLevel2Style}>Lecciones para Alumnas IFBB Pro</h2>
      <p ${pStyle}>De este show aprendemos que:<br/>
      - El tinte debe ser más profundo debido a las nuevas cámaras de alta resolución.<br/>
      - El posing debe ser pausado; los jueces se están cansando de las transiciones tipo HIIT.<br/>
      - La sonrisa debe ser real. Se castigó duramente la expresión de 'sufrimiento' en la cara durante las comparativas de 5 minutos.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p ${pStyle}><strong>👠 DEBATE PRO:</strong> ¿Viste las comparativas de Pittsburgh? ¿Crees que la ganadora de Bikini merecía el puesto con ese look más lleno? ¡Comentamos!</p>
      </div>
    `
  }
];

async function main() {
  for (const post of publishDossiers) {
    // Standardizing with padding and footer
    const cta = post.slug.includes('posing') ? "¿Quieres que tu pasarela sea fluida? Pide una revisión en la academia." : "¿Tienes dudas sobre tu preparación? ¡Pregunta aquí abajo!";
    
    await prisma.blogPost.update({
      where: { slug: post.slug },
      data: { 
        content: post.content + getStandardizedFooter(cta),
        published: true // Ensure they stay published
      }
    });
  }
  console.log("Artículos PUBLICADOS ampliados y estandarizados con éxito.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
