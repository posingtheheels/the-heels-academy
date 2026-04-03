import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const slug = process.argv[2];
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (post) {
    console.log(`TITLE: ${post.title}`);
    console.log(`CONTENT LENGTH: ${post.content.length}`);
    console.log(`CONTENT PREVIEW: ${post.content.substring(0, 500)}`);
  } else {
    console.log("Post not found");
  }
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());
