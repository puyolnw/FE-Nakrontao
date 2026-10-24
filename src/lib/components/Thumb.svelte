<script lang="ts">
	import { safeUrl } from '#lib/util.ts';
	import Illustration, { illustrationFor } from './Illustration.svelte';

	// A real photo when staff uploaded one, otherwise the drawing for the item's category.
	let { src = '', kind, alt = '', ratio = '4 / 3' }: { src?: string; kind: string; alt?: string; ratio?: string } = $props();
	// Stock photos come in 1200–1800px wide; cards never show them larger than ~700px.
	const url = $derived(safeUrl(src)?.replace(/([?&])w=\d+/, '$1w=720'));
</script>

<div class="thumb" style:aspect-ratio={ratio}>
	{#if url}
		<img src={url} {alt} loading="lazy" decoding="async" />
	{:else}
		<Illustration name={illustrationFor(kind)} />
	{/if}
</div>

<style>
	.thumb {
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--bg-sunken);
		border-radius: inherit;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.thumb :global(svg) {
		padding: 12%;
	}
</style>
