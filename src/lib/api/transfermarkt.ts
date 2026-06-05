import axios from 'axios';
import { z } from 'zod';
import { serverEnv } from '../server/env';
import { get as cacheGet, set as cacheSet, CACHE_TTLS } from '../utils/cache';
import {
	TransfermarktPlayerResponseSchema,
	TransfermarktMarketValueHistoryItemSchema,
	TransfermarktTransferItemSchema
} from '../schemas/transfermarkt';
import type { TransfermarktPlayerResponse } from '../schemas/transfermarkt';

export type FetchResult<T> =
	| { data: T; error: null }
	| { data: null; error: string };

// Dynamic Host extraction from configured URL
const transfermarktHost = new URL(serverEnv.TRANSFERMARKT_URL).host;

const transfermarktClient = axios.create({
	baseURL: serverEnv.TRANSFERMARKT_URL,
	timeout: 5000,
	headers: {
		'x-rapidapi-key': serverEnv.TRANSFERMARKT_KEY,
		'x-rapidapi-host': transfermarktHost
	}
});

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

// Zod schemas for Transfermarkt API responses
export const TransfermarktSearchPlayerItemSchema = z.object({
	id: z.string().or(z.number()),
	name: z.string(),
	image: z.string().url().nullable().optional(),
	club: z.string().nullable().optional(),
	position: z.string().nullable().optional(),
	age: z.string().or(z.number()).nullable().optional(),
	nationality: z.array(z.string()).nullable().optional()
});

export const TransfermarktSearchResponseSchema = z.union([
	z.array(TransfermarktSearchPlayerItemSchema),
	z.object({
		results: z.array(TransfermarktSearchPlayerItemSchema)
	})
]);

export type TransfermarktSearchResponse = z.infer<typeof TransfermarktSearchResponseSchema>;

export const TransfermarktMarketValueHistoryResponseSchema = z.union([
	z.array(TransfermarktMarketValueHistoryItemSchema),
	z.object({
		history: z.array(TransfermarktMarketValueHistoryItemSchema)
	})
]);

export type TransfermarktMarketValueHistoryResponse = z.infer<
	typeof TransfermarktMarketValueHistoryResponseSchema
>;

export const TransfermarktTransferHistoryResponseSchema = z.union([
	z.array(TransfermarktTransferItemSchema),
	z.object({
		transfers: z.array(TransfermarktTransferItemSchema)
	})
]);

export type TransfermarktTransferHistoryResponse = z.infer<
	typeof TransfermarktTransferHistoryResponseSchema
>;

export async function searchPlayerTM(
	query: string
): Promise<FetchResult<TransfermarktSearchResponse>> {
	const cacheKey = `tm:search:${query}`;
	const cached = cacheGet<TransfermarktSearchResponse>(cacheKey);
	if (cached) {
		return { data: cached, error: null };
	}

	try {
		const response = await transfermarktClient.get('/searchPlayers', {
			params: { query }
		});

		const parsed = TransfermarktSearchResponseSchema.safeParse(response.data);
		if (!parsed.success) {
			return { data: null, error: `Invalid response format: ${parsed.error.message}` };
		}

		cacheSet(cacheKey, parsed.data, CACHE_TTLS.MARKET_VALUE);
		return { data: parsed.data, error: null };
	} catch (err: unknown) {
		return { data: null, error: extractNetworkError(err) };
	}
}

export async function getMarketValue(
	id: string
): Promise<FetchResult<TransfermarktPlayerResponse>> {
	const cacheKey = `tm:profile:${id}`;
	const cached = cacheGet<TransfermarktPlayerResponse>(cacheKey);
	if (cached) {
		return { data: cached, error: null };
	}

	try {
		const response = await transfermarktClient.get('/getPlayerProfile', {
			params: { id }
		});

		const parsed = TransfermarktPlayerResponseSchema.safeParse(response.data);
		if (!parsed.success) {
			return { data: null, error: `Invalid response format: ${parsed.error.message}` };
		}

		cacheSet(cacheKey, parsed.data, CACHE_TTLS.MARKET_VALUE);
		return { data: parsed.data, error: null };
	} catch (err: unknown) {
		return { data: null, error: extractNetworkError(err) };
	}
}

export async function getMarketValueHistory(
	id: string
): Promise<FetchResult<TransfermarktMarketValueHistoryResponse>> {
	const cacheKey = `tm:marketValueHistory:${id}`;
	const cached = cacheGet<TransfermarktMarketValueHistoryResponse>(cacheKey);
	if (cached) {
		return { data: cached, error: null };
	}

	try {
		const response = await transfermarktClient.get('/getPlayerMarketValueHistory', {
			params: { id }
		});

		const parsed = TransfermarktMarketValueHistoryResponseSchema.safeParse(response.data);
		if (!parsed.success) {
			return { data: null, error: `Invalid response format: ${parsed.error.message}` };
		}

		cacheSet(cacheKey, parsed.data, CACHE_TTLS.MARKET_VALUE);
		return { data: parsed.data, error: null };
	} catch (err: unknown) {
		return { data: null, error: extractNetworkError(err) };
	}
}

export async function getTransferHistory(
	id: string
): Promise<FetchResult<TransfermarktTransferHistoryResponse>> {
	const cacheKey = `tm:transfers:${id}`;
	const cached = cacheGet<TransfermarktTransferHistoryResponse>(cacheKey);
	if (cached) {
		return { data: cached, error: null };
	}

	try {
		const response = await transfermarktClient.get('/getPlayerTransfers', {
			params: { id }
		});

		const parsed = TransfermarktTransferHistoryResponseSchema.safeParse(response.data);
		if (!parsed.success) {
			return { data: null, error: `Invalid response format: ${parsed.error.message}` };
		}

		cacheSet(cacheKey, parsed.data, CACHE_TTLS.MARKET_VALUE);
		return { data: parsed.data, error: null };
	} catch (err: unknown) {
		return { data: null, error: extractNetworkError(err) };
	}
}
