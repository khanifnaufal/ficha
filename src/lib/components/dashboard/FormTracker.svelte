<script lang="ts">
	export interface MatchFormItem {
		rating: number;
		date: string;
		opponent: string;
		isHome?: boolean;
	}

	let { matches = [] }: { matches: MatchFormItem[] } = $props();

	function getRatingColorClass(rating: number): string {
		if (rating >= 7.0) {
			return 'bg-green border-green/30 hover:bg-green-400 hover:border-green-300 shadow-[0_0_10px_rgba(45,122,69,0.3)] hover:shadow-[0_0_14px_rgba(45,122,69,0.6)]';
		}
		if (rating >= 5.0) {
			return 'bg-gold border-gold/30 hover:bg-gold-light hover:border-gold/50 shadow-[0_0_10px_rgba(201,168,76,0.3)] hover:shadow-[0_0_14px_rgba(201,168,76,0.6)]';
		}
		return 'bg-red-500 border-red-500/30 hover:bg-red-400 hover:border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:shadow-[0_0_14px_rgba(239,68,68,0.6)]';
	}
</script>

<div class="flex items-center gap-2">
	{#each matches as match, idx (idx)}
		<div class="group relative flex items-center justify-center">
			<!-- Colored Dot -->
			<div
				class="h-7 w-7 rounded-full border cursor-help transition-all duration-300 hover:scale-120 hover:z-10 flex items-center justify-center {getRatingColorClass(match.rating)}"
			>
				<span class="text-[10px] font-bold text-[#0d0d0d] select-none">
					{match.rating.toFixed(1)}
				</span>
			</div>

			<!-- Tooltip -->
			<div
				class="pointer-events-none absolute bottom-full mb-3 flex w-44 flex-col items-center rounded-xl border border-border bg-surface-raised p-2.5 text-center text-xs shadow-2xl opacity-0 scale-95 transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100 z-50"
			>
				<div class="font-bold text-text truncate max-w-full">
					vs {match.opponent}
				</div>
				<div class="text-[10px] text-text-muted mt-0.5">
					{match.date}
				</div>
				<div class="w-full border-t border-border/40 mt-1.5 pt-1.5 flex justify-between items-center">
					<span class="text-[9px] text-text-muted uppercase tracking-wider font-semibold">Match Rating</span>
					<span class="font-extrabold text-gold">{match.rating.toFixed(1)}</span>
				</div>
				<!-- Arrow -->
				<div
					class="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-surface-raised"
				></div>
			</div>
		</div>
	{/each}
</div>
