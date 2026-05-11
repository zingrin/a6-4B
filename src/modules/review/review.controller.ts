import type { NextFunction, Request, Response } from "express"
import { reviewService } from "./review.service";
import type { User } from "../../../generated/prisma/client";


const getAllReviews = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await reviewService.getAllReviews(req.user as User, req.tutorId as string)
        return res.json({success : true, message : "Reviews data retrieved successfully", data : result})
    } catch (e) {
        next(e)
    }
}

const createReview = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const data = req.body;
        const studentId = req.user?.id;

        const result = await reviewService.createReview(data, studentId as string)

        return res.json({success : true, message : "Review added successfully", data : result})
    } catch (e) {
        next(e)
    }
}
const updateReview = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const data = req.body;
        const studentId = req.user?.id;
        const reviewId = req.params.reviewId as string;

        const result = await reviewService.updateReview(reviewId, data, studentId as string)

        return res.json({success : true, message : "Review updated successfully", data : result})
    } catch (e) {
        next(e)
    }
}

export const reviewController = {createReview, updateReview, getAllReviews}