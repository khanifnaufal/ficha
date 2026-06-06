export function apiErrorStatus(message: string): 429 | 500 {
	return /rate limit|too many requests|quota/i.test(message) ? 429 : 500;
}

export function apiErrorBody(message: string): { error: string; retryAfter?: number } {
	if (apiErrorStatus(message) === 429) {
		return {
			error: message,
			retryAfter: 60
		};
	}

	return { error: message };
}
