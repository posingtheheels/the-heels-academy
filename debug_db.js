const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- DB Audit Starting ---');
  try {
    const list = await prisma.blogPost.findMany();
    console.log('Posts found:', list.length);
    list.forEach(p => console.log('- ', p.title, `(Slug: ${p.slug}, Published: ${p.published})`));
  } catch (err) {
    console.error('Audit Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
