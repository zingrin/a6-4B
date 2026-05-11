import type { NextFunction, Request, Response } from "express";
import { mentorService } from "./mentor.service";

const getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await mentorService.getOverview(req.user!.id as string);
        res.status(200).json({ success: true, message: "Mentor overview retrieved", data: result });
    } catch (e) {
        next(e);
    }
}

const listAssignedCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await mentorService.listAssignedCourses(req.user!.id as string, req.query);
        res.status(200).json({ success: true, message: "Assigned courses retrieved", data: result });
    } catch (e) {
        next(e);
    }
}

const listMentorStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await mentorService.listMentorStudents(req.user!.id as string, req.query);
        res.status(200).json({ success: true, message: "Mentor students retrieved", data: result });
    } catch (e) {
        next(e);
    }
}

const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await mentorService.getMyProfile(req.user!.id as string);
        res.status(200).json({ success: true, message: "Mentor profile retrieved", data: result });
    } catch (e) {
        next(e);
    }
}

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await mentorService.updateProfile(req.user!.id as string, req.body);
        res.status(200).json({ success: true, message: "Mentor profile updated", data: result });
    } catch (e) {
        next(e);
    }
}

export const mentorController = { getOverview, listAssignedCourses, listMentorStudents, getMyProfile, updateProfile };
