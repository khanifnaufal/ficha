<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo.png';
	import { onMount } from 'svelte';

	let { children } = $props();
	let isDark = $state(true);

	onMount(() => {
		const savedTheme = localStorage.getItem('ficha_theme');
		if (savedTheme === 'light') {
			isDark = false;
			document.documentElement.classList.add('light');
		} else {
			isDark = true;
			document.documentElement.classList.remove('light');
		}
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

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Ficha - Football Intelligence</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-bg text-text transition-colors duration-200">
	<!-- Navbar -->
	<header
		class="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-surface/85 px-6 backdrop-blur-md"
	>
		<a href="/" class="group flex items-center gap-2">
			<img
				src={logo}
				alt="Ficha Logo"
				class="h-9 w-9 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]"
			/>

			<span class="font-heading text-2xl font-bold tracking-wider">
				Ficha<span class="text-gold transition-colors group-hover:text-gold-light">.</span>
			</span>
		</a>

		<!-- Theme Toggle Button -->
		<button
			onclick={toggleTheme}
			class="flex cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-raised p-2.5 text-text-muted transition-all duration-200 hover:border-gold/50 hover:bg-surface hover:text-text"
			aria-label="Toggle Theme"
		>
			{#if isDark}
				<!-- Sun Icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 text-gold-light"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
					/>
				</svg>
			{:else}
				<!-- Moon Icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5 text-gold"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
					/>
				</svg>
			{/if}
		</button>
	</header>

	<!-- Main content area -->
	<main class="flex grow flex-col">
		{@render children()}
	</main>
</div>
