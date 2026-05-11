import z from "zod";

export const inviteMentorZodSchema = z.object({
    email: z.string().email("Must be a valid email address"),
    name: z.string().min(2, "Name must be at least 2 characters")
});

export const updateInstituteProfileZodSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    logoUrl: z.string().url().optional().nullable(),
    contactEmail: z.string().email().optional().nullable(),
    website: z.string().url().optional().nullable(),
    establishedYear: z.coerce.number().int().positive().optional().nullable(),
});
