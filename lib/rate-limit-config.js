/**
 * Rate Limit Configuration
 * Centralized configuration for API rate limiting
 */

/**
 * Rate limit tiers
 */
export const RATE_LIMIT_TIERS = {
    // Anonymous/IP-based requests
    ANONYMOUS: {
        limit: 100,
        windowMs: 60 * 1000, // 1 minute
        message: 'Too many requests from this IP, please try again later.'
    },

    // Authenticated users
    AUTHENTICATED: {
        limit: 200,
        windowMs: 60 * 1000, // 1 minute
        message: 'Too many requests, please try again later.'
    },

    // Admin users (no limit)
    ADMIN: {
        limit: Infinity,
        windowMs: 60 * 1000,
        message: null
    },

    // Strict limits for sensitive endpoints
    STRICT: {
        limit: 10,
        windowMs: 60 * 1000, // 1 minute
        message: 'Too many attempts, please try again later.'
    }
};

/**
 * Endpoint-specific rate limits
 * Override default limits for specific routes
 */
export const ENDPOINT_LIMITS = {
    // Authentication endpoints - stricter limits
    '/api/auth/login': RATE_LIMIT_TIERS.STRICT,
    '/api/auth/register': RATE_LIMIT_TIERS.STRICT,
    '/api/auth/reset-password': RATE_LIMIT_TIERS.STRICT,

    // Payment endpoints - moderate limits
    '/api/payments': {
        limit: 50,
        windowMs: 60 * 1000,
        message: 'Too many payment requests, please try again later.'
    },

    // Order creation - moderate limits
    '/api/orders': {
        limit: 60,
        windowMs: 60 * 1000,
        message: 'Too many order requests, please try again later.'
    },

    // Read-only endpoints - higher limits
    '/api/menu': {
        limit: 200,
        windowMs: 60 * 1000,
        message: 'Too many requests, please try again later.'
    }
};

/**
 * IP whitelist - IPs that bypass rate limiting
 * Add trusted IPs here (e.g., monitoring services, internal services)
 */
export const IP_WHITELIST = [
    '127.0.0.1',
    '::1',
    // Add more trusted IPs as needed
];

/**
 * IP blacklist - IPs that are always blocked
 */
export const IP_BLACKLIST = [
    // Add abusive IPs here
];

/**
 * Get rate limit configuration for a specific endpoint
 */
export function getRateLimitConfig(pathname, userRole = null) {
    // Admin users bypass rate limiting
    if (userRole === 'admin') {
        return RATE_LIMIT_TIERS.ADMIN;
    }

    // Check for endpoint-specific limits
    if (ENDPOINT_LIMITS[pathname]) {
        return ENDPOINT_LIMITS[pathname];
    }

    // Check for pattern matches (e.g., /api/orders/*)
    for (const [pattern, config] of Object.entries(ENDPOINT_LIMITS)) {
        if (pathname.startsWith(pattern)) {
            return config;
        }
    }

    // Default to authenticated or anonymous tier
    return userRole ? RATE_LIMIT_TIERS.AUTHENTICATED : RATE_LIMIT_TIERS.ANONYMOUS;
}

/**
 * Check if IP is whitelisted
 */
export function isWhitelisted(ip) {
    return IP_WHITELIST.includes(ip);
}

/**
 * Check if IP is blacklisted
 */
export function isBlacklisted(ip) {
    return IP_BLACKLIST.includes(ip);
}
