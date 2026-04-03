import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Function to generate the consistent footer
const getFooter = (ctaText: string) => `
<div style="background: rgba(230, 192, 192, 0.1); padding: 24px; border-radius: 12px; border-left: 4px solid #e6c0c0; margin-top: 40px;">
  <p style="margin-bottom: 8px; font-weight: 800; letter-spacing: 0.1em; color: #8e6a6a; text-transform: uppercase; font-size: 11px;">👠 DEBATE PRO: THE HEELS ACADEMY</p>
  <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a;">${ctaText}</p>
</div>
`;

async function main() {
  const posts = await prisma.blogPost.findMany();
  
  for (const post of posts) {
    // Standardization Logic:
    // 1. Replace generic "Sección X:" with more professional headers if found (cleanup)
    let standardizedContent = post.content
      .replace(/Sección \d+:/g, '<strong>Análisis Técnico:</strong>')
      .replace(/Pilar \d+:/g, '<strong>Pilar Estratégico:</strong>');
      
    // 2. Ensure we have the standardized FOOTER
    // If it already has one, we clean it first
    standardizedContent = standardizedContent.split('👠 DEBATE PRO:')[0];
    
    // Default CTA based on category
    let cta = "¿Tienes dudas sobre cómo aplicar esto a tu categoría? ¡Pregúntanos abajo y eleva tu nivel!";
    if (post.category === "Posing") cta = "¿Quieres que revisemos tu pasarela? Comenta tus dudas o sube tu feedback en la academia.";
    if (post.category === "Nutrición") cta = "¿Cómo gestionas tú estas variables en tu preparación? ¡Cuéntanos tu experiencia nutricional aquí abajo!";

    standardizedContent += getFooter(cta);

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content: standardizedContent }
    });
  }
  
  console.log("Estandarización de estilo y cierres completada para todos los artículos.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
