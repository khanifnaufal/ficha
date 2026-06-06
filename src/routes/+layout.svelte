<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo.png';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	// Track navigation to drive page transition
	let pageKey = $state(0);
	$effect(() => {
		if ($navigating) {
			pageKey++;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Ficha - Football Intelligence</title>
</svelte:head>

<div class="layout-root">
	<!-- Navbar -->
	<header class="navbar">
		<a href="/" class="nav-brand group">
			<img
				src={logo}
				alt="Ficha Logo"
				class="nav-logo"
			/>
			<span class="nav-title">
				Ficha<span class="nav-dot">.</span>
			</span>
		</a>

		<!-- Right side: theme toggle -->
		<div class="nav-actions">
			<ThemeToggle />
		</div>
	</header>

	<!-- Main content area with page transition -->
	<main class="layout-main">
		{#key pageKey}
			<div in:fade={{ duration: 180, delay: 60 }} out:fade={{ duration: 120 }}>
				{@render children()}
			</div>
		{/key}
	</main>
</div>

<style>
	.layout-root {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: var(--color-bg);
		color: var(--color-text);
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}

	/* ── Navbar ── */
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		height: 4rem;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--color-border);
		background-color: color-mix(in srgb, var(--color-surface) 85%, transparent);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		padding: 0 1.5rem;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease;
	}

	.nav-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--color-text);
	}

	.nav-logo {
		height: 2.25rem;
		width: 2.25rem;
		object-fit: contain;
		transition:
			transform 0.3s ease,
			filter 0.3s ease;
	}

	.nav-brand:hover .nav-logo {
		transform: scale(1.05);
		filter: drop-shadow(0 0 8px rgba(201, 168, 76, 0.4));
	}

	.nav-title {
		font-family: 'Outfit', sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.nav-dot {
		color: var(--color-gold);
		transition: color 0.2s ease;
	}

	.nav-brand:hover .nav-dot {
		color: var(--color-gold-light);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	/* ── Main ── */
	.layout-main {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	/* Ensure the transition wrapper fills the space */
	.layout-main > div {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}
</style>
