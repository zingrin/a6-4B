import z from "zod";

export const updateMentorProfileZodSchema = z.object({
    name: z.string().max(100).optional(),
    title: z.string().max(100).optional().nullable(),
    bio: z.string().max(1000).optional().nullable(),
    expertise: z.string().max(100).optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
});
