interface RateLimitInfo {
	timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitInfo>();

export function isRateLimited(
	key: string,
	limit: number,
	windowMs: number = 60 * 1000
): { limited: boolean; retryAfter: number } {
	const now = Date.now();
	let info = rateLimitMap.get(key);
	if (!info) {
		info = { timestamps: [] };
		rateLimitMap.set(key, info);
	}

	info.timestamps = info.timestamps.filter((ts) => now - ts < windowMs);

	if (info.timestamps.length >= limit) {
		const oldest = info.timestamps[0];
		const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
		return { limited: true, retryAfter: Math.max(1, retryAfter) };
	}

	info.timestamps.push(now);
	return { limited: false, retryAfter: 0 };
}

export function clearRateLimiter(): void {
	rateLimitMap.clear();
}
