import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../utils/paginationHelper";

const getOverview = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const profile = await tx.mentorProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Mentor profile not found");

    const mentorId = profile.id;

    const totalCourses = await tx.course.count({
      where: { mentors: { some: { id: mentorId } } },
    });

    const totalStudents = await tx.courseEnrollment.count({
      where: { course: { mentors: { some: { id: mentorId } } } },
    });

    const tutor = await tx.tutorProfiles.findUnique({
      where: { userId },
      select: { avgRating: true, totalReviews: true },
    });
    const avgRating = tutor?.avgRating ? Number(tutor.avgRating) : 0;
    const totalReviews = tutor?.totalReviews ?? 0;

    const levelGroups = await tx.course.groupBy({
      by: ["level"],
      where: { mentors: { some: { id: mentorId } } },
      _count: { _all: true },
    });
    const coursesByLevel = levelGroups.map((g) => ({
      name: g.level.charAt(0) + g.level.slice(1).toLowerCase(),
      value: g._count._all,
    }));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentEnrollments = await tx.courseEnrollment.findMany({
      where: {
        course: { mentors: { some: { id: mentorId } } },
        enrolledAt: { gte: sixMonthsAgo },
      },
      select: { enrolledAt: true },
    });

    const monthMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      monthMap[key] = 0;
    }
    for (const e of recentEnrollments) {
      const key = new Date(e.enrolledAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (monthMap[key] !== undefined) monthMap[key]++;
    }
    const enrollmentsTrend = Object.entries(monthMap).map(([month, count]) => ({
      month,
      enrollments: count,
    }));

    // Top 5 Courses by Enrollment
    const topCourses = await tx.course.findMany({
      where: { mentors: { some: { id: mentorId } } },
      select: {
        title: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    });

    const recentActivity = await tx.courseEnrollment.findMany({
      where: { course: { mentors: { some: { id: mentorId } } } },
      include: {
        student: { select: { name: true, image: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: "desc" },
      take: 5,
    });

    return {
      stats: { totalCourses, totalStudents, avgRating, totalReviews },
      enrollmentsTrend,
      coursesByLevel,
      topCourses: topCourses.map((c) => ({
        name: c.title,
        enrollments: c._count.enrollments,
      })),
      recentActivity,
      instituteId: profile.instituteId,
    };
  });
};

const listAssignedCourses = async (userId: string, query: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationSortingHelper(query);
  const profile = await prisma.mentorProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Mentor profile not found");

  const where = { mentors: { some: { id: profile.id } } };
  const total = await prisma.course.count({ where });
  const data = await prisma.course.findMany({
    where,
    include: {
      category: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const listMentorStudents = async (userId: string, query: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationSortingHelper(query);
  const profile = await prisma.mentorProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Mentor profile not found");

  const where = { course: { mentors: { some: { id: profile.id } } } };

  const total = await prisma.courseEnrollment.count({ where });
  const data = await prisma.courseEnrollment.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true, image: true } },
      course: { select: { id: true, title: true } },
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getMyProfile = async (userId: string) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true, image: true } } },
  });
  if (!profile) throw new Error("Mentor profile not found");
  return profile;
};

const updateProfile = async (userId: string, data: any) => {
  return await prisma.$transaction(async (tx) => {
    // Update User info if name or avatarUrl
    if (data.name || data.avatarUrl) {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.avatarUrl && { image: data.avatarUrl }),
        },
      });
    }

    // Update Mentor Profile
    return await tx.mentorProfile.update({
      where: { userId },
      data: {
        title: data.title,
        bio: data.bio,
        expertise: data.expertise,
        avatarUrl: data.avatarUrl,
      },
    });
  });
};

export const mentorService = {
  getOverview,
  listAssignedCourses,
  listMentorStudents,
  getMyProfile,
  updateProfile,
};
