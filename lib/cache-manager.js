
const CACHE_VERSION = '1.0';
const CACHE_PREFIX = 'kulhad_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

const CACHE_CONFIG = {
  customers: { ttl: 10 * 60 * 1000, storage: 'indexeddb' }, // 10 minutes
  products: { ttl: 15 * 60 * 1000, storage: 'indexeddb' }, // 15 minutes
  invoices: { ttl: 5 * 60 * 1000, storage: 'indexeddb' }, // 5 minutes
  payments: { ttl: 5 * 60 * 1000, storage: 'indexeddb' }, // 5 minutes
  users: { ttl: 30 * 60 * 1000, storage: 'localstorage' }, // 30 minutes
  businessSettings: { ttl: 60 * 60 * 1000, storage: 'localstorage' }, // 1 hour
  lowStockProducts: { ttl: 10 * 60 * 1000, storage: 'localstorage' }, // 10 minutes
  userActivity: { ttl: 2 * 60 * 1000, storage: 'localstorage' }, // 2 minutes

  // Query result caching
  queryResults: { ttl: 5 * 60 * 1000, storage: 'indexeddb' }, // 5 minutes
  orders: { ttl: 5 * 60 * 1000, storage: 'indexeddb' }, // 5 minutes
  inventory: { ttl: 10 * 60 * 1000, storage: 'indexeddb' }, // 10 minutes
  menuItems: { ttl: 15 * 60 * 1000, storage: 'indexeddb' }, // 15 minutes
  tables: { ttl: 10 * 60 * 1000, storage: 'indexeddb' }, // 10 minutes
};

const DB_NAME = 'KulhadChaiCache';
const DB_VERSION = 1;
let dbInstance = null;

const initIndexedDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores for each cache type
      Object.keys(CACHE_CONFIG).forEach((key) => {
        if (CACHE_CONFIG[key].storage === 'indexeddb' && !db.objectStoreNames.contains(key)) {
          db.createObjectStore(key, { keyPath: 'cacheKey' });
        }
      });
    };
  });
};

const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!item) return null;

    const parsed = JSON.parse(item);

    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const setToLocalStorage = (key, data, ttl = DEFAULT_TTL) => {
  try {
    const item = {
      data,
      expiry: Date.now() + ttl,
      version: CACHE_VERSION,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    if (error.name === 'QuotaExceededError') {
      clearOldestCache('localstorage');
      try {
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
          data,
          expiry: Date.now() + ttl,
          version: CACHE_VERSION,
          timestamp: Date.now(),
        }));
        return true;
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError);
      }
    }
    return false;
  }
};

const getFromIndexedDB = async (storeName, key = 'default') => {
  try {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        if (Date.now() > result.expiry) {
          deleteFromIndexedDB(storeName, key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error reading from IndexedDB:', error);
    return null;
  }
};

const setToIndexedDB = async (storeName, data, key = 'default', ttl = DEFAULT_TTL) => {
  try {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const item = {
        cacheKey: key,
        data,
        expiry: Date.now() + ttl,
        version: CACHE_VERSION,
        timestamp: Date.now(),
      };

      const request = store.put(item);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error writing to IndexedDB:', error);
    return false;
  }
};

const deleteFromIndexedDB = async (storeName, key = 'default') => {
  try {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting from IndexedDB:', error);
    return false;
  }
};

export const cacheManager = {
  async get(cacheType, key = 'default') {
    // SSR guard - browser APIs not available on server
    if (typeof window === 'undefined') {
      return null;
    }

    const config = CACHE_CONFIG[cacheType];
    if (!config) {
      console.warn(`No cache config for type: ${cacheType}`);
      return null;
    }

    if (config.storage === 'localstorage') {
      return getFromLocalStorage(`${cacheType}_${key}`);
    } else {
      return await getFromIndexedDB(cacheType, key);
    }
  },

  async set(cacheType, data, key = 'default') {
    // SSR guard - browser APIs not available on server
    if (typeof window === 'undefined') {
      return false;
    }

    const config = CACHE_CONFIG[cacheType];
    if (!config) {
      console.warn(`No cache config for type: ${cacheType}`);
      return false;
    }

    if (config.storage === 'localstorage') {
      return setToLocalStorage(`${cacheType}_${key}`, data, config.ttl);
    } else {
      return await setToIndexedDB(cacheType, data, key, config.ttl);
    }
  },

  async invalidate(cacheType, key = 'default') {
    // SSR guard - browser APIs not available on server
    if (typeof window === 'undefined') {
      return;
    }

    const config = CACHE_CONFIG[cacheType];
    if (!config) return;

    if (config.storage === 'localstorage') {
      localStorage.removeItem(`${CACHE_PREFIX}${cacheType}_${key}`);
    } else {
      await deleteFromIndexedDB(cacheType, key);
    }
  },

  async clearAll() {
    // SSR guard - browser APIs not available on server
    if (typeof window === 'undefined') {
      return;
    }

    // Clear localStorage caches
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });

    // Clear IndexedDB
    try {
      const db = await initIndexedDB();
      Object.keys(CACHE_CONFIG).forEach((cacheType) => {
        if (CACHE_CONFIG[cacheType].storage === 'indexeddb') {
          const transaction = db.transaction([cacheType], 'readwrite');
          const store = transaction.objectStore(cacheType);
          store.clear();
        }
      });
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
    }
  },

  async getStats() {
    // SSR guard - browser APIs not available on server
    if (typeof window === 'undefined') {
      return { localStorage: {}, indexedDB: {}, totalSize: 0 };
    }

    const stats = {
      localStorage: {},
      indexedDB: {},
      totalSize: 0,
    };

    // LocalStorage stats
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          const size = new Blob([localStorage.getItem(key)]).size;
          const cacheType = key.replace(CACHE_PREFIX, '').split('_')[0];

          if (!stats.localStorage[cacheType]) {
            stats.localStorage[cacheType] = { count: 0, size: 0 };
          }

          stats.localStorage[cacheType].count++;
          stats.localStorage[cacheType].size += size;
          stats.totalSize += size;
        } catch (error) {
          console.error('Error reading cache stats:', error);
        }
      }
    });

    // IndexedDB stats
    try {
      const db = await initIndexedDB();
      for (const cacheType of Object.keys(CACHE_CONFIG)) {
        if (CACHE_CONFIG[cacheType].storage === 'indexeddb') {
          const transaction = db.transaction([cacheType], 'readonly');
          const store = transaction.objectStore(cacheType);
          const countRequest = store.count();

          await new Promise((resolve) => {
            countRequest.onsuccess = () => {
              stats.indexedDB[cacheType] = { count: countRequest.result };
              resolve();
            };
          });
        }
      }
    } catch (error) {
      console.error('Error getting IndexedDB stats:', error);
    }

    return stats;
  },

  async isValid(cacheType, key = 'default') {
    const data = await this.get(cacheType, key);
    return data !== null;
  },
};

// Clear oldest cache entries when quota exceeded
const clearOldestCache = (storageType) => {
  if (storageType === 'localstorage') {
    const cacheItems = [];

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          cacheItems.push({ key, timestamp: item.timestamp });
        } catch (error) {
          // Invalid cache item, remove it
          localStorage.removeItem(key);
        }
      }
    });

    // Sort by timestamp and remove oldest 25%
    cacheItems.sort((a, b) => a.timestamp - b.timestamp);
    const removeCount = Math.ceil(cacheItems.length * 0.25);

    for (let i = 0; i < removeCount; i++) {
      localStorage.removeItem(cacheItems[i].key);
    }
  }
};

// Export cache config for external use
export const getCacheConfig = () => CACHE_CONFIG;

// Initialize on load
if (typeof window !== 'undefined') {
  initIndexedDB().catch(console.error);
}
