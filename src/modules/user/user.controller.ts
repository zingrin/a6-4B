import type { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import type { User, UserRoles } from "../../../generated/prisma/client";
import paginationSortingHelper from "../../utils/paginationHelper";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";


const getUser = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await userService.getUser(req.user as User)
        return res.status(200).json({success : true, message : "User data retrieved successfully", data : result})
    } catch (e) {
        next(e)
    }
}

const listUsers = async (req : Request, res : Response, next : NextFunction) => {
    try {

        const paginations = paginationSortingHelper(req.query);
        const role = req.query.role as UserRoles;

        const result = await userService.listUsers({ ...paginations, role })
        return res.status(200).json({success : true, message : "Users data retrieved successfully", data : result})
    } catch (e) {
        next(e)
    }
}


const updateUserStatus = async (req : Request, res : Response, next : NextFunction) => {
    try {

        if (!req.body?.status) {
            throw new AppError(status.BAD_REQUEST, "Status is required");
        }

        const result = await userService.updateUserStatus(req.body.status, req.params.userId as string)

        return res.status(200).json({success : true, message : "User status updated", data : result})
    } catch (e) {
        next(e)
    }
}


const updateUserData = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const body: any = { ...req.body };
        if (req.file?.path) body.image = req.file.path;

        const result = await userService.updateUserData(body, req.user as User)

        return res.status(200).json({success : true, message : "Updated successfully", data : result})
    } catch (e) {
        next(e)
    }
}


const getStudentStats = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await userService.getStudentStats(req.user?.id as string)

        return res.status(200).json({success : true, message : "Student stats retrieved successfully", data : result})
    } catch (e) {
        next(e)
    }
}
const getAdminAnalytics = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await userService.getAdminAnalytics()

        return res.status(200).json({success : true, message : "Admin analytics retrieved successfully", data : result})
    } catch (e) {
        next(e)
    }
}



const inviteModerator = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            throw new AppError(status.BAD_REQUEST, "Email and name are required");
        }
        const result = await userService.inviteModerator(email, name);
        return res.status(200).json({success : true, message : "Invitation sent successfully", data : result})
    } catch (e) {
        next(e)
    }
}

export const userController = {
  getUser, 
  listUsers, 
  updateUserStatus, 
  updateUserData, 
  getStudentStats, 
  getAdminAnalytics,
  inviteModerator
}