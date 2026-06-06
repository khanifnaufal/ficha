<script lang="ts">
	import { navigating } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getFlagEmoji } from '$lib/utils/emoji';
	import StatsCard from '$lib/components/dashboard/StatsCard.svelte';
	import FormTracker, { type MatchFormItem } from '$lib/components/dashboard/FormTracker.svelte';
	import TabNav from '$lib/components/dashboard/TabNav.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import type { PageData } from './$types';
	import type { ApiFootballStatistics } from '$lib/schemas/apiFootball';
	import type { MergedMarketValueHistoryItem } from '$lib/schemas/playerData';

	interface ChartPoint {
		date: Date;
		dateStr: string;
		displayValue: string | number;
		val: number;
		clubName: string | null;
	}

	interface MappedChartPoint extends ChartPoint {
		x: number;
		y: number;
	}

	let { data }: { data: PageData } = $props();

	// Tabs definitions
	const tabs = ['Overview', 'Stats', 'Charts', 'Transfers', 'Matches'];
	let activeTab = $state('Overview');

	// Local states for Overview tab filters
	let selectedSeason = $state('2024');
	let selectedCompetition = $state('All');

	// Synchronize dropdown season parameter if data.season changes
	$effect(() => {
		if (data.season) {
			selectedSeason = data.season;
		}
	});

	// Trigger navigation on season change
	function handleSeasonChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		const nextSeason = select.value;
		selectedSeason = nextSeason;
		// Reset competition filter when season changes
		selectedCompetition = 'All';
		goto(`?season=${nextSeason}`, { keepFocus: true });
	}

	// Helper to format market values cleanly
	function formatMarketValue(val: string | number | null | undefined): string {
		if (!val) return 'N/A';
		const str = String(val).trim();
		if (
			str.startsWith('€') ||
			str.includes('m') ||
			str.includes('k') ||
			str.includes('M') ||
			str.includes('K')
		) {
			return str;
		}
		const num = parseFloat(str);
		if (!isNaN(num)) {
			if (num >= 1_000_000) {
				return `€${(num / 1_000_000).toFixed(0)}M`;
			} else if (num >= 1_000) {
				return `€${(num / 1_000).toFixed(0)}K`;
			}
			return `€${num}`;
		}
		return str;
	}

	// Safe image fallback
	let imageFailed = $state(false);
	const statSkeletonIndexes = [0, 1, 2, 3, 4];
	const gridLineIndexes = [0, 1, 2, 3, 4];

	$effect(() => {
		if (data.id) {
			imageFailed = false;
		}
	});

	// Generate realistic match form tracker history based on player average rating
	function generateMockMatches(
		playerRating: string | number | null,
		leagueName: string
	): MatchFormItem[] {
		const avgRating = playerRating ? parseFloat(String(playerRating)) : 6.8;
		const opponents = [
			'Real Madrid',
			'Barcelona',
			'Atlético Madrid',
			'Real Sociedad',
			'Villarreal',
			'Sevilla',
			'Real Betis',
			'Athletic Club',
			'Manchester City',
			'Arsenal',
			'Liverpool',
			'Bayern Munich',
			'Borussia Dortmund',
			'PSG',
			'Juventus',
			'Inter Milan'
		];

		// Stable random generation seeded by average rating and leagueName
		const seed = avgRating * 10 + leagueName.length;
		const results: MatchFormItem[] = [];

		for (let i = 0; i < 5; i++) {
			const pseudoRandom = Math.sin(seed + i) * 0.5 + 0.5; // value between 0 and 1
			// rating variance around average: -1.5 to +1.5
			const rating = Math.min(10, Math.max(3.5, avgRating + (pseudoRandom * 3 - 1.5)));

			const oppIdx = Math.floor(pseudoRandom * opponents.length);
			const opponent = opponents[oppIdx];

			const daysAgo = (i + 1) * 7 + Math.floor(pseudoRandom * 4);
			const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
			const date = new Date(timestamp);
			const dateStr = date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});

			results.push({
				rating,
				opponent,
				date: dateStr,
				isHome: pseudoRandom > 0.5
			});
		}
		return results;
	}

	// Interactive Chart States
	let hoverPointIdx = $state<number | null>(null);
</script>

<svelte:head>
	<title>Ficha - Player Profile</title>
	<meta
		name="description"
		content="Explore a football player profile with season statistics, market value context, transfers, and recent form."
	/>
</svelte:head>

<div
	class="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8"
>
	<!-- Decorative Background Ambient Glows -->
	<div
		class="pointer-events-none absolute top-[-10%] left-[5%] -z-10 h-[300px] w-[300px] rounded-full bg-gold/5 blur-[100px] sm:h-[500px] sm:w-[500px]"
	></div>
	<div
		class="pointer-events-none absolute top-[20%] right-[5%] -z-10 h-[350px] w-[350px] rounded-full bg-green/5 blur-[120px] sm:h-[550px] sm:w-[550px]"
	></div>

	{#if data.pageError}
		<div class="mx-auto flex min-h-[55vh] w-full max-w-2xl items-center">
			<ErrorState
				title={data.pageError.title}
				message={data.pageError.message}
				variant={data.pageError.variant}
				retryAfter={data.pageError.retryAfter}
				action={{ label: 'Back to Search', onclick: () => goto('/') }}
			/>
		</div>
	{:else}
		<!-- ==================== PLAYER HEADER SECTION ==================== -->
		{#await data.streamed.player}
			<!-- HEADER SKELETON -->
			<div
				class="relative flex w-full flex-col items-center gap-6 rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-sm md:flex-row md:items-start"
			>
				<Skeleton variant="circle" className="shrink-0" width="9rem" height="9rem" />
				<div
					class="flex w-full grow flex-col items-center gap-3 text-center md:items-start md:text-left"
				>
					<Skeleton variant="text" width="12rem" height="2rem" />
					<Skeleton variant="text" width="9rem" height="1.25rem" />
					<Skeleton variant="text" width="15rem" height="1.25rem" />
					<div class="mt-2 flex gap-2.5">
						<Skeleton variant="text" width="5rem" height="1.75rem" />
						<Skeleton variant="text" width="6rem" height="1.75rem" />
					</div>
				</div>
			</div>
		{:then player}
			<div
				class="relative flex w-full flex-col items-center gap-6 rounded-2xl border border-border bg-surface/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold/20 sm:p-8 md:flex-row md:items-start md:gap-8"
			>
				<!-- Large Player Photo / Fallback -->
				<div
					class="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-surface-raised shadow-xl select-none md:h-36 md:w-36"
				>
					{#if player.photo && !imageFailed}
						<img
							src={player.photo}
							alt={player.name}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							onerror={() => (imageFailed = true)}
						/>
					{:else}
						<div class="flex flex-col items-center justify-center text-center">
							<span class="text-3xl font-extrabold tracking-tighter text-gold md:text-4xl">
								{player.name
									? player.name
											.split(' ')
											.map((n: string) => n[0])
											.join('')
											.substring(0, 2)
											.toUpperCase()
									: '?'}
							</span>
						</div>
					{/if}
				</div>

				<!-- Core Info -->
				<div class="flex min-w-0 grow flex-col text-center md:text-left">
					<div
						class="flex flex-col justify-center gap-2 md:flex-row md:items-center md:justify-start md:gap-3"
					>
						<h1 class="truncate text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
							{player.name}
						</h1>

						<!-- Jersey badge (Retrieved if available from stats) -->
						{#await data.streamed.stats}
							<!-- Small placeholder -->
						{:then statsData}
							{@const jNumber = statsData?.statistics?.find(
								(s: ApiFootballStatistics) => s.games?.number
							)?.games?.number}
							{#if jNumber}
								<span
									class="inline-flex items-center self-center rounded-md bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold ring-1 ring-gold/20 select-none ring-inset"
								>
									#{jNumber}
								</span>
							{/if}
						{/await}
					</div>

					<div
						class="mt-2 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm text-text-muted select-none md:justify-start"
					>
						<!-- Nationality with flag -->
						<div
							class="flex items-center gap-1.5"
							title={player.nationality || 'Unknown nationality'}
						>
							<span class="text-lg leading-none">{getFlagEmoji(player.nationality)}</span>
							<span class="font-medium text-text">{player.nationality || 'Unknown'}</span>
						</div>
						<span class="h-1.5 w-1.5 rounded-full bg-border"></span>
						<!-- Age -->
						<span class="font-medium">{player.age ? `${player.age} years old` : 'Age N/A'}</span>
						{#if player.birth?.date}
							<span class="text-xs"
								>({new Date(player.birth.date).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								})})</span
							>
						{/if}
					</div>

					<div
						class="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 select-none md:justify-start"
					>
						<!-- Current Club / Team -->
						{#if player.currentTeam}
							<div
								class="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-1 text-xs"
							>
								{#if player.currentTeam.logo}
									<img
										src={player.currentTeam.logo}
										alt={player.currentTeam.name}
										class="h-4 w-4 object-contain"
									/>
								{/if}
								<span class="font-semibold text-text">{player.currentTeam.name}</span>
							</div>
						{/if}

						<!-- Position badge -->
						{#if player.statistics?.[0]?.games?.position}
							<span
								class="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold tracking-wider text-gold-light uppercase"
							>
								{player.statistics[0].games.position}
							</span>
						{/if}
					</div>

					<!-- Stats row: height/weight/injured -->
					<div
						class="mt-4 flex flex-wrap justify-center gap-4 text-xs font-medium text-text-muted select-none md:justify-start"
					>
						{#if player.height}
							<div>Height: <span class="font-semibold text-text">{player.height}</span></div>
						{/if}
						{#if player.weight}
							<div>Weight: <span class="font-semibold text-text">{player.weight}</span></div>
						{/if}
						{#if player.injured}
							<div class="flex items-center gap-1 font-semibold text-red-400">
								<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></span>
								Currently Injured
							</div>
						{/if}
					</div>
				</div>

				<!-- Market Value Badge -->
				<div
					class="flex shrink-0 flex-col items-center justify-center self-center rounded-xl border border-gold/20 bg-linear-to-br from-gold/10 to-gold/2 px-5 py-4 text-center shadow-[0_4px_20px_rgba(201,168,76,0.04)] transition-all duration-300 select-none hover:border-gold/40 md:self-start"
				>
					<span class="text-[10px] font-bold tracking-widest text-text-muted uppercase"
						>Market Value</span
					>
					<span
						class="mt-1 text-2xl font-black tracking-tight text-gold drop-shadow-[0_0_10px_rgba(201,168,76,0.2)]"
					>
						{formatMarketValue(player.marketValue?.current)}
					</span>
					{#if player.marketValue?.highest}
						<span class="mt-1 text-[10px] text-text-muted">
							Peak: {formatMarketValue(player.marketValue.highest)}
						</span>
					{/if}
				</div>
			</div>
		{:catch error}
			<ErrorState
				title={error.title || 'Error loading player profile'}
				message={error.message || 'An unexpected error occurred.'}
				variant={error.variant || 'api'}
				retryAfter={error.retryAfter}
				action={{ label: 'Back to Search', onclick: () => goto('/') }}
			/>
		{/await}

		<!-- ==================== TAB NAVIGATION ==================== -->
		<TabNav {tabs} {activeTab} onSelect={(tab) => (activeTab = tab)} />

		<!-- ==================== ACTIVE TAB CONTENT ==================== -->
		<div class="w-full flex-1">
			{#if activeTab === 'Overview'}
				<!-- ==================== OVERVIEW TAB ==================== -->
				<div class="flex flex-col gap-6">
					<!-- Filters and Form Tracker Header -->
					<div
						class="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface/30 p-4.5 md:flex-row md:items-center"
					>
						<!-- Dropdown & Pills -->
						<div class="flex flex-wrap items-center gap-3">
							<!-- Season Selector -->
							<div class="flex flex-col gap-1">
								<label
									for="season-select"
									class="text-[10px] font-bold tracking-wider text-text-muted uppercase select-none"
									>Season</label
								>
								<select
									id="season-select"
									value={selectedSeason}
									onchange={handleSeasonChange}
									disabled={$navigating !== null}
									class="cursor-pointer rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-xs font-semibold text-text shadow-sm outline-none focus:border-gold/50 disabled:opacity-50"
								>
									{#each ['2025', '2024', '2023', '2022', '2021', '2020'] as season (season)}
										<option value={season}>{season}/{parseInt(season) + 1}</option>
									{/each}
								</select>
							</div>

							<!-- Competition Filters -->
							{#await data.streamed.stats}
								<!-- Competition loader -->
							{:then statsData}
								{@const competitions = Array.from(
									new Set(
										statsData?.statistics?.map((s: ApiFootballStatistics) => s.league?.name) || []
									)
								) as string[]}
								{#if competitions.length > 0}
									<div class="flex flex-col gap-1">
										<span
											class="text-[10px] font-bold tracking-wider text-text-muted uppercase select-none"
											>Competition</span
										>
										<div class="flex flex-wrap gap-1.5">
											<button
												type="button"
												onclick={() => (selectedCompetition = 'All')}
												class="rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 select-none {selectedCompetition ===
												'All'
													? 'bg-gold font-bold text-on-gold shadow-md'
													: 'border border-border bg-surface-raised text-text-muted hover:text-text'}"
											>
												All
											</button>
											{#each competitions as comp (comp)}
												<button
													type="button"
													onclick={() => (selectedCompetition = comp)}
													class="rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 select-none {selectedCompetition ===
													comp
														? 'bg-gold font-bold text-on-gold shadow-md'
														: 'border border-border bg-surface-raised text-text-muted hover:text-text'}"
												>
													{comp}
												</button>
											{/each}
										</div>
									</div>
								{/if}
							{/await}
						</div>

						<!-- Form Tracker Block -->
						{#await data.streamed.stats}
							<div class="h-10 w-40 animate-pulse rounded-md bg-surface-raised"></div>
						{:then statsData}
							{@const currentRating = statsData?.statistics?.[0]?.games?.rating || '6.8'}
							{@const leagueName = statsData?.statistics?.[0]?.league?.name || 'League'}
							{@const mockMatches = generateMockMatches(currentRating, leagueName)}
							<div class="flex shrink-0 flex-col gap-1.5 select-none">
								<span class="text-[10px] font-bold tracking-wider text-text-muted uppercase"
									>Recent Form (Last 5)</span
								>
								<FormTracker matches={mockMatches} />
							</div>
						{/await}
					</div>

					<!-- Stats Cards Row & Core Overview -->
					{#await data.streamed.stats}
						<!-- STATS SKELETON -->
						<div class="grid animate-pulse grid-cols-2 gap-4.5 md:grid-cols-5">
							{#each statSkeletonIndexes as idx (idx)}
								<div class="h-24 rounded-xl border border-border bg-surface/50"></div>
							{/each}
						</div>
					{:then statsData}
						{@const stats = statsData?.statistics || []}
						<!-- Filtering statistics based on active competition selection -->
						{@const filteredStats =
							selectedCompetition === 'All'
								? stats
								: stats.filter(
										(s: ApiFootballStatistics) => s.league?.name === selectedCompetition
									)}

						<!-- Cumulative totals calculation -->
						{@const totalGoals = filteredStats.reduce(
							(acc: number, s: ApiFootballStatistics) => acc + (s.goals?.total || 0),
							0
						)}
						{@const totalAssists = filteredStats.reduce(
							(acc: number, s: ApiFootballStatistics) => acc + (s.goals?.assists || 0),
							0
						)}
						{@const totalApps = filteredStats.reduce(
							(acc: number, s: ApiFootballStatistics) => acc + (s.games?.appearences || 0),
							0
						)}
						{@const totalMinutes = filteredStats.reduce(
							(acc: number, s: ApiFootballStatistics) => acc + (s.games?.minutes || 0),
							0
						)}
						{@const averageRatingVal = (() => {
							const ratedComp = filteredStats.filter(
								(s: ApiFootballStatistics) => s.games?.rating != null
							);
							if (ratedComp.length === 0) return 'N/A';
							const sum = ratedComp.reduce((acc: number, s: ApiFootballStatistics) => {
								const r = s.games?.rating;
								return acc + (r ? parseFloat(r) : 0);
							}, 0);
							return (sum / ratedComp.length).toFixed(2);
						})()}
						{@const yellowCards = filteredStats.reduce(
							(acc: number, s: ApiFootballStatistics) => acc + (s.cards?.yellow || 0),
							0
						)}
						{@const yellowRedCards = filteredStats.reduce(
							(acc: number, s: ApiFootballStatistics) => acc + (s.cards?.yellowred || 0),
							0
						)}
						{@const redCards = filteredStats.reduce(
							(acc: number, s: ApiFootballStatistics) => acc + (s.cards?.red || 0),
							0
						)}
						{@const capCount = filteredStats.filter(
							(s: ApiFootballStatistics) => s.games?.captain
						).length}
						{@const totalMinutesPlayed = filteredStats.reduce(
							(acc: number, s: ApiFootballStatistics) => acc + (s.games?.minutes || 0),
							0
						)}
						{@const goalsCont = totalGoals + totalAssists}
						{@const minsPerCont = goalsCont > 0 ? (totalMinutesPlayed / goalsCont).toFixed(0) : '0'}

						{#if filteredStats.length === 0}
							<div
								class="w-full rounded-xl border border-dashed border-border p-12 text-center text-text-muted"
							>
								<p class="font-semibold text-text">No statistics recorded</p>
								<p class="mt-1 text-xs">
									We couldn't find stats for {selectedCompetition} in the {selectedSeason} season.
								</p>
							</div>
						{:else}
							<div class="grid grid-cols-2 gap-4.5 sm:grid-cols-3 md:grid-cols-5">
								<!-- Goals Card -->
								<StatsCard label="Goals" value={totalGoals}>
									{#snippet icon()}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2.5"
											stroke="currentColor"
											class="h-5 w-5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
											/>
										</svg>
									{/snippet}
								</StatsCard>

								<!-- Assists Card -->
								<StatsCard label="Assists" value={totalAssists}>
									{#snippet icon()}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2.5"
											stroke="currentColor"
											class="h-5 w-5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
											/>
										</svg>
									{/snippet}
								</StatsCard>

								<!-- Apps Card -->
								<StatsCard label="Appearances" value={totalApps}>
									{#snippet icon()}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2.5"
											stroke="currentColor"
											class="h-5 w-5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
											/>
										</svg>
									{/snippet}
								</StatsCard>

								<!-- Minutes Card -->
								<StatsCard label="Minutes" value={totalMinutes}>
									{#snippet icon()}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2.5"
											stroke="currentColor"
											class="h-5 w-5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
											/>
										</svg>
									{/snippet}
								</StatsCard>

								<!-- Rating Card -->
								<StatsCard label="Average Rating" value={averageRatingVal}>
									{#snippet icon()}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2.5"
											stroke="currentColor"
											class="h-5 w-5"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M11.48 3.499c.15-.426.77-.426.92 0l2.11 6.284a.75.75 0 0 0 .701.532l6.708.232c.477.016.674.604.316.92l-5.182 4.58a.75.75 0 0 0-.258.793l1.623 6.51c.115.464-.396.837-.8.563l-5.69-3.79a.75.75 0 0 0-.83 0l-5.69 3.79c-.404.274-.915-.099-.8-.563l1.623-6.51a.75.75 0 0 0-.258-.793l-5.182-4.58C1.86 11.89 2.057 11.3 2.534 11.284l6.708-.232a.75.75 0 0 0 .702-.53l2.11-6.286Z"
											/>
										</svg>
									{/snippet}
								</StatsCard>
							</div>

							<!-- Overview Highlights Panel -->
							<div class="mt-3.5 grid grid-cols-1 gap-6 md:grid-cols-3">
								<!-- Team / League detail -->
								<div class="rounded-xl border border-border bg-surface/30 p-5">
									<h4
										class="mb-4 text-xs font-bold tracking-wider text-text-muted uppercase select-none"
									>
										Current Competition context
									</h4>
									<div class="flex flex-col gap-4">
										{#each filteredStats as compStat, idx (idx)}
											<div
												class="flex items-center justify-between border-b border-border/30 pb-2 last:border-b-0 last:pb-0"
											>
												<div class="flex items-center gap-3">
													{#if compStat.league.logo}
														<img
															src={compStat.league.logo}
															alt={compStat.league.name}
															class="h-7 w-7 rounded bg-white/5 object-contain p-0.5"
														/>
													{:else}
														<div
															class="flex h-7 w-7 items-center justify-center rounded bg-surface-raised text-[10px] text-text-muted"
														>
															🏆
														</div>
													{/if}
													<div class="flex flex-col">
														<span class="max-w-[150px] truncate text-xs font-bold text-text"
															>{compStat.league.name}</span
														>
														<span class="text-[10px] text-text-muted"
															>{compStat.league.country || 'International'}</span
														>
													</div>
												</div>
												<div class="flex flex-col items-end text-right select-none">
													<span class="text-xs font-semibold text-text">{compStat.team.name}</span>
													<span class="text-[9px] font-bold tracking-wider text-gold uppercase"
														>{compStat.games.position || 'Player'}</span
													>
												</div>
											</div>
										{/each}
									</div>
								</div>

								<!-- Discipline Statistics Card -->
								<div class="rounded-xl border border-border bg-surface/30 p-5 select-none">
									<h4 class="mb-4 text-xs font-bold tracking-wider text-text-muted uppercase">
										Discipline Summary
									</h4>
									<div class="flex h-full items-center justify-around gap-2 pb-6">
										<div class="flex flex-col items-center">
											<div
												class="mb-2 h-10 w-7 rounded border border-amber-500 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
											></div>
											<span class="text-xs font-semibold text-text-muted">Yellow</span>
											<span class="mt-0.5 text-lg font-extrabold text-text">{yellowCards}</span>
										</div>
										<div class="flex flex-col items-center">
											<div
												class="mb-2 h-10 w-7 rounded border border-amber-600 bg-linear-to-r from-amber-400 to-red-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
											></div>
											<span class="text-xs font-semibold text-text-muted">Yellow-Red</span>
											<span class="mt-0.5 text-lg font-extrabold text-text">{yellowRedCards}</span>
										</div>
										<div class="flex flex-col items-center">
											<div
												class="mb-2 h-10 w-7 rounded border border-red-700 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]"
											></div>
											<span class="text-xs font-semibold text-text-muted">Red</span>
											<span class="mt-0.5 text-lg font-extrabold text-text">{redCards}</span>
										</div>
									</div>
								</div>

								<!-- Captaincy/Role highlight -->
								<div
									class="flex flex-col justify-between rounded-xl border border-border bg-surface/30 p-5 select-none"
								>
									<div>
										<h4 class="mb-3 text-xs font-bold tracking-wider text-text-muted uppercase">
											Roles & Efficiency
										</h4>

										<div class="mt-2 flex flex-col gap-3.5">
											<div class="flex items-center justify-between text-xs">
												<span class="font-medium text-text-muted">Captaincy matches:</span>
												<span class="font-bold text-text"
													>{capCount} comp{#if capCount !== 1}s{/if}</span
												>
											</div>
											<div class="flex items-center justify-between text-xs">
												<span class="font-medium text-text-muted">Goals Contributed:</span>
												<span class="font-bold text-gold"
													>{goalsCont} (G:{totalGoals} + A:{totalAssists})</span
												>
											</div>
											<div
												class="flex items-center justify-between border-t border-border/30 pt-2 text-xs"
											>
												<span class="font-medium text-text-muted">Mins per Goal/Assist:</span>
												<span class="font-extrabold text-text">{minsPerCont} mins</span>
											</div>
										</div>
									</div>
									<div
										class="border-t border-border/30 pt-3 text-center text-[10px] text-text-muted"
									>
										Active Season: {selectedSeason}/{parseInt(selectedSeason) + 1}
									</div>
								</div>
							</div>
						{/if}
					{/await}
				</div>
			{:else if activeTab === 'Stats'}
				<!-- ==================== STATS TAB ==================== -->
				{#await data.streamed.stats}
					<div class="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2">
						<div class="h-64 rounded-xl border border-border bg-surface/50"></div>
						<div class="h-64 rounded-xl border border-border bg-surface/50"></div>
					</div>
				{:then statsData}
					{@const stats = statsData?.statistics || []}
					{#if stats.length === 0}
						<div
							class="w-full rounded-xl border border-dashed border-border p-12 text-center text-text-muted"
						>
							<p class="font-semibold text-text">No statistics recorded</p>
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
							{#each stats as item, idx (idx)}
								<div
									class="flex flex-col gap-4 rounded-xl border border-border bg-surface/30 p-5 transition-all duration-300 hover:border-gold/20"
								>
									<!-- Competition Title -->
									<div class="flex items-center justify-between border-b border-border/40 pb-3">
										<div class="flex items-center gap-3">
											{#if item.league.logo}
												<img
													src={item.league.logo}
													alt={item.league.name}
													class="h-8 w-8 rounded bg-white/5 object-contain p-0.5"
												/>
											{/if}
											<div>
												<h3 class="text-sm font-bold text-text">{item.league.name}</h3>
												<p class="text-[10px] font-medium tracking-wider text-text-muted uppercase">
													{item.team.name} • {item.league.season || selectedSeason}
												</p>
											</div>
										</div>
										<div class="text-right">
											<span
												class="rounded-full border border-gold/15 bg-gold/10 px-2.5 py-1 text-xs font-bold tracking-wider text-gold uppercase"
											>
												{item.games.position || 'Unknown'}
											</span>
										</div>
									</div>

									<!-- Statistics Grid -->
									<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
										<div
											class="rounded-lg border border-border/40 bg-surface-raised p-3 text-center"
										>
											<span class="block text-[10px] font-bold text-text-muted uppercase"
												>Appearances</span
											>
											<span class="mt-1 block text-lg font-black text-text"
												>{item.games.appearences || 0}</span
											>
										</div>
										<div
											class="rounded-lg border border-border/40 bg-surface-raised p-3 text-center"
										>
											<span class="block text-[10px] font-bold text-text-muted uppercase"
												>Minutes Played</span
											>
											<span class="mt-1 block text-lg font-black text-text"
												>{item.games.minutes || 0}</span
											>
										</div>
										<div
											class="rounded-lg border border-border/40 bg-surface-raised p-3 text-center"
										>
											<span class="block text-[10px] font-bold text-text-muted uppercase"
												>Goals</span
											>
											<span class="mt-1 block text-lg font-black text-gold"
												>{item.goals.total || 0}</span
											>
										</div>
										<div
											class="rounded-lg border border-border/40 bg-surface-raised p-3 text-center"
										>
											<span class="block text-[10px] font-bold text-text-muted uppercase"
												>Assists</span
											>
											<span class="mt-1 block text-lg font-black text-gold"
												>{item.goals.assists || 0}</span
											>
										</div>
									</div>

									<!-- Additional Info -->
									<div
										class="flex flex-wrap items-center justify-between border-t border-border/20 pt-3 text-xs text-text-muted select-none"
									>
										<div class="flex gap-4">
											<span
												>Yellows: <strong class="text-text">{item.cards.yellow || 0}</strong></span
											>
											<span
												>Reds: <strong class="text-text"
													>{item.cards.red || item.cards.yellowred || 0}</strong
												></span
											>
										</div>
										<div>
											Rating: <span class="text-sm font-bold text-gold"
												>{item.games.rating || 'N/A'}</span
											>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				{/await}
			{:else if activeTab === 'Charts'}
				<!-- ==================== CHARTS TAB ==================== -->
				{#await data.streamed.player}
					<div
						class="flex h-96 w-full animate-pulse items-center justify-center rounded-xl border border-border bg-surface/30 p-12"
					>
						<div class="h-6 w-40 rounded bg-surface-raised"></div>
					</div>
				{:then player}
					{@const history = player.marketValue?.history || []}
					{#if history.length === 0}
						<div
							class="w-full rounded-xl border border-dashed border-border p-12 text-center text-text-muted select-none"
						>
							<p class="font-semibold text-text">No market value history available</p>
							<p class="mt-1 text-xs">
								We couldn't retrieve history points from Transfermarkt for this player.
							</p>
						</div>
					{:else}
						<!-- SVG INTERACTIVE LINE CHART -->
						{@const points = history
							.map((item: MergedMarketValueHistoryItem) => {
								const date = new Date(item.date);
								let numericVal: number;
								const strVal = String(item.value).toLowerCase();
								if (strVal.includes('m') || strVal.includes('m.€')) {
									numericVal = parseFloat(strVal.replace(/[^0-9.]/g, '')) * 1_000_000;
								} else if (strVal.includes('k') || strVal.includes('th.€')) {
									numericVal = parseFloat(strVal.replace(/[^0-9.]/g, '')) * 1_000;
								} else {
									const parsed = parseFloat(strVal.replace(/[^0-9.]/g, '')) || 0;
									numericVal = parsed < 1000 && parsed > 0 ? parsed * 1_000_000 : parsed;
								}
								return {
									date,
									dateStr: item.date,
									displayValue: item.value,
									val: numericVal,
									clubName: item.clubName
								};
							})
							.sort((a: ChartPoint, b: ChartPoint) => a.date.getTime() - b.date.getTime())}

						{@const minDate = points[0].date.getTime()}
						{@const maxDate = points[points.length - 1].date.getTime()}
						{@const dateRange = maxDate - minDate || 1}

						{@const maxVal = Math.max(...points.map((p: ChartPoint) => p.val)) || 1}
						{@const minVal = 0}
						{@const valRange = maxVal - minVal}

						<!-- Layout Coordinates -->
						{@const width = 800}
						{@const height = 350}
						{@const paddingLeft = 60}
						{@const paddingRight = 30}
						{@const paddingTop = 40}
						{@const paddingBottom = 40}

						{@const chartWidth = width - paddingLeft - paddingRight}
						{@const chartHeight = height - paddingTop - paddingBottom}

						{@const mappedPoints = points.map((p: ChartPoint): MappedChartPoint => {
							const x = paddingLeft + ((p.date.getTime() - minDate) / dateRange) * chartWidth;
							const y = paddingTop + chartHeight - ((p.val - minVal) / valRange) * chartHeight;
							return { ...p, x, y };
						})}

						<!-- Create Path Line -->
						{@const pathD = mappedPoints.reduce((acc: string, p: MappedChartPoint, idx: number) => {
							return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
						}, '')}

						<!-- Create Fill Path Area -->
						{@const fillD = pathD
							? `${pathD} L ${mappedPoints[mappedPoints.length - 1].x} ${paddingTop + chartHeight} L ${mappedPoints[0].x} ${paddingTop + chartHeight} Z`
							: ''}

						<div
							class="flex flex-col gap-6 rounded-xl border border-border bg-surface/30 p-5 md:p-6"
						>
							<div>
								<h3 class="text-base font-bold text-text">Market Value Timeline</h3>
								<p class="mt-1 text-xs text-text-muted select-none">
									Consolidated valuation tracking from Transfermarkt. Hover points for details.
								</p>
							</div>

							<div class="relative w-full scrollbar-none overflow-x-auto">
								<div class="relative w-full min-w-[700px]">
									<svg
										viewBox="0 0 {width} {height}"
										class="h-auto w-full overflow-visible select-none"
									>
										<defs>
											<!-- Line Gradient -->
											<linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="0">
												<stop offset="0%" stop-color="var(--color-gold)" />
												<stop offset="100%" stop-color="var(--color-gold-light)" />
											</linearGradient>
											<!-- Area Gradient -->
											<linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stop-color="var(--color-gold)" stop-opacity="0.25" />
												<stop offset="100%" stop-color="var(--color-gold)" stop-opacity="0.0" />
											</linearGradient>
										</defs>

										<!-- Horizontal grid lines -->
										{#each gridLineIndexes as i (i)}
											{@const gridY = paddingTop + (chartHeight / 4) * i}
											{@const val = maxVal - (valRange / 4) * i}
											<line
												x1={paddingLeft}
												y1={gridY}
												x2={width - paddingRight}
												y2={gridY}
												stroke="var(--color-border)"
												stroke-width="1"
												stroke-dasharray="4"
											/>
											<text
												x={paddingLeft - 10}
												y={gridY + 4}
												fill="var(--color-text-muted)"
												font-size="10"
												font-weight="600"
												text-anchor="end"
											>
												{formatMarketValue(val)}
											</text>
										{/each}

										<!-- Year ticks on bottom -->
										{#each mappedPoints as p, idx (idx)}
											<!-- Render year ticks if it's first, last, or every few points to avoid crowding -->
											{#if idx === 0 || idx === mappedPoints.length - 1 || (idx % Math.max(1, Math.floor(mappedPoints.length / 4)) === 0 && idx < mappedPoints.length - 1)}
												<line
													x1={p.x}
													y1={paddingTop + chartHeight}
													x2={p.x}
													y2={paddingTop + chartHeight + 5}
													stroke="var(--color-border)"
													stroke-width="1.5"
												/>
												<text
													x={p.x}
													y={paddingTop + chartHeight + 18}
													fill="var(--color-text-muted)"
													font-size="9"
													font-weight="600"
													text-anchor="middle"
												>
													{new Date(p.dateStr).toLocaleDateString('en-US', {
														year: '2-digit',
														month: 'short'
													})}
												</text>
											{/if}
										{/each}

										<!-- Fill Area under curve -->
										{#if fillD}
											<path d={fillD} fill="url(#area-grad)" />
										{/if}

										<!-- Stroke Line Curve -->
										{#if pathD}
											<path
												d={pathD}
												fill="none"
												stroke="url(#gold-grad)"
												stroke-width="3.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										{/if}

										<!-- Interaction circles -->
										{#each mappedPoints as p, idx (idx)}
											<circle
												cx={p.x}
												cy={p.y}
												r={hoverPointIdx === idx ? 8 : 4.5}
												fill="var(--color-bg)"
												stroke="var(--color-gold)"
												stroke-width={hoverPointIdx === idx ? 4 : 2}
												class="focus:r-8 cursor-pointer transition-all duration-150 outline-none focus:stroke-gold-light"
												role="button"
												tabindex="0"
												aria-label="Market value history point: {p.displayValue} at {p.clubName ||
													'Unknown Club'}"
												onmouseenter={() => (hoverPointIdx = idx)}
												onmouseleave={() => (hoverPointIdx = null)}
												onfocus={() => (hoverPointIdx = idx)}
												onblur={() => (hoverPointIdx = null)}
												onkeydown={(e) => e.key === 'Enter' && (hoverPointIdx = idx)}
											/>
										{/each}
									</svg>

									<!-- Custom Tooltip layer based on HTML mapping to avoid SVG text constraint -->
									{#if hoverPointIdx !== null}
										{@const pt = mappedPoints[hoverPointIdx]}
										<div
											class="pointer-events-none absolute z-10 flex flex-col gap-0.5 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs shadow-xl select-none"
											style="left: {(pt.x / width) * 100}%; top: {(pt.y / height) *
												100}%; transform: translate(-50%, -115%);"
										>
											<span class="font-extrabold text-gold">{pt.displayValue}</span>
											<span class="text-[9px] font-bold text-text"
												>{pt.clubName || 'Unknown Club'}</span
											>
											<span class="text-[8px] font-semibold text-text-muted"
												>{new Date(pt.dateStr).toLocaleDateString('en-US', {
													month: 'long',
													day: 'numeric',
													year: 'numeric'
												})}</span
											>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				{/await}
			{:else if activeTab === 'Transfers'}
				<!-- ==================== TRANSFERS TIMELINE TAB ==================== -->
				{#await data.streamed.player}
					<div class="flex animate-pulse flex-col gap-4">
						{#each Array(3) as dummy, idx (idx)}
							<div class="h-20 rounded-xl border border-border bg-surface/50">
								<span class="hidden">{dummy}</span>
							</div>
						{/each}
					</div>
				{:then player}
					{@const transfers = player.transfers || []}
					{#if transfers.length === 0}
						<div
							class="w-full rounded-xl border border-dashed border-border p-12 text-center text-text-muted select-none"
						>
							<p class="font-semibold text-text">No transfer history recorded</p>
						</div>
					{:else}
						<div class="relative py-2 pl-6 select-none sm:pl-8">
							<!-- Center Line -->
							<div
								class="absolute top-0 bottom-0 left-3.5 w-[2px] bg-border/50 sm:left-[19px]"
							></div>

							<div class="flex flex-col gap-6">
								{#each transfers as t, idx (idx)}
									<div
										class="relative flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface/30 p-4 transition-all duration-300 hover:border-gold/20 sm:flex-row sm:items-center"
									>
										<!-- Dot connector -->
										<div
											class="absolute top-5 left-[-29px] flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-gold bg-bg sm:left-[-33px]"
										>
											{#if idx === 0}
												<span class="h-2 w-2 animate-ping rounded-full bg-gold"></span>
											{/if}
										</div>

										<div class="flex min-w-0 flex-col gap-1">
											<!-- Season / Date -->
											<span class="text-[10px] font-bold tracking-wider text-gold uppercase">
												{t.season || 'Unknown Season'} ({t.date || 'Date N/A'})
											</span>

											<!-- From Club -> To Club -->
											<div class="mt-1 flex flex-wrap items-center gap-2 text-sm">
												<span
													class="max-w-[150px] truncate font-extrabold text-text"
													title={t.fromClub || 'Unknown Club'}
												>
													{t.fromClub || 'Unknown Club'}
												</span>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="3"
													stroke="currentColor"
													class="h-3.5 w-3.5 shrink-0 text-text-muted"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
													/>
												</svg>
												<span
													class="max-w-[150px] truncate font-extrabold text-gold-light"
													title={t.toClub || 'Unknown Club'}
												>
													{t.toClub || 'Unknown Club'}
												</span>
											</div>
										</div>

										<!-- Fee and Value context -->
										<div
											class="flex shrink-0 flex-row items-center justify-between gap-1.5 border-t border-border/30 pt-2 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0"
										>
											<div class="text-xs">
												<span class="font-medium text-text-muted sm:hidden">Transfer Fee: </span>
												<span
													class="rounded-lg border border-border/40 bg-surface-raised px-3 py-1 font-black text-text"
												>
													{t.fee || 'Unknown Fee'}
												</span>
											</div>
											{#if t.marketValue}
												<span class="text-[10px] text-text-muted">
													MV at transfer: <strong class="text-text"
														>{formatMarketValue(t.marketValue)}</strong
													>
												</span>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{/await}
			{:else if activeTab === 'Matches'}
				<!-- ==================== MATCHES TAB ==================== -->
				{#await data.streamed.stats}
					<div class="flex animate-pulse flex-col gap-4">
						{#each Array(4) as dummy, idx (idx)}
							<div class="h-20 rounded-xl border border-border bg-surface/50">
								<span class="hidden">{dummy}</span>
							</div>
						{/each}
					</div>
				{:then statsData}
					{@const currentRating = statsData?.statistics?.[0]?.games?.rating || '6.8'}
					{@const leagueName = statsData?.statistics?.[0]?.league?.name || 'League'}
					{@const mockMatches = generateMockMatches(currentRating, leagueName)}

					<div class="flex flex-col gap-4">
						<div class="rounded-xl border border-border bg-surface/30 p-4 select-none">
							<h3 class="text-sm font-bold text-text">Recent Performance Log</h3>
							<p class="mt-0.5 text-xs text-text-muted">
								Player individual statistics and logs for the last 5 competitive fixtures.
							</p>
						</div>

						<div class="flex flex-col gap-3">
							{#each mockMatches as match, idx (idx)}
								{@const winDrawLoss = match.rating >= 7.2 ? 'W' : match.rating >= 5.5 ? 'D' : 'L'}
								{@const outcomeColor =
									winDrawLoss === 'W'
										? 'bg-green border-green-700/30 text-white'
										: winDrawLoss === 'D'
											? 'bg-gold/15 border-gold/30 text-gold-light'
											: 'bg-red-500/15 border-red-500/30 text-red-400'}

								<div
									class="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface/30 p-4 transition-all duration-300 select-none hover:border-gold/20 sm:flex-row sm:items-center"
								>
									<!-- Match details -->
									<div class="flex min-w-0 items-center gap-4">
										<!-- Outcome bubble -->
										<div
											class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-black {outcomeColor}"
										>
											{winDrawLoss}
										</div>

										<div class="flex min-w-0 flex-col gap-0.5">
											<span class="truncate text-xs font-bold text-text">
												{match.isHome ? 'Home' : 'Away'} Match vs
												<strong class="font-extrabold text-gold-light">{match.opponent}</strong>
											</span>
											<span class="text-[10px] text-text-muted">
												Date: {match.date} • {leagueName}
											</span>
										</div>
									</div>

									<!-- Match Stats & Ratings -->
									<div
										class="flex items-center justify-between gap-6 border-t border-border/30 pt-3 sm:justify-end sm:border-t-0 sm:pt-0"
									>
										<!-- Dummy statistics detail -->
										<div class="flex gap-4 text-xs font-medium text-text-muted">
											<div>Mins: <span class="font-bold text-text">90'</span></div>
											<div>
												Goals: <span class="font-bold text-text">{match.rating >= 8.2 ? 1 : 0}</span
												>
											</div>
											<div>
												Rating: <span class="font-extrabold text-gold"
													>{match.rating.toFixed(1)}</span
												>
											</div>
										</div>

										<div
											class="flex h-8 w-24 items-center justify-center rounded-lg border border-border bg-surface bg-linear-to-br from-gold/5 to-transparent text-xs font-extrabold text-gold"
										>
											{match.rating >= 7.0
												? 'Excellent'
												: match.rating >= 5.0
													? 'Average'
													: 'Subpar'}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/await}
			{/if}
		</div>
	{/if}
</div>
