import {
  AvailabilityStatus,
  UserRoles,
  UserStatus,
  type TutorProfiles,
  type TutorSubject,
  type User,
} from "../../../generated/prisma/client";
import type { TutorProfilesWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

type FilterItems = {
  search: string | null;
  hourlyRate: number | null;
  categoryId: string | null;
  isFeatured: boolean | null;
  avgRating: number | null;
  totalReviews: number | null;
  subjectId: string | null;

  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

const getAllTutors = async ({
  search,
  hourlyRate,
  categoryId,
  isFeatured,
  avgRating,
  totalReviews,
  subjectId,
  page,
  limit,
  sortBy,
  skip,
  sortOrder,
}: FilterItems) => {
  const andConditions: TutorProfilesWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          bio: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (subjectId) {
    andConditions.push({
      subjects: {
        some: {
          subjectId: subjectId,
        },
      },
    });
  }

  if (hourlyRate) {
    andConditions.push({
      hourlyRate: {
        lte: hourlyRate,
      },
    });
  }

  if (categoryId) {
    andConditions.push({
      categoryId,
    });
  }

  if (isFeatured !== null) {
    andConditions.push({
      isFeatured: isFeatured,
    });
  }

  if (avgRating) {
    andConditions.push({
      avgRating: {
        gte: avgRating,
      },
    });
  }

  if (totalReviews) {
    andConditions.push({
      totalReviews: {
        gte: totalReviews,
      },
    });
  }

  andConditions.push({
    user: {
      status: UserStatus.ACTIVE,
    },
  });

  const result = await prisma.tutorProfiles.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: true,
      availability: true,
      category: true,
      subjects: {
        include: {
          subject: true,
        },
      },
      reviews: {
        include: {
          student: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  const total = await prisma.tutorProfiles.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTutorById = async (tutorId: string) => {
  const tutor = await prisma.tutorProfiles.findUnique({
    where: {
      id: tutorId,
    },
    include: {
      user: true,
      category: true,
      availability: true,
      reviews: {
        include: {
          student: true,
        },
      },
      subjects: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!tutor) return null;

  const relatedTutors = tutor.categoryId
    ? await prisma.tutorProfiles.findMany({
        where: {
          categoryId: tutor.categoryId,
          id: { not: tutorId },
          user: { status: "ACTIVE" },
        },
        take: 4,
        include: {
          user: true,
          category: true,
          availability: true,
          _count: { select: { reviews: true } },
        },
        orderBy: { avgRating: "desc" },
      })
    : [];

  return { ...tutor, relatedTutors };
};

const updateTutor = async (data: Partial<TutorProfiles>, user: User) => {
  if (user.role !== UserRoles.ADMIN) {
    delete data.isFeatured;
    delete data.avgRating;
    delete data.totalReviews;
  }

  return await prisma.tutorProfiles.update({
    where: {
      userId: user.id,
    },
    data,
  });
};

const updateTutorSubjects = async (subjectIds: string[], user: User) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }

  if (!tutorProfile.categoryId) {
    throw new Error("Tutor profile category not found");
  }

  const subjects = await prisma.subject.findMany({
    where: {
      id: { in: subjectIds },
    },
    select: {
      id: true,
      categoryId: true,
    },
  });

  if (subjects.length !== subjectIds.length) {
    throw new Error("One or more subjects are invalid");
  }

  const invalidSubject = subjects.find(
    (s) => s.categoryId !== tutorProfile.categoryId,
  );

  if (invalidSubject) {
    throw new Error("You selected a subject outside your category");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.tutorSubject.deleteMany({
      where: {
        tutorId: tutorProfile.id,
      },
    });

    const data = subjectIds.map((subjectId) => ({
      tutorId: tutorProfile.id,
      subjectId,
    }));

    return await tx.tutorSubject.createManyAndReturn({
      data,
    });
  });
};

const deleteTutorSubject = async (subjectId: string, user: User) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId: user.id },
  });

  if (!tutorProfile) {
    throw new Error("Tutor not found");
  }

  return await prisma.tutorSubject.delete({
    where: {
      tutorId_subjectId: {
        tutorId: tutorProfile.id,
        subjectId: subjectId,
      },
    },
  });
};

const featureTutor = async (isFeatured: boolean, tutorId: string) => {
  return await prisma.tutorProfiles.update({
    where: {
      id: tutorId,
    },
    data: {
      isFeatured,
    },
  });
};

const getTopTutors = async (limit = 6) => {
  return await prisma.tutorProfiles.findMany({
    where: {
      isFeatured: true,
      user: {
        status: UserStatus.ACTIVE,
      },
    },
    take: limit,
    orderBy: {
      avgRating: "desc",
    },
    include: {
      user: true,
      category: true,
      availability: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });
};

const getTutorDashboardOverview = async (user: User) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      bio: true,
      hourlyRate: true,
      avgRating: true,
      totalReviews: true,
      isFeatured: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      subjects: {
        select: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }

  return await prisma.$transaction(async (tx) => {
    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      upcomingBookings,
      totalEarnings,
      recentReviews,
      availabilities,
    ] = await Promise.all([
      tx.booking.count({
        where: {
          tutorId: tutorProfile.id,
        },
      }),

      tx.booking.count({
        where: {
          tutorId: tutorProfile.id,
          status: "COMPLETED",
        },
      }),

      tx.booking.count({
        where: {
          tutorId: tutorProfile.id,
          status: "CANCELLED",
        },
      }),

      tx.booking.findMany({
        where: {
          tutorId: tutorProfile.id,
          status: { in: ["CONFIRMED", "PENDING"] },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          price: true,
          status: true,
          createdAt: true,
          completedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          availability: {
            select: {
              day: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      }),

      tx.booking.aggregate({
        where: {
          tutorId: tutorProfile.id,
          status: "COMPLETED",
        },
        _sum: {
          price: true,
        },
      }),

      tx.review.findMany({
        where: {
          tutorId: tutorProfile.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          student: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),

      tx.availability.findMany({
        where: {
          tutorId: tutorProfile.id,
        },
        orderBy: {
          day: "asc",
        },
        select: {
          id: true,
          day: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      }),
    ]);

    const activeAvailabilities = availabilities.filter(
      (a) => a.status === AvailabilityStatus.AVAILABLE,
    );

    return {
      profile: {
        bio: tutorProfile.bio,
        hourlyRate: tutorProfile.hourlyRate,
        avgRating: tutorProfile.avgRating,
        totalReviews: tutorProfile.totalReviews,
        isFeatured: tutorProfile.isFeatured,
        category: tutorProfile.category,
        subjects: tutorProfile.subjects.map(
          (tutorSubejct) => tutorSubejct.subject,
        ),
      },
      stats: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        upcomingCount: upcomingBookings.length,
        totalEarnings: totalEarnings._sum.price ?? 0,
      },
      upcomingBookings,
      recentReviews,
      availability: {
        total: availabilities.length,
        activeSlots: activeAvailabilities.length,
        slots: availabilities,
      },
    };
  });
};

export const tutorService = {
  getAllTutors,
  getTutorById,
  getTopTutors,
  updateTutor,
  updateTutorSubjects,
  deleteTutorSubject,
  featureTutor,
  getTutorDashboardOverview,
};
