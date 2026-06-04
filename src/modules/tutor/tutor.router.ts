import { Router } from "express";
import { tutorController } from "./tutor.controller";
import { auth } from "../../middlewares/auth";
import { UserRoles } from "../../../generated/prisma/enums";
import { uploadProfilePhoto } from "../../config/multer.config";

const router: Router = Router();

router.get("/", tutorController.getAllTutors);
router.get(
  "/overview",
  auth(UserRoles.TUTOR),
  tutorController.getTutorDashboardOverview,
);
router.get("/:tutorId", tutorController.getTutorById);

router.put(
  "/update",
  auth(UserRoles.TUTOR),
  uploadProfilePhoto,
  tutorController.updateTutor,
);
router.put(
  "/subjects",
  auth(UserRoles.TUTOR),
  tutorController.updateTutorSubjects,
);
router.put(
  "/feature/:tutorId",
  auth(UserRoles.ADMIN),
  tutorController.featureTutor,
);

router.delete(
  "/subjects/:subjectId",
  auth(UserRoles.TUTOR),
  tutorController.deleteTutorSubject,
);

export { router as tutorRouter };
