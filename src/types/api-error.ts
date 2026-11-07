export interface ValidationErrorItem {
  field: string;
  message: string;
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  validationErrors?: ValidationErrorItem[];
}

export function createApiError(message: string, statusCode: number, code: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
