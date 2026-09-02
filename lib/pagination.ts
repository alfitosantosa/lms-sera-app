import { NextRequest } from "next/server";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

/**
 * Extract pagination parameters from URL search params
 * @param searchParams - URL search parameters
 * @returns Validated pagination params with page, limit, and skip
 */
export function extractPaginationParams(searchParams: URLSearchParams): PaginationParams {
  // Ensure page is at least 1
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  // Limit between 1-100 to prevent DOS
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  // Calculate skip for database query
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create standardized pagination response
 * @param data - Array of data items
 * @param total - Total count of items in database
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Formatted pagination response
 */
export function createPaginationResponse<T>(data: T[], total: number, page: number, limit: number): PaginationResponse<T> {
  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasMore: page < pages,
    },
  };
}

/**
 * Extract pagination params from NextRequest
 * Convenience wrapper for extractPaginationParams
 * @param request - Next.js request object
 * @returns Validated pagination params
 */
export function getPaginationQuery(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);
  return extractPaginationParams(searchParams);
}
