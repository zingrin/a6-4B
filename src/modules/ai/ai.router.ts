import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { AIController } from "./ai.controller";
import { AIValidation } from "./ai.validation";
import { auth } from "../../lib/auth"; // From better-auth

const router = Router();

// Custom middleware to optionally parse user or enforce authentication
// Wait, skillbridge uses better-auth. We can parse the session.
import type { Request, Response, NextFunction } from "express";

const parseUserOptional = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as any
        });
        if (session && session.user) {
            (req as any).user = session.user;
        }
    } catch (error) {
        // Ignored
    }
    next();
};

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as any
        });
        if (!session || !session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        (req as any).user = session.user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
}

router.post("/chat",
  parseUserOptional,
  validateRequest(AIValidation.chatSchema),
  AIController.chat
);

router.post("/generate-description",
  checkAuth,
  validateRequest(AIValidation.generateDescriptionSchema),
  AIController.generateDescription
);

router.get("/recommendations",
  parseUserOptional,
  AIController.getRecommendations
);

export const aiRouter = router;
