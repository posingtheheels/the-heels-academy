import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany();
  
  for (const post of posts) {
    let cleanContent = post.content;
    
    // Replace Markdown headers with Bold Caps
    cleanContent = cleanContent.replace(/^# (.*$)/gim, '<strong>$1</strong><br/>');
    cleanContent = cleanContent.replace(/^## (.*$)/gim, '<strong>$1</strong><br/>');
    cleanContent = cleanContent.replace(/^### (.*$)/gim, '<strong>$1</strong><br/>');
    
    // Replace * bullets with - or numbers (User prefers numbers)
    // We'll do a simple replacement for bold specifically first
    cleanContent = cleanContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Fix the bullet points starting with *
    cleanContent = cleanContent.replace(/^\* /gm, '• ');
    
    // Ensure line breaks are consistent
    cleanContent = cleanContent.replace(/\n/g, '<br/>');

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content: cleanContent }
    });
    console.log("Updated: " + post.title);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
