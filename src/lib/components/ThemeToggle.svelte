<script lang="ts">
	import { onMount } from 'svelte';

	let isDark = $state(true);

	onMount(() => {
		const savedTheme = localStorage.getItem('ficha_theme');
		isDark = savedTheme !== 'light';
	});

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.remove('light');
			localStorage.setItem('ficha_theme', 'dark');
		} else {
			document.documentElement.classList.add('light');
			localStorage.setItem('ficha_theme', 'light');
		}
	}
</script>

<button
	onclick={toggleTheme}
	id="theme-toggle-btn"
	class="theme-toggle-btn"
	aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
	title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
	{#if isDark}
		<!-- Sun icon: shown in dark mode to switch to light -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="icon sun"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
			/>
		</svg>
	{:else}
		<!-- Moon icon: shown in light mode to switch to dark -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="icon moon"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
			/>
		</svg>
	{/if}
</button>

<style>
	.theme-toggle-btn {
		display: flex;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		border-radius: 0.75rem;
		border: 1px solid var(--color-border);
		background-color: var(--color-surface-raised);
		padding: 0.625rem;
		color: var(--color-text-muted);
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.theme-toggle-btn:hover {
		border-color: rgba(201, 168, 76, 0.5);
		background-color: var(--color-surface);
		color: var(--color-text);
		transform: scale(1.05);
		box-shadow: 0 0 12px rgba(201, 168, 76, 0.15);
	}

	.theme-toggle-btn:active {
		transform: scale(0.95);
	}

	.icon {
		width: 1.25rem;
		height: 1.25rem;
		transition: transform 0.3s ease;
	}

	.icon.sun {
		color: var(--color-gold-light);
	}

	.icon.moon {
		color: var(--color-gold);
	}
</style>
