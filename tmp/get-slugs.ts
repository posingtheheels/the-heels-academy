import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany({ select: { slug: true, title: true } });
  console.log(JSON.stringify(posts));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
