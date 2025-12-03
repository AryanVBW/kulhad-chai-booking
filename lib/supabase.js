import { createClient } from '@supabase/supabase-js';
import { performanceMonitor } from './performance-monitor';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Enhanced Supabase client with performance monitoring and optimizations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
      'x-client-info': 'kulhad-chai-booking'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Wrapper for database queries with performance tracking
 */
export async function trackedQuery(queryName, queryFn) {
  const startTime = performance.now();
  let success = true;

  try {
    const result = await queryFn();
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    performanceMonitor.trackQuery(queryName, duration, success);
  }
}

/**
 * Create a query builder with automatic performance tracking
 */
export function createTrackedQuery(tableName) {
  return new Proxy(supabase.from(tableName), {
    get(target, prop) {
      const original = target[prop];

      if (typeof original === 'function') {
        return function (...args) {
          const result = original.apply(target, args);

          // Track the final query execution
          if (prop === 'select' || prop === 'insert' || prop === 'update' || prop === 'delete') {
            const queryName = `${tableName}.${prop}`;
            return trackedQuery(queryName, () => result);
          }

          return result;
        };
      }

      return original;
    }
  });
}

// Database types
