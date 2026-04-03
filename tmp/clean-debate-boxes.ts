import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getStandardizedFooter = (question: string) => `
<div style="background: rgba(230, 192, 192, 0.1); padding: 32px; border-radius: 16px; border-left: 6px solid #e6c0c0; margin-top: 48px; border-top: 1px solid rgba(230, 192, 192, 0.2);">
  <p style="margin-bottom: 12px; font-weight: 900; letter-spacing: 0.2em; color: #8e6a6a; text-transform: uppercase; font-size: 13px;">👠 DEBATE</p>
  <p style="font-size: 17px; line-height: 1.6; color: #374151; font-weight: 500;">${question}</p>
</div>
`;

async function main() {
  const posts = await prisma.blogPost.findMany();
  
  for (const post of posts) {
    // 1. Clean ALL previous footers/debates (using common strings found in screenshots)
    let cleanContent = post.content
      .split('<div style="background: rgba(230, 192, 192, 0.1)')[0]
      .split('<div style="background: #f8f8f8')[0]
      .split('👠 DEBATE')[0] // Catch both DEBATE PRO and DEBATE
      .trim();

    // 2. Select a single punchy question based on the post category or title
    let luckyQuestion = "¿Tienes alguna duda técnica sobre cómo aplicar este análisis a tu preparación actual?";
    
    if (post.slug.includes('posing')) luckyQuestion = "¿Cuál es el giro o transición que más te está costando perfeccionar en tu pasarela?";
    if (post.slug.includes('nutricion') || post.slug.includes('diet')) luckyQuestion = "¿Cómo gestionas tú estas variables metabólicas en tu fase de corte?";
    if (post.slug.includes('pittsburgh')) luckyQuestion = "¿Crees que la ganadora de Bikini merecía el puesto con ese look más lleno y armónico?";
    if (post.slug.includes('new-york')) luckyQuestion = "¿Crees que Nueva York es el show más difícil del año después del Olympia?";
    if (post.slug.includes('psicologia') || post.slug.includes('mente')) luckyQuestion = "¿Cuál es tu ritual secreto en el backstage para mantener la calma?";
    if (post.slug.includes('cortisol')) luckyQuestion = "¿Sientes que los niveles de estrés te han afectado a la retención de líquidos en competiciones previas?";
    if (post.slug.includes('tie-in')) luckyQuestion = "¿Notas que tu glúteo pierde la nítidez del tie-in cuando subes las grasas en la dieta?";
    if (post.slug.includes('hombros') || post.slug.includes('figure')) luckyQuestion = "¿Entrenas hombros en una sesión dedicada o los doblas con otros grupos?";
    if (post.slug.includes('reglamento')) luckyQuestion = "¿Te parece justo que se penalice tanto el control abdominal en el nuevo reglamento?";
    if (post.slug.includes('sentadilla') || post.slug.includes('pierna')) luckyQuestion = "¿Cuál es tu RM en sentadilla libre y cómo gestionas la profundidad?";

    // 3. Re-assemble with a SINGLE footer
    const finalContent = cleanContent + getStandardizedFooter(luckyQuestion);

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content: finalContent }
    });
  }
  
  console.log("Limpieza y unificación de cajas DEBATE completada. Solo una pregunta por artículo.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
