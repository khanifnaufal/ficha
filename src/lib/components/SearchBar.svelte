<script lang="ts">
	import { onDestroy } from 'svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import type { ApiFootballPlayerItem } from '$lib/schemas/apiFootball';

	let {
		query = $bindable(''),
		results = $bindable<ApiFootballPlayerItem[]>([]),
		loading = $bindable(false),
		error = $bindable(''),
		onSelectFirst = () => {}
	} = $props();

	let inputVal = $state('');
	let debounceTimeout: ReturnType<typeof setTimeout> | undefined;
	let abortController: AbortController | null = null;
	let errorStatus = $state<number | null>(null);
	let retryAfter = $state<number | null>(null);
	const skeletonRows = [0, 1, 2];

	// Synchronize external clears (like clicking a recent search or clearing all)
	$effect(() => {
		if (query === '' && inputVal !== '') {
			inputVal = '';
		}
	});

	async function performSearch(searchTerm: string) {
		const trimmed = searchTerm.trim();
		if (trimmed.length < 3) {
			results = [];
			loading = false;
			error = '';
			errorStatus = null;
			retryAfter = null;
			query = trimmed;
			return;
		}

		query = trimmed;
		loading = true;
		error = '';
		errorStatus = null;
		retryAfter = null;

		// Cancel the previous active request
		if (abortController) {
			abortController.abort();
		}
		abortController = new AbortController();

		try {
			const res = await fetch(`/api/player/search?q=${encodeURIComponent(trimmed)}`, {
				signal: abortController.signal
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				errorStatus = res.status;
				retryAfter =
					typeof data.retryAfter === 'number'
						? data.retryAfter
						: Number(res.headers.get('retry-after')) || null;
				throw new Error(data.error || 'Failed to fetch results');
			}

			const data = await res.json();
			results = data.results || [];
		} catch (err) {
			if (err instanceof Error) {
				if (err.name !== 'AbortError') {
					console.error(err);
					error = err.message || 'An error occurred during search';
					results = [];
				}
			} else {
				console.error(err);
				error = 'An error occurred during search';
				results = [];
			}
		} finally {
			if (!abortController?.signal.aborted) {
				loading = false;
			}
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		inputVal = target.value;

		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		if (inputVal.trim().length >= 3) {
			loading = true; // Set loading state immediately for snappy user feedback
			debounceTimeout = setTimeout(() => {
				performSearch(inputVal);
			}, 800); // 800ms debounce — conserves API quota (100 calls/day free tier)
		} else {
			loading = false;
			results = [];
			error = '';
			errorStatus = null;
			retryAfter = null;
			query = inputVal.trim();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			inputVal = '';
			query = '';
			results = [];
			loading = false;
			error = '';
			errorStatus = null;
			retryAfter = null;
			if (abortController) abortController.abort();
		} else if (e.key === 'Enter') {
			if (results.length > 0) {
				onSelectFirst();
			}
		}
	}

	onDestroy(() => {
		if (debounceTimeout) clearTimeout(debounceTimeout);
		if (abortController) abortController.abort();
	});
</script>

<div class="relative w-full">
	<div class="relative flex items-center">
		<!-- Search Icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="2"
			stroke="currentColor"
			class="pointer-events-none absolute left-4 h-5 w-5 text-text-muted select-none"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"
			/>
		</svg>

		<!-- Search Input Field -->
		<input
			type="text"
			value={inputVal}
			oninput={handleInput}
			onkeydown={handleKeydown}
			placeholder="Search players by name (min. 3 characters)..."
			class="w-full rounded-xl border border-border bg-surface py-3.5 pr-12 pl-12 text-sm font-medium text-text placeholder-text-muted shadow-md transition-all duration-200 outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15 sm:py-4 sm:text-base"
		/>

		<!-- Loading spinner / Clear button -->
		<div class="absolute right-4 flex items-center justify-center">
			{#if loading}
				<!-- Spinner -->
				<svg
					class="h-5 w-5 animate-spin text-gold"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			{:else if inputVal}
				<!-- Clear Button -->
				<button
					onclick={() => {
						inputVal = '';
						query = '';
						results = [];
						loading = false;
						error = '';
						errorStatus = null;
						retryAfter = null;
					}}
					class="cursor-pointer rounded-md p-0.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
					title="Clear search"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="h-4 w-4"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

	{#if loading && query.length >= 3}
		<div class="mt-4 flex flex-col gap-2" aria-label="Loading search results">
			{#each skeletonRows as index (index)}
				<div class="flex items-center gap-4 rounded-xl border border-border bg-surface p-3.5">
					<Skeleton variant="circle" width="3rem" height="3rem" />
					<div class="flex min-w-0 grow flex-col gap-2">
						<Skeleton variant="text" width={index === 1 ? '44%' : '58%'} />
						<Skeleton variant="text" width={index === 2 ? '68%' : '76%'} height="0.75rem" />
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Error / Empty State messaging -->
	{#if error}
		<div class="mt-4">
			<ErrorState
				title={errorStatus === 429 ? 'Rate limit hit' : 'Search unavailable'}
				message={error}
				variant={errorStatus === 429 ? 'rate-limit' : 'api'}
				{retryAfter}
			/>
		</div>
	{:else if query.length >= 3 && !loading && results.length === 0}
		<div class="mt-4">
			<ErrorState
				title="No players found"
				message={`We couldn't find any player matching "${query}".`}
				variant="empty"
			/>
		</div>
	{/if}
</div>
