import type { FootballPlayerDataResponse, FootballPlayerStatisticsResult } from '../schemas/football';
import type { TransfermarktPlayerResponse } from '../schemas/transfermarkt';
import type { PlayerData, MergedStatistics, MergedTransferItem } from '../schemas/playerData';

// ─── Legacy import shim ───────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyInput = any;

/**
 * Converts a player birth date timestamp (seconds since epoch) to ISO string.
 */
function tsToDateString(ts: number | null | undefined): string | null {
	if (!ts) return null;
	return new Date(ts * 1000).toISOString().slice(0, 10);
}

/**
 * Converts a player's height in cm to a human-readable string ("182 cm").
 */
function formatHeight(heightCm: number | null | undefined): string | null {
	if (!heightCm) return null;
	return `${heightCm} cm`;
}

// ─── Football API-aware merge ──────────────────────────────────────────────────

/**
 * Merges Football API player data + multiple season statistics + optional
 * Transfermarkt market value data into the unified PlayerData structure.
 */
export function mergeFootballPlayerData(
	playerResponse: FootballPlayerDataResponse,
	statsResults: FootballPlayerStatisticsResult[],
	tmInput: TransfermarktPlayerResponse | null | undefined
): PlayerData {
	const player = playerResponse.data;
	if (!player) {
		throw new Error('No player data in Football API response');
	}

	// ── Core bio ──────────────────────────────────────────────────────────────
	const birthDate = tsToDateString(player.dateOfBirthTimestamp) || player.birthDate || null;

	// Age calculated from birth date
	let age: number | null = null;
	if (player.dateOfBirthTimestamp) {
		const birthMs = player.dateOfBirthTimestamp * 1000;
		const now = Date.now();
		const diffMs = now - birthMs;
		age = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
	} else if (birthDate) {
		const birthMs = Date.parse(birthDate);
		if (!isNaN(birthMs)) {
			const now = Date.now();
			const diffMs = now - birthMs;
			age = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
		}
	}

	// ── Current team ──────────────────────────────────────────────────────────
	const currentTeam = player.team
		? {
				id: typeof player.team.id === 'string' ? parseInt(player.team.id, 10) || 0 : player.team.id ?? 0,
				name: player.team.name || 'Unknown Club',
				logo: player.team.logo || null
			}
		: null;

	// ── Map statistics ────────────────────────────────────────────────────────
	const mappedStatistics: MergedStatistics[] = [];

	for (const statsResult of statsResults) {
		const d = statsResult.data;
		if (!d?.statistics) continue;

		const stats = d.statistics;
		const team = d.team ?? player.team;
		const tournament = d.uniqueTournament;
		const season = d.season;

		if (!team || !tournament) continue;

		mappedStatistics.push({
			team: {
				id: typeof team.id === 'string' ? parseInt(team.id, 10) || 0 : team.id ?? 0,
				name: team.name || 'Unknown',
				logo: team.logo || null
			},
			league: {
				id: typeof tournament.id === 'string' ? parseInt(tournament.id, 10) || null : tournament.id ?? null,
				name: tournament.name || 'Unknown',
				country: tournament.category?.name ?? null,
				logo: null,
				season: season ? parseInt(String(season.year ?? '0'), 10) || null : null
			},
			games: {
				appearences: stats.appearances ?? 0,
				minutes: stats.minutesPlayed ?? 0,
				rating: stats.rating != null ? stats.rating.toFixed(2) : null,
				position: stats.position ?? player.position ?? null,
				captain: false
			},
			goals: {
				total: stats.goals ?? 0,
				assists: stats.assists ?? 0
			},
			cards: {
				yellow: stats.yellowCards ?? 0,
				yellowred: stats.yellowRedCards ?? 0,
				red: stats.redCards ?? 0
			}
		});
	}

	// ── Market value (from Transfermarkt) ────────────────────────────────────
	const tmMarketValue = tmInput?.marketValue;
	const marketValue = tmMarketValue
		? {
				current: tmMarketValue.current != null ? String(tmMarketValue.current) : null,
				highest: tmMarketValue.highest != null ? String(tmMarketValue.highest) : null,
				highestDate: tmMarketValue.highestDate || null,
				history: (tmMarketValue.history || []).map((item) => ({
					date: item.date,
					value: item.value,
					clubName: item.clubName || null
				}))
			}
		: {
				current: null,
				highest: null,
				highestDate: null,
				history: []
			};

	// ── Transfers (from Transfermarkt) ────────────────────────────────────────
	const transfers: MergedTransferItem[] = (tmInput?.transfers || []).map((t) => ({
		date: t.date || null,
		season: t.season || null,
		fromClub: t.from || null,
		toClub: t.to || null,
		fee: t.fee || null,
		marketValue: t.marketValue != null ? String(t.marketValue) : null
	}));

	// ── Current league (from primary stat entry) ──────────────────────────────
	const currentLeague =
		mappedStatistics.length > 0
			? mappedStatistics[0].league
			: null;

	return {
		id: typeof player.id === 'string' ? parseInt(player.id, 10) || 0 : player.id ?? 0,
		name: player.name || '',
		firstname: player.shortName ? player.shortName.split(' ')[0] : null,
		lastname: player.shortName ? player.shortName.split(' ').slice(1).join(' ') : null,
		age,
		birth: birthDate
			? { date: birthDate, place: null, country: player.country?.name ?? null }
			: null,
		nationality: player.country?.name ?? null,
		height: formatHeight(typeof player.height === 'string' ? parseInt(player.height, 10) || null : player.height),
		weight: player.weight ? `${player.weight} kg` : null,
		injured: player.injured ?? false,
		photo: null,
		currentTeam,
		currentLeague,
		statistics: mappedStatistics,
		marketValue,
		transfers
	};
}

// ─── Legacy shim: keeps old call sites working ─────────────────────────────────

/**
 * Legacy function kept for backward-compatibility with old server routes.
 */
export function mergePlayerData(
	apiInput: AnyInput,
	tmInput: TransfermarktPlayerResponse | null | undefined
): PlayerData {
	if (apiInput && typeof apiInput === 'object' && 'data' in apiInput && apiInput.data?.id) {
		return mergeFootballPlayerData(
			apiInput as FootballPlayerDataResponse,
			[],
			tmInput
		);
	}

	// ── Original ApiFootball mapping (kept as fallback) ──────────────────────
	let playerItem: AnyInput = null;
	if (Array.isArray(apiInput?.response) && apiInput.response.length > 0) {
		playerItem = apiInput.response[0];
	} else if (apiInput?.player) {
		playerItem = apiInput;
	}

	if (!playerItem) {
		throw new Error('No player data found in input.');
	}

	const { player, statistics = [] } = playerItem;

	let currentTeam = null;
	let currentLeague = null;
	if (statistics.length > 0) {
		const pStat = statistics[0];
		currentTeam = {
			id: pStat.team.id,
			name: pStat.team.name,
			logo: pStat.team.logo || null
		};
		currentLeague = {
			id: pStat.league.id || null,
			name: pStat.league.name,
			country: pStat.league.country || null,
			logo: pStat.league.logo || null,
			season: pStat.league.season || null
		};
	}

	const mappedStatistics: MergedStatistics[] = statistics.map(
		(stat: AnyInput): MergedStatistics => ({
			team: { id: stat.team.id, name: stat.team.name, logo: stat.team.logo || null },
			league: {
				id: stat.league.id || null,
				name: stat.league.name,
				country: stat.league.country || null,
				logo: stat.league.logo || null,
				season: stat.league.season || null
			},
			games: {
				appearences: stat.games?.appearences ?? 0,
				minutes: stat.games?.minutes ?? 0,
				rating: stat.games?.rating || null,
				position: stat.games?.position || null,
				captain: stat.games?.captain ?? false
			},
			goals: { total: stat.goals?.total ?? 0, assists: stat.goals?.assists ?? 0 },
			cards: {
				yellow: stat.cards?.yellow ?? 0,
				yellowred: stat.cards?.yellowred ?? 0,
				red: stat.cards?.red ?? 0
			}
		})
	);

	const tmMV = tmInput?.marketValue;
	const marketValue = tmMV
		? {
				current: tmMV.current != null ? String(tmMV.current) : null,
				highest: tmMV.highest != null ? String(tmMV.highest) : null,
				highestDate: tmMV.highestDate || null,
				history: (tmMV.history || []).map((item: AnyInput) => ({
					date: item.date,
					value: item.value,
					clubName: item.clubName || null
				}))
			}
		: { current: null, highest: null, highestDate: null, history: [] };

	const transfers: MergedTransferItem[] = (tmInput?.transfers || []).map(
		(t: AnyInput): MergedTransferItem => ({
			date: t.date || null,
			season: t.season || null,
			fromClub: t.from || null,
			toClub: t.to || null,
			fee: t.fee || null,
			marketValue: t.marketValue != null ? String(t.marketValue) : null
		})
	);

	return {
		id: player.id,
		name: player.name,
		firstname: player.firstname || null,
		lastname: player.lastname || null,
		age: player.age || null,
		birth: player.birth
			? { date: player.birth.date || null, place: player.birth.place || null, country: player.birth.country || null }
			: null,
		nationality: player.nationality || null,
		height: player.height || null,
		weight: player.weight || null,
		injured: player.injured ?? false,
		photo: player.photo || null,
		currentTeam,
		currentLeague,
		statistics: mappedStatistics,
		marketValue,
		transfers
	};
}
