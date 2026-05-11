import Router from "express"
import { auth } from "../../middlewares/auth";
import { UserRoles } from "../../../generated/prisma/enums";
import { availabilityController } from "./availability.controller";


const router = Router();

router.get("/", auth(UserRoles.TUTOR), availabilityController.getAllAvailabilities)
router.post("/create", auth(UserRoles.TUTOR), availabilityController.createAvailability)
router.put("/update/:availabilityId", auth(UserRoles.TUTOR), availabilityController.updateAvailability)
router.delete("/delete/:availabilityId", auth(UserRoles.TUTOR), availabilityController.deleteAvailability)

export const availabilityRouter = router;