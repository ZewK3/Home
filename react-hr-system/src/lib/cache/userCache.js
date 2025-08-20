// User Cache with TTL to reduce API calls
let cache = null;

export function getUserFromCache() {
  if (!cache) return null;
  
  const now = Date.now();
  if (cache.expiredAt && cache.expiredAt > now) {
    return cache.user;
  }
  
  return null;
}

export function setUserToCache(user, ttlMs = 5 * 60 * 1000) { // Default 5 minutes
  cache = {
    user,
    expiredAt: Date.now() + ttlMs
  };
}

export function clearUserCache() {
  cache = null;
}

export function isUserCacheValid() {
  if (!cache) return false;
  const now = Date.now();
  return cache.expiredAt && cache.expiredAt > now;
}