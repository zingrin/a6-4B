import z from "zod";

export const inviteModeratorZodSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters")
});

export const updateUserZodSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional().nullable(),
    image: z.string().url().optional().nullable(),
});
