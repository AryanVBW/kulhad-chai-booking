/**
 * Rate Limiter
 * Implements sliding window rate limiting algorithm
 */

import { getRateLimitConfig, isWhitelisted, isBlacklisted } from './rate-limit-config';

/**
 * In-memory store for rate limit data
 * For production with multiple servers, use Redis
 */
class RateLimitStore {
    constructor() {
        this.store = new Map();
        this.cleanupInterval = 60 * 1000; // Cleanup every minute

        // Start cleanup interval
        if (typeof setInterval !== 'undefined') {
            setInterval(() => this.cleanup(), this.cleanupInterval);
        }
    }

    /**
     * Get rate limit data for a key
     */
    get(key) {
        return this.store.get(key);
    }

    /**
     * Set rate limit data for a key
     */
    set(key, value) {
        this.store.set(key, value);
    }

    /**
     * Delete rate limit data for a key
     */
    delete(key) {
        this.store.delete(key);
    }

    /**
     * Cleanup expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, data] of this.store.entries()) {
            // Remove entries where all timestamps are expired
            const validTimestamps = data.timestamps.filter(
                timestamp => now - timestamp < data.windowMs
            );

            if (validTimestamps.length === 0) {
                this.store.delete(key);
                cleaned++;
            } else if (validTimestamps.length !== data.timestamps.length) {
                // Update with only valid timestamps
                data.timestamps = validTimestamps;
                this.store.set(key, data);
            }
        }

        if (cleaned > 0) {
            console.log(`[Rate Limiter] Cleaned up ${cleaned} expired entries`);
        }
    }

    /**
     * Get store statistics
     */
    getStats() {
        return {
            totalKeys: this.store.size,
            entries: Array.from(this.store.entries()).map(([key, data]) => ({
                key,
                count: data.timestamps.length,
                limit: data.limit,
                resetAt: new Date(Math.min(...data.timestamps) + data.windowMs)
            }))
        };
    }
}

// Singleton store instance
const store = new RateLimitStore();

/**
 * Rate limiter class implementing sliding window algorithm
 */
export class RateLimiter {
    constructor() {
        this.store = store;
        this.stats = {
            totalRequests: 0,
            blockedRequests: 0,
            allowedRequests: 0
        };
    }

    /**
     * Get client identifier (IP or user ID)
     */
    getClientId(request, userId = null) {
        if (userId) {
            return `user:${userId}`;
        }

        // Get IP from various headers (for proxies/load balancers)
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ip = forwarded?.split(',')[0] || realIp || 'unknown';

        return `ip:${ip}`;
    }

    /**
     * Get IP address from request
     */
    getIpAddress(request) {
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        return forwarded?.split(',')[0] || realIp || 'unknown';
    }

    /**
     * Check rate limit for a request
     * Returns { allowed, limit, remaining, resetTime }
     */
    async check(request, options = {}) {
        this.stats.totalRequests++;

        const {
            userId = null,
            userRole = null,
            pathname = new URL(request.url).pathname
        } = options;

        // Get IP address
        const ip = this.getIpAddress(request);

        // Check blacklist
        if (isBlacklisted(ip)) {
            this.stats.blockedRequests++;
            return {
                allowed: false,
                limit: 0,
                remaining: 0,
                resetTime: Date.now(),
                reason: 'IP blacklisted'
            };
        }

        // Check whitelist
        if (isWhitelisted(ip)) {
            this.stats.allowedRequests++;
            return {
                allowed: true,
                limit: Infinity,
                remaining: Infinity,
                resetTime: null,
                reason: 'IP whitelisted'
            };
        }

        // Get rate limit configuration
        const config = getRateLimitConfig(pathname, userRole);

        // Admin users bypass rate limiting
        if (config.limit === Infinity) {
            this.stats.allowedRequests++;
            return {
                allowed: true,
                limit: Infinity,
                remaining: Infinity,
                resetTime: null,
                reason: 'Admin bypass'
            };
        }

        // Get client identifier
        const clientId = this.getClientId(request, userId);
        const key = `${clientId}:${pathname}`;

        // Get current rate limit data
        const now = Date.now();
        let data = this.store.get(key);

        if (!data) {
            // Initialize new entry
            data = {
                timestamps: [],
                limit: config.limit,
                windowMs: config.windowMs
            };
        }

        // Remove timestamps outside the window (sliding window)
        data.timestamps = data.timestamps.filter(
            timestamp => now - timestamp < config.windowMs
        );

        // Check if limit exceeded
        if (data.timestamps.length >= config.limit) {
            this.stats.blockedRequests++;

            // Calculate reset time (when oldest request expires)
            const oldestTimestamp = Math.min(...data.timestamps);
            const resetTime = oldestTimestamp + config.windowMs;

            return {
                allowed: false,
                limit: config.limit,
                remaining: 0,
                resetTime,
                retryAfter: Math.ceil((resetTime - now) / 1000), // seconds
                message: config.message
            };
        }

        // Add current timestamp
        data.timestamps.push(now);
        data.limit = config.limit;
        data.windowMs = config.windowMs;

        // Update store
        this.store.set(key, data);

        this.stats.allowedRequests++;

        // Calculate reset time
        const oldestTimestamp = Math.min(...data.timestamps);
        const resetTime = oldestTimestamp + config.windowMs;

        return {
            allowed: true,
            limit: config.limit,
            remaining: config.limit - data.timestamps.length,
            resetTime
        };
    }

    /**
     * Reset rate limit for a client
     */
    reset(clientId, pathname = null) {
        if (pathname) {
            const key = `${clientId}:${pathname}`;
            this.store.delete(key);
        } else {
            // Reset all entries for this client
            for (const key of this.store.store.keys()) {
                if (key.startsWith(clientId)) {
                    this.store.delete(key);
                }
            }
        }
    }

    /**
     * Get rate limiter statistics
     */
    getStats() {
        return {
            ...this.stats,
            blockRate: this.stats.totalRequests > 0
                ? ((this.stats.blockedRequests / this.stats.totalRequests) * 100).toFixed(2) + '%'
                : '0%',
            store: this.store.getStats()
        };
    }

    /**
     * Log statistics
     */
    logStats() {
        const stats = this.getStats();
        console.log('\n=== Rate Limiter Stats ===');
        console.log(`Total Requests: ${stats.totalRequests}`);
        console.log(`Allowed: ${stats.allowedRequests}`);
        console.log(`Blocked: ${stats.blockedRequests}`);
        console.log(`Block Rate: ${stats.blockRate}`);
        console.log(`Active Keys: ${stats.store.totalKeys}`);
        console.log('========================\n');
    }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Log stats every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        rateLimiter.logStats();
    }, 5 * 60 * 1000);
}
