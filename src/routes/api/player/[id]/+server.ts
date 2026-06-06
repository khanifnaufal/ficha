import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getPlayerWithStats, getPlayerTransfers } from '$lib/api/football';
import type { PlayerData } from '$lib/schemas/playerData';

const idSchema = z.string().regex(/^\d+$/);

export const GET: RequestHandler = async (event) => {
	const idParam = event.params.id || '';
	const parsed = idSchema.safeParse(idParam);
	if (!parsed.success) {
		return json({ error: 'Player ID must be a numeric string.' }, { status: 400 });
	}

	const idStr = parsed.data;
	const idNum = parseInt(idStr, 10);
	const season = parseInt(event.url.searchParams.get('season') || '2024', 10);

	// Fetch player stats + transfer history in parallel from API-Football
	// (Transfermarkt API is non-functional; we use API-Football /transfers instead)
	const [playerResult, transfersResult] = await Promise.all([
		getPlayerWithStats(idNum, season),
		getPlayerTransfers(idNum)
	]);

	if (playerResult.error) {
		return json({ error: `API-Football error: ${playerResult.error}` }, { status: 500 });
	}
	if (!playerResult.data) {
		return json({ error: 'Player not found.' }, { status: 404 });
	}

	const { player, statistics } = playerResult.data;
	const rawTransfers = transfersResult.data ?? [];

	// Current team = first stat entry's team (most recent league)
	const currentTeam =
		statistics.length > 0
			? {
					id: statistics[0].team.id,
					name: statistics[0].team.name,
					logo: statistics[0].team.logo
				}
			: null;

	const currentLeague =
		statistics.length > 0
			? {
					id: statistics[0].league.id,
					name: statistics[0].league.name,
					country: statistics[0].league.country,
					logo: statistics[0].league.logo,
					season: statistics[0].league.season
				}
			: null;

	const mappedStats = statistics.map((s) => ({
		team: { id: s.team.id, name: s.team.name, logo: s.team.logo },
		league: {
			id: s.league.id,
			name: s.league.name,
			country: s.league.country,
			logo: s.league.logo,
			season: s.league.season
		},
		games: {
			appearences: s.games.appearences,
			minutes: s.games.minutes,
			rating: s.games.rating,
			position: s.games.position,
			captain: s.games.captain
		},
		goals: { total: s.goals.total, assists: s.goals.assists },
		cards: { yellow: s.cards.yellow, yellowred: s.cards.yellowred, red: s.cards.red }
	}));

	// Map API-Football transfers to the PlayerData.transfers shape
	const transfers = rawTransfers.map((t) => ({
		date: t.date || null,
		season: null, // API-Football /transfers doesn't give season label
		fromClub: t.teams.out.name || null,
		toClub: t.teams.in.name || null,
		fee: t.type || null, // "Free", "Loan", or a fee string
		marketValue: null // not provided by API-Football free tier
	}));

	const playerData: PlayerData = {
		id: player.id,
		name: player.name,
		firstname: player.firstname,
		lastname: player.lastname,
		age: player.age,
		birth: player.birth,
		nationality: player.nationality,
		height: player.height,
		weight: player.weight,
		injured: player.injured,
		photo: player.photo,
		currentTeam,
		currentLeague,
		statistics: mappedStats,
		// Market value not available in API-Football free tier
		marketValue: { current: null, highest: null, highestDate: null, history: [] },
		transfers
	};

	return json(playerData);
};
