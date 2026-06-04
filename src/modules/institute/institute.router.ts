import { Router } from "express";
import { UserRoles } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { instituteController } from "./institute.controller";
import { inviteMentorZodSchema } from "./institute.validation";

const router: Router = Router();

router.get(
  "/overview",
  auth(UserRoles.INSTITUTE),
  instituteController.getOverview,
);
router.get(
  "/mentors",
  auth(UserRoles.INSTITUTE),
  instituteController.listMentors,
);
router.get(
  "/students",
  auth(UserRoles.INSTITUTE),
  instituteController.listInstituteStudents,
);
router.get(
  "/reviews",
  auth(UserRoles.INSTITUTE),
  instituteController.listInstituteReviews,
);
router.get(
  "/payments",
  auth(UserRoles.INSTITUTE),
  instituteController.listInstitutePayments,
);
router.post(
  "/mentors/invite",
  auth(UserRoles.INSTITUTE),
  validateRequest(inviteMentorZodSchema),
  instituteController.inviteMentor,
);
router.put(
  "/mentors/update/:mentorId",
  auth(UserRoles.INSTITUTE),
  instituteController.updateMentorProfile,
);
router.delete(
  "/mentors/delete/:mentorId",
  auth(UserRoles.INSTITUTE),
  instituteController.removeMentor,
);

import { uploadProfilePhoto } from "../../config/multer.config";

router.put(
  "/update",
  auth(UserRoles.INSTITUTE),
  uploadProfilePhoto,
  instituteController.updateInstituteProfile,
);

export { router as instituteRouter };
