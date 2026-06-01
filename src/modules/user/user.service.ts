import {
  BookingStatus,
  UserRoles,
  UserStatus,
  type User,
} from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import crypto from "crypto";
import { sendEmail } from "../../utils/email";
import { envVars } from "../../config/env";

type PaginationInput = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
  role?: UserRoles;
};

const listUsers = async ({
  page,
  limit,
  sortBy,
  skip,
  sortOrder,
  role,
}: PaginationInput) => {
  const whereCondition = role ? { role } : {};

  const total = await prisma.user.count({
    where: whereCondition,
  });

  const result = await prisma.user.findMany({
    where: whereCondition,
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder,
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

const getUser = async (user: User) => {
  return await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      studentReviews: user.role === UserRoles.STUDENT,
      studentBookings: user.role === UserRoles.STUDENT,
      tutorProfile: user.role === UserRoles.TUTOR && {
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      },
      instituteProfile: user.role === UserRoles.INSTITUTE,
    },
  });
};

const updateUserData = async (data: Partial<User>, user: User) => {
  const { name, image, phone } = data;

  if (!name && !image && !phone) {
    throw new Error("Invalid input fields");
  }

  const userExists = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.id,
    },
  });

  return await prisma.user.update({
    where: {
      id: userExists.id,
    },
    data: {
      ...(name && { name }),
      ...(image && { image }),
      ...(phone && { phone }),
    },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      phone: true,
    },
  });
};

const updateUserStatus = async (status: UserStatus, userId: string) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
  });
};

const getStudentStats = async (studentId: string) => {
  return await prisma.$transaction(async (tx) => {
    //  Stat Counts
    const [
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalEnrolledCourses,
      totalReviews,
    ] = await Promise.all([
      tx.booking.count({ where: { studentId } }),
      tx.booking.findMany({
        where: {
          studentId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        },
        take: 3,
        orderBy: { createdAt: "asc" },
        include: {
          tutor: { include: { user: { select: { name: true, image: true } } } },
          subject: { select: { name: true } },
          availability: {
            select: { day: true, startTime: true, endTime: true },
          },
        },
      }),
      tx.booking.count({
        where: { studentId, status: BookingStatus.COMPLETED },
      }),
      tx.courseEnrollment.count({
        where: { studentId, status: "ACTIVE" },
      }),
      tx.review.count({
        where: { studentId },
      }),
    ]);

    // Total Spent (Sum of all completed payments)
    const totalSpentResult = await tx.payment.aggregate({
      where: { studentId, status: "COMPLETED" },
      _sum: { amount: true },
    });
    const totalSpent = totalSpentResult._sum.amount ?? 0;

    // Service Mix (Donut Chart)
    // Spending on Courses vs Bookings
    const coursePaymentSum = await tx.payment.aggregate({
      where: {
        studentId,
        status: "COMPLETED",
        NOT: { courseEnrollmentId: null },
      },
      _sum: { amount: true },
    });
    const bookingPaymentSum = await tx.payment.aggregate({
      where: { studentId, status: "COMPLETED", NOT: { bookingId: null } },
      _sum: { amount: true },
    });

    const serviceMix = [
      { name: "Courses", value: coursePaymentSum._sum.amount ?? 0 },
      { name: "Tutoring", value: bookingPaymentSum._sum.amount ?? 0 },
    ];

    // Category Distribution (Bar/Donut)
    const categoryGroups = await tx.courseEnrollment.findMany({
      where: { studentId, status: "ACTIVE" },
      include: {
        course: { include: { category: true } },
      },
    });

    const categoryMap: Record<string, number> = {};
    categoryGroups.forEach((enrollment) => {
      const catName = enrollment.course.category?.name || "Other";
      categoryMap[catName] = (categoryMap[catName] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryMap).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    // ── Spending Trend – last 6 months (Line Chart) ────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentPayments = await tx.payment.findMany({
      where: {
        studentId,
        status: "COMPLETED",
        createdAt: { gte: sixMonthsAgo },
      },
      select: { amount: true, createdAt: true },
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
    for (const p of recentPayments) {
      const key = new Date(p.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (monthMap[key] !== undefined) {
        monthMap[key] += p.amount;
      }
    }
    const spendingTrend = Object.entries(monthMap).map(([month, amount]) => ({
      month,
      amount,
    }));

    // ── Recent Enrollments ──────────────────────────────────────
    const recentEnrollments = await tx.courseEnrollment.findMany({
      where: { studentId, status: "ACTIVE" },
      include: {
        course: {
          include: {
            institute: { select: { name: true } },
            category: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
      take: 4,
    });

    return {
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalEnrolledCourses,
      totalSpent,
      totalReviews,
      serviceMix,
      categoryDistribution,
      spendingTrend,
      recentEnrollments,
    };
  });
};

const getAdminAnalytics = async () => {
  return await prisma.$transaction(async (tx) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalStudents,
      totalTutors,
      totalInstitutes,
      totalBookings,
      completedBookings,
      totalRevenue,
      totalReviews,
      averageRating,
      allRolesDistribution,
      bookingStatusDistribution,
      monthlyRevenue,
      monthlyUserGrowth,
    ] = await Promise.all([
      tx.user.count(),
      tx.user.count({ where: { role: "STUDENT" } }),
      tx.user.count({ where: { role: "TUTOR" } }),
      tx.user.count({ where: { role: "INSTITUTE" } }),
      tx.booking.count(),
      tx.booking.count({ where: { status: "COMPLETED" } }),
      tx.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      tx.review.count(),
      tx.review.aggregate({ _avg: { rating: true } }),

      // Distributions
      tx.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
      tx.booking.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),

      // Trends
      tx.payment.findMany({
        where: { status: "COMPLETED", createdAt: { gte: sixMonthsAgo } },
        select: { amount: true, createdAt: true },
      }),
      tx.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { role: true, createdAt: true },
      }),
    ]);

    // Format Trends
    const monthMap: Record<string, { revenue: number; signups: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      monthMap[key] = { revenue: 0, signups: 0 };
    }

    for (const p of monthlyRevenue) {
      const key = new Date(p.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (monthMap[key]) monthMap[key].revenue += p.amount;
    }
    for (const u of monthlyUserGrowth) {
      const key = new Date(u.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (monthMap[key]) monthMap[key].signups += 1;
    }

    const platformTrend = Object.entries(monthMap).map(([month, data]) => ({
      month,
      ...data,
    }));

    return {
      totalUsers,
      totalStudents,
      totalTutors,
      totalInstitutes,
      totalBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      roleDistribution: allRolesDistribution.map((r) => ({
        name: r.role,
        value: r._count._all,
      })),
      bookingDistribution: bookingStatusDistribution.map((b) => ({
        name: b.status,
        value: b._count._all,
      })),
      platformTrend,
    };
  });
};

const inviteModerator = async (email: string, name: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const token = crypto.randomBytes(32).toString("hex");

  // Keep a single invite valid for moderation per email
  await prisma.verification.deleteMany({
    where: { identifier: `invite:moderator:${email}` },
  });

  await prisma.verification.create({
    data: {
      id: crypto.randomUUID(),
      identifier: `invite:moderator:${email}`,
      value: token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    },
  });

  const inviteUrl = `${envVars.APP_URL}/accept-invite?token=${token}&email=${encodeURIComponent(email)}&role=${UserRoles.MODERATOR}&name=${encodeURIComponent(name)}`;

  await sendEmail({
    to: email,
    subject: "You're Invited to SkillBridge",
    templateName: "invite",
    templateData: {
      invitedName: name,
      roleName: "Moderator",
      inviterName: "SkillBridge Admin",
      inviteUrl,
    },
  });

  return { message: "Invitation sent successfully" };
};

export const userService = {
  getUser,
  listUsers,
  updateUserStatus,
  updateUserData,
  getStudentStats,
  getAdminAnalytics,
  inviteModerator,
};
