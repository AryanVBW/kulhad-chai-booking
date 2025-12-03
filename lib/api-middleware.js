/**
 * API Middleware Utilities
 * Provides compression, caching, and performance monitoring for API routes
 */

import { NextResponse } from 'next/server';
import { performanceMonitor } from './performance-monitor';
import { cacheManager } from './cache-manager';

/**
 * Compress response data
 * Note: Next.js automatically handles compression, but we can optimize payload size
 */
export function optimizePayload(data) {
    // Remove null/undefined fields to reduce payload size
    if (Array.isArray(data)) {
        return data.map(item => optimizePayload(item));
    }

    if (data && typeof data === 'object') {
        const optimized = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined) {
                optimized[key] = optimizePayload(value);
            }
        }
        return optimized;
    }

    return data;
}

/**
 * Create cached response wrapper
 */
export async function withCache(cacheKey, cacheType, fetchFn, options = {}) {
    const { ttl, bypassCache = false } = options;

    // Check cache first
    if (!bypassCache) {
        const cached = await cacheManager.get(cacheType, cacheKey);
        if (cached) {
            performanceMonitor.trackCache(true);
            return cached;
        }
    }

    performanceMonitor.trackCache(false);

    // Fetch fresh data
    const data = await fetchFn();

    // Cache the result
    if (data) {
        await cacheManager.set(cacheType, data, cacheKey);
    }

    return data;
}

/**
 * Performance tracking wrapper for API routes
 */
export function withPerformanceTracking(handler, endpoint) {
    return async (request, context) => {
        const method = request.method;
        const tracker = performanceMonitor.startRequest(endpoint, method);

        try {
            const response = await handler(request, context);

            const duration = performanceMonitor.endRequest(tracker, response.status);

            // Add performance header
            const headers = new Headers(response.headers);
            headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);

            return new NextResponse(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers
            });
        } catch (error) {
            performanceMonitor.endRequest(tracker, 500);
            throw error;
        }
    };
}

/**
 * Add cache control headers
 */
export function withCacheHeaders(response, maxAge = 300) {
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`);
    headers.set('CDN-Cache-Control', `public, max-age=${maxAge}`);

    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

/**
 * Standard error response
 */
export function errorResponse(message, status = 500, details = null) {
    const error = {
        error: message,
        status,
        timestamp: new Date().toISOString()
    };

    if (details && process.env.NODE_ENV === 'development') {
        error.details = details;
    }

    return NextResponse.json(error, { status });
}

/**
 * Standard success response with optimized payload
 */
export function successResponse(data, status = 200, options = {}) {
    const { cacheMaxAge, optimize = true } = options;

    const payload = optimize ? optimizePayload(data) : data;
    const response = NextResponse.json(payload, { status });

    if (cacheMaxAge) {
        return withCacheHeaders(response, cacheMaxAge);
    }

    return response;
}

/**
 * Validate request body
 */
export function validateRequest(body, requiredFields = []) {
    const missing = [];

    for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null) {
            missing.push(field);
        }
    }

    if (missing.length > 0) {
        return {
            valid: false,
            error: `Missing required fields: ${missing.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Parse and normalize request body (handle camelCase and snake_case)
 */
export function normalizeRequestBody(body, fieldMap = {}) {
    const normalized = {};

    for (const [targetField, sourceFields] of Object.entries(fieldMap)) {
        // sourceFields can be a string or array of possible field names
        const fields = Array.isArray(sourceFields) ? sourceFields : [sourceFields];

        for (const field of fields) {
            if (body[field] !== undefined && body[field] !== null) {
                normalized[targetField] = body[field];
                break;
            }
        }
    }

    return normalized;
}

/**
 * Batch database operations
 */
export async function batchOperation(items, operation, batchSize = 50) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(item => operation(item))
        );
        results.push(...batchResults);
    }

    return results;
}

/**
 * Rate limit check (basic implementation)
 * For production, consider using a proper rate limiting service
 */
const rateLimitStore = new Map();

export function checkRateLimit(identifier, limit = 100, windowMs = 60000) {
    const now = Date.now();
    const key = `ratelimit:${identifier}`;

    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return { allowed: true, remaining: limit - 1 };
    }

    const record = rateLimitStore.get(key);

    // Reset if window expired
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
        return { allowed: true, remaining: limit - 1 };
    }

    // Check limit
    if (record.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: record.resetTime
        };
    }

    record.count++;
    return {
        allowed: true,
        remaining: limit - record.count
    };
}

// Clean up rate limit store periodically
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of rateLimitStore.entries()) {
            if (now > record.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, 60000); // Clean every minute
}
