import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getPlayerProfile } from '$lib/api/football';
import { getMarketValue } from '$lib/api/transfermarkt';
import { mergePlayerData } from '$lib/utils/merge';
import { isRateLimited } from '$lib/utils/rateLimit';

const idSchema = z.string().regex(/^\d+$/);

export const GET: RequestHandler = async (event) => {
	const ip = event.getClientAddress();
	const { limited, retryAfter } = isRateLimited(`profile:${ip}`, 20);
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
	const parsed = idSchema.safeParse(idParam);
	if (!parsed.success) {
		return json({ error: 'Player ID must be a numeric string.' }, { status: 400 });
	}

	const idStr = parsed.data;
	const idNum = parseInt(idStr, 10);

	const [profileResult, tmResult] = await Promise.all([
		getPlayerProfile(idNum),
		getMarketValue(idStr)
	]);

	if (profileResult.error) {
		return json({ error: `API-Football error: ${profileResult.error}` }, { status: 500 });
	}

	if (!profileResult.data || profileResult.data.response.length === 0) {
		return json({ error: 'Player not found in API-Football.' }, { status: 404 });
	}

	if (tmResult.error) {
		console.warn(
			`[Transfermarkt] Failed to fetch market value for player ${idStr}: ${tmResult.error}`
		);
	}

	try {
		const merged = mergePlayerData(profileResult.data, tmResult.data);
		return json(merged);
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Unknown merge error';
		return json({ error: `Failed to merge player data: ${msg}` }, { status: 500 });
	}
};
