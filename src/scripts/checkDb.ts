import { prisma } from "../lib/prisma";

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  users.forEach((u) =>
    console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`),
  );

  const instituteProfiles = await prisma.instituteProfile.findMany();
  console.log("\nInstitute Profiles in DB:", instituteProfiles);

  await prisma.$disconnect();
}

main().catch(console.error);
