import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.log("No admin found.");
    return;
  }

  const updatedAdmin = await prisma.user.update({
    where: { id: admin.id },
    data: { email: "posingtheheels@gmail.com" },
  });

  console.log(`Admin email updated from ${admin.email} to ${updatedAdmin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
