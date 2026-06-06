<script lang="ts">
	import { onDestroy } from 'svelte';
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
			query = trimmed;
			return;
		}

		query = trimmed;
		loading = true;
		error = '';

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
				const data = await res.json();
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
					}}
					class="cursor-pointer rounded-md p-0.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
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

	<!-- Error / Empty State messaging -->
	{#if error}
		<div class="mt-3 flex items-center gap-1.5 px-1 text-xs font-medium text-red-500/90">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-4 w-4 text-red-500"
			>
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
					clip-rule="evenodd"
				/>
			</svg>
			{error}
		</div>
	{:else if query.length >= 3 && !loading && results.length === 0}
		<div
			class="mt-4 rounded-xl border border-dashed border-border bg-surface/30 p-6 text-center text-text-muted"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="mx-auto mb-2 h-8 w-8 text-text-muted/50"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
				/>
			</svg>
			<p class="text-sm font-semibold text-text sm:text-base">No players found</p>
			<p class="mt-1 text-xs text-text-muted/80">We couldn't find any player matching "{query}"</p>
		</div>
	{/if}
</div>
