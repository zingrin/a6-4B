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

  const updatePromises = tutors
    .map((tutor, i) => {
      const category = categories[i % categories.length];
      if (!tutor || !category) return null;

      return prisma.tutorProfiles.update({
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
    })
    .filter((p): p is any => p !== null);

  await prisma.$transaction(updatePromises);
  console.log(`Successfully updated ${updatePromises.length} tutors.`);

  await prisma.$disconnect();
}

main().catch(console.error);
