import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = ({ params, fetch, url }) => {
	const id = params.id;
	const season = url.searchParams.get('season') || '2024';

	// Validate that the ID parameter is numeric
	if (!/^\d+$/.test(id)) {
		throw error(400, { message: 'Player ID must be a numeric string.' });
	}

	// Initiate player profile fetch
	const playerPromise = fetch(`/api/player/${id}`).then(async (res) => {
		if (!res.ok) {
			const errBody = await res.json().catch(() => ({}));
			throw new Error(errBody.error || `Failed to fetch player profile (${res.status})`);
		}
		return res.json();
	});

	// Initiate player statistics fetch
	const statsPromise = fetch(`/api/player/${id}/stats?season=${season}`).then(async (res) => {
		if (!res.ok) {
			// If statistics are not found for a specific season, return an empty array rather than breaking the page
			if (res.status === 404) {
				return { statistics: [] };
			}
			const errBody = await res.json().catch(() => ({}));
			throw new Error(errBody.error || `Failed to fetch player statistics (${res.status})`);
		}
		return res.json();
	});

	return {
		id,
		season,
		streamed: {
			player: playerPromise,
			stats: statsPromise
		}
	};
};
