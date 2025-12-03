/**
 * Performance Monitoring Utility
 * Tracks API response times, database queries, and cache performance
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            apiCalls: new Map(),
            dbQueries: new Map(),
            cacheStats: {
                hits: 0,
                misses: 0,
                totalRequests: 0
            },
            slowQueries: []
        };
        this.slowQueryThreshold = 100; // ms
    }

    /**
     * Start tracking an API request
     */
    startRequest(endpoint, method = 'GET') {
        const requestId = `${method}:${endpoint}:${Date.now()}`;
        return {
            requestId,
            startTime: performance.now(),
            endpoint,
            method
        };
    }

    /**
     * End tracking an API request
     */
    endRequest(tracker, statusCode = 200) {
        const duration = performance.now() - tracker.startTime;
        const key = `${tracker.method}:${tracker.endpoint}`;

        if (!this.metrics.apiCalls.has(key)) {
            this.metrics.apiCalls.set(key, {
                count: 0,
                totalDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
                durations: [],
                errors: 0
            });
        }

        const stats = this.metrics.apiCalls.get(key);
        stats.count++;
        stats.totalDuration += duration;
        stats.minDuration = Math.min(stats.minDuration, duration);
        stats.maxDuration = Math.max(stats.maxDuration, duration);
        stats.durations.push(duration);

        // Keep only last 100 durations for percentile calculations
        if (stats.durations.length > 100) {
            stats.durations.shift();
        }

        if (statusCode >= 400) {
            stats.errors++;
        }

        // Log slow requests
        if (duration > 200) {
            console.warn(`[SLOW REQUEST] ${key} took ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    /**
     * Track database query performance
     */
    trackQuery(queryName, duration, success = true) {
        const key = queryName;

        if (!this.metrics.dbQueries.has(key)) {
            this.metrics.dbQueries.set(key, {
                count: 0,
                totalDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
                errors: 0
            });
        }

        const stats = this.metrics.dbQueries.get(key);
        stats.count++;
        stats.totalDuration += duration;
        stats.minDuration = Math.min(stats.minDuration, duration);
        stats.maxDuration = Math.max(stats.maxDuration, duration);

        if (!success) {
            stats.errors++;
        }

        // Track slow queries
        if (duration > this.slowQueryThreshold) {
            this.metrics.slowQueries.push({
                query: queryName,
                duration,
                timestamp: new Date().toISOString()
            });

            // Keep only last 50 slow queries
            if (this.metrics.slowQueries.length > 50) {
                this.metrics.slowQueries.shift();
            }

            console.warn(`[SLOW QUERY] ${queryName} took ${duration.toFixed(2)}ms`);
        }
    }

    /**
     * Track cache hit/miss
     */
    trackCache(hit) {
        this.metrics.cacheStats.totalRequests++;
        if (hit) {
            this.metrics.cacheStats.hits++;
        } else {
            this.metrics.cacheStats.misses++;
        }
    }

    /**
     * Calculate percentile from array of durations
     */
    calculatePercentile(durations, percentile) {
        if (durations.length === 0) return 0;

        const sorted = [...durations].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * Get performance report
     */
    getReport() {
        const apiReport = [];

        for (const [endpoint, stats] of this.metrics.apiCalls.entries()) {
            const avgDuration = stats.totalDuration / stats.count;
            const p95 = this.calculatePercentile(stats.durations, 95);
            const p99 = this.calculatePercentile(stats.durations, 99);

            apiReport.push({
                endpoint,
                count: stats.count,
                avgDuration: avgDuration.toFixed(2),
                minDuration: stats.minDuration.toFixed(2),
                maxDuration: stats.maxDuration.toFixed(2),
                p95: p95.toFixed(2),
                p99: p99.toFixed(2),
                errors: stats.errors,
                errorRate: ((stats.errors / stats.count) * 100).toFixed(2) + '%'
            });
        }

        const dbReport = [];
        for (const [query, stats] of this.metrics.dbQueries.entries()) {
            const avgDuration = stats.totalDuration / stats.count;

            dbReport.push({
                query,
                count: stats.count,
                avgDuration: avgDuration.toFixed(2),
                minDuration: stats.minDuration.toFixed(2),
                maxDuration: stats.maxDuration.toFixed(2),
                errors: stats.errors
            });
        }

        const cacheHitRate = this.metrics.cacheStats.totalRequests > 0
            ? ((this.metrics.cacheStats.hits / this.metrics.cacheStats.totalRequests) * 100).toFixed(2)
            : '0.00';

        return {
            api: apiReport,
            database: dbReport,
            cache: {
                ...this.metrics.cacheStats,
                hitRate: cacheHitRate + '%'
            },
            slowQueries: this.metrics.slowQueries
        };
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.metrics.apiCalls.clear();
        this.metrics.dbQueries.clear();
        this.metrics.cacheStats = {
            hits: 0,
            misses: 0,
            totalRequests: 0
        };
        this.metrics.slowQueries = [];
    }

    /**
     * Log performance summary
     */
    logSummary() {
        const report = this.getReport();

        console.log('\n=== Performance Report ===');

        if (report.api.length > 0) {
            console.log('\nAPI Endpoints:');
            console.table(report.api);
        }

        if (report.database.length > 0) {
            console.log('\nDatabase Queries:');
            console.table(report.database);
        }

        console.log('\nCache Performance:');
        console.log(`  Hit Rate: ${report.cache.hitRate}`);
        console.log(`  Total Requests: ${report.cache.totalRequests}`);
        console.log(`  Hits: ${report.cache.hits}`);
        console.log(`  Misses: ${report.cache.misses}`);

        if (report.slowQueries.length > 0) {
            console.log('\nRecent Slow Queries:');
            console.table(report.slowQueries.slice(-10));
        }

        console.log('========================\n');
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Log summary every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        performanceMonitor.logSummary();
    }, 5 * 60 * 1000);
}
