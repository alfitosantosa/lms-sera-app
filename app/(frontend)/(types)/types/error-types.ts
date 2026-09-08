export interface error_types {
  invalidCredentials: string;
  userExists: string;
  invalidToken: string;
  serverError: string;
  notFound: string;
}

// Prisma error interface for database operations
export interface PrismaError {
  message?: string;
  code?: string;
  meta?: {
    target?: string[];
    field_name?: string;
    column_name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Generic API error interface
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

// Type guard to check if an error has a message property
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === "object" && error !== null && "message" in error && typeof (error as Record<string, unknown>).message === "string";
}

// Helper function to extract error message from unknown error
export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }

  return "Terjadi kesalahan";
}

// Generic select option type (for dropdowns)
export interface SelectOption {
  id: string;
  name: string;
  [key: string]: unknown;
}
