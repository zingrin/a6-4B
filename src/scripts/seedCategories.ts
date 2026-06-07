import "dotenv/config";
import { prisma } from "../lib/prisma";

const categories = [
  {
    name: "Web Development",
    description: "Frontend, backend, and full-stack web development courses.",
  },
  {
    name: "Mobile Development",
    description: "iOS, Android, and cross-platform mobile app development.",
  },
  {
    name: "Data Science",
    description: "Data analysis, machine learning, and AI courses.",
  },
  {
    name: "Cloud Computing",
    description: "AWS, Azure, GCP, and cloud architecture courses.",
  },
  {
    name: "Cybersecurity",
    description: "Ethical hacking, network security, and cyber defense.",
  },
  {
    name: "DevOps",
    description: "CI/CD, containerization, and infrastructure automation.",
  },
  {
    name: "UI/UX Design",
    description: "User interface and user experience design principles.",
  },
  {
    name: "Blockchain",
    description: "Cryptocurrency, smart contracts, and DeFi development.",
  },
  {
    name: "Game Development",
    description: "2D and 3D game design and development.",
  },
  {
    name: "Digital Marketing",
    description: "SEO, social media, content marketing and analytics.",
  },
];

async function seedCategories() {
  console.log("🌱 Seeding categories...");

  let created = 0;
  let skipped = 0;

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { name: category.name },
    });

    if (existing) {
      console.log(`  ⏭  Skipped (already exists): ${category.name}`);
      skipped++;
      continue;
    }

    await prisma.category.create({ data: category });
    console.log(`  ✅ Created: ${category.name}`);
    created++;
  }

  console.log(`\n✔ Done — ${created} created, ${skipped} skipped.`);
  await prisma.$disconnect();
}

seedCategories().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
