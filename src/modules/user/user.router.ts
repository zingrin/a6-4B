import { Router } from "express";
import { userController } from "./user.controller";
import { UserRoles } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { uploadProfilePhoto } from "../../config/multer.config";
import { inviteModeratorZodSchema, updateUserZodSchema } from "./user.validation";

const router = Router();

router.get("/me", auth(UserRoles.STUDENT, UserRoles.TUTOR, UserRoles.ADMIN, UserRoles.INSTITUTE, UserRoles.MODERATOR, UserRoles.MENTOR), userController.getUser)
router.put("/update", auth(UserRoles.STUDENT, UserRoles.TUTOR, UserRoles.ADMIN, UserRoles.INSTITUTE, UserRoles.MODERATOR, UserRoles.MENTOR), uploadProfilePhoto, validateRequest(updateUserZodSchema), userController.updateUserData)

router.get("/student/stats", auth(UserRoles.STUDENT), userController.getStudentStats)
router.get("/admin/analytics", auth(UserRoles.ADMIN), userController.getAdminAnalytics)

router.get("/list", auth(UserRoles.ADMIN, UserRoles.MODERATOR), userController.listUsers)
router.put("/ban/:userId", auth(UserRoles.ADMIN, UserRoles.MODERATOR), userController.updateUserStatus)

router.post("/moderator/invite", auth(UserRoles.ADMIN), validateRequest(inviteModeratorZodSchema), userController.inviteModerator)

export const userRouter = router; 