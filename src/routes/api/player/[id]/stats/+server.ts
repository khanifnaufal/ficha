import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getPlayerStats } from '$lib/api/football';
import { isRateLimited } from '$lib/utils/rateLimit';

const idSchema = z.string().regex(/^\d+$/);
const seasonSchema = z
	.string()
	.regex(/^\d{4}$/)
	.transform((val) => parseInt(val, 10));

export const GET: RequestHandler = async (event) => {
	const ip = event.getClientAddress();
	const { limited, retryAfter } = isRateLimited(`stats:${ip}`, 20);
	if (limited) {
		return json(
			{ error: 'Too many requests' },
			{
				status: 429,
				headers: {
					'Retry-After': String(retryAfter)
				}
			}
		);
	}

	const idParam = event.params.id || '';
	const parsedId = idSchema.safeParse(idParam);
	if (!parsedId.success) {
		return json({ error: 'Player ID must be a numeric string.' }, { status: 400 });
	}

	const seasonParam = event.url.searchParams.get('season');
	let season = 2024;
	if (seasonParam !== null) {
		const parsedSeason = seasonSchema.safeParse(seasonParam);
		if (!parsedSeason.success) {
			return json(
				{ error: 'Season must be a 4-digit numeric year (e.g. 2024).' },
				{ status: 400 }
			);
		}
		season = parsedSeason.data;
	}

	const idNum = parseInt(parsedId.data, 10);
	const { data, error } = await getPlayerStats(idNum, season);
	if (error) {
		return json({ error }, { status: 500 });
	}

	if (!data || data.response.length === 0) {
		return json(
			{ error: `No statistics found for player ${idNum} in season ${season}.` },
			{ status: 404 }
		);
	}

	return json({ statistics: data.response });
};
