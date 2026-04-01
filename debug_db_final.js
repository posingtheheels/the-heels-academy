const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- INICIANDO DIAGNÓSTICO DE BLOG ---");
  try {
    const count = await prisma.blogPost.count();
    console.log("CANTIDAD DE ARTÍCULOS:", count);
    
    if (count > 0) {
      const posts = await prisma.blogPost.findMany();
      console.log("LISTADO DE TÍTULOS:");
      posts.forEach(p => console.log(`- ${p.title} (Publicado: ${p.published})`));
    } else {
      console.log("ALERTA: ¡La tabla está VACÍA!");
    }
  } catch (error) {
    console.error("ERROR CRÍTICO:", error.message);
  } finally {
    await prisma.$disconnect();
    console.log("--- FIN DEL DIAGNÓSTICO ---");
  }
}

main();
