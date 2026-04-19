import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: { title: true, createdAt: true, slug: true, published: true }
  })
  console.log(JSON.stringify(posts, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
