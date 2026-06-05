import axios from 'axios';
import { z } from 'zod';
import { serverEnv } from '../server/env';
import { get as cacheGet, set as cacheSet, CACHE_TTLS } from '../utils/cache';
import { ApiFootballPlayerResponseSchema, ApiFootballStatisticsSchema } from '../schemas/apiFootball';
import type { ApiFootballPlayerResponse } from '../schemas/apiFootball';

export type FetchResult<T> =
	| { data: T; error: null }
	| { data: null; error: string };

const apiFootballClient = axios.create({
	baseURL: serverEnv.API_FOOTBALL_URL,
	timeout: 5000,
	headers: {
		'x-apisports-key': serverEnv.API_FOOTBALL_KEY
	}
});

// Response envelope for statistics
export const ApiFootballStatisticsResponseSchema = z.object({
	get: z.string().optional(),
	parameters: z.record(z.string(), z.any()).optional(),
	errors: z.array(z.any()).or(z.record(z.string(), z.any())).optional(),
	results: z.number().optional(),
	paging: z
		.object({
			current: z.number(),
			total: z.number()
		})
		.optional(),
	response: z.array(ApiFootballStatisticsSchema)
});

export type ApiFootballStatisticsResponse = z.infer<typeof ApiFootballStatisticsResponseSchema>;

// Detailed schema for fixtures/form
export const ApiFootballFixtureSchema = z.object({
	fixture: z.object({
		id: z.number(),
		referee: z.string().nullable().optional(),
		timezone: z.string().nullable().optional(),
		date: z.string(),
		timestamp: z.number().nullable().optional(),
		periods: z
			.object({
				first: z.number().nullable().optional(),
				second: z.number().nullable().optional()
			})
			.nullable()
			.optional(),
		venue: z
			.object({
				id: z.number().nullable().optional(),
				name: z.string().nullable().optional(),
				city: z.string().nullable().optional()
			})
			.nullable()
			.optional(),
		status: z
			.object({
				long: z.string().nullable().optional(),
				short: z.string(),
				elapsed: z.number().nullable().optional()
			})
			.nullable()
			.optional()
	}),
	league: z
		.object({
			id: z.number().nullable().optional(),
			name: z.string(),
			country: z.string().nullable().optional(),
			logo: z.string().url().nullable().optional(),
			flag: z.string().url().nullable().optional(),
			season: z.number().nullable().optional(),
			round: z.string().nullable().optional()
		})
		.nullable()
		.optional(),
	teams: z.object({
		home: z.object({
			id: z.number(),
			name: z.string(),
			logo: z.string().url().nullable().optional(),
			winner: z.boolean().nullable().optional()
		}),
		away: z.object({
			id: z.number(),
			name: z.string(),
			logo: z.string().url().nullable().optional(),
			winner: z.boolean().nullable().optional()
		})
	}),
	goals: z
		.object({
			home: z.number().nullable().optional(),
			away: z.number().nullable().optional()
		})
		.nullable()
		.optional(),
	score: z
		.object({
			halftime: z
				.object({
					home: z.number().nullable().optional(),
					away: z.number().nullable().optional()
				})
				.nullable()
				.optional(),
			fulltime: z
				.object({
					home: z.number().nullable().optional(),
					away: z.number().nullable().optional()
				})
				.nullable()
				.optional(),
			extratime: z
				.object({
					home: z.number().nullable().optional(),
					away: z.number().nullable().optional()
				})
				.nullable()
				.optional(),
			penalty: z
				.object({
					home: z.number().nullable().optional(),
					away: z.number().nullable().optional()
				})
				.nullable()
				.optional()
		})
		.nullable()
		.optional()
});

export const ApiFootballFixturesResponseSchema = z.object({
	get: z.string().optional(),
	parameters: z.record(z.string(), z.any()).optional(),
	errors: z.array(z.any()).or(z.record(z.string(), z.any())).optional(),
	results: z.number().optional(),
	paging: z
		.object({
			current: z.number(),
			total: z.number()
		})
		.optional(),
	response: z.array(ApiFootballFixtureSchema)
});

export type ApiFootballFixturesResponse = z.infer<typeof ApiFootballFixturesResponseSchema>;
export type ApiFootballFixture = z.infer<typeof ApiFootballFixtureSchema>;

function extractNetworkError(err: unknown): string {
	if (err && typeof err === 'object') {
		const errorObj = err as Record<string, unknown>;
		if (errorObj.code === 'ECONNABORTED') {
			return 'Request timeout';
		}
		if (errorObj.response && typeof errorObj.response === 'object') {
			const responseObj = errorObj.response as Record<string, unknown>;
			if (responseObj.data && typeof responseObj.data === 'object') {
				const dataObj = responseObj.data as Record<string, unknown>;
				if (typeof dataObj.message === 'string') {
					return dataObj.message;
				}
			}
		}
		if (typeof errorObj.message === 'string') {
			return errorObj.message;
		}
	}
	return 'Unknown network error';
}

function extractApiFootballError(data: unknown): string | null {
	if (!data || typeof data !== 'object') return null;
	const obj = data as Record<string, unknown>;
	if (!obj.errors) return null;
	const errors = obj.errors;
	if (Array.isArray(errors)) {
		if (errors.length > 0) {
			return errors.map((e: unknown) => (typeof e === 'string' ? e : JSON.stringify(e))).join(', ');
		}
	} else if (typeof errors === 'object' && errors !== null) {
		const errRecord = errors as Record<string, unknown>;
		const keys = Object.keys(errRecord);
		if (keys.length > 0) {
			return keys
				.map(
					(k) => `${k}: ${typeof errRecord[k] === 'string' ? errRecord[k] : JSON.stringify(errRecord[k])}`
				)
				.join(', ');
		}
	}
	return null;
}

export async function searchPlayers(
	query: string
): Promise<FetchResult<ApiFootballPlayerResponse>> {
	const cacheKey = `fb:search:${query}`;
	const cached = cacheGet<ApiFootballPlayerResponse>(cacheKey);
	if (cached) {
		return { data: cached, error: null };
	}

	try {
		const response = await apiFootballClient.get('/players/search', {
			params: { query, search: query }
		});

		const apiError = extractApiFootballError(response.data);
		if (apiError) {
			return { data: null, error: apiError };
		}

		const parsed = ApiFootballPlayerResponseSchema.safeParse(response.data);
		if (!parsed.success) {
			return { data: null, error: `Invalid response format: ${parsed.error.message}` };
		}

		cacheSet(cacheKey, parsed.data, CACHE_TTLS.STATS);
		return { data: parsed.data, error: null };
	} catch (err: unknown) {
		return { data: null, error: extractNetworkError(err) };
	}
}

export async function getPlayerProfile(
	id: number
): Promise<FetchResult<ApiFootballPlayerResponse>> {
	const cacheKey = `fb:profile:${id}`;
	const cached = cacheGet<ApiFootballPlayerResponse>(cacheKey);
	if (cached) {
		return { data: cached, error: null };
	}

	const currentSeason = new Date().getFullYear();

	try {
		const response = await apiFootballClient.get('/players', {
			params: { id, season: currentSeason }
		});

		const apiError = extractApiFootballError(response.data);
		if (apiError) {
			return { data: null, error: apiError };
		}

		const parsed = ApiFootballPlayerResponseSchema.safeParse(response.data);
		if (!parsed.success) {
			return { data: null, error: `Invalid response format: ${parsed.error.message}` };
		}

		cacheSet(cacheKey, parsed.data, CACHE_TTLS.STATS);
		return { data: parsed.data, error: null };
	} catch (err: unknown) {
		return { data: null, error: extractNetworkError(err) };
	}
}

export async function getPlayerStats(
	id: number,
	season: number
): Promise<FetchResult<ApiFootballStatisticsResponse>> {
	const cacheKey = `fb:stats:${id}:${season}`;
	const cached = cacheGet<ApiFootballStatisticsResponse>(cacheKey);
	if (cached) {
		return { data: cached, error: null };
	}

	try {
		const response = await apiFootballClient.get('/statistics', {
			params: { id, player: id, season }
		});

		const apiError = extractApiFootballError(response.data);
		if (apiError) {
			return { data: null, error: apiError };
		}

		const parsed = ApiFootballStatisticsResponseSchema.safeParse(response.data);
		if (!parsed.success) {
			return { data: null, error: `Invalid response format: ${parsed.error.message}` };
		}

		cacheSet(cacheKey, parsed.data, CACHE_TTLS.STATS);
		return { data: parsed.data, error: null };
	} catch (err: unknown) {
		return { data: null, error: extractNetworkError(err) };
	}
}

export async function getPlayerForm(
	id: number
): Promise<FetchResult<ApiFootballFixturesResponse>> {
	const cacheKey = `fb:form:${id}`;
	const cached = cacheGet<ApiFootballFixturesResponse>(cacheKey);
	if (cached) {
		return { data: cached, error: null };
	}

	try {
		const response = await apiFootballClient.get('/fixtures', {
			params: { player: id, last: 5 }
		});

		const apiError = extractApiFootballError(response.data);
		if (apiError) {
			return { data: null, error: apiError };
		}

		const parsed = ApiFootballFixturesResponseSchema.safeParse(response.data);
		if (!parsed.success) {
			return { data: null, error: `Invalid response format: ${parsed.error.message}` };
		}

		cacheSet(cacheKey, parsed.data, CACHE_TTLS.STATS);
		return { data: parsed.data, error: null };
	} catch (err: unknown) {
		return { data: null, error: extractNetworkError(err) };
	}
}
