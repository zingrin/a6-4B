import type { NextFunction, Request, Response } from "express"
import { bookingService } from "./booking.service"
import { BookingStatus, UserRoles } from "../../../generated/prisma/enums";
import type { User } from "../../../generated/prisma/client";




const getAllBookings = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await bookingService.getAllBookings(req.user as User, req.tutorId as string)
        return res.json({success : true, message : "Bookings data retrieved successfully", data : result})
    } catch (e) {
        next(e)
    }
}


const getBookingById = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await bookingService.getBookingById(req.user as User, req.tutorId as string, req.params.bookingId as string)
        return res.json({success : true, message : "Booking data retrieved successfully", data : result})
    } catch (e) {
        next(e)
    }
}


const createBooking = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const data = req.body;
        const studentId = req.user?.id;

        const result = await bookingService.createBooking(data, studentId as string)

        return res.json({success : true, message : "Booking created successfully", data : result})
    } catch (e) {
        next(e)
    }
}

const updateBookingStatus = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const {status} = req.body;
        
        if (!status) {
            return res.json({success : false, message : "Invalid input"})
        }

        if (!Object.values(BookingStatus).includes(status)) {
             return res.status(400).json({ success: false, message: "Invalid status type" });
        }

        const tutorId = req.user?.role === UserRoles.TUTOR ? req.tutorId : null;
        const bookingId = req.params.bookingId as string;

        const result = await bookingService.updateBookingStatus(bookingId, status, req.user as User, tutorId)

        return res.json({success : true, message : "Booking status updated", data : result})
    } catch (e) {
        next(e)
    }
}




export const bookingController = {createBooking, updateBookingStatus, getAllBookings, getBookingById}