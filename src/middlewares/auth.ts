import type { NextFunction, Request, Response } from "express";
import {auth as betterAuth} from "../lib/auth"
import { UserRoles, type User } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import AppError from "../errorHelpers/AppError";
import status from "http-status";



export const auth = (...roles : UserRoles[]) => {
    return async (req : Request, res : Response, next : NextFunction) => {
        try {
            
            const session = await betterAuth.api.getSession({
                headers : req.headers as any,
            })

            if (!session) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorized");
            }

            req.user = session.user as User;

            

            if (roles.length > 0 && !roles.includes(req.user.role as UserRoles)) {
                throw new AppError(status.FORBIDDEN, "You don't have permission to perform this action.");
            }

            if (req.user.role === UserRoles.TUTOR) {
                const tutorProfile = await prisma.tutorProfiles.findUnique({
                    where : {
                        userId : req.user.id as string
                    },
                    select : {
                        id : true
                    }
                });
                if (tutorProfile) {
                    req.tutorId = tutorProfile.id
                }
            }

            next();
        } catch (error) {
            next(error)
        }
    }
}
