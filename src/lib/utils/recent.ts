export interface RecentPlayer {
	id: number;
	name: string;
	photo?: string | null;
	clubName?: string;
	position?: string;
	nationality?: string | null;
}

/**
 * Fetches recent searches list from localStorage
 */
export function getRecentSearches(): RecentPlayer[] {
	if (typeof window === 'undefined') return [];
	try {
		const stored = localStorage.getItem('ficha_recent_searches');
		return stored ? JSON.parse(stored) : [];
	} catch (e) {
		console.error(e);
		return [];
	}
}

/**
 * Adds a player to the recent searches list, keeping only the 5 most recent unique items
 */
export function savePlayerToRecent(player: RecentPlayer) {
	if (typeof window === 'undefined') return;
	try {
		const list = getRecentSearches();
		const filtered = list.filter((item) => item.id !== player.id);
		filtered.unshift(player);
		const trimmed = filtered.slice(0, 5);
		localStorage.setItem('ficha_recent_searches', JSON.stringify(trimmed));
	} catch (e) {
		console.error(e);
	}
}

/**
 * Removes a single player from recent searches list
 */
export function removePlayerFromRecent(id: number) {
	if (typeof window === 'undefined') return;
	try {
		const list = getRecentSearches();
		const filtered = list.filter((item) => item.id !== id);
		localStorage.setItem('ficha_recent_searches', JSON.stringify(filtered));
	} catch (e) {
		console.error(e);
	}
}

/**
 * Clears all recent searches from localStorage
 */
export function clearRecentSearches() {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem('ficha_recent_searches');
	} catch (e) {
		console.error(e);
	}
}
