<script lang="ts">
	// Horizontal bar list: label, bar, value. Readable at any width and needs no chart library.
	let { rows, label = (k: string) => k }: { rows: { key: string; count: number }[]; label?: (k: string) => string } = $props();
	const max = $derived(Math.max(1, ...rows.map((r) => r.count)));
</script>

{#if rows.length}
	<ul>
		{#each rows as r (r.key)}
			<li>
				<span class="k" title={r.key}>{label(r.key)}</span>
				<span class="bar"><span style:width="{(r.count / max) * 100}%"></span></span>
				<span class="v">{r.count.toLocaleString()}</span>
			</li>
		{/each}
	</ul>
{:else}
	<p class="muted small">—</p>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-1);
	}
	li {
		display: grid;
		grid-template-columns: minmax(80px, 38%) 1fr 6ch;
		gap: var(--space-2);
		align-items: center;
		font-size: var(--text-small);
	}
	.k {
		/* Room above for tall Thai marks: this label clips its own overflow. */
		padding-top: 0.5em;
		line-height: 1.6;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.bar {
		height: 10px;
		background: var(--bg-sunken);
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	.v {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>
