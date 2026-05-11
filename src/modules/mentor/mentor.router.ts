import { Router } from "express";
import { UserRoles } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { mentorController } from "./mentor.controller";
import { updateMentorProfileZodSchema } from "./mentor.validation";

const router = Router();
router.get("/overview", auth(UserRoles.MENTOR), mentorController.getOverview);
router.get("/profile", auth(UserRoles.MENTOR), mentorController.getMyProfile);
router.get("/courses", auth(UserRoles.MENTOR), mentorController.listAssignedCourses);
router.get("/students", auth(UserRoles.MENTOR), mentorController.listMentorStudents);
router.put("/update", auth(UserRoles.MENTOR), validateRequest(updateMentorProfileZodSchema), mentorController.updateProfile);

export const mentorRouter = router;
