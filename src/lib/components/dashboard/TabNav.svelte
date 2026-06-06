<script lang="ts">
	let {
		tabs = [],
		activeTab = '',
		onSelect
	}: {
		tabs: string[];
		activeTab: string;
		onSelect: (tab: string) => void;
	} = $props();
</script>

<div class="w-full border-b border-border bg-surface/20 backdrop-blur-sm select-none">
	<nav class="mx-auto flex max-w-7xl -mb-px space-x-8 overflow-x-auto px-4 sm:px-6 lg:px-8 scrollbar-none" aria-label="Player profile navigation">
		{#each tabs as tab (tab)}
			<button
				type="button"
				onclick={() => onSelect(tab)}
				class="group relative cursor-pointer whitespace-nowrap py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 outline-none focus:outline-none {activeTab === tab ? 'text-gold drop-shadow-[0_0_8px_rgba(201,168,76,0.3)]' : 'text-text-muted hover:text-text'}"
			>
				{tab}
				
				<!-- Underline indicator -->
				<span
					class="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-gold transition-all duration-300 transform origin-left {activeTab === tab ? 'scale-x-100 opacity-100 shadow-[0_0_8px_var(--color-gold)]' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-40 group-hover:bg-gold/50'}"
				></span>
			</button>
		{/each}
	</nav>
</div>

<style>
	/* Hide default scrollbars but keep functionality */
	.scrollbar-none::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-none {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
