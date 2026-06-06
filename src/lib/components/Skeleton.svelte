<script lang="ts">
	type SkeletonVariant = 'text' | 'card' | 'circle';

	let {
		variant = 'text',
		lines = 1,
		className = '',
		width = '',
		height = ''
	}: {
		variant?: SkeletonVariant;
		lines?: number;
		className?: string;
		width?: string;
		height?: string;
	} = $props();

	const baseClass =
		'overflow-hidden border border-border/50 bg-surface-raised/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]';

	const variantClass = $derived(
		variant === 'circle' ? 'rounded-full' : variant === 'card' ? 'rounded-xl' : 'rounded-md'
	);

	const defaultSize = $derived(
		variant === 'circle'
			? 'height: 3rem; width: 3rem;'
			: variant === 'card'
				? 'height: 5rem; width: 100%;'
				: 'height: 0.875rem; width: 100%;'
	);

	const styleAttr = $derived(
		`${defaultSize}${width ? ` width: ${width};` : ''}${height ? ` height: ${height};` : ''}`
	);
	const lineIndexes = $derived(Array.from({ length: lines }, (_value, index) => index));
</script>

{#if variant === 'text' && lines > 1}
	<div class="flex flex-col gap-2 {className}" aria-hidden="true">
		{#each lineIndexes as index (index)}
			<div
				class="skeleton {baseClass} {variantClass}"
				style="{styleAttr}{index === lines - 1 ? ' width: 70%;' : ''}"
			></div>
		{/each}
	</div>
{:else}
	<div
		class="skeleton {baseClass} {variantClass} {className}"
		style={styleAttr}
		aria-hidden="true"
	></div>
{/if}

<style>
	.skeleton {
		position: relative;
	}

	.skeleton::after {
		position: absolute;
		inset: 0;
		content: '';
		transform: translateX(-100%);
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--color-gold) 16%, transparent),
			transparent
		);
		animation: shimmer 1.45s ease-in-out infinite;
	}

	@keyframes shimmer {
		100% {
			transform: translateX(100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton::after {
			animation: none;
		}
	}
</style>
