import { Router } from "express";
import { UserRoles } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { courseController } from "./course.controller";
import { uploadCourseThumbnail } from "../../config/multer.config";

const router: Router = Router();

// Public routes
router.get("/", courseController.getPublicCourses);
router.get("/top", courseController.getTopCourses);
router.get("/featured", courseController.getTopCourses);

// Institute routes
router.get(
  "/institute/list",
  auth(UserRoles.INSTITUTE),
  courseController.getInstituteCourses,
);
router.post(
  "/create",
  auth(UserRoles.INSTITUTE),
  uploadCourseThumbnail,
  courseController.createCourse,
);
router.put(
  "/update/:courseId",
  auth(UserRoles.INSTITUTE),
  uploadCourseThumbnail,
  courseController.updateCourse,
);
router.delete(
  "/delete/:courseId",
  auth(UserRoles.INSTITUTE),
  courseController.deleteCourse,
);

// Mentor routes
router.get(
  "/assigned/list",
  auth(UserRoles.MENTOR),
  courseController.getAssignedCourses,
);
router.get(
  "/roster/:courseId",
  auth(UserRoles.MENTOR),
  courseController.getCourseRoster,
);

// Student routes
router.get(
  "/enrolled/list",
  auth(UserRoles.STUDENT),
  courseController.getEnrolledCourses,
);
router.delete(
  "/drop/:courseId",
  auth(UserRoles.STUDENT),
  courseController.dropCourse,
);

router.get("/:courseId", courseController.getCourseDetails);

// export const courseRouter = router;
export { router as courseRouter };
