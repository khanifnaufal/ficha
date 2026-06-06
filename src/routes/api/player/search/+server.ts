import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { searchPlayers } from '$lib/api/football';
import { apiErrorBody, apiErrorStatus } from '$lib/server/apiErrors';

const querySchema = z.string().min(3).max(50);

export const GET: RequestHandler = async (event) => {
	const qParam = event.url.searchParams.get('q') || '';
	const trimmedQuery = qParam.trim();

	const parsed = querySchema.safeParse(trimmedQuery);
	if (!parsed.success) {
		return json(
			{ error: 'Query parameter "q" must be between 3 and 50 characters.' },
			{ status: 400 }
		);
	}

	const { data, error } = await searchPlayers(parsed.data);
	if (error) {
		return json(apiErrorBody(error), { status: apiErrorStatus(error) });
	}

	if (!data || data.length === 0) {
		return json({ results: [] });
	}

	// API-Football /players/profiles returns players with no statistics array
	// We map them directly to ApiFootballPlayerItem shape for the frontend
	const results = data.map((item) => ({
		player: {
			id: item.player.id,
			name: item.player.name,
			photo: item.player.photo,
			nationality: item.player.nationality,
			age: item.player.age,
			birth: item.player.birth,
			height: item.player.height,
			weight: item.player.weight,
			injured: item.player.injured,
			position: item.player.position
		},
		statistics: item.statistics // empty [] from /profiles, that's fine
	}));

	return json({ results });
};
