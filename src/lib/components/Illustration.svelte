<script lang="ts" module>
	export type IllustrationName = 'shrine' | 'moat' | 'offering' | 'rain' | 'food' | 'market' | 'house';

	/** Which drawing stands in for an item that has no photo yet. */
	export function illustrationFor(key: string): IllustrationName {
		const map: Record<string, IllustrationName> = {
			sacred: 'shrine',
			belief: 'shrine',
			history: 'moat',
			culture: 'offering',
			ritual: 'offering',
			practice: 'offering',
			community: 'market',
			shop: 'market',
			product: 'market',
			food: 'food',
			stay: 'house',
			event: 'rain'
		};
		return map[key] ?? 'shrine';
	}
</script>

<script lang="ts">
	// Hand-drawn line illustrations in the site palette. Decorative only: real photos uploaded by
	// staff always take precedence (see Thumb.svelte).
	let { name, label = '' }: { name: IllustrationName; label?: string } = $props();
</script>

<svg viewBox="0 0 240 180" role={label ? 'img' : 'presentation'} aria-label={label || undefined} aria-hidden={label ? undefined : 'true'}>
	{#if name === 'shrine'}
		<path class="soft" d="M20 164 H220" />
		<path class="ink" d="M112 40 v-12 M108 30 h8" />
		<circle class="gold" cx="112" cy="24" r="4" />
		<path class="tile" d="M84 66 Q112 34 140 66 Z" transform="translate(0 2)" />
		<path class="tile" d="M70 66 H154 L170 80 H54 Z" />
		<path class="ink" d="M54 80 q-8 0 -12 -8 M170 80 q8 0 12 -8" />
		<rect class="paper" x="64" y="80" width="96" height="58" />
		<rect class="lac" x="66" y="80" width="8" height="58" />
		<rect class="lac" x="150" y="80" width="8" height="58" />
		<path class="lac" d="M44 92 H180 L170 84 H54 Z" />
		<path class="ink" d="M44 92 q-6 0 -9 -6 M180 92 q6 0 9 -6" />
		<path class="dark" d="M98 138 V112 Q112 98 126 112 V138 Z" />
		<path class="gold-line" d="M86 100 h52" />
		<rect class="paper" x="52" y="138" width="120" height="10" />
		<rect class="paper" x="40" y="148" width="144" height="10" />
		<rect class="lac" x="104" y="150" width="16" height="10" />
		<path class="smoke" d="M108 148 q-6 -10 0 -18 t0 -18 M116 148 q6 -12 0 -20 t2 -18" />
		<path class="ink" d="M196 164 v-34 M190 136 h12 M192 130 h8" />
		<circle class="gold" cx="196" cy="126" r="3" />
		<path class="leaf" d="M26 164 q4 -26 18 -34 q-2 18 -18 34 M34 164 q10 -18 24 -20 q-8 14 -24 20" />
	{:else if name === 'moat'}
		<path class="jade-line wide" d="M40 92 C40 46 96 26 128 30 C176 34 206 62 200 100 C194 140 150 156 112 152 C68 148 40 130 40 92 Z" />
		<path class="jade-line" d="M54 92 C56 56 100 42 128 44 C166 48 188 70 184 100 C180 130 146 142 114 138 C78 134 54 122 54 92 Z" />
		<path class="soft" d="M72 92 C74 66 104 56 126 58 C156 62 170 78 166 100 C162 122 138 128 114 126 C88 124 72 114 72 92 Z" />
		<circle class="lac" cx="118" cy="92" r="6" />
		<circle class="ink-dot" cx="98" cy="80" r="2.5" />
		<circle class="ink-dot" cx="140" cy="104" r="2.5" />
		<circle class="ink-dot" cx="132" cy="76" r="2.5" />
		<path class="ink" d="M118 92 L140 104 M118 92 L98 80 M118 92 L132 76" stroke-dasharray="2 3" />
		<path class="soft" d="M10 120 C30 112 30 128 50 120 M196 46 C210 40 214 52 232 44" />
		<g transform="translate(204 140)">
			<circle class="ink" r="14" />
			<path class="lac" d="M0 -12 L4 0 L0 12 L-4 0 Z" />
			<text class="label" y="-17" text-anchor="middle">N</text>
		</g>
		<path class="ink" d="M20 30 h28 M20 30 v6 M48 30 v6 M34 30 v4" />
	{:else if name === 'offering'}
		<path class="soft" d="M20 160 H220" />
		<path class="paper" d="M60 160 L66 128 H174 L180 160 Z" />
		<path class="ink" d="M60 160 H180" />
		<path class="gold-line" d="M70 140 H170" />
		<path class="lac" d="M98 128 h44 l-6 -14 h-32 Z" />
		<path class="ink" d="M112 114 L106 48 M120 114 V44 M128 114 L134 48" />
		<circle class="lac" cx="106" cy="46" r="2" />
		<circle class="lac" cx="120" cy="42" r="2" />
		<circle class="lac" cx="134" cy="46" r="2" />
		<path class="smoke" d="M106 42 q-6 -8 0 -16 t0 -14 M120 38 q6 -8 0 -16 t2 -14 M134 42 q-4 -10 2 -18" />
		<rect class="paper" x="76" y="86" width="10" height="42" />
		<rect class="paper" x="154" y="86" width="10" height="42" />
		<path class="gold" d="M81 86 q-5 -8 0 -14 q5 6 0 14 Z M159 86 q-5 -8 0 -14 q5 6 0 14 Z" />
		<g class="flower">
			<circle cx="40" cy="132" r="9" /><circle cx="52" cy="122" r="8" /><circle cx="36" cy="116" r="7" />
			<circle cx="200" cy="132" r="9" /><circle cx="188" cy="122" r="8" /><circle cx="204" cy="116" r="7" />
		</g>
		<path class="leaf" d="M40 160 V140 M52 160 V130 M200 160 V140 M188 160 V130" />
	{:else if name === 'rain'}
		<path class="paper" d="M50 64 q0 -24 26 -24 q8 -18 30 -14 q14 -14 34 -2 q26 -4 28 22 q20 2 18 18 H52 q-12 0 -2 0 Z" />
		<path class="rain" d="M70 78 l-6 16 M92 80 l-6 16 M114 78 l-6 16 M136 80 l-6 16 M158 78 l-6 16 M80 100 l-6 16 M124 102 l-6 16 M168 98 l-6 16" />
		<path class="jade-line" d="M10 160 H230" />
		<path class="water" d="M20 168 q10 -4 20 0 t20 0 M120 172 q10 -4 20 0 t20 0 M180 166 q10 -4 20 0" />
		{#each [30, 60, 90, 120, 150, 180, 210] as x (x)}
			<path class="leaf" d="M{x} 160 q-6 -14 -10 -20 M{x} 160 q0 -16 2 -24 M{x} 160 q6 -14 12 -18" />
		{/each}
		<circle class="gold" cx="200" cy="30" r="10" />
	{:else if name === 'food'}
		<path class="soft" d="M20 160 H220" />
		<path class="paper" d="M40 116 H136 Q132 152 88 154 Q44 152 40 116 Z" />
		<path class="lac" d="M40 116 H136 v6 H40 Z" />
		<path class="jade-line" d="M56 116 q10 -14 22 -4 q8 -12 20 0 q10 -10 22 4" />
		<path class="paper" d="M156 156 L150 84 Q170 72 190 84 L184 156 Z" />
		<path class="gold-line" d="M152 100 H188 M153 116 H187 M154 132 H186 M155 146 H185" />
		<path class="ink" d="M150 84 Q170 60 190 84" />
		<path class="ink" d="M160 74 q10 -10 20 0" />
		<path class="leaf" d="M200 156 q8 -20 20 -24 q-4 16 -20 24" />
	{:else if name === 'market'}
		<path class="soft" d="M14 164 H226" />
		<path class="ink" d="M40 164 V78 M200 164 V78" />
		<path class="lac" d="M30 78 H210 L200 56 H40 Z" />
		<path class="paper" d="M30 78 q15 12 30 0 q15 12 30 0 q15 12 30 0 q15 12 30 0 q15 12 30 0 q15 12 30 0" />
		<rect class="paper" x="52" y="116" width="136" height="12" />
		<path class="ink" d="M60 128 V164 M180 128 V164" />
		<circle class="gold" cx="76" cy="108" r="8" /><circle class="gold" cx="92" cy="110" r="6" />
		<path class="jade" d="M118 116 q6 -18 12 0 Z M134 116 q6 -22 12 0 Z" />
		<rect class="lac" x="158" y="100" width="18" height="16" />
		<path class="ink" d="M158 100 l9 -6 l9 6" />
	{:else}
		<path class="soft" d="M14 164 H226" />
		<path class="ink" d="M60 164 V112 M180 164 V112 M100 164 V112 M140 164 V112" />
		<rect class="paper" x="50" y="80" width="140" height="34" />
		<path class="tile" d="M40 82 L120 36 L200 82 Z" />
		<path class="ink" d="M120 36 L120 26 M40 82 l-8 -4 M200 82 l8 -4" />
		<rect class="lac" x="108" y="88" width="24" height="26" />
		<rect class="paper" x="66" y="90" width="18" height="14" />
		<rect class="paper" x="156" y="90" width="18" height="14" />
		<path class="ink" d="M186 114 L210 164 M196 132 h14 M202 148 h12" />
		<path class="leaf" d="M24 164 q4 -30 22 -40 q-2 22 -22 40" />
	{/if}
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
		display: block;
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.ink {
		stroke: var(--fg);
		stroke-width: 1.6;
	}
	.ink-dot {
		fill: var(--fg);
	}
	.soft {
		stroke: var(--fg-faint);
		stroke-width: 1.2;
	}
	.paper {
		fill: var(--bg-raised);
		stroke: var(--fg);
		stroke-width: 1.6;
	}
	.lac {
		fill: var(--accent);
		stroke: var(--fg);
		stroke-width: 1.2;
	}
	.tile,
	.dark {
		fill: var(--fg);
		stroke: var(--fg);
		stroke-width: 1.2;
	}
	.gold {
		fill: var(--date);
		stroke: var(--fg);
		stroke-width: 1;
	}
	.gold-line {
		stroke: var(--date);
		stroke-width: 2;
	}
	.jade {
		fill: var(--ok);
		stroke: var(--fg);
		stroke-width: 1;
	}
	.jade-line {
		stroke: var(--ok);
		stroke-width: 2;
	}
	.wide {
		stroke-width: 6;
		opacity: 0.35;
	}
	.leaf {
		stroke: var(--ok);
		stroke-width: 1.6;
	}
	.flower circle {
		fill: var(--date);
		stroke: var(--fg);
		stroke-width: 1;
	}
	.smoke {
		stroke: var(--fg-faint);
		stroke-width: 1.2;
	}
	.rain {
		stroke: var(--ok);
		stroke-width: 1.6;
	}
	.water {
		stroke: var(--ok);
		stroke-width: 1.2;
	}
	.label {
		fill: var(--fg);
		font: 600 10px var(--font-body);
	}
</style>
