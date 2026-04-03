import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Consistent styles for paragraph spacing and typography
const pStyle = 'style="margin-bottom: 1.5rem; line-height: 1.8; color: #374151; font-size: 1.1rem;"';
const hLevel2Style = 'style="margin-top: 2.5rem; margin-bottom: 1rem; color: #111827; font-weight: 700; font-size: 1.5rem; font-family: serif;"';
const hLevel3Style = 'style="margin-top: 2rem; margin-bottom: 0.75rem; color: #1f2937; font-weight: 600; font-size: 1.25rem;"';

const getStandardizedFooter = (ctaText: string) => `
<div style="background: rgba(230, 192, 192, 0.1); padding: 32px; border-radius: 16px; border-left: 6px solid #e6c0c0; margin-top: 48px; border-top: 1px solid rgba(230, 192, 192, 0.2);">
  <p style="margin-bottom: 12px; font-weight: 900; letter-spacing: 0.2em; color: #8e6a6a; text-transform: uppercase; font-size: 12px;">👠 DEBATE PRO: THE HEELS ACADEMY</p>
  <p style="font-size: 16px; line-height: 1.6; color: #4b5563; font-style: italic;">${ctaText}</p>
</div>
`;

async function main() {
  const posts = await prisma.blogPost.findMany();
  
  for (const post of posts) {
    let content = post.content
      .split('👠 DEBATE PRO:')[0] // Clean footer
      .replace(/<br\s*\/?>/gi, '</p><p ' + pStyle + '>') // Replace breaks with paragraph tags
      .replace(/<div>/gi, '<p ' + pStyle + '>')
      .replace(/<\/div>/gi, '</p>')
      .replace(/<h2>(.*?)<\/h2>/gi, `<h2 ${hLevel2Style}>$1</h2>`)
      .replace(/<h3>(.*?)<\/h3>/gi, `<h3 ${hLevel3Style}>$1</h3>`)
      .replace(/<strong>Análisis Técnico:<\/strong>/gi, `<h2 ${hLevel2Style}>Análisis Técnico</h2>`)
      .replace(/<strong>Pilar Estratégico:<\/strong>/gi, `<h2 ${hLevel2Style}>Pilar Estratégico</h2>`);

    // Clean up empty paragraphs and ensure start/end
    content = content.trim();
    if (!content.startsWith('<p ') && !content.startsWith('<h')) {
      content = `<p ${pStyle}>` + content;
    }
    if (!content.endsWith('</p>') && !content.endsWith('</h2>') && !content.endsWith('</h3>')) {
      content += '</p>';
    }

    // Category based CTA
    let cta = "¿Tienes dudas sobre cómo aplicar este análisis a tu preparación actual? ¡Escribe tu consulta abajo y eleva tu nivel competitivo de la mano de The Heels!";
    if (post.category === "Posing") cta = "¿Notas que tu pasarela necesita este ajuste técnico? Comenta tus sensaciones o pide una revisión directa en la academia.";

    content += getStandardizedFooter(cta);

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content }
    });
  }
  
  console.log("Infraestructura de párrafos y tipografía estandarizada al nivel de Dossier Pro.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
