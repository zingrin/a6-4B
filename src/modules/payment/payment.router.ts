import { Router } from "express";
import express from "express";
import { auth } from "../../middlewares/auth";
import { UserRoles } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router: Router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook,
);

router.post(
  "/booking/:bookingId",
  auth(UserRoles.STUDENT),
  paymentController.createBookingPayment,
);

router.post(
  "/course/:courseId",
  auth(UserRoles.STUDENT),
  paymentController.createCoursePayment,
);

router.get(
  "/me",
  auth(UserRoles.STUDENT, UserRoles.ADMIN, UserRoles.MODERATOR),
  paymentController.getMyPayments,
);

router.get(
  "/verify/:sessionId",
  auth(UserRoles.STUDENT),
  paymentController.verifySession,
);

router.get("/tutor", auth(UserRoles.TUTOR), paymentController.getTutorPayments);

router.get("/", auth(UserRoles.ADMIN), paymentController.listAllPayments);

export { router as paymentRouter };
