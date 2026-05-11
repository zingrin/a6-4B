import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AIService } from "./ai.service";

export const chat = async (req: Request, res: Response) => {
    try {
        const { messages } = req.body;
        let user = (req as any).user;

        if (user?.id) {
            const fullUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { name: true, email: true, role: true }
            });
            if (fullUser) {
                user = { ...user, name: fullUser.name };
            }
        }

        const result = await AIService.chatWithDB(messages, user);
        
        res.status(200).json({
            success: true,
            message: "AI response generated successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Failed to generate AI response" });
    }
};

export const generateDescription = async (req: Request, res: Response) => {
    try {
        const { title, category, tags } = req.body;
        
        const result = await AIService.generateDescription({ title, category, tags });
        
        res.status(200).json({
            success: true,
            message: "Description generated successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Failed to generate description" });
    }
};

export const getRecommendations = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user?.id || "";
        
        const result = await AIService.getSmartRecommendations(userId);
        
        res.status(200).json({
            success: true,
            message: "Recommendations generated successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || "Failed to get recommendations" });
    }
};

export const AIController = {
    chat,
    generateDescription,
    getRecommendations,
};
