import { z } from "zod";

const chatSchema = z.object({
    messages: z.array(z.any()).min(1, "Messages array cannot be empty"),
});

const generateDescriptionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

export const AIValidation = {
    chatSchema,
    generateDescriptionSchema
};
