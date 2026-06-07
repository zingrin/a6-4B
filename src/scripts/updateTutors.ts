import { prisma } from "../lib/prisma";

async function main() {
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.log("No categories found. Run seedCategories first.");
    return;
  }

  const tutors = await prisma.tutorProfiles.findMany({
    include: { user: true },
  });

  console.log(`Found ${tutors.length} tutors.`);

  for (let i = 0; i < tutors.length; i++) {
    const tutor = tutors[i];
    const category = categories[i % categories.length];

    if (!tutor || !category) continue;

    // Update the tutor profile
    await prisma.tutorProfiles.update({
      where: { id: tutor.id },
      data: {
        categoryId: category.id,
        isFeatured: true,
        hourlyRate: 25 + i * 5,
        avgRating: 4.5 + i * 0.1,
        totalReviews: 5 + i * 3,
        bio: `Experienced educator specializing in ${category.name}. I help students achieve their goals.`,
      },
    });

    console.log(
      `Updated tutor ${tutor.user.name} to category ${category.name} and set featured: true`,
    );
  }

  await prisma.$disconnect();
}

main().catch(console.error);
