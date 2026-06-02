import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRoles } from "../../../generated/prisma/enums";
import { reviewController } from "./review.controller";

const router: Router = Router();

router.get(
  "/",
  auth(UserRoles.STUDENT, UserRoles.TUTOR),
  reviewController.getAllReviews,
);
router.post("/create", auth(UserRoles.STUDENT), reviewController.createReview);
router.put(
  "/update/:reviewId",
  auth(UserRoles.STUDENT),
  reviewController.updateReview,
);

export { router as reviewRouter };
