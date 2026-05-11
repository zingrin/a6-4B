import { BookingStatus, UserRoles, type Review, type User } from "../../../generated/prisma/client"
import type { ReviewCreateInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma";


const createReview = async (data: Review, studentId: string) => {
    const { bookingId, rating, review } = data;

    if (!bookingId) {
        throw new Error("Booking ID is required");
    }

    if (!review || review.trim().length === 0) {
        throw new Error("Review cannot be empty");
    }

    const numericRating = Number(rating);

    if (isNaN(numericRating)) {
        throw new Error("Rating must be a number");
    }

    if (numericRating < 1 || numericRating > 5) {
        throw new Error("Rating must be between 1 and 5.0");
    }

    const roundedRating = Number(numericRating.toFixed(1));

    return await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUniqueOrThrow({
        where: { id: bookingId },
        select: {
            id: true,
            studentId: true,
            tutorId: true,
            status: true,
        },
        });

        if (booking.status !== BookingStatus.COMPLETED) {
        throw new Error("Booking must be completed to leave a review");
        }

        if (booking.studentId !== studentId) {
        throw new Error("Not authorized to leave a review for this booking");
        }

        const existingReview = await tx.review.findUnique({
            where: { bookingId },
        });

        if (existingReview) {
            throw new Error("Review already exists for this booking");
        }

        const tutorReviews = await tx.review.findMany({
            where: { tutorId: booking.tutorId },
            select: { rating: true },
        });

        const totalOld = tutorReviews.reduce((acc, r) => acc + Number(r.rating),0);

        const newAverage = Number(((totalOld + roundedRating) / (tutorReviews.length + 1)).toFixed(1));

        await tx.tutorProfiles.update({
            where: { id: booking.tutorId },
            data: {
                totalReviews: tutorReviews.length + 1,
                avgRating: newAverage,
            },
        });

        return await tx.review.create({
            data: {
                bookingId: booking.id,
                studentId,
                tutorId: booking.tutorId,
                rating: roundedRating,
                review: review.trim(),
            },
        });
    });
};


const updateReview = async (reviewId: string, data: Partial<Review>, studentId: string) => {
  const { rating, review } = data;

  if (!review || review.trim().length === 0) {
    throw new Error("Review cannot be empty");
  }

  const numericRating = Number(rating);

  if (isNaN(numericRating)) {
    throw new Error("Rating must be a number");
  }

  if (numericRating < 1 || numericRating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const roundedRating = Number(numericRating.toFixed(1));

  return await prisma.$transaction(async (tx) => {
    const existingReview = await tx.review.findUniqueOrThrow({
      where: { id: reviewId },
      select: {
        id: true,
        studentId: true,
        tutorId: true,
        rating: true,
      },
    });

    if (existingReview.studentId !== studentId) {
      throw new Error("You can only edit your own review");
    }

    const tutor = await tx.tutorProfiles.findUniqueOrThrow({
      where: { id: existingReview.tutorId },
      select: {
        avgRating: true,
        totalReviews: true,
      },
    });

    const totalOld = Number(tutor.avgRating) * tutor.totalReviews;

    const newAverage = Number(
      (
        (totalOld - Number(existingReview.rating) + roundedRating) /
        tutor.totalReviews
      ).toFixed(1)
    );

    await tx.tutorProfiles.update({
      where: { id: existingReview.tutorId },
      data: {
        avgRating: newAverage,
      },
    });

    return await tx.review.update({
      where: { id: reviewId },
      data: {
        rating: roundedRating,
        review: review.trim(),
      },
    });
  });
};



const getAllReviews = async (user : User, tutorId : string) => {

   if (user.role === UserRoles.STUDENT) {
      return await prisma.review.findMany({
        where: {
          studentId: user.id,
        },
        include: {
          student : true,
          tutor : true
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  
    if (user.role === UserRoles.TUTOR) {
      return await prisma.review.findMany({
        where: {
          tutorId: tutorId,
        },
        include: {
          student : true,
          tutor : true
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  
    if (user.role === UserRoles.ADMIN) {
      return prisma.review.findMany({
        include: {
          student : true,
          tutor : true
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  
    throw new Error("Unauthorized");
  };






export const reviewService = {createReview, updateReview, getAllReviews}