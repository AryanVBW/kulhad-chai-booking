import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheManager } from '@/lib/cache-manager';

/**
 * Custom hook for fetching and caching data
 * @param {string} cacheType - Type of cache (customers, products, etc.)
 * @param {Function} fetchFunction - Function to fetch data from database
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, refetch, invalidate }
 */
export const useCachedData = (cacheType, fetchFunction, options = {}) => {
  const {
    key = 'default',
    enabled = true,
    dependencies = [],
    onSuccess,
    onError,
    forceRefresh = false,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  const loadData = useCallback(async (skipCache = false) => {
    // SSR guard - prevent browser API access during server-side rendering
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    if (!enabled || fetchInProgress.current) return;

    fetchInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      // Try to get from cache first
      if (!skipCache && !forceRefresh) {
        const cachedData = await cacheManager.get(cacheType, key);
        if (cachedData) {
          if (isMounted.current) {
            setData(cachedData);
            setLoading(false);
            fetchInProgress.current = false;
            onSuccess?.(cachedData);
          }
          return;
        }
      }

      // Fetch from database
      const freshData = await fetchFunction();

      if (isMounted.current) {
        setData(freshData);
        setLoading(false);

        // Cache the data
        await cacheManager.set(cacheType, freshData, key);

        onSuccess?.(freshData);
      }
    } catch (err) {
      console.error(`Error loading ${cacheType}:`, err);
      if (isMounted.current) {
        setError(err);
        setLoading(false);
        onError?.(err);
      }
    } finally {
      fetchInProgress.current = false;
    }
  }, [cacheType, fetchFunction, key, enabled, forceRefresh, onSuccess, onError]);

  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(true);
    setIsRefreshing(false);
  }, [loadData]);

  const invalidate = useCallback(async () => {
    await cacheManager.invalidate(cacheType, key);
    await refetch();
  }, [cacheType, key, refetch]);

  useEffect(() => {
    isMounted.current = true;
    loadData();

    return () => {
      isMounted.current = false;
    };
  }, [loadData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    isRefreshing,
  };
};

/**
 * Hook for managing multiple cached data sources
 * @param {Array} sources - Array of {cacheType, fetchFunction, key} objects
 * @returns {Object} { data, loading, error, refetchAll, invalidateAll }
 */
export const useMultipleCachedData = (sources, options = {}) => {
  const { enabled = true } = options;
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const isMounted = useRef(true);

  const loadAllData = useCallback(async (skipCache = false) => {
    if (!enabled) return;

    setLoading(true);
    const results = {};
    const errorResults = {};

    await Promise.all(
      sources.map(async ({ cacheType, fetchFunction, key = 'default' }) => {
        try {
          // Try cache first
          if (!skipCache) {
            const cachedData = await cacheManager.get(cacheType, key);
            if (cachedData) {
              results[cacheType] = cachedData;
              return;
            }
          }

          // Fetch from database
          const freshData = await fetchFunction();
          results[cacheType] = freshData;

          // Cache the data
          await cacheManager.set(cacheType, freshData, key);
        } catch (error) {
          console.error(`Error loading ${cacheType}:`, error);
          errorResults[cacheType] = error;
        }
      })
    );

    if (isMounted.current) {
      setData(results);
      setErrors(errorResults);
      setLoading(false);
    }
  }, [sources, enabled]);

  const refetchAll = useCallback(async () => {
    await loadAllData(true);
  }, [loadAllData]);

  const invalidateAll = useCallback(async () => {
    await Promise.all(
      sources.map(({ cacheType, key = 'default' }) =>
        cacheManager.invalidate(cacheType, key)
      )
    );
    await refetchAll();
  }, [sources, refetchAll]);

  useEffect(() => {
    isMounted.current = true;
    loadAllData();

    return () => {
      isMounted.current = false;
    };
  }, [loadAllData]);

  return {
    data,
    loading,
    errors,
    refetchAll,
    invalidateAll,
  };
};

/**
 * Hook for cache statistics
 */
export const useCacheStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const cacheStats = await cacheManager.getStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, refresh: loadStats };
};

/**
 * Hook for clearing all caches
 */
export const useClearCache = () => {
  const [clearing, setClearing] = useState(false);

  const clearAll = useCallback(async () => {
    setClearing(true);
    try {
      await cacheManager.clearAll();
      // Reload the page to refresh all data
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setClearing(false);
    }
  }, []);

  return { clearAll, clearing };
};
