<script lang="ts">
	import { tx, tr } from '#lib/i18n.svelte.ts';
	import { t } from '#lib/i18n.svelte.ts';
	import { reveal } from '#lib/motion.ts';
	import type { Knowledge } from '#lib/types.ts';
	import Thumb from './Thumb.svelte';

	let { k }: { k: Knowledge } = $props();
</script>

<a class="card" href="/history/{k.id}" use:reveal>
	<div class="media">
		<Thumb src={k.cover_url} kind={k.kind} alt={tr(k.title)} ratio="16 / 10" />
		<span class="tag">{tx(`kind.${k.kind}`)}</span>
	</div>
	<div class="body">
		<h3>{tr(k.title)}</h3>
		<p class="desc small muted">{tr(k.body).replace(/(^|\s)\d+\.\s+/g, '$1')}</p>
	</div>
</a>

<style>
	.media :global(.thumb) {
		border: 0;
		height: 100%;
	}
	.card .media {
		aspect-ratio: 16 / 10;
	}
	.desc {
		margin: 0;
		min-height: 3lh;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.desc {
		min-height: 3lh;
	}
</style>
