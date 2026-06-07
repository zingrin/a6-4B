import { prisma } from "../lib/prisma";
import { UserRoles } from "../../generated/prisma/enums";

async function main() {
  // 1. Find or create an Institute user
  const email = "academy@skillbridge.com";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: "institute-user-id-1",
        name: "SkillBridge Academy",
        email,
        role: UserRoles.INSTITUTE,
        emailVerified: true,
      },
    });
    console.log("Created Institute User.");
  }

  // 2. Create InstituteProfile if not exists
  let profile = await prisma.instituteProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    profile = await prisma.instituteProfile.create({
      data: {
        userId: user.id,
        name: "SkillBridge Academy",
        description: "Leading tech and professional skills training provider.",
        contactEmail: "contact@skillbridge.com",
        website: "https://skillbridge.com",
      },
    });
    console.log("Created Institute Profile.");
  }

  // 3. Get Categories
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.log("Please run seedCategories first.");
    return;
  }

  // 4. Create courses
  const courseData = [
    {
      title: "Complete Web Development Bootcamp",
      description:
        "Learn HTML, CSS, JavaScript, React, Node.js, and build full-stack web applications.",
      price: 99,
      level: "BEGINNER" as const,
      duration: "45 hours",
      isPublished: true,
      categoryId: categories.find((c) => c.name === "Web Development")?.id,
    },
    {
      title: "iOS & Android Mobile App Development",
      description:
        "Master React Native and Flutter to build high performance mobile apps for iOS and Android.",
      price: 129,
      level: "INTERMEDIATE" as const,
      duration: "35 hours",
      isPublished: true,
      categoryId: categories.find((c) => c.name === "Mobile Development")?.id,
    },
    {
      title: "Data Science & Machine Learning with Python",
      description:
        "Dive deep into data analysis, statistical methods, neural networks and machine learning algorithms.",
      price: 149,
      level: "ADVANCED" as const,
      duration: "50 hours",
      isPublished: true,
      categoryId: categories.find((c) => c.name === "Data Science")?.id,
    },
    {
      title: "AWS Certified Cloud Practitioner & Solutions Architect",
      description:
        "Prepare for AWS certification exams and learn core cloud architecture principles.",
      price: 89,
      level: "BEGINNER" as const,
      duration: "25 hours",
      isPublished: true,
      categoryId: categories.find((c) => c.name === "Cloud Computing")?.id,
    },
    {
      title: "Cybersecurity & Ethical Hacking Complete Course",
      description:
        "Understand penetration testing, network defense, threat assessment and cybersecurity tools.",
      price: 119,
      level: "INTERMEDIATE" as const,
      duration: "30 hours",
      isPublished: true,
      categoryId: categories.find((c) => c.name === "Cybersecurity")?.id,
    },
  ];

  for (const course of courseData) {
    const existing = await prisma.course.findFirst({
      where: { title: course.title },
    });

    if (existing) {
      console.log(`Skipped existing course: ${course.title}`);
      continue;
    }

    await prisma.course.create({
      data: {
        instituteId: profile.id,
        title: course.title,
        description: course.description,
        price: course.price,
        level: course.level,
        duration: course.duration,
        isPublished: course.isPublished,
        categoryId: course.categoryId,
      },
    });

    console.log(`Created course: ${course.title}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
