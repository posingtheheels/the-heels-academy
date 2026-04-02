import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Move ALL articles to draft status
  const result = await prisma.blogPost.updateMany({
    data: { published: false }
  });
  
  console.log(`Successfully moved ${result.count} articles to Drafts.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
