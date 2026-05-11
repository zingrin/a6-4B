import { Router } from "express";
import express from "express";
import { auth } from "../../middlewares/auth";
import { UserRoles } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

// ⚠️ Webhook MUST use raw body — registered before express.json() in app.ts
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    paymentController.handleStripeWebhook
);

// Create a Stripe checkout session to pay for a 1-on-1 booking
router.post(
    "/booking/:bookingId",
    auth(UserRoles.STUDENT),
    paymentController.createBookingPayment
);

// Create a Stripe checkout session to enroll in a course
router.post(
    "/course/:courseId",
    auth(UserRoles.STUDENT),
    paymentController.createCoursePayment
);

// View all payment history for the logged-in student
router.get(
    "/me",
    auth(UserRoles.STUDENT, UserRoles.ADMIN, UserRoles.MODERATOR),
    paymentController.getMyPayments
);

// Verify a checkout session
router.get(
    "/verify/:sessionId",
    auth(UserRoles.STUDENT),
    paymentController.verifySession
);

// View all payment history for the logged-in tutor
router.get(
    "/tutor",
    auth(UserRoles.TUTOR),
    paymentController.getTutorPayments
);

// Admin-only route to list all payments on the platform
router.get(
    "/",
    auth(UserRoles.ADMIN),
    paymentController.listAllPayments
);

export const paymentRouter = router;
