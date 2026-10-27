<script lang="ts">
	import { page } from '$app/state';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Clock from '@lucide/svelte/icons/clock';
	import Footprints from '@lucide/svelte/icons/footprints';
	import Car from '@lucide/svelte/icons/car';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Ticket from '@lucide/svelte/icons/ticket';
	import Phone from '@lucide/svelte/icons/phone';
	import { t, tx, tr } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { directionsUrl, haversineKm, paragraphs, safeUrl, share } from '#lib/util.ts';
	import { photos } from '#lib/photos.ts';
	import { clipReveal, reveal } from '#lib/motion.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Status from '#lib/components/Status.svelte';
	import MapView from '#lib/components/MapView.svelte';
	import type { Place, Shop } from '#lib/types.ts';

	const id = $derived(/^\d+$/.test(page.params.id ?? '') ? page.params.id : null);
	const place = resource<Place>(() => (id ? `/api/v1/places/${id}` : null));
	const all = resource<Place[]>(() => '/api/v1/places');
	const shops = resource<Shop[]>(() => '/api/v1/shops');

	// Scope 3.8: nearby places and services from stored coordinates.
	const nearby = $derived.by(() => {
		const p = place.data;
		if (!p) return [];
		const ps = (all.data ?? []).filter((x) => x.id !== p.id).map((x) => ({ name: tr(x.name), href: `/places/${x.id}`, km: haversineKm(p.lat, p.lon, x.lat, x.lon), kind: tx(`cat.${x.category}`) }));
		const ss = (shops.data ?? []).filter((s) => s.lat !== null && s.lon !== null).map((s) => ({ name: tr(s.name), href: `/community/${s.id}`, km: haversineKm(p.lat, p.lon, s.lat!, s.lon!), kind: tx(`cat.${s.kind === 'product' || s.kind === 'shop' ? 'community' : s.kind}`) }));
		return [...ps, ...ss].filter((x) => x.km <= 5).sort((a, b) => a.km - b.km).slice(0, 8);
	});
	const filled = (v: string | null | undefined) => !!v && !/^[\s\-–—]*$/.test(v);
	const imgs = $derived((place.data?.images ?? []).map(safeUrl).filter((u): u is string => !!u));

	let shared = $state('');
	async function onShare() {
		const r = await share(location.href, tr(place.data?.name));
		shared = r === 'copied' ? t('common.copied') : '';
	}
</script>

{#if place.data}
	{@const p = place.data}
	<PageHead section={tx(`cat.${p.category}`)} title={tr(p.name)} lead={paragraphs(tr(p.description))[0] ?? ''} photo={imgs[0] ?? photos.places}>
		<div class="hero-actions">
			<a class="btn accent" href={directionsUrl(p.lat, p.lon, 'walking')} target="_blank" rel="noopener noreferrer"><Footprints size={18} /> {t('place.walkShort')}</a>
			<a class="btn ghost" href={directionsUrl(p.lat, p.lon, 'driving')} target="_blank" rel="noopener noreferrer"><Car size={18} /> {t('place.driveShort')}</a>
			<button class="icon-btn" onclick={onShare} aria-label={t('common.share')} title={t('common.share')}><Share2 size={20} /></button>
			{#if shared}<span class="small" role="status">{shared}</span>{/if}
		</div>
	</PageHead>

	<div class="wrap section">
		<div class="facts" use:reveal={{ children: true }}>
			{#if filled(p.open_hours)}<div><Clock size={22} /><span>{t('place.hours')}</span><strong>{p.open_hours}</strong></div>{/if}
			<div><Clock size={22} /><span>{t('place.visit')}</span><strong>{p.visit_minutes} {t('common.minutes')}</strong></div>
			<div><Ticket size={22} /><span>{t('place.fee')}</span><strong>{filled(p.fee) ? p.fee : t('place.free')}</strong></div>
			{#if filled(p.contact)}<div><Phone size={22} /><span>{t('place.contact')}</span><strong>{p.contact}</strong></div>{/if}
		</div>

		<div class="cols" class:solo={paragraphs(tr(p.description)).length <= 1}>
			<div>
				{#if paragraphs(tr(p.description)).length > 1}
					<section class="about-place">
						<div class="section-head"><div><p class="eyebrow">{t('nav.places')}</p><h2>{t('place.about')}</h2></div></div>
						{#each paragraphs(tr(p.description)) as para, i (i)}<p>{para}</p>{/each}
					</section>
				{/if}
				{#if imgs.length}
					<div class="gallery">
						{#each imgs as src, i (src)}
							<figure class:wide={i === 0 && imgs.length !== 2} use:clipReveal><img {src} alt="{tr(p.name)} {i + 1}" loading="lazy" /></figure>
						{/each}
					</div>
				{/if}
				{#if p.source}<p class="small muted">{t('common.source')}: {p.source}</p>{/if}
			</div>
			<aside use:reveal>
				<div><div class="map"><MapView pins={[{ lat: p.lat, lon: p.lon, label: tr(p.name), kind: p.category === 'sacred' ? 'sacred' : 'other' }]} height="300px" /></div></div>
				<div>
				{#if nearby.length}
					<div class="section-head h-near"><div><p class="eyebrow">{t('nav.places')}</p><h2>{t('place.nearby')}</h2></div></div>
					<ul class="near lux">
						{#each nearby as n (n.href + n.name)}
							<li>
								<a href={n.href}>
									<span><strong>{n.name}</strong><small>{n.kind}</small></span>
									<em>{n.km.toFixed(1)} {t('place.km')}</em>
									<ArrowUpRight size={16} />
								</a>
							</li>
						{/each}
					</ul>
				{/if}
				</div>
			</aside>
		</div>
	</div>
{:else}
	<div class="wrap page"><Status loading={place.loading} error={place.error} /></div>
{/if}

<style>
	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		margin-top: var(--space-5);
	}

	.facts {
		display: grid;
		grid-template-columns: none;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		gap: var(--space-3);
		margin-bottom: var(--space-7);
	}
	@media (max-width: 640px) {
		/* Phones: one fact per row — icon, label, value on a single line. */
		.facts {
			grid-auto-flow: row;
			gap: var(--space-2);
		}
		.facts div {
			grid-template-columns: auto 1fr auto;
			align-items: center;
			gap: var(--space-3);
			padding: var(--space-3) var(--space-4);
		}
		.facts div :global(svg) {
			margin: 0;
		}
		.facts strong {
			font-size: var(--text-body) !important;
		}
	}
	@media (min-width: 860px) {
		/* however many facts there are, they share one row */
		.facts {
			grid-template-columns: none;
			grid-auto-flow: column;
			grid-auto-columns: 1fr;
		}
	}
	.facts div {
		display: grid;
		gap: 4px;
		padding: var(--space-5);
		border-radius: var(--radius-l);
		background: linear-gradient(180deg, rgb(255 255 255 / 0.035), transparent 50%), var(--bg-raised);
		box-shadow: inset 0 0 0 1px rgb(241 198 106 / 0.18), var(--shadow-1);
	}
	.facts :global(svg) {
		color: var(--accent);
		margin-bottom: var(--space-2);
	}
	.facts span {
		font-size: var(--text-small);
		color: var(--fg-muted);
	}
	.facts strong {
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
		font-family: var(--font-head);
		font-size: var(--text-title);
		font-weight: 500;
	}
	.cols {
		display: grid;
		gap: var(--space-6);
	}
	@media (min-width: 960px) {
		.cols {
			grid-template-columns: 1.5fr 1fr;
			align-items: start;
		}
		aside {
			position: sticky;
			top: 100px;
		}
	}
	.gallery {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin: 0 0 var(--space-5);
	}
	.gallery figure {
		margin: 0;
		overflow: hidden;
		border-radius: var(--radius-l);
		aspect-ratio: 4 / 3;
	}
	.gallery figure.wide {
		grid-column: 1 / -1;
		aspect-ratio: 16 / 9;
	}
	.gallery img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.map {
		border-radius: var(--radius-l);
		overflow: hidden;
	}
	.h-near {
		margin: var(--space-5) 0 var(--space-2);
	}
	.near {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.near a {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: var(--space-3);
		align-items: center;
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--line);
		transition: padding 400ms var(--ease-out);
	}
	.near a:hover {
		padding-left: var(--space-2);
	}
	.near span {
		display: grid;
	}
	.near small {
		color: var(--fg-muted);
	}
	.near em {
		font-style: normal;
		font-family: var(--font-mono);
		font-size: var(--text-small);
		color: var(--fg-muted);
	}
	/* Little text: photos and the map/nearby list each take a full-width row. */
	@media (min-width: 960px) {
		.cols.solo {
			grid-template-columns: 1fr;
		}
		.cols.solo aside {
			position: static;
			display: grid;
			grid-template-columns: 1.2fr 1fr;
			gap: var(--space-6);
			align-items: start;
		}
		.cols.solo .h-near {
			margin-top: 0;
		}
	}
	.hero-actions {
		justify-content: center;
	}
	@media (max-width: 520px) {
		.hero-actions :global(.btn) {
			flex: 1 1 0;
			justify-content: center;
			padding-inline: 12px;
		}
	}
	@media (min-width: 960px) {
		.cols.solo aside {
			align-items: stretch;
		}
		.cols.solo aside > div:first-child,
		.cols.solo .map {
			height: 100%;
		}
		.cols.solo .map :global(.map) {
			height: 100% !important;
			min-height: 300px;
		}
	}
	@media (max-width: 520px) {
		.hero-actions {
			display: grid;
			grid-template-columns: 1fr 1fr auto;
			width: 100%;
		}
	}

	@media (max-width: 640px) {
		.gallery {
			grid-template-columns: 1fr;
		}
		.gallery figure {
			aspect-ratio: 16 / 10;
		}
	}
	.cols {
		margin-top: 0;
	}
	@media (max-width: 640px) {
		.facts {
			gap: 0 !important;
			border-radius: var(--radius-l);
			background: linear-gradient(180deg, rgb(255 255 255 / 0.035), transparent 50%), var(--bg-raised);
			box-shadow: inset 0 0 0 1px rgb(241 198 106 / 0.18), var(--shadow-1);
			overflow: hidden;
		}
		.facts div {
			background: none !important;
			box-shadow: none !important;
			border-radius: 0 !important;
		}
		.facts div + div {
			border-top: 1px solid rgb(241 198 106 / 0.14);
		}
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.facts {
			grid-auto-flow: column !important;
			grid-auto-columns: minmax(0, 1fr) !important;
		}
		.gallery {
			grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
		}
		.gallery figure.wide {
			grid-column: auto;
			aspect-ratio: 4 / 3;
		}
		aside {
			display: grid !important;
			grid-template-columns: 1fr !important;
			gap: var(--space-5);
		}
		.h-near {
			margin-top: 0 !important;
		}
	}
	.near {
		max-width: 640px;
	}

	.about-place {
		max-width: 65ch;
		margin: 0 auto var(--space-6);
	}
	.about-place h2 {
		font-size: clamp(1.6rem, 3vw, 2.2rem);
		margin-bottom: var(--space-3);
	}
	.about-place p {
		font-size: var(--text-lead);
		line-height: 1.8;
	}
	.about-place {
		text-align: center;
	}
	.near {
		max-width: none !important;
	}
	.near.lux {
		padding: var(--space-2) var(--space-4);
		margin: 0;
	}
	@media (max-width: 699px) {
		.facts div {
			grid-template-columns: 24px 1fr auto !important;
		}
		.facts div :global(svg) {
			justify-self: center;
		}
	}
	@media (max-width: 959px) {
		.gallery {
			margin-bottom: 0;
		}
	}
</style>
