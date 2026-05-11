import status from "http-status";
import type { ZodError, ZodIssue } from "zod";
import type { TErrorResponse, TErrorSource } from "../interfaces/error.interface";

export const handleZodError = (err: ZodError): TErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources: TErrorSource[] = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue.path.join(" => "),
      message: issue.message,
    };
  });

  return {
    success: false,
    message,
    errorSources,
    statusCode,
  };
};
