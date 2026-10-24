<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import { t, tx, tr } from '#lib/i18n.svelte.ts';
	import { reveal } from '#lib/motion.ts';
	import type { Place } from '#lib/types.ts';
	import Thumb from './Thumb.svelte';

	let { p, km = null }: { p: Place; km?: number | null } = $props();
</script>

<a class="card" href="/places/{p.id}" use:reveal>
	<div class="media">
		<Thumb src={p.images[0]} kind={p.category} alt={tr(p.name)} ratio="4 / 3" />
		<span class="tag">{tx(`cat.${p.category}`)}</span>
	</div>
	<div class="body">
		<h3>{tr(p.name)}</h3>
		<p class="desc small muted">{tr(p.description)}</p>
		<div class="meta">
			<span><Clock size={14} /> {p.visit_minutes} {t('common.minutes')}</span>
			{#if km !== null}<span><MapPin size={14} /> {km.toFixed(1)} {t('place.km')}</span>{:else if p.open_hours}<span>{p.open_hours}</span>{/if}
		</div>
	</div>
</a>

<style>
	.media :global(.thumb) {
		border: 0;
		height: 100%;
	}
	.desc {
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	@media (max-width: 640px) {
		.card {
			flex-direction: row;
			align-items: stretch;
		}
		.card .media {
			flex: 0 0 112px;
			aspect-ratio: auto;
		}
		.card .media :global(.tag) {
			display: none;
		}
		.card .body {
			padding: var(--space-3) var(--space-4);
		}
		.card .body h3 {
			min-height: 0;
			font-size: var(--text-body);
		}
		.desc {
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.card .media {
			aspect-ratio: 4 / 3;
		}
	}
	@media (max-width: 699px) {
		.card .body h3 {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
		.card {
			min-height: 158px;
		}
		.desc {
			-webkit-line-clamp: 1 !important;
			line-clamp: 1 !important;
		}
	}
</style>
