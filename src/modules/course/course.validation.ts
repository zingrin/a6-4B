import z from "zod";
import { CourseLevel } from "../../../generated/prisma/enums";
import { booleanCoerce, numberCoerce } from "../../utils/validationHelper";

export const createCourseZodSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: numberCoerce.nonnegative("Price cannot be negative"),
    level: z.enum([CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED]).default(CourseLevel.BEGINNER),
    duration: z.string().optional().nullable(),
    isPublished: booleanCoerce.default(false),
    categoryId: z.string().uuid("Invalid category ID").optional().nullable(),
    mentorIds: z.array(z.string().uuid("Invalid mentor ID")).optional(),
});

export const updateCourseZodSchema = z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(10).optional(),
    price: numberCoerce.nonnegative().optional(),
    level: z.enum([CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED]).optional(),
    duration: z.string().optional().nullable(),
    isPublished: booleanCoerce.optional(),
    categoryId: z.string().uuid().optional().nullable(),
    mentorIds: z.array(z.string().uuid()).optional(),
});
