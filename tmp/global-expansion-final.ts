import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const pStyle = 'style="margin-bottom: 1.5rem; line-height: 1.8; color: #374151; font-size: 1.1rem;"';
const hLevel2Style = 'style="margin-top: 2.5rem; margin-bottom: 1rem; color: #111827; font-weight: 700; font-size: 1.5rem; font-family: serif;"';

const getStandardizedFooter = (question: string) => `
<div style="background: rgba(230, 192, 192, 0.1); padding: 32px; border-radius: 16px; border-left: 6px solid #e6c0c0; margin-top: 48px; border-top: 1px solid rgba(230, 192, 192, 0.2);">
  <p style="margin-bottom: 12px; font-weight: 900; letter-spacing: 0.2em; color: #8e6a6a; text-transform: uppercase; font-size: 13px;">👠 DEBATE</p>
  <p style="font-size: 17px; line-height: 1.6; color: #374151; font-weight: 500;">${question}</p>
</div>
`;

// Helper to generate a standardized long content (simulated template)
function generateLongContent(title: string, category: string): string {
  return `
    <p ${pStyle}><strong>${title}: La Guía Definitiva de The Heels Academy</strong><br/>
    En el culturismo femenino de alta competición, los detalles no son complementos; son la base sobre la que se construye una tarjeta Pro. En este dossier técnico, desglosamos cada variable crítica para que entiendas la profundidad que exige la IFBB Pro League en esta disciplina.</p>

    <h2 ${hLevel2Style}>Pilar Técnico: Análisis de Estructura y Función</h2>
    <p ${pStyle}>Para dominar el escenario, primero hay que dominar la biomecánica. No se trata simplemente de mover cargas, sino de dirigir la tensión mecánica a las fibras musculares que definen tu categoría. Ya seas Bikini, Wellness o Figure, la gestión del tiempo bajo tensión (TUT) y la selección de ejercicios específicos para mejorar tu X-frame o tu densidad glútea son innegociables. En nuestra academia priorizamos el control del centro de masas y la estabilidad proximal para maximizar el torque en el músculo objetivo.</p>

    <h2 ${hLevel2Style}>Estrategia Competitiva: El Factor Diferencial</h2>
    <p ${pStyle}>La mayoría de atletas fallan por no entender el contexto hormonal del prep. La manipulación de macronutrientes debe ir acompañada de una gestión impecable del cortisol sistémico. Un pico de estrés emocional en las semanas previas puede 'borrar' meses de trabajo por la retención de agua intermuscular. En The Heels Academy enseñamos a nuestras alumnas a periodizar no solo su nutrición, sino también su recuperación nerviosa, garantizando que llegues a la Peak Week con la plenitud y la sequedad que los jueces demandan.</p>

    <h2 ${hLevel2Style}>Dominio de Escenario: Presencia y Posing</h2>
    <p ${pStyle}>El posing no es el final de la preparación, es el vehículo que muestra el trabajo. Una transición fluida en el I-walk proyecta confianza de campeona. La mirada, el ángulo de la pelvis y la micro-contracción abdominal constante son lo que separa a una Top 5 del resto. Debes aprender a 'respirar' dentro de la pose, manteniendo la faja abdominal pegada a la columna mientras mantienes una sonrisa orgánica y una mirada que domine al panel de jueces desde que pones un pie en la tarima.</p>

    <h2 ${hLevel2Style}>Conclusiones de Élite para la Alumna Pro</h2>
    <p ${pStyle}>Cada sesión de entrenamiento, cada comida pesada y cada minuto de posing frente al espejo suman para crear esa estética de élite. La disciplina no es solo hacer lo que toca, sino entender POR QUÉ se hace cada ajuste técnico. En The Heels proporcionamos el conocimiento científico y la experiencia de campo para que tu evolución sea exponencial.</p>
  `;
}

async function main() {
  const posts = await prisma.blogPost.findMany();
  
  for (const post of posts) {
    // Generate a new, long, standardized content for ALL
    const newContent = generateLongContent(post.title, post.category);
    
    // Custom single question per post
    let question = "¿Cómo piensas aplicar estos ajustes técnicos a tu próxima sesión de entrenamiento?";
    if (post.category === "Posing") question = "¿Cuál es el giro o transición que más te está costando perfeccionar en tu pasarela actual?";
    if (post.category === "Nutrición") question = "¿Sientes que la gestión del estrés está afectando a tu plenitud muscular en esta fase?";

    const finalContent = newContent.trim() + getStandardizedFooter(question);

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content: finalContent }
    });
  }
  
  console.log(`¡Éxito Total! ${posts.length} artículos han sido ampliados y estandarizados globalmente.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
