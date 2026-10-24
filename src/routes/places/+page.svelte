<script lang="ts">
	import PlaceCard from '#lib/components/PlaceCard.svelte';
	import Search from '@lucide/svelte/icons/search';
	import LocateFixed from '@lucide/svelte/icons/locate-fixed';
	import { photos } from '#lib/photos.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Thumb from '#lib/components/Thumb.svelte';
	import { i18n, t, tx, tr } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { geo, locate } from '#lib/geo.svelte.ts';
	import { haversineKm, numeral } from '#lib/util.ts';
	import { qs } from '#lib/api.ts';
	import Status from '#lib/components/Status.svelte';
	import MapView from '#lib/components/MapView.svelte';
	import type { Pin, Place } from '#lib/types.ts';

	const cats = ['sacred', 'history', 'culture', 'community', 'food', 'stay'] as const;
	let category = $state('');
	let q = $state('');
	let applied = $state('');
	const list = resource<Place[]>(() => `/api/v1/places${qs({ category, q: applied })}`);

	const rows = $derived.by(() => {
		const data = (list.data ?? []).map((p) => ({
			p,
			km: geo.lat !== null && geo.lon !== null ? haversineKm(geo.lat, geo.lon, p.lat, p.lon) : null
		}));
		return geo.lat !== null ? data.sort((a, b) => a.km! - b.km!) : data;
	});
	const pins = $derived<Pin[]>([
		...rows.map(({ p }) => ({ lat: p.lat, lon: p.lon, label: tr(p.name), href: `/places/${p.id}`, kind: p.category === 'sacred' ? ('sacred' as const) : ('other' as const) })),
		...(geo.lat !== null ? [{ lat: geo.lat, lon: geo.lon!, label: t('place.myLocation'), kind: 'me' as const }] : [])
	]);
</script>

<PageHead n={3} section={t('nav.places')} title={t('nav.places')} lead={t('lead.places')} art="moat" photo={photos.places} />
<div class="wrap page">

	<form class="filters lux" onsubmit={(e) => (e.preventDefault(), (applied = q.trim()))}>
		<div class="top">
			<label class="searchbox">
				<Search size={20} />
				<span class="visually-hidden">{t('common.search')}</span>
				<input type="search" bind:value={q} maxlength="100" placeholder={t('common.search')} onchange={() => (applied = q.trim())} />
			</label>
			<button class="icon-btn" class:on={geo.lat !== null} type="button" onclick={locate} disabled={geo.busy} aria-label={t('place.locate')} title={t('place.locate')}><LocateFixed size={22} /></button>
		</div>
		<div class="chip-row" role="group" aria-label={t('common.all')}>
			<button type="button" class="chip" aria-pressed={category === ''} onclick={() => (category = '')}>{t('common.all')}</button>
			{#each cats as c (c)}
				<button type="button" class="chip" aria-pressed={category === c} onclick={() => (category = c)}>{tx(`cat.${c}`)}</button>
			{/each}
		</div>
		{#if list.data}<p class="count muted">{list.data.length} {t('nav.places')}{#if geo.lat !== null} · {t('place.nearby')}{/if}</p>{/if}
	</form>

	<div class="mapbox"><MapView {pins} height="clamp(220px, 38vh, 420px)" /></div>
	<Status loading={list.loading} error={list.error} empty={list.data?.length === 0} />
	<div class="grid">
		{#each rows as { p, km } (p.id)}<PlaceCard {p} {km} />{/each}
	</div>
</div>

<style>
	.filters {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
		margin: var(--space-5) 0;
	}
	.top {
		display: flex;
		gap: var(--space-2);
	}
	.top .searchbox {
		flex: 1;
	}
	.count {
		margin: 0;
		font-size: var(--text-small);
	}
	.mapbox {
		border-radius: var(--radius-l);
		overflow: hidden;
		margin-bottom: var(--space-6);
		box-shadow: var(--shadow-1);
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.mapbox :global(.map) {
			height: 340px !important;
		}
	}
</style>
