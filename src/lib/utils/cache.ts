import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.resolve('.cache.json');

interface CacheEntry<T> {
	value: T;
	expiry: number;
}

let cache = new Map<string, CacheEntry<unknown>>();

// Helper to load cache from disk
function loadCache() {
	try {
		if (fs.existsSync(CACHE_FILE)) {
			const raw = fs.readFileSync(CACHE_FILE, 'utf8');
			const parsed = JSON.parse(raw);
			cache = new Map(Object.entries(parsed));
		}
	} catch (e) {
		console.error('Failed to load persistent cache from disk:', e);
	}
}

// Helper to save cache to disk
function saveCache() {
	try {
		const obj = Object.fromEntries(cache.entries());
		fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf8');
	} catch (e) {
		console.error('Failed to save persistent cache to disk:', e);
	}
}

// Load cache at start
loadCache();

export const CACHE_TTLS = {
	MARKET_VALUE: 7 * 24 * 60 * 60 * 1000, // 7 days
	STATS: 6 * 60 * 60 * 1000, // 6 hours
	SEARCH: 24 * 60 * 60 * 1000, // 24 hours
	PROFILE: 12 * 60 * 60 * 1000 // 12 hours
};

export function get<T>(key: string): T | null {
	const entry = cache.get(key);
	if (!entry) return null;

	if (Date.now() > entry.expiry) {
		cache.delete(key);
		saveCache();
		return null;
	}

	return entry.value as T;
}

export function set<T>(key: string, value: T, ttlMs: number): void {
	const expiry = Date.now() + ttlMs;
	cache.set(key, { value, expiry });
	saveCache();
}

export function has(key: string): boolean {
	const entry = cache.get(key);
	if (!entry) return false;

	if (Date.now() > entry.expiry) {
		cache.delete(key);
		saveCache();
		return false;
	}

	return true;
}

export function clear(): void {
	cache.clear();
	try {
		if (fs.existsSync(CACHE_FILE)) {
			fs.unlinkSync(CACHE_FILE);
		}
	} catch (e) {
		console.error('Failed to delete cache file:', e);
	}
}
