import type { NextFunction, Request, Response } from "express"
import { availabilityService } from "./availability.service"


const createAvailability = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await availabilityService.createAvailability(req.body, req.tutorId as string)
    
        return res.json({success : true, message : "Tutor availability slot created successfully", data : result})
    } catch (e) {
        next(e)
    }
}


const getAllAvailabilities = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await availabilityService.getAllAvailabilities(req.tutorId as string)
    
        return res.json({success : true, message : "Tutor availability data retrieved successfully", data : result})
    } catch (e) {
        next(e)
    }
}


const updateAvailability = async (req : Request, res : Response, next : NextFunction) => {
    try {

        const data = req.body;
        const tutorId = req.tutorId as string;
        const availabilityId = req.params.availabilityId as string;

        const result = await availabilityService.updateAvailability(data, tutorId, availabilityId)
    
        return res.json({success : true, message : "Tutor availability slot updated successfully", data : result})
    } catch (e) {
        next(e)
    }
}

const deleteAvailability = async (req : Request, res : Response, next : NextFunction) => {
    try {

        const tutorId = req.tutorId as string;
        const availabilityId = req.params.availabilityId as string;

        const result = await availabilityService.deleteAvailability(availabilityId, tutorId)
    
        return res.json({success : true, message : "Tutor availability slot deleted successfully", data : result})
    } catch (e) {
        next(e)
    }
}



export const availabilityController = {getAllAvailabilities, createAvailability, updateAvailability, deleteAvailability}