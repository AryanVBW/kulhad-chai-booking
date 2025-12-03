/**
 * Pagination Helper Utilities
 * Provides reusable pagination functions for API endpoints
 */

/**
 * Parse pagination parameters from request
 */
export function parsePaginationParams(searchParams) {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor') || null;

    // Validate and constrain values
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    return {
        page: validatedPage,
        limit: validatedLimit,
        offset: (validatedPage - 1) * validatedLimit,
        cursor
    };
}

/**
 * Create pagination metadata for offset-based pagination
 */
export function createPaginationMeta(totalCount, page, limit) {
    const totalPages = Math.ceil(totalCount / limit);

    return {
        currentPage: page,
        pageSize: limit,
        totalItems: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null
    };
}

/**
 * Create cursor-based pagination metadata
 */
export function createCursorPaginationMeta(items, limit, cursorField = 'id') {
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;

    const nextCursor = hasMore && resultItems.length > 0
        ? resultItems[resultItems.length - 1][cursorField]
        : null;

    return {
        items: resultItems,
        pageSize: limit,
        hasMore,
        nextCursor,
        cursorField
    };
}

/**
 * Apply offset-based pagination to Supabase query
 */
export function applyOffsetPagination(query, { page, limit, offset }) {
    return query
        .range(offset, offset + limit - 1);
}

/**
 * Apply cursor-based pagination to Supabase query
 */
export function applyCursorPagination(query, { cursor, limit, cursorField = 'created_at', direction = 'desc' }) {
    let paginatedQuery = query.limit(limit + 1); // Fetch one extra to check if there's more

    if (cursor) {
        if (direction === 'desc') {
            paginatedQuery = paginatedQuery.lt(cursorField, cursor);
        } else {
            paginatedQuery = paginatedQuery.gt(cursorField, cursor);
        }
    }

    return paginatedQuery.order(cursorField, { ascending: direction === 'asc' });
}

/**
 * Get total count for a query
 * Note: This performs a separate count query
 */
export async function getTotalCount(supabase, tableName, filters = {}) {
    let query = supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    });

    const { count, error } = await query;

    if (error) {
        console.error('Error getting total count:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Create paginated response with metadata
 */
export function createPaginatedResponse(data, meta, additionalData = {}) {
    return {
        data,
        pagination: meta,
        ...additionalData
    };
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams({ page, limit }) {
    const errors = [];

    if (page < 1) {
        errors.push('Page must be greater than 0');
    }

    if (limit < 1) {
        errors.push('Limit must be greater than 0');
    }

    if (limit > 100) {
        errors.push('Limit cannot exceed 100');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Helper to paginate array data (for in-memory pagination)
 */
export function paginateArray(array, page, limit) {
    const offset = (page - 1) * limit;
    const paginatedItems = array.slice(offset, offset + limit);
    const meta = createPaginationMeta(array.length, page, limit);

    return createPaginatedResponse(paginatedItems, meta);
}

/**
 * Convert cursor to timestamp for date-based cursors
 */
export function cursorToTimestamp(cursor) {
    try {
        return new Date(cursor).toISOString();
    } catch (error) {
        console.error('Invalid cursor format:', error);
        return null;
    }
}

/**
 * Create cursor from timestamp
 */
export function timestampToCursor(timestamp) {
    if (!timestamp) return null;

    try {
        return new Date(timestamp).toISOString();
    } catch (error) {
        console.error('Invalid timestamp format:', error);
        return null;
    }
}

/**
 * Example usage:
 * 
 * // Offset-based pagination
 * const params = parsePaginationParams(request.url.searchParams);
 * const query = supabase.from('orders').select('*');
 * const paginatedQuery = applyOffsetPagination(query, params);
 * const { data } = await paginatedQuery;
 * const totalCount = await getTotalCount(supabase, 'orders');
 * const meta = createPaginationMeta(totalCount, params.page, params.limit);
 * return createPaginatedResponse(data, meta);
 * 
 * // Cursor-based pagination
 * const params = parsePaginationParams(request.url.searchParams);
 * const query = supabase.from('orders').select('*');
 * const paginatedQuery = applyCursorPagination(query, {
 *   cursor: params.cursor,
 *   limit: params.limit,
 *   cursorField: 'created_at'
 * });
 * const { data } = await paginatedQuery;
 * const meta = createCursorPaginationMeta(data, params.limit, 'created_at');
 * return createPaginatedResponse(meta.items, { 
 *   hasMore: meta.hasMore, 
 *   nextCursor: meta.nextCursor 
 * });
 */
