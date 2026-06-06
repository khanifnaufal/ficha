interface CacheEntry<T> {
	value: T;
	expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export const CACHE_TTLS = {
	MARKET_VALUE: 7 * 24 * 60 * 60 * 1000, // 7 days
	STATS: 6 * 60 * 60 * 1000, // 6 hours (was 1h, player stats don't change that fast)
	SEARCH: 24 * 60 * 60 * 1000, // 24 hours — search results barely change day-to-day
	PROFILE: 12 * 60 * 60 * 1000 // 12 hours for player bio
};

export function get<T>(key: string): T | null {
	const entry = cache.get(key);
	if (!entry) return null;

	if (Date.now() > entry.expiry) {
		cache.delete(key);
		return null;
	}

	return entry.value as T;
}

export function set<T>(key: string, value: T, ttlMs: number): void {
	const expiry = Date.now() + ttlMs;
	cache.set(key, { value, expiry });
}

export function has(key: string): boolean {
	const entry = cache.get(key);
	if (!entry) return false;

	if (Date.now() > entry.expiry) {
		cache.delete(key);
		return false;
	}

	return true;
}

export function clear(): void {
	cache.clear();
}
