export type TErrorSource = {
  path: string;
  message: string;
};

export type TErrorResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  errorSources: TErrorSource[];
  stack?: string | undefined;
  error?: unknown;
};
