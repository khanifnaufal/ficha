<script lang="ts">
	import type { ApiFootballPlayerItem } from '$lib/schemas/apiFootball';
	import { getFlagEmoji } from '$lib/utils/emoji';
	import { savePlayerToRecent } from '$lib/utils/recent';

	let { playerItem }: { playerItem: ApiFootballPlayerItem } = $props();

	// Use Svelte 5 derived states to avoid capturing stale values
	const player = $derived(playerItem.player);
	const stats = $derived(playerItem.statistics);

	// Position fallbacks to player.position
	const position = $derived(stats?.[0]?.games?.position || player.position || 'Unknown Position');
	const flag = $derived(getFlagEmoji(player.nationality));

	// Reactive club details
	let clubName = $state('Loading...');
	let clubLogo = $state<string | null>(null);

	// Safe image error state handler
	let imageFailed = $state(false);

	$effect(() => {
		if (stats && stats.length > 0 && stats[0].team?.name) {
			clubName = stats[0].team.name;
			clubLogo = stats[0].team.logo || null;
		} else {
			fetch(`/api/player/${player.id}/team`)
				.then((res) => {
					if (res.ok) return res.json();
					throw new Error();
				})
				.then((data) => {
					clubName = data.clubName || 'Unknown Club';
					clubLogo = data.clubLogo || null;
				})
				.catch(() => {
					clubName = 'Unknown Club';
					clubLogo = null;
				});
		}
	});

	// Reset image error state when player changes to prevent getting stuck on initials
	$effect(() => {
		player.id;
		player.photo;
		imageFailed = false;
	});

	function handleSave() {
		savePlayerToRecent({
			id: player.id,
			name: player.name,
			photo: player.photo,
			clubName,
			position,
			nationality: player.nationality
		});
	}
</script>

<a
	href="/player/{player.id}"
	onclick={handleSave}
	class="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border bg-surface p-3.5 text-left transition-all duration-200 hover:border-gold/30 hover:bg-surface-raised"
>
	<!-- Player photo / Avatar -->
	<div
		class="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised"
	>
		{#if player.photo && !imageFailed}
			<img
				src={player.photo}
				alt={player.name}
				class="h-12 w-12 object-cover transition-transform duration-200 group-hover:scale-105"
				onerror={() => (imageFailed = true)}
			/>
		{:else}
			<span class="text-lg font-bold text-text-muted select-none">
				{player.name ? player.name.charAt(0) : '?'}
			</span>
		{/if}
	</div>

	<!-- Info -->
	<div class="min-w-0 grow">
		<div class="flex items-center gap-2">
			<h4
				class="truncate text-sm font-semibold text-text transition-colors group-hover:text-gold sm:text-base"
			>
				{player.name}
			</h4>
			<span
				class="text-base select-none sm:text-lg"
				title={player.nationality || 'Unknown nationality'}
			>
				{flag}
			</span>
		</div>
		<div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
			<div class="flex items-center gap-1 min-w-0">
				{#if clubLogo}
					<img src={clubLogo} alt={clubName} class="h-3.5 w-3.5 object-contain shrink-0" />
				{/if}
				<span class="truncate font-medium">{clubName}</span>
			</div>
			<span class="hidden h-1 w-1 rounded-full bg-text-muted/40 sm:inline"></span>
			<span
				class="rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[10px] font-semibold tracking-wider text-gold-light uppercase"
			>
				{position}
			</span>
		</div>
	</div>

	<!-- Arrow indicator -->
	<div class="shrink-0 pl-2 text-text-muted transition-colors group-hover:text-gold">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="2.5"
			stroke="currentColor"
			class="h-4 w-4 transform transition-transform group-hover:translate-x-0.5"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
			/>
		</svg>
	</div>
</a>
