const countsCache = new Map();

export async function getCachedTabCounts({ key, fetcher }) {
  const now = Date.now();
  const cached = countsCache.get(key);
  if (cached && now - cached.timestamp < 30000) {
    return cached.data;
  }
  const data = await fetcher();
  countsCache.set(key, { data, timestamp: now });
  return data;
}

export function clearTabCountsCache() {
  countsCache.clear();
}
