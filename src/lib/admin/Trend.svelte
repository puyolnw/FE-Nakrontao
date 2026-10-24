<script lang="ts">
	// Daily series as a column chart in inline SVG; one column per day, value on hover.
	let { rows }: { rows: { key: string; count: number }[] } = $props();
	const w = 640;
	const h = 140;
	const max = $derived(Math.max(1, ...rows.map((r) => r.count)));
	const bw = $derived(rows.length ? w / rows.length : w);
</script>

<svg viewBox="0 0 {w} {h + 18}" role="img" aria-label="daily page views">
	<line x1="0" y1={h} x2={w} y2={h} class="axis" />
	{#each rows as r, i (r.key)}
		<rect x={i * bw + 1} y={h - (r.count / max) * h} width={Math.max(1, bw - 2)} height={(r.count / max) * h}>
			<title>{r.key}: {r.count}</title>
		</rect>
	{/each}
	{#if rows.length}
		<text x="0" y={h + 14}>{rows[0].key}</text>
		<text x={w} y={h + 14} text-anchor="end">{rows[rows.length - 1].key}</text>
		<text x={w} y="10" text-anchor="end">max {max}</text>
	{/if}
</svg>

<style>
	svg {
		width: 100%;
		height: auto;
		display: block;
	}
	rect {
		fill: var(--accent);
	}
	rect:hover {
		fill: var(--fg);
	}
	.axis {
		stroke: var(--line-strong);
	}
	text {
		font-size: 13px;
		fill: var(--fg-muted);
		font-family: var(--font-body);
	}
</style>
