import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getPlayerWithStats } from '$lib/api/football';

const idSchema = z.string().regex(/^\d+$/);
const seasonSchema = z.string().regex(/^\d{4}$/);

export const GET: RequestHandler = async (event) => {
	const idParam = event.params.id || '';
	const parsedId = idSchema.safeParse(idParam);
	if (!parsedId.success) {
		return json({ error: 'Player ID must be a numeric string.' }, { status: 400 });
	}

	const seasonParam = event.url.searchParams.get('season') || '2024';
	const parsedSeason = seasonSchema.safeParse(seasonParam);
	if (!parsedSeason.success) {
		return json({ error: 'Season must be a 4-digit year (e.g. 2024).' }, { status: 400 });
	}

	const idNum = parseInt(parsedId.data, 10);
	const season = parseInt(parsedSeason.data, 10);

	const { data, error } = await getPlayerWithStats(idNum, season);
	if (error) {
		return json({ error }, { status: 500 });
	}
	if (!data || data.statistics.length === 0) {
		return json(
			{ error: `No statistics found for player ${idNum} in season ${season}.` },
			{ status: 404 }
		);
	}

	// Map to the full statistics shape the frontend dashboard expects
	const statistics = data.statistics.map((s) => ({
		team: {
			id: s.team.id,
			name: s.team.name,
			logo: s.team.logo
		},
		league: {
			id: s.league.id,
			name: s.league.name,
			country: s.league.country,
			logo: s.league.logo,
			season: s.league.season
		},
		games: {
			appearences: s.games.appearences,
			lineups: s.games.lineups,
			minutes: s.games.minutes,
			number: s.games.number,
			position: s.games.position,
			rating: s.games.rating,
			captain: s.games.captain
		},
		substitutes: s.substitutes,
		shots: s.shots,
		goals: s.goals,
		passes: s.passes,
		tackles: s.tackles,
		duels: s.duels,
		dribbles: s.dribbles,
		fouls: s.fouls,
		cards: s.cards,
		penalty: s.penalty
	}));

	return json({ statistics });
};
