import { toNodeHandler } from "better-auth/node";
import express from "express";
import cors from "cors"
import { auth } from "./lib/auth";
import { userRouter } from "./modules/user/user.router";
import { tutorRouter } from "./modules/tutor/tutor.router";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { categoryRouter } from "./modules/category/category.router";
import { availabilityRouter } from "./modules/availability/availability.router";
import { bookingRouter } from "./modules/booking/booking.router";
import { reviewRouter } from "./modules/review/review.router";
import { paymentRouter } from "./modules/payment/payment.router";
import { instituteRouter } from "./modules/institute/institute.router";
import { mentorRouter } from "./modules/mentor/mentor.router";
import { courseRouter } from "./modules/course/course.router";
import { aiRouter } from "./modules/ai/ai.router";
 
console.log(process.env.APP_URL)

const app = express();

// app.use(cors({
//     origin : process.env.APP_URL || "http://localhost:3000",
//     credentials : true
// })) 




const allowedOrigins = [
  process.env.APP_URL || "http://localhost:4000",
  process.env.PROD_APP_URL, 
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5000",
].filter(Boolean); 

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); 

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);




app.use("/api/payments", paymentRouter);

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/tutors", tutorRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/institutes", instituteRouter);
app.use("/api/mentors", mentorRouter);
app.use("/api/courses", courseRouter);
app.use("/api/ai", aiRouter);

app.get("/", (_, res) => {
    res.json("Welcome to Skillbridge server")
})


app.use(notFound);
app.use(globalErrorHandler);


export default app