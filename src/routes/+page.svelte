<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import PlayerCard from '$lib/components/PlayerCard.svelte';
	import logo from '$lib/assets/logo.png';
	import {
		getRecentSearches,
		removePlayerFromRecent,
		clearRecentSearches,
		savePlayerToRecent
	} from '$lib/utils/recent';
	import type { RecentPlayer } from '$lib/utils/recent';
	import type { ApiFootballPlayerItem } from '$lib/schemas/apiFootball';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let query = $state('');
	let results = $state<ApiFootballPlayerItem[]>([]);
	let loading = $state(false);
	let error = $state('');
	let recentSearches = $state<RecentPlayer[]>([]);

	onMount(() => {
		loadRecent();
	});

	function loadRecent() {
		recentSearches = getRecentSearches();
	}

	function handleSelectFirst() {
		if (results.length > 0) {
			const firstItem = results[0];
			const { player, statistics } = firstItem;
			const clubName = statistics?.[0]?.team?.name || 'Unknown Club';
			const position = statistics?.[0]?.games?.position || 'Unknown Position';

			const recent: RecentPlayer = {
				id: player.id,
				name: player.name,
				photo: player.photo,
				clubName,
				position,
				nationality: player.nationality
			};

			savePlayerToRecent(recent);
			goto(`/player/${player.id}`);
		}
	}

	function handleDismissRecent(e: MouseEvent, id: number) {
		e.stopPropagation();
		e.preventDefault();
		removePlayerFromRecent(id);
		loadRecent();
	}

	function handleClearAll() {
		clearRecentSearches();
		loadRecent();
	}

	function handleRecentClick(player: RecentPlayer) {
		// Save it again to bubble it up to the top of recent searches
		savePlayerToRecent(player);
		goto(`/player/${player.id}`);
	}
</script>

<svelte:head>
	<title>Ficha - Player Search</title>
	<meta
		name="description"
		content="Search football players and open concise Ficha profiles with club, nationality, statistics, transfers, and market context."
	/>
</svelte:head>

<div
	class="relative flex w-full grow flex-col items-center justify-center overflow-hidden px-4 py-12 sm:py-16"
>
	<!-- Ambient Background Glows -->
	<div
		class="pointer-events-none absolute top-1/4 left-1/4 -z-10 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[80px] sm:h-[480px] sm:w-[480px] sm:blur-[120px]"
	></div>
	<div
		class="pointer-events-none absolute right-1/4 bottom-1/4 -z-10 h-[320px] w-[320px] translate-x-1/2 translate-y-1/2 rounded-full bg-green/5 blur-[90px] sm:h-[550px] sm:w-[550px] sm:blur-[130px]"
	></div>

	<div class="flex w-full max-w-4xl flex-col items-center justify-center">
		<!-- Hero Section -->
		<div class="mb-6 flex flex-col items-center text-center select-none">
			<div class="group relative mb-2">
				<!-- Logo Backlight Glow -->
				<div
					class="absolute inset-0 scale-90 rounded-full bg-gold/15 blur-2xl transition-all duration-500 group-hover:scale-105 group-hover:bg-gold/25"
				></div>
				<img
					src={logo}
					alt="Ficha Logo"
					class="relative h-24 w-24 max-w-none object-contain transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(201,168,76,0.35)] sm:h-32 sm:w-32"
				/>
			</div>
			<h1 class="text-5xl font-extrabold tracking-wider text-text sm:text-7xl">
				FICHA<span class="text-gold">.</span>
			</h1>
			<p
				class="mx-auto mt-2 max-w-sm text-[10px] font-bold tracking-[0.25em] text-text-muted uppercase sm:text-xs"
			>
				Football intelligence, player by player
			</p>
		</div>

		<!-- Search Section -->
		<div class="flex w-full max-w-2xl flex-col gap-6">
			<SearchBar
				bind:query
				bind:results
				bind:loading
				bind:error
				onSelectFirst={handleSelectFirst}
			/>

			<!-- Recent Searches Section -->
			{#if query.length < 3 && recentSearches.length > 0}
				<div class="flex flex-col gap-2.5 px-1">
					<div class="flex items-center justify-between">
						<h3 class="text-xs font-semibold tracking-wider text-text-muted uppercase">
							Recent Searches
						</h3>
						<button
							onclick={handleClearAll}
							class="cursor-pointer text-xs font-semibold text-text-muted transition-colors hover:text-gold"
						>
							Clear all
						</button>
					</div>

					<div class="flex flex-wrap gap-2">
						{#each recentSearches as player (player.id)}
							<div
								onclick={() => handleRecentClick(player)}
								onkeydown={(e) => e.key === 'Enter' && handleRecentClick(player)}
								role="button"
								tabindex="0"
								class="group flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-left text-xs font-medium text-text transition-all duration-200 hover:border-gold/30 hover:bg-surface-raised sm:text-sm"
							>
								<span>{player.name}</span>
								<button
									onclick={(e) => handleDismissRecent(e, player.id)}
									class="flex cursor-pointer items-center justify-center rounded-full p-0.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-red-500"
									aria-label="Dismiss recent search"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="2.5"
										stroke="currentColor"
										class="h-3 w-3"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Search Results Grid -->
			{#if query.length >= 3 && results.length > 0}
				<div class="mt-2 flex flex-col gap-3">
					<div class="px-1">
						<h3 class="text-xs font-semibold tracking-wider text-text-muted uppercase">
							Search Results ({results.length})
						</h3>
					</div>
					<div class="flex flex-col gap-2">
						{#each results as playerItem (playerItem.player.id)}
							<PlayerCard {playerItem} />
						{/each}
					</div>
				</div>
			{/if}

			<!-- Feature Highlights (Only visible when not searching) -->
			{#if query.length < 3}
				<div class="mt-8 grid w-full grid-cols-1 gap-4 text-center sm:grid-cols-3">
					<div
						class="flex flex-col items-center rounded-2xl border border-border/50 bg-surface/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:bg-surface"
					>
						<div
							class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="h-5 w-5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
								/>
							</svg>
						</div>
						<h4 class="mb-1 text-sm font-bold text-text select-none">Deep Intelligence</h4>
						<p class="text-xs text-text-muted/90 select-none">
							Comprehensive statistics parsed directly from leading API engines.
						</p>
					</div>
					<div
						class="flex flex-col items-center rounded-2xl border border-border/50 bg-surface/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:bg-surface"
					>
						<div
							class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="h-5 w-5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
								/>
							</svg>
						</div>
						<h4 class="mb-1 text-sm font-bold text-text select-none">Instant Search</h4>
						<p class="text-xs text-text-muted/90 select-none">
							Debounced querying with caching for snappy response times.
						</p>
					</div>
					<div
						class="flex flex-col items-center rounded-2xl border border-border/50 bg-surface/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:bg-surface"
					>
						<div
							class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="h-5 w-5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12z"
								/>
							</svg>
						</div>
						<h4 class="mb-1 text-sm font-bold text-text select-none">Double Verified</h4>
						<p class="text-xs text-text-muted/90 select-none">
							Data verified and merged from both API-Football and Transfermarkt.
						</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
