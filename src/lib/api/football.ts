import axios from 'axios';
import { serverEnv } from '../server/env';
import { get as cacheGet, set as cacheSet, CACHE_TTLS } from '../utils/cache';

export type FetchResult<T> = { data: T; error: null } | { data: null; error: string };

// ─── Axios client ─────────────────────────────────────────────────────────────
// API-Football v3 uses x-apisports-key header (NOT X-RapidAPI-Key)
const cleanBaseURL = serverEnv.API_FOOTBALL_URL.startsWith('http')
	? serverEnv.API_FOOTBALL_URL
	: `https://${serverEnv.API_FOOTBALL_URL}`;

const footballClient = axios.create({
	baseURL: cleanBaseURL,
	timeout: 10000,
	headers: {
		'x-apisports-key': serverEnv.API_FOOTBALL_KEY
	}
});

// ─── Shared types (match ApiFootball schema in apiFootball.ts) ────────────────
export interface ApiPlayerProfile {
	id: number;
	name: string;
	firstname: string | null;
	lastname: string | null;
	age: number | null;
	birth: { date: string | null; place: string | null; country: string | null } | null;
	nationality: string | null;
	height: string | null;
	weight: string | null;
	injured: boolean;
	photo: string | null;
}

export interface ApiPlayerStatistics {
	team: { id: number; name: string; logo: string | null };
	league: { id: number | null; name: string; country: string | null; logo: string | null; season: number | null };
	games: { appearences: number; lineups: number; minutes: number; number: number | null; position: string | null; rating: string | null; captain: boolean };
	substitutes: { in: number; out: number; bench: number };
	shots: { total: number; on: number };
	goals: { total: number; conceded: number; assists: number; saves: number | null };
	passes: { total: number; key: number; accuracy: number | null };
	tackles: { total: number | null; blocks: number | null; interceptions: number | null };
	duels: { total: number | null; won: number | null };
	dribbles: { attempts: number | null; success: number | null; past: number | null };
	fouls: { drawn: number | null; committed: number | null };
	cards: { yellow: number; yellowred: number; red: number };
	penalty: { won: number | null; commited: number | null; scored: number; missed: number; saved: number | null };
}

export interface ApiPlayerItem {
	player: ApiPlayerProfile;
	statistics: ApiPlayerStatistics[];
}

// ─── Error helpers ────────────────────────────────────────────────────────────
function extractNetworkError(err: unknown): string {
	if (err && typeof err === 'object') {
		const e = err as Record<string, unknown>;
		if (e.code === 'ECONNABORTED') return 'Request timeout';
		if (e.response && typeof e.response === 'object') {
			const r = e.response as Record<string, unknown>;
			if (typeof r.status === 'number') {
				if (r.status === 429) return 'Rate limit exceeded (100 calls/day free tier)';
				if (r.status === 403) return 'Forbidden – check API key';
				if (r.status === 404) return 'Not found';
			}
		}
		if (typeof e.message === 'string') return e.message;
	}
	return 'Unknown network error';
}

function safeNum(v: unknown): number {
	const n = Number(v);
	return isNaN(n) ? 0 : n;
}

function safeNumOrNull(v: unknown): number | null {
	if (v == null) return null;
	const n = Number(v);
	return isNaN(n) ? null : n;
}

// ─── Normalize raw API response into clean ApiPlayerItem ─────────────────────
function normalizePlayerItem(raw: Record<string, unknown>): ApiPlayerItem {
	const p = (raw.player ?? {}) as Record<string, unknown>;
	const stats: ApiPlayerStatistics[] = ((raw.statistics ?? []) as Record<string, unknown>[]).map(
		(s) => {
			const team = (s.team ?? {}) as Record<string, unknown>;
			const league = (s.league ?? {}) as Record<string, unknown>;
			const games = (s.games ?? {}) as Record<string, unknown>;
			const subs = (s.substitutes ?? {}) as Record<string, unknown>;
			const shots = (s.shots ?? {}) as Record<string, unknown>;
			const goals = (s.goals ?? {}) as Record<string, unknown>;
			const passes = (s.passes ?? {}) as Record<string, unknown>;
			const tackles = (s.tackles ?? {}) as Record<string, unknown>;
			const duels = (s.duels ?? {}) as Record<string, unknown>;
			const dribbles = (s.dribbles ?? {}) as Record<string, unknown>;
			const fouls = (s.fouls ?? {}) as Record<string, unknown>;
			const cards = (s.cards ?? {}) as Record<string, unknown>;
			const penalty = (s.penalty ?? {}) as Record<string, unknown>;

			return {
				team: {
					id: safeNum(team.id),
					name: String(team.name ?? ''),
					logo: team.logo ? String(team.logo) : null
				},
				league: {
					id: safeNumOrNull(league.id),
					name: String(league.name ?? ''),
					country: league.country ? String(league.country) : null,
					logo: league.logo ? String(league.logo) : null,
					season: safeNumOrNull(league.season)
				},
				games: {
					appearences: safeNum(games.appearences),
					lineups: safeNum(games.lineups),
					minutes: safeNum(games.minutes),
					number: safeNumOrNull(games.number),
					position: games.position ? String(games.position) : null,
					rating: games.rating ? String(games.rating) : null,
					captain: Boolean(games.captain)
				},
				substitutes: {
					in: safeNum(subs.in),
					out: safeNum(subs.out),
					bench: safeNum(subs.bench)
				},
				shots: { total: safeNum(shots.total), on: safeNum(shots.on) },
				goals: {
					total: safeNum(goals.total),
					conceded: safeNum(goals.conceded),
					assists: safeNum(goals.assists),
					saves: safeNumOrNull(goals.saves)
				},
				passes: {
					total: safeNum(passes.total),
					key: safeNum(passes.key),
					accuracy: safeNumOrNull(passes.accuracy)
				},
				tackles: {
					total: safeNumOrNull(tackles.total),
					blocks: safeNumOrNull(tackles.blocks),
					interceptions: safeNumOrNull(tackles.interceptions)
				},
				duels: { total: safeNumOrNull(duels.total), won: safeNumOrNull(duels.won) },
				dribbles: {
					attempts: safeNumOrNull(dribbles.attempts),
					success: safeNumOrNull(dribbles.success),
					past: safeNumOrNull(dribbles.past)
				},
				fouls: {
					drawn: safeNumOrNull(fouls.drawn),
					committed: safeNumOrNull(fouls.committed)
				},
				cards: {
					yellow: safeNum(cards.yellow),
					yellowred: safeNum(cards.yellowred),
					red: safeNum(cards.red)
				},
				penalty: {
					won: safeNumOrNull(penalty.won),
					commited: safeNumOrNull(penalty.commited),
					scored: safeNum(penalty.scored),
					missed: safeNum(penalty.missed),
					saved: safeNumOrNull(penalty.saved)
				}
			};
		}
	);

	const birth = (p.birth ?? {}) as Record<string, unknown>;

	return {
		player: {
			id: safeNum(p.id),
			name: String(p.name ?? ''),
			firstname: p.firstname ? String(p.firstname) : null,
			lastname: p.lastname ? String(p.lastname) : null,
			age: safeNumOrNull(p.age),
			birth: {
				date: birth.date ? String(birth.date) : null,
				place: birth.place ? String(birth.place) : null,
				country: birth.country ? String(birth.country) : null
			},
			nationality: p.nationality ? String(p.nationality) : null,
			height: p.height ? String(p.height) : null,
			weight: p.weight ? String(p.weight) : null,
			injured: Boolean(p.injured),
			photo: p.photo ? String(p.photo) : null
		},
		statistics: stats
	};
}

// ─── Search players (/players/profiles) ───────────────────────────────────────
/**
 * Search players by name. Returns basic profile (no per-season stats).
 * Endpoint: GET /players/profiles?search={query}
 */
export async function searchPlayers(query: string): Promise<FetchResult<ApiPlayerItem[]>> {
	const cacheKey = `apif:search:${query.toLowerCase()}`;
	const cached = cacheGet<ApiPlayerItem[]>(cacheKey);
	if (cached) return { data: cached, error: null };

	try {
		const response = await footballClient.get('/players/profiles', {
			params: { search: query }
		});

		const apiErrors = response.data?.errors;
		if (apiErrors && typeof apiErrors === 'object' && Object.keys(apiErrors).length > 0) {
			const msg = Object.values(apiErrors).join('; ');
			return { data: null, error: msg };
		}

		const rawItems: Record<string, unknown>[] = response.data?.response ?? [];
		// /players/profiles returns { player: {...} } with no statistics array
		const results: ApiPlayerItem[] = rawItems.map((raw) => ({
			player: normalizePlayerItem({ player: raw.player ?? raw, statistics: [] }).player,
			statistics: []
		}));

		cacheSet(cacheKey, results, CACHE_TTLS.SEARCH); // 24h — search results rarely change
		return { data: results, error: null };
	} catch (err) {
		return { data: null, error: extractNetworkError(err) };
	}
}

// ─── Get player with full stats (/players?id&season) ──────────────────────────
/**
 * Fetches a player's profile + all their statistics for a given season.
 * Endpoint: GET /players?id={id}&season={season}
 */
export async function getPlayerWithStats(
	id: number,
	season: number = 2024
): Promise<FetchResult<ApiPlayerItem>> {
	const cacheKey = `apif:player:${id}:${season}`;
	const cached = cacheGet<ApiPlayerItem>(cacheKey);
	if (cached) return { data: cached, error: null };

	try {
		const response = await footballClient.get('/players', {
			params: { id, season }
		});

		const apiErrors = response.data?.errors;
		if (apiErrors && typeof apiErrors === 'object' && Object.keys(apiErrors).length > 0) {
			const msg = Object.values(apiErrors).join('; ');
			return { data: null, error: msg };
		}

		const rawItems: Record<string, unknown>[] = response.data?.response ?? [];
		if (rawItems.length === 0) {
			return { data: null, error: `No player data found for ID ${id} in season ${season}` };
		}

		const item = normalizePlayerItem(rawItems[0]);
		cacheSet(cacheKey, item, CACHE_TTLS.PROFILE); // 12h — bio rarely changes
		return { data: item, error: null };
	} catch (err) {
		return { data: null, error: extractNetworkError(err) };
	}
}

// ─── Get player transfers (/transfers?player=id) ───────────────────────────────
export interface ApiTransferTeam {
	id: number;
	name: string;
	logo: string | null;
}
export interface ApiTransfer {
	date: string;
	type: string;
	teams: { in: ApiTransferTeam; out: ApiTransferTeam };
}

/**
 * Fetches a player's full transfer history.
 * Endpoint: GET /transfers?player={id}
 */
export async function getPlayerTransfers(
	id: number
): Promise<FetchResult<ApiTransfer[]>> {
	const cacheKey = `apif:transfers:${id}`;
	const cached = cacheGet<ApiTransfer[]>(cacheKey);
	if (cached) return { data: cached, error: null };

	try {
		const response = await footballClient.get('/transfers', {
			params: { player: id }
		});

		const rawItems: Record<string, unknown>[] = response.data?.response ?? [];
		if (rawItems.length === 0) {
			cacheSet(cacheKey, [], CACHE_TTLS.MARKET_VALUE);
			return { data: [], error: null };
		}

		const raw = rawItems[0] as Record<string, unknown>;
		const transfers: ApiTransfer[] = ((raw.transfers ?? []) as Record<string, unknown>[]).map((t) => {
			const teams = (t.teams ?? {}) as Record<string, Record<string, unknown>>;
			return {
				date: String(t.date ?? ''),
				type: String(t.type ?? 'Unknown'),
				teams: {
					in: {
						id: safeNum(teams.in?.id),
						name: String(teams.in?.name ?? ''),
						logo: teams.in?.logo ? String(teams.in.logo) : null
					},
					out: {
						id: safeNum(teams.out?.id),
						name: String(teams.out?.name ?? ''),
						logo: teams.out?.logo ? String(teams.out.logo) : null
					}
				}
			};
		});

		cacheSet(cacheKey, transfers, CACHE_TTLS.MARKET_VALUE); // 7 days — transfers rarely change
		return { data: transfers, error: null };
	} catch (err) {
		return { data: null, error: extractNetworkError(err) };
	}
}

// ─── Backward-compat shims (keep old imports working) ─────────────────────────
export type ApiFootballPlayerResponse = { response: ApiPlayerItem[] };
export type ApiFootballPlayerItem = ApiPlayerItem;
