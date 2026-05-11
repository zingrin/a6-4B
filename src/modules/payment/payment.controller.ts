import type { NextFunction, Request, Response } from "express";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import { paymentService } from "./payment.service";
import type { User } from "../../../generated/prisma/client";

const handleStripeWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
        return res.status(400).json({ success: false, message: "Missing Stripe signature" });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            envVars.STRIPE.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Webhook verification failed";
        console.error("Stripe webhook error:", msg);
        return res.status(400).json({ success: false, message: msg });
    }

    try {
        const result = await paymentService.handleStripeWebhookEvent(event);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const createBookingPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const bookingId = req.params.bookingId as string;
        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }
        const result = await paymentService.createBookingCheckoutSession(
            bookingId,
            req.user as User
        );
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const createCoursePayment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const courseId = req.params.courseId as string;
        if (!courseId) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }
        const result = await paymentService.createCourseCheckoutSession(
            courseId,
            req.user as User
        );
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getMyPayments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await paymentService.getMyPayments(req.user!.id as string);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const verifySession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const sessionId = req.params.sessionId as string;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "Session ID is required" });
        }
        const result = await paymentService.verifySession(sessionId);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getTutorPayments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await paymentService.getTutorPayments(req.user!.id as string);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const listAllPayments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await paymentService.listAllPayments(req.query);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const paymentController = {
    handleStripeWebhook,
    createBookingPayment,
    createCoursePayment,
    getMyPayments,
    getTutorPayments,
    verifySession,
    listAllPayments,
};
