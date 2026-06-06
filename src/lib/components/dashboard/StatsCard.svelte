<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		value,
		icon
	}: {
		label: string;
		value: string | number;
		icon?: Snippet;
	} = $props();
</script>

<div
	class="flex items-center gap-4 rounded-xl border border-border bg-surface p-4.5 transition-all duration-300 hover:border-gold/30 hover:bg-surface-raised hover:shadow-[0_4px_20px_rgba(201,168,76,0.06)]"
>
	{#if icon}
		<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold/20">
			{@render icon()}
		</div>
	{/if}
	<div class="min-w-0 flex-1">
		<p class="truncate text-xs font-semibold tracking-wider text-text-muted uppercase">
			{label}
		</p>
		<p class="mt-1 text-2xl font-extrabold tracking-tight text-gold sm:text-3xl">
			{value}
		</p>
	</div>
</div>
