import type { ApiFootballPlayerResponse, ApiFootballPlayerItem } from '../schemas/apiFootball';
import type { TransfermarktPlayerResponse } from '../schemas/transfermarkt';
import type { PlayerData, MergedStatistics, MergedTransferItem } from '../schemas/playerData';

/**
 * Helper to check if the input is a full API-Football response wrapper
 */
function isFullResponse(
	input: ApiFootballPlayerResponse | ApiFootballPlayerItem
): input is ApiFootballPlayerResponse {
	return Array.isArray((input as ApiFootballPlayerResponse).response);
}

/**
 * Merges API-Football data (player profile, seasonal statistics) and
 * Transfermarkt data (market value history, transfer records) into a
 * single unified PlayerData structure.
 *
 * @param apiInput The full API-Football response or a single parsed player item
 * @param tmInput The Transfermarkt response
 * @returns The consolidated PlayerData object
 */
export function mergePlayerData(
	apiInput: ApiFootballPlayerResponse | ApiFootballPlayerItem,
	tmInput: TransfermarktPlayerResponse | null | undefined
): PlayerData {
	// 1. Resolve the main player item
	let playerItem: ApiFootballPlayerItem | null = null;

	if (isFullResponse(apiInput)) {
		if (apiInput.response && apiInput.response.length > 0) {
			playerItem = apiInput.response[0];
		}
	} else {
		playerItem = apiInput;
	}

	if (!playerItem) {
		throw new Error('No player data found in API-Football input.');
	}

	const { player, statistics } = playerItem;

	// 2. Determine current team and league (fall back to the first available stats item)
	let currentTeam = null;
	let currentLeague = null;

	if (statistics && statistics.length > 0) {
		const primaryStat = statistics[0];
		currentTeam = {
			id: primaryStat.team.id,
			name: primaryStat.team.name,
			logo: primaryStat.team.logo || null
		};
		currentLeague = {
			id: primaryStat.league.id || null,
			name: primaryStat.league.name,
			country: primaryStat.league.country || null,
			logo: primaryStat.league.logo || null,
			season: primaryStat.league.season || null
		};
	}

	// 3. Map statistics
	const mappedStatistics: MergedStatistics[] = (statistics || []).map((stat) => ({
		team: {
			id: stat.team.id,
			name: stat.team.name,
			logo: stat.team.logo || null
		},
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
		goals: {
			total: stat.goals?.total ?? 0,
			assists: stat.goals?.assists ?? 0
		},
		cards: {
			yellow: stat.cards?.yellow ?? 0,
			yellowred: stat.cards?.yellowred ?? 0,
			red: stat.cards?.red ?? 0
		}
	}));

	// 4. Map market value details
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

	// 5. Map transfers list
	const transfers: MergedTransferItem[] = (tmInput?.transfers || []).map((t) => ({
		date: t.date || null,
		season: t.season || null,
		fromClub: t.from || null,
		toClub: t.to || null,
		fee: t.fee || null,
		marketValue: t.marketValue != null ? String(t.marketValue) : null
	}));

	// 6. Build final merged structure
	return {
		id: player.id,
		name: player.name,
		firstname: player.firstname || null,
		lastname: player.lastname || null,
		age: player.age || null,
		birth: player.birth
			? {
					date: player.birth.date || null,
					place: player.birth.place || null,
					country: player.birth.country || null
				}
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
