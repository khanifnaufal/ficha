import type { PageLoad } from './$types';

type PlayerLoadError = {
	status: number;
	title: string;
	message: string;
	variant: 'not-found' | 'api' | 'rate-limit';
	retryAfter?: number | null;
};

async function readError(res: Response, fallback: string): Promise<PlayerLoadError> {
	const body = await res.json().catch(() => ({}));
	const message = typeof body.error === 'string' ? body.error : fallback;
	const retryAfter =
		typeof body.retryAfter === 'number'
			? body.retryAfter
			: Number(res.headers.get('retry-after')) || null;

	if (res.status === 404) {
		return {
			status: 404,
			title: 'Player not found',
			message,
			variant: 'not-found'
		};
	}

	if (res.status === 429) {
		return {
			status: 429,
			title: 'Rate limit hit',
			message,
			variant: 'rate-limit',
			retryAfter
		};
	}

	return {
		status: res.status,
		title: 'API unavailable',
		message,
		variant: 'api'
	};
}

function toLoadError(err: unknown): PlayerLoadError {
	if (err && typeof err === 'object' && 'status' in err) {
		return err as PlayerLoadError;
	}

	return {
		status: 500,
		title: 'API unavailable',
		message: err instanceof Error ? err.message : 'Unable to load player data right now.',
		variant: 'api'
	};
}

export const load: PageLoad = ({ params, fetch, url }) => {
	const id = params.id;
	const season = url.searchParams.get('season') || '2024';

	if (!/^\d+$/.test(id)) {
		return {
			id,
			season,
			pageError: {
				status: 400,
				title: 'Invalid player URL',
				message: 'Player ID must be a numeric string.',
				variant: 'not-found' as const,
				retryAfter: null
			}
		};
	}

	if (!/^\d{4}$/.test(season)) {
		return {
			id,
			season,
			pageError: {
				status: 400,
				title: 'Invalid season',
				message: 'Season must be a 4-digit year, such as 2024.',
				variant: 'not-found' as const,
				retryAfter: null
			}
		};
	}

	const playerPromise = fetch(`/api/player/${id}`)
		.then(async (res) => {
			if (!res.ok) {
				throw await readError(res, `Failed to fetch player profile (${res.status})`);
			}
			return res.json();
		})
		.catch((err) => {
			throw toLoadError(err);
		});

	const statsPromise = fetch(`/api/player/${id}/stats?season=${season}`)
		.then(async (res) => {
			if (!res.ok) {
				if (res.status === 404) {
					return { statistics: [] };
				}
				throw await readError(res, `Failed to fetch player statistics (${res.status})`);
			}
			return res.json();
		})
		.catch((err) => {
			throw toLoadError(err);
		});

	return {
		id,
		season,
		pageError: null,
		streamed: {
			player: playerPromise,
			stats: statsPromise
		}
	};
};
