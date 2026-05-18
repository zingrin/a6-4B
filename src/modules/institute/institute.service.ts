import { prisma } from "../../lib/prisma";
import crypto from "crypto";
import { sendEmail } from "../../utils/email";
import { envVars } from "../../config/env";
import { UserRoles } from "../../../generated/prisma/client";
import paginationSortingHelper from "../../utils/paginationHelper";

const getOverview = async (instituteId: string) => {
    return await prisma.$transaction(async (tx) => {
        const totalMentors = await tx.mentorProfile.count({ where: { instituteId } });
        const totalCourses = await tx.course.count({ where: { instituteId } });
        const totalEnrollments = await tx.courseEnrollment.count({
            where: { course: { instituteId } }
        });

        const revenueResult = await tx.payment.aggregate({
            where: {
                status: "COMPLETED",
                courseEnrollment: { course: { instituteId } }
            },
            _sum: { amount: true }
        });
        const totalRevenue = revenueResult._sum.amount ?? 0;

        const topCourses = await tx.course.findMany({
            where: { instituteId },
            select: {
                title: true,
                level: true,
                _count: { select: { enrollments: true } }
            },
            orderBy: { enrollments: { _count: "desc" } },
            take: 5
        });
        const enrollmentsByCourse = topCourses.map((c) => ({
            name: c.title.length > 22 ? c.title.slice(0, 22) + "…" : c.title,
            enrollments: c._count.enrollments,
            level: c.level,
        }));

        const levelGroups = await tx.course.groupBy({
            by: ["level"],
            where: { instituteId },
            _count: { _all: true }
        });
        const coursesByLevel = levelGroups.map((g) => ({
            name: g.level.charAt(0) + g.level.slice(1).toLowerCase(),
            value: g._count._all,
        }));

        const publishedCount = await tx.course.count({ where: { instituteId, isPublished: true } });
        const draftCount = await tx.course.count({ where: { instituteId, isPublished: false } });
        const coursesByStatus = [
            { name: "Published", value: publishedCount },
            { name: "Draft", value: draftCount },
        ];

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const recentEnrollments = await tx.courseEnrollment.findMany({
            where: {
                course: { instituteId },
                enrolledAt: { gte: sixMonthsAgo }
            },
            select: { enrolledAt: true }
        });

        const monthMap: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
            monthMap[key] = 0;
        }
        for (const e of recentEnrollments) {
            const key = new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            if (monthMap[key] !== undefined) {
                monthMap[key] += 1;
            }
        }
        const enrollmentsTrend = Object.entries(monthMap).map(([month, count]) => ({
            month,
            enrollments: count,
        }));

        const recentCourses = await tx.course.findMany({
            where: { instituteId },
            select: {
                id: true,
                title: true,
                level: true,
                price: true,
                isPublished: true,
                createdAt: true,
                _count: { select: { enrollments: true } },
                category: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        return {
            stats: { totalCourses, totalMentors, totalEnrollments, totalRevenue },
            enrollmentsByCourse,
            coursesByLevel,
            coursesByStatus,
            enrollmentsTrend,
            recentCourses,
        };
    });
};

const listMentors = async (instituteId: string, query: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);
    const total = await prisma.mentorProfile.count({ where: { instituteId } });
    const data = await prisma.mentorProfile.findMany({
        where: { instituteId },
        include: { user: { select: { name: true, email: true, image: true, phone: true } } },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
    });
    
    return {
        data,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
};

const inviteMentor = async (instituteId: string, email: string, name: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    const institute = await prisma.instituteProfile.findUnique({ where: { id: instituteId }});
    if (!institute) throw new Error("Institute not found");

    const token = crypto.randomBytes(32).toString("hex");
    const identifier = `invite:mentor:${instituteId}:${email}`;

    await prisma.verification.deleteMany({
        where: { identifier }
    });

    await prisma.verification.create({
        data: {
            id: crypto.randomUUID(),
            identifier,
            value: token,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
    });

    const inviteUrl = `${envVars.APP_URL}/accept-invite?token=${token}&email=${encodeURIComponent(email)}&role=${UserRoles.MENTOR}&name=${encodeURIComponent(name)}`;

    await sendEmail({
        to: email,
        subject: "You're Invited to be a Mentor",
        templateName: "mentor-invite",
        templateData: {
            mentorName: name,
            instituteName: institute.name,
            courseTitle: null,
            acceptUrl: inviteUrl,
        },
    });

    return { message: "Invitation sent successfully" };
};

const updateMentorProfile = async (instituteId: string, mentorId: string, data: any) => {
    const mentor = await prisma.mentorProfile.findFirst({
        where: { id: mentorId, instituteId }
    });

    if (!mentor) throw new Error("Mentor not found or doesn't belong to this institute");

    return await prisma.mentorProfile.update({
        where: { id: mentorId },
        data: {
            title: data.title,
            bio: data.bio,
            expertise: data.expertise
        }
    });
};

const removeMentor = async (instituteId: string, mentorId: string) => {
    const mentor = await prisma.mentorProfile.findFirst({
        where: { id: mentorId, instituteId }
    });
    if (!mentor) throw new Error("Mentor not found or doesn't belong to this institute");

    await prisma.mentorProfile.delete({ where: { id: mentorId } });
    return { message: "Mentor removed successfully" };
};

const listStudents = async (instituteId: string, query: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);
    
    // Find enrollments for all courses belonging to this institute
    const where = { course: { instituteId } };
    
    const total = await prisma.courseEnrollment.count({ where });
    const data = await prisma.courseEnrollment.findMany({
        where,
        include: {
            student: { select: { id: true, name: true, email: true, image: true } },
            course: { select: { id: true, title: true } }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
    });

    return {
        data,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
};

const listReviews = async (instituteId: string, query: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    // 1. Get all mentors in the institute
    const mentors = await prisma.mentorProfile.findMany({
        where: { instituteId },
        select: { userId: true }
    });
    const mentorUserIds = mentors.map(m => m.userId);

    // 2. Get TutorProfiles for these mentors
    const tutorProfiles = await prisma.tutorProfiles.findMany({
        where: { userId: { in: mentorUserIds } },
        select: { id: true }
    });
    const tutorProfileIds = tutorProfiles.map(t => t.id);

    // 3. Get reviews for these tutors
    const where = { tutorId: { in: tutorProfileIds } };

    const total = await prisma.review.count({ where });
    const data = await prisma.review.findMany({
        where,
        include: {
            student: { select: { id: true, name: true, image: true } },
            tutor: { 
                include: { 
                    user: { select: { name: true, image: true } } 
                } 
            }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
    });

    return {
        data,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
};

const listPayments = async (instituteId: string, query: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    // Find payments for all course enrollments belonging to this institute
    const where = { courseEnrollment: { course: { instituteId } } };

    const total = await prisma.payment.count({ where });
    const data = await prisma.payment.findMany({
        where,
        include: {
            student: { select: { id: true, name: true, email: true } },
            courseEnrollment: {
                include: {
                    course: { select: { id: true, title: true } }
                }
            }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
    });

    return {
        data,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
};

const updateInstituteProfile = async (instituteId: string, data: any) => {
    return await prisma.instituteProfile.update({
        where: { id: instituteId },
        data: {
            name: data.name,
            description: data.description,
            logoUrl: data.logoUrl,
            contactEmail: data.contactEmail,
            website: data.website,
            establishedYear: data.establishedYear
        }
    });
};

export const instituteService = {
  getOverview,
  listMentors,
  inviteMentor,
  updateMentorProfile,
  removeMentor,
  listStudents,
  listReviews,
  listPayments,
  updateInstituteProfile
};
