<script lang="ts">
	type ErrorVariant = 'not-found' | 'api' | 'rate-limit' | 'empty';
	type ErrorAction = {
		label: string;
		onclick: () => void;
	};

	let {
		title,
		message,
		variant = 'api',
		retryAfter,
		action
	}: {
		title: string;
		message: string;
		variant?: ErrorVariant | string;
		retryAfter?: number | null;
		action?: ErrorAction;
	} = $props();

	const accentClass = $derived(
		variant === 'rate-limit'
			? 'text-gold border-gold/25 bg-gold/10'
			: variant === 'empty'
				? 'text-text-muted border-border bg-surface/50'
				: variant === 'not-found'
					? 'text-gold-light border-gold/20 bg-gold/10'
					: 'text-red-400 border-red-500/20 bg-red-500/10'
	);

	const iconPath = $derived(
		variant === 'empty'
			? 'M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
			: variant === 'rate-limit'
				? 'M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z'
				: variant === 'not-found'
					? 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.178-.43.326-.67.442-.745.361-1.451.999-1.451 1.827V14.25M12 17.25h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
					: 'M12 9v3.75m0 3.75h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
	);
</script>

<section
	class="flex w-full flex-col items-center rounded-xl border border-border bg-surface/40 px-6 py-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
	role={variant === 'empty' ? 'status' : 'alert'}
>
	<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full border {accentClass}">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.7"
			stroke="currentColor"
			class="h-6 w-6"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d={iconPath} />
		</svg>
	</div>

	<h2 class="text-base font-extrabold text-text sm:text-lg">{title}</h2>
	<p class="mt-2 max-w-md text-sm leading-6 text-text-muted">{message}</p>

	{#if variant === 'rate-limit' && retryAfter}
		<p class="mt-2 text-xs font-bold tracking-wider text-gold uppercase">
			Try again in {retryAfter} seconds
		</p>
	{/if}

	{#if action}
		<button
			type="button"
			onclick={action.onclick}
			class="mt-5 cursor-pointer rounded-lg border border-gold/30 bg-gold px-4 py-2 text-sm font-bold text-on-gold shadow-[0_10px_28px_rgba(201,168,76,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-light focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none"
		>
			{action.label}
		</button>
	{/if}
</section>
