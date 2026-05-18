import multer from "multer";
import type { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { Request } from "express";
import { cloudinaryInstance } from "./cloudinary.config";

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/svg+xml",
    "image/webp",
];

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File type not allowed. Accepted types: JPG, PNG, SVG, WebP"));
    }
};

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryInstance,
    params: async (_req, file) => {
        const originalName = file.originalname;

        const fileNameWithoutExtension = originalName
            .split(".")
            .slice(0, -1)
            .join(".")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

        const uniqueName =
            Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            fileNameWithoutExtension;

        return {
            folder: `skillbridge/images`,
            public_id: uniqueName,
            resource_type: "auto",
        };
    },
});

export const multerUpload = multer({ storage, fileFilter });


/** Generic single-file upload for any field name */
export const uploadSingleFile = (fieldName: string) =>
    multerUpload.single(fieldName);

/** User & Mentor profile photos — field name: "image" */
export const uploadProfilePhoto = multerUpload.single("image");

/** Institute logo — field name: "logo" */
export const uploadInstituteLogo = multerUpload.single("logo");

/** Course thumbnail — field name: "thumbnail" */
export const uploadCourseThumbnail = multerUpload.single("thumbnail");
