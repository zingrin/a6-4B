import Stripe from "stripe";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import { sendEmail } from "../../utils/email";
import type { User } from "../../../generated/prisma/client";
import paginationSortingHelper from "../../utils/paginationHelper";

// ─── Webhook Handler ─────────────────────────────────────────────────────────

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
    // Idempotency check — skip already-processed events
    const existingEvent = await prisma.payment.findFirst({
        where: {
            metadata: {
                path: ["stripeEventId"],
                equals: event.id,
            },
        },
    });

    if (existingEvent) {
        console.log(`Event ${event.id} already processed. Skipping.`);
        return { message: `Event ${event.id} already processed.` };
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentId = session.metadata?.paymentId;
            const type = session.metadata?.type; // "booking" | "course"

            if (!paymentId || !type) {
                console.error("⚠️ Missing metadata in webhook event");
                return { message: "Missing metadata" };
            }

            const paymentData = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: {
                    student: { select: { name: true, email: true } },
                    booking: {
                        include: { tutor: { include: { user: { select: { name: true } } } } },
                    },
                    courseEnrollment: {
                        include: { course: { select: { title: true } } },
                    },
                },
            });

            if (!paymentData) {
                console.error(`⚠️ Payment ${paymentId} not found.`);
                return { message: "Payment not found" };
            }

            if (paymentData.status === PaymentStatus.COMPLETED) {
                 console.log(`Payment ${paymentId} already marked as COMPLETED. Skipping.`);
                 return { message: "Payment already completed" };
            }

            await prisma.$transaction(async (tx) => {
                const status =
                    session.payment_status === "paid"
                        ? PaymentStatus.COMPLETED
                        : PaymentStatus.FAILED;

                await tx.payment.update({
                    where: { id: paymentId },
                    data: {
                        status,
                        transactionId: (session.payment_intent as string) || null,
                        gatewayRef: session.id,
                        metadata: {
                            stripeEventId: event.id,
                            sessionData: JSON.parse(JSON.stringify(session)),
                        },
                    },
                });

                if (status === PaymentStatus.COMPLETED) {
                    if (type === "course" && paymentData.courseEnrollmentId) {
                        await tx.courseEnrollment.update({
                            where: { id: paymentData.courseEnrollmentId },
                            data: { status: "ACTIVE" }
                        });
                    } else if (type === "booking" && paymentData.bookingId) {
                        await tx.booking.update({
                            where: { id: paymentData.bookingId },
                            data: { status: "CONFIRMED" } 
                        });
                        if (paymentData.booking?.availabilityId) {
                            await tx.availability.update({
                                where: { id: paymentData.booking.availabilityId },
                                data: { status: "BOOKED" }
                            });
                        }
                    }
                }
            });

            // Send invoice email after successful payment
            if (session.payment_status === "paid") {
                try {
                    const itemTitle =
                        type === "course"
                            ? (paymentData.courseEnrollment?.course.title ?? "Course")
                            : `Session with ${paymentData.booking?.tutor.user.name ?? "Tutor"}`;

                    const itemSubtitle =
                        type === "course" ? "Course Enrollment" : "1-on-1 Tutoring Session";

                    await sendEmail({
                        to: paymentData.student.email,
                        subject: `Payment Confirmed - ${itemTitle} · SkillBridge`,
                        templateName: "invoice",
                        templateData: {
                            payeeName: paymentData.student.name,
                            invoiceId: paymentId,
                            transactionId: (session.payment_intent as string) ?? "",
                            gatewayRef: session.id,
                            paymentDate: new Date().toLocaleDateString(),
                            itemTitle,
                            itemSubtitle,
                            type,
                            amount: paymentData.amount,
                            currency: paymentData.currency,
                            invoiceUrl: null,
                        },
                    });

                    console.log(`✅ Invoice email sent to ${paymentData.student.email}`);
                } catch (emailError) {
                    console.error("❌ Failed to send invoice email:", emailError);
                }
            }

            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentId = session.metadata?.paymentId;

            if (paymentId) {
                const payment = await prisma.payment.findUnique({
                    where: { id: paymentId },
                    include: { booking: true }
                });

                if (payment) {
                    await prisma.$transaction(async (tx) => {
                        await tx.payment.update({
                            where: { id: paymentId },
                            data: {
                                status: PaymentStatus.FAILED,
                                gatewayRef: session.id,
                                metadata: {
                                    stripeEventId: event.id,
                                    sessionData: JSON.parse(JSON.stringify(session)),
                                },
                            },
                        });

                        // We no longer automatically cancel the booking or explicitly release availability 
                        // as availability is now not locked upfront.
                        // We also allow users to retry payment later via the UI.
                    });
                }
            }

            console.log(`Checkout session ${session.id} expired.`);
            break;
        }

        case "payment_intent.payment_failed": {
            const intent = event.data.object as Stripe.PaymentIntent;
            console.log(`Payment intent ${intent.id} failed.`);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return { message: `Webhook event ${event.id} processed successfully` };
};

// ─── Create Checkout Session for a Booking ───────────────────────────────────

const createBookingCheckoutSession = async (
    bookingId: string,
    user: User
) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            tutor: { include: { user: { select: { name: true } } } },
            subject: { select: { name: true } },
        },
    });

    if (!booking || booking.studentId !== user.id) {
        throw new Error("Booking not found or access denied.");
    }

    // Find existing payment or create a new one to support payment retries for pending bookings
    let payment = await prisma.payment.findUnique({
        where: { bookingId: booking.id },
    });

    if (payment) {
        if (payment.status === PaymentStatus.COMPLETED) {
            throw new Error("This booking has already been paid.");
        }
        payment = await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.PENDING }
        });
    } else {
        payment = await prisma.payment.create({
            data: {
                studentId: user.id,
                bookingId: booking.id,
                amount: booking.price,
                currency: "USD",
                status: PaymentStatus.PENDING,
            },
        });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        expires_at: Math.floor(Date.now() / 1000) + 35 * 60, // Expire in 35 minutes
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Tutoring Session: ${booking.subject?.name ?? "Session"}`,
                        description: `1-on-1 session with ${booking.tutor.user.name}`,
                    },
                    unit_amount: Math.round(booking.price * 100),
                },
                quantity: 1,
            },
        ],
        metadata: {
            paymentId: payment.id,
            bookingId: booking.id,
            type: "booking",
        },
        success_url: `${envVars.APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${envVars.APP_URL}/dashboard/bookings?error=payment_cancelled`,
    });

    return { paymentUrl: session.url };
};

// ─── Create Checkout Session for a Course Enrollment ─────────────────────────

const createCourseCheckoutSession = async (
    courseId: string,
    user: User
) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId, isPublished: true },
    });

    if (!course) throw new Error("Course not found.");

    let enrollment = await prisma.courseEnrollment.findUnique({
        where: { studentId_courseId: { studentId: user.id, courseId } },
    });

    if (enrollment) {
        if (enrollment.status === "ACTIVE") {
            throw new Error("You are already enrolled in this course.");
        }
    } else {
        enrollment = await prisma.courseEnrollment.create({
            data: { studentId: user.id, courseId, status: "PENDING" },
        });
    }

    let payment = await prisma.payment.findUnique({
        where: { courseEnrollmentId: enrollment.id },
    });

    if (payment) {
        if (payment.status === PaymentStatus.COMPLETED) {
            throw new Error("This course enrollment has already been paid.");
        }
        payment = await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.PENDING }
        });
    } else {
        payment = await prisma.payment.create({
            data: {
                studentId: user.id,
                courseEnrollmentId: enrollment.id,
                amount: course.price,
                currency: "USD",
                status: PaymentStatus.PENDING,
            },
        });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        expires_at: Math.floor(Date.now() / 1000) + 35 * 60, // Expire in 35 minutes
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Course: ${course.title}`,
                        description: course.description.substring(0, 100),
                    },
                    unit_amount: Math.round(course.price * 100),
                },
                quantity: 1,
            },
        ],
        metadata: {
            paymentId: payment.id,
            enrollmentId: enrollment.id,
            courseId: course.id,
            type: "course",
        },
        success_url: `${envVars.APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${envVars.APP_URL}/courses/${courseId}?error=payment_cancelled`,
    });

    return { paymentUrl: session.url };
};

// ─── Get My Payments ──────────────────────────────────────────────────────────

const getMyPayments = async (userId: string) => {
    return prisma.payment.findMany({
        where: { studentId: userId },
        include: {
            booking: {
                include: {
                    tutor: { include: { user: { select: { name: true, image: true } } } },
                    subject: { select: { name: true } },
                },
            },
            courseEnrollment: {
                include: {
                    course: { select: { title: true, thumbnailUrl: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};

// ─── Get Tutor Payments ─────────────────────────────────────────────────────────

const getTutorPayments = async (userId: string) => {
    return prisma.payment.findMany({
        where: {
            booking: {
                tutor: { userId: userId },
            },
            status: PaymentStatus.COMPLETED,
        },
        include: {
            student: { select: { name: true, image: true, email: true } },
            booking: {
                include: {
                    subject: { select: { name: true } },
                    availability: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};

// ─── Verify Stripe Checkout Session ──────────────────────────────────────────

const verifySession = async (sessionId: string) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
            const mockEvent = {
                id: session.id + "_verify",
                type: "checkout.session.completed",
                data: { object: session }
            } as any;
            await handleStripeWebhookEvent(mockEvent);
            return { verified: true };
        }
        return { verified: false };
    } catch (e) {
        console.error("Session verification failed", e);
        return { verified: false };
    }
};

const listAllPayments = async (query: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    const total = await prisma.payment.count();
    const data = await prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            student: { select: { name: true, email: true, image: true } },
            booking: {
                include: {
                    tutor: { include: { user: { select: { name: true } } } },
                    subject: { select: { name: true } },
                },
            },
            courseEnrollment: {
                include: {
                    course: { select: { title: true } },
                },
            },
        },
    });

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const paymentService = {
    handleStripeWebhookEvent,
    createBookingCheckoutSession,
    createCourseCheckoutSession,
    getMyPayments,
    getTutorPayments,
    verifySession,
    listAllPayments,
};
