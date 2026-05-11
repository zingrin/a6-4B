import status from "http-status";
import { Prisma } from "../../generated/prisma/client";
import type { TErrorResponse, TErrorSource } from "../interfaces/error.interface";

const getStatusCodeFromPrismaError = (errorCode: string): number => {
    if (errorCode === "P2002") return status.CONFLICT;
    if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) return status.NOT_FOUND;
    if (["P1000", "P6002"].includes(errorCode)) return status.UNAUTHORIZED;
    if (["P1010", "P6010"].includes(errorCode)) return status.FORBIDDEN;
    if (errorCode === "P6003") return status.PAYMENT_REQUIRED;
    if (["P1008", "P2004", "P6004"].includes(errorCode)) return status.GATEWAY_TIMEOUT;
    if (errorCode === "P5011") return status.TOO_MANY_REQUESTS;
    if (errorCode === "P6009") return 413;
    if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) return status.SERVICE_UNAVAILABLE;
    if (errorCode.startsWith("P2")) return status.BAD_REQUEST;
    return status.INTERNAL_SERVER_ERROR;
};

export const handlePrismaClientKnownRequestError = (error: Prisma.PrismaClientKnownRequestError): TErrorResponse => {
    const statusCode = getStatusCodeFromPrismaError(error.code);
    const meta = error.meta as Record<string, unknown> | undefined;
    const modelName = meta?.modelName as string | undefined;
    const cause = meta?.cause as string | undefined;
    const target = meta?.target as string[] | string | undefined;

    let message: string;
    let errorPath: string = error.code;

    switch (error.code) {
        case "P2025":
            message = modelName ? `${modelName} record not found` : (cause || "The requested record was not found");
            break;
        case "P2002": {
            const fields = Array.isArray(target) ? target.join(", ") : (target ?? "field");
            message = `A record with this ${fields} already exists`;
            errorPath = String(fields);
            break;
        }
        case "P2003": {
            const field = meta?.field_name as string | undefined;
            message = field ? `Foreign key constraint failed on field: ${field}` : "Foreign key constraint failed";
            errorPath = field ?? error.code;
            break;
        }
        default:
            message = error.message.replace(/Invalid `.*?` invocation:?\s*/i, "").split("\n")[0] || "A database error occurred";
    }

    return {
        success: false,
        statusCode,
        message,
        errorSources: [{ path: errorPath, message }],
    };
};

export const handlePrismaClientValidationError = (error: Prisma.PrismaClientValidationError): TErrorResponse => {
    return {
        success: false,
        statusCode: status.BAD_REQUEST,
        message: "Database validation failed",
        errorSources: [{ path: "database", message: error.message.split("\n")[0] || "Check your data" }],
    };
};
