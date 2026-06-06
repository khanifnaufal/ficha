import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getPlayerTeams } from '$lib/api/football';
import { apiErrorBody, apiErrorStatus } from '$lib/server/apiErrors';
import { get as cacheGet } from '$lib/utils/cache';
import type { ApiPlayerItem } from '$lib/api/football';

const idSchema = z.string().regex(/^\d+$/);

export const GET: RequestHandler = async (event) => {
	const idParam = event.params.id || '';
	const parsedId = idSchema.safeParse(idParam);
	if (!parsedId.success) {
		return json({ error: 'Player ID must be a numeric string.' }, { status: 400 });
	}

	const idNum = parseInt(parsedId.data, 10);

	// 1. Try to check if player details (profile/statistics) are already cached
	// The key format is apif:player:{id}:{season} - we try recent seasons
	const seasons = [2024, 2023, 2025, 2026];
	for (const season of seasons) {
		const cachedPlayer = cacheGet<ApiPlayerItem>(`apif:player:${idNum}:${season}`);
		if (cachedPlayer && cachedPlayer.statistics && cachedPlayer.statistics.length > 0) {
			const team = cachedPlayer.statistics[0].team;
			return json({
				clubName: team.name,
				clubLogo: team.logo
			});
		}
	}

	// 2. Otherwise, fetch teams list using our cached API helper
	const { data, error } = await getPlayerTeams(idNum);
	if (error) {
		return json(apiErrorBody(error), { status: apiErrorStatus(error) });
	}

	if (!data || data.length === 0) {
		return json({ clubName: 'Unknown Club', clubLogo: null });
	}

	// Find the most recent club team (heuristically, highest season count / highest season year)
	// We want to avoid national teams if possible.
	// We sort seasons descending. National teams usually have names like 'Argentina', 'Brazil', etc.
	// But since we can't reliably distinguish national teams from club teams in the response easily
	// (API doesn't return team.national here), we can look at the name.
	// Let's filter out national teams if there are other club teams.
	// We can do this by checking if the team.id is a national team ID, or just taking the team with the most recent season.
	// Usually, the API returns the list with the current team(s) first.
	// Let's look at the teams and select the one that doesn't match a list of common country names,
	// or simply take the first one that is a club if possible, or just the first one if all else fails.
	const nationalTeamNames = [
		'argentina',
		'brazil',
		'france',
		'england',
		'germany',
		'spain',
		'italy',
		'portugal',
		'netherlands',
		'belgium',
		'uruguay',
		'colombia',
		'chile',
		'mexico',
		'usa',
		'canada',
		'morocco',
		'senegal',
		'egypt',
		'nigeria',
		'cameroon',
		'ghana',
		'japan',
		'south korea',
		'australia',
		'saudi arabia',
		'croatia',
		'sweden',
		'norway',
		'denmark',
		'switzerland',
		'austria',
		'poland',
		'ukraine',
		'wales',
		'scotland',
		'ireland',
		'turkey',
		'greece',
		'ecuador',
		'peru',
		'venezuela',
		'paraguay',
		'bolivia',
		'algeria',
		'tunisia',
		'ivory coast',
		'indonesia'
	];

	// Sort teams so that the one with the highest season is first
	const sorted = [...data].sort((a, b) => {
		const maxA = Math.max(...a.seasons, 0);
		const maxB = Math.max(...b.seasons, 0);
		return maxB - maxA;
	});

	// Try to find the first team that is likely not a national team
	let selected = sorted.find((item) => !nationalTeamNames.includes(item.team.name.toLowerCase()));

	// If all are national teams or we filtered everything, take the first one
	if (!selected && sorted.length > 0) {
		selected = sorted[0];
	}

	if (selected) {
		return json({
			clubName: selected.team.name,
			clubLogo: selected.team.logo
		});
	}

	return json({ clubName: 'Unknown Club', clubLogo: null });
};
