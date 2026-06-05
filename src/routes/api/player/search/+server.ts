import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { searchPlayers } from '$lib/api/football';
import { isRateLimited } from '$lib/utils/rateLimit';

const querySchema = z.string().min(3).max(50);

export const GET: RequestHandler = async (event) => {
	const ip = event.getClientAddress();
	const { limited, retryAfter } = isRateLimited(`search:${ip}`, 10);
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
		return json({ error }, { status: 500 });
	}

	if (!data) {
		return json({ results: [] });
	}

	return json({ results: data.response });
};
