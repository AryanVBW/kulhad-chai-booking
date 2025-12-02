/**
 * Supabase Connection Pool Manager
 * Optimizes database connections and implements connection pooling strategies
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

/**
 * Connection pool configuration
 */
const POOL_CONFIG = {
    // Maximum number of clients in the pool
    max: parseInt(process.env.DB_POOL_MAX || '20'),

    // Minimum number of clients in the pool
    min: parseInt(process.env.DB_POOL_MIN || '2'),

    // Maximum time (ms) a client can be idle before being removed
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),

    // Maximum time (ms) to wait for a connection
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),

    // Query timeout
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000')
};

/**
 * Create optimized Supabase client with connection pooling
 */
export function createPooledClient() {
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
        },
        db: {
            schema: 'public'
        },
        global: {
            headers: {
                'x-connection-pool': 'enabled'
            }
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    });
}

/**
 * Connection Pool Manager
 */
class ConnectionPool {
    constructor() {
        this.pool = [];
        this.activeConnections = 0;
        this.waitQueue = [];
        this.stats = {
            totalCreated: 0,
            totalAcquired: 0,
            totalReleased: 0,
            totalErrors: 0,
            currentActive: 0,
            currentIdle: 0
        };

        // Initialize minimum connections
        this.initialize();
    }

    /**
     * Initialize pool with minimum connections
     */
    async initialize() {
        for (let i = 0; i < POOL_CONFIG.min; i++) {
            await this.createConnection();
        }
    }

    /**
     * Create a new connection
     */
    async createConnection() {
        try {
            const client = createPooledClient();
            const connection = {
                client,
                id: this.stats.totalCreated++,
                createdAt: Date.now(),
                lastUsed: Date.now(),
                inUse: false
            };

            this.pool.push(connection);
            this.stats.currentIdle++;

            return connection;
        } catch (error) {
            this.stats.totalErrors++;
            console.error('Error creating connection:', error);
            throw error;
        }
    }

    /**
     * Acquire a connection from the pool
     */
    async acquire() {
        // Find an idle connection
        const idleConnection = this.pool.find(conn => !conn.inUse);

        if (idleConnection) {
            idleConnection.inUse = true;
            idleConnection.lastUsed = Date.now();
            this.stats.totalAcquired++;
            this.stats.currentActive++;
            this.stats.currentIdle--;
            return idleConnection.client;
        }

        // Create new connection if under max limit
        if (this.pool.length < POOL_CONFIG.max) {
            const connection = await this.createConnection();
            connection.inUse = true;
            this.stats.totalAcquired++;
            this.stats.currentActive++;
            this.stats.currentIdle--;
            return connection.client;
        }

        // Wait for a connection to become available
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const index = this.waitQueue.indexOf(request);
                if (index > -1) {
                    this.waitQueue.splice(index, 1);
                }
                reject(new Error('Connection timeout'));
            }, POOL_CONFIG.connectionTimeoutMillis);

            const request = { resolve, reject, timeout };
            this.waitQueue.push(request);
        });
    }

    /**
     * Release a connection back to the pool
     */
    release(client) {
        const connection = this.pool.find(conn => conn.client === client);

        if (connection) {
            connection.inUse = false;
            connection.lastUsed = Date.now();
            this.stats.totalReleased++;
            this.stats.currentActive--;
            this.stats.currentIdle++;

            // Process wait queue
            if (this.waitQueue.length > 0) {
                const request = this.waitQueue.shift();
                clearTimeout(request.timeout);

                connection.inUse = true;
                this.stats.currentActive++;
                this.stats.currentIdle--;
                request.resolve(connection.client);
            }
        }
    }

    /**
     * Execute a query with automatic connection management
     */
    async query(fn) {
        const client = await this.acquire();

        try {
            const result = await fn(client);
            return result;
        } finally {
            this.release(client);
        }
    }

    /**
     * Clean up idle connections
     */
    cleanup() {
        const now = Date.now();
        const toRemove = [];

        for (const connection of this.pool) {
            if (
                !connection.inUse &&
                now - connection.lastUsed > POOL_CONFIG.idleTimeoutMillis &&
                this.pool.length > POOL_CONFIG.min
            ) {
                toRemove.push(connection);
            }
        }

        for (const connection of toRemove) {
            const index = this.pool.indexOf(connection);
            if (index > -1) {
                this.pool.splice(index, 1);
                this.stats.currentIdle--;
            }
        }

        if (toRemove.length > 0) {
            console.log(`Cleaned up ${toRemove.length} idle connections`);
        }
    }

    /**
     * Get pool statistics
     */
    getStats() {
        return {
            ...this.stats,
            poolSize: this.pool.length,
            waitQueueSize: this.waitQueue.length,
            config: POOL_CONFIG
        };
    }

    /**
     * Drain the pool (close all connections)
     */
    async drain() {
        // Wait for active connections to finish
        while (this.stats.currentActive > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.pool = [];
        this.stats.currentIdle = 0;
    }
}

// Singleton instance
export const connectionPool = new ConnectionPool();

// Cleanup idle connections every 30 seconds
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        connectionPool.cleanup();
    }, 30000);
}

// Log stats every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        const stats = connectionPool.getStats();
        console.log('\n=== Connection Pool Stats ===');
        console.log(`Pool Size: ${stats.poolSize}`);
        console.log(`Active: ${stats.currentActive}`);
        console.log(`Idle: ${stats.currentIdle}`);
        console.log(`Total Acquired: ${stats.totalAcquired}`);
        console.log(`Total Released: ${stats.totalReleased}`);
        console.log(`Wait Queue: ${stats.waitQueueSize}`);
        console.log(`Errors: ${stats.totalErrors}`);
        console.log('============================\n');
    }, 5 * 60 * 1000);
}
