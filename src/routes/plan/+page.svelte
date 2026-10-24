<script lang="ts">
	import LocateFixed from '@lucide/svelte/icons/locate-fixed';
	import { photos } from '#lib/photos.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Thumb from '#lib/components/Thumb.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { i18n, reason, t, tx, tr } from '#lib/i18n.svelte.ts';
	import { api, ApiError } from '#lib/api.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { geo, locate } from '#lib/geo.svelte.ts';
	import { directionsUrl, numeral, share } from '#lib/util.ts';
	import MapView from '#lib/components/MapView.svelte';
	import type { Pin, PlanStop, Place, Route } from '#lib/types.ts';

	const interestsAll = ['sacred', 'history', 'culture', 'community', 'food', 'stay'] as const;
	const durations = [60, 120, 180, 240, 360, 480];

	// The plan lives entirely in the URL, so sharing the link reproduces it (scope 6.8) with no server storage.
	const sp = page.url.searchParams;
	let interests = $state<string[]>(sp.get('i')?.split(',').filter((x) => (interestsAll as readonly string[]).includes(x)) ?? ['sacred', 'history']);
	let minutes = $state(Number(sp.get('m')) || 180);
	let mode = $state<'walk' | 'drive'>(sp.get('mode') === 'drive' ? 'drive' : 'walk');

	let stops = $state<PlanStop[] | null>(null);
	let total = $state(0);
	let busy = $state(false);
	let err = $state('');
	let note = $state('');

	// A curated route chosen from the home page (scope 3.9).
	const routeId = sp.get('route');
	const route = resource<Route>(() => (routeId && /^\d+$/.test(routeId) ? `/api/v1/routes/${routeId}` : null));
	const places = resource<Place[]>(() => (routeId ? '/api/v1/places' : null));
	const routeStops = $derived.by(() => {
		if (!route.data || !places.data) return [];
		const byId = new Map(places.data.map((p) => [p.id, p]));
		return route.data.place_ids.map((id) => byId.get(id)).filter((p): p is Place => !!p);
	});

	async function build() {
		busy = true;
		err = '';
		try {
			const res = await api.post<{ stops: PlanStop[]; total_minutes: number }>('/api/v1/plan', {
				interests,
				minutes,
				mode,
				start_lat: geo.lat,
				start_lon: geo.lon
			});
			stops = res.stops;
			total = res.total_minutes;
			goto(`/plan?i=${interests.join(',')}&m=${minutes}&mode=${mode}`, { replace: true, shallow: true });
		} catch (e) {
			err = e instanceof ApiError ? e.message : t('common.error');
		} finally {
			busy = false;
		}
	}
	$effect(() => {
		if (sp.get('i')) build();
	});

	const pins = $derived<Pin[]>(
		(stops ?? []).map((s, i) => ({ lat: s.place.lat, lon: s.place.lon, label: tr(s.place.name), n: i + 1, kind: 'stop' as const, href: `/places/${s.place.id}` }))
	);
	const routePins = $derived<Pin[]>(routeStops.map((p, i) => ({ lat: p.lat, lon: p.lon, label: tr(p.name), n: i + 1, kind: 'stop' as const, href: `/places/${p.id}` })));
	const clock = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

	async function onShare() {
		note = (await share(location.href, t('plan.title'))) === 'copied' ? t('common.copied') : '';
	}
</script>

<PageHead n={4} section={t('nav.plan')} title={t('plan.title')} lead={t('lead.plan')} art="market" photo={photos.plan} />
<div class="wrap page">

	{#if route.data}
		<h1>{tr(route.data.name)}</h1>
		<p class="muted">{tr(route.data.description)} · {route.data.minutes} {t('common.minutes')}</p>
		<MapView pins={routePins} line height="380px" />
		<ol class="stops">
			{#each routeStops as p, i (p.id)}
				<li>
					<span class="n">{numeral(i + 1, i18n.lang)}</span>
					<div>
						<a class="name" href="/places/{p.id}">{tr(p.name)}</a>
						<p class="small muted">{tx(`cat.${p.category}`)} · {p.visit_minutes} {t('common.minutes')}</p>
					</div>
					<a class="small" href={directionsUrl(p.lat, p.lon, 'walking')} target="_blank" rel="noopener noreferrer">{t('place.walk')}</a>
				</li>
			{/each}
		</ol>
		<hr />
	{/if}

	<form class="form lux" onsubmit={(e) => (e.preventDefault(), build())}>
		<fieldset>
			<legend>{t('plan.interests')}</legend>
			<div class="opts three">
				{#each interestsAll as c (c)}
					<label class="chip"><input type="checkbox" value={c} bind:group={interests} /><span class="tick"></span>{tx(`cat.${c}`)}</label>
				{/each}
			</div>
		</fieldset>
		<fieldset>
			<legend>{t('plan.time')}</legend>
			<div class="opts six">
				{#each durations as d (d)}
					<label class="chip"><input type="radio" value={d} bind:group={minutes} /><span class="tick"></span>{d / 60} {t('plan.hours')}</label>
				{/each}
			</div>
		</fieldset>
		<fieldset>
			<legend>{t('plan.mode')}</legend>
			<div class="opts two">
				<label class="chip"><input type="radio" value="walk" bind:group={mode} /><span class="tick"></span>{t('plan.walk')}</label>
				<label class="chip"><input type="radio" value="drive" bind:group={mode} /><span class="tick"></span>{t('plan.drive')}</label>
			</div>
			<button type="button" class="btn quiet locate" class:on={geo.lat !== null} onclick={locate} disabled={geo.busy}><LocateFixed size={18} /> {geo.lat !== null ? '✓ ' : ''}{t('place.locate')}</button>
		</fieldset>
		<button class="btn submit" type="submit" disabled={busy || !interests.length}>{t('plan.build')}</button>
		{#if err}<p class="error" role="alert">{err}</p>{/if}
	</form>

	{#if stops}
		<section class="result" aria-live="polite">
			{#if stops.length === 0}
				<p class="notice">{t('plan.empty')}</p>
			{:else}
				<div class="head">
					<p><strong>{t('plan.total')} {clock(total)}</strong> · {stops.length}</p>
					<button class="btn quiet small" onclick={onShare}>{t('common.share')}</button>
					{#if note}<span class="small muted">{note}</span>{/if}
				</div>
				<MapView {pins} line height="380px" />
				<ol class="stops">
					{#each stops as s, i (s.place.id)}
						<li>
							<span class="n">{numeral(i + 1, i18n.lang)}</span>
							<div class="stopbody">
								<div><Thumb kind={s.place.category} ratio="1" /></div>
								<div>
								<span class="time">{clock(s.arrive_at_minute)}</span>
								<a class="name" href="/places/{s.place.id}">{tr(s.place.name)}</a>
								<p class="small muted">
									{s.place.visit_minutes} {t('common.minutes')}{#if s.travel_minutes} · {t('plan.travel')} {s.travel_minutes} {t('common.minutes')}{/if}
								</p>
								<p class="small why">{t('plan.why')}: {s.reasons.map(reason).join(' · ')}</p>
								</div>
							</div>
							<a class="small" href={directionsUrl(s.place.lat, s.place.lon, mode === 'drive' ? 'driving' : 'walking')} target="_blank" rel="noopener noreferrer">
								{mode === 'drive' ? t('place.drive') : t('place.walk')}
							</a>
						</li>
					{/each}
				</ol>
				<p class="small muted">{t('plan.shareHint')}</p>
			{/if}
		</section>
	{/if}
</div>

<style>
	.form {
		display: grid;
		gap: var(--space-5);
		max-width: 760px;
		margin: 0 auto;
		padding: var(--space-6) var(--space-5);
		counter-reset: step;
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		counter-increment: step;
	}
	fieldset + fieldset {
		padding-top: var(--space-5);
		border-top: 1px solid var(--line);
	}
	legend {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-family: var(--font-head);
		font-size: var(--text-lead);
		font-weight: 600;
		padding: 0;
		margin-bottom: var(--space-3);
	}
	legend::before {
		content: counter(step);
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--gold-grad);
		color: var(--night-950);
		font: 700 var(--text-small) var(--font-body);
	}
	.opts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}
	.submit {
		min-height: 56px;
		font-size: var(--text-lead);
	}
	.result :global(.map),
	.result :global(.leaflet-container) {
		border-radius: var(--radius-l);
	}
	.result {
		margin-top: var(--space-6);
	}
	.head {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		flex-wrap: wrap;
	}
	.head p {
		margin: 0;
	}
	.stops {
		list-style: none;
		padding: 0;
		margin: var(--space-5) 0;
		border-top: var(--hair) solid var(--line-strong);
	}
	.stops li {
		display: grid;
		grid-template-columns: 3ch 1fr auto;
		gap: var(--space-4);
		padding: var(--space-4) 0;
		border-bottom: var(--hair) solid var(--line);
		align-items: baseline;
	}
	.n {
		font-family: var(--font-display);
		color: var(--accent);
		font-size: var(--text-h4);
	}
	.time {
		font-variant-numeric: tabular-nums;
		color: var(--date);
		margin-right: var(--space-2);
	}
	.name {
		font-family: var(--font-display);
		line-height: 1.5;
		font-size: var(--text-lead);
	}
	.stops p {
		margin: var(--space-1) 0 0;
	}
	.stopbody {
		display: grid;
		grid-template-columns: 64px 1fr;
		gap: var(--space-3);
		align-items: start;
	}
	.why {
		color: var(--fg-muted);
	}
	.opts.three,
	.opts.six {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	@media (min-width: 560px) {
		.opts.three,
		.opts.six {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	@media (min-width: 900px) {
		.opts.six {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}
	.opts .chip {
		justify-content: center;
		padding-inline: 12px;
	}
	.opts.two {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.locate {
		width: 100%;
		margin-top: var(--space-3);
		justify-content: center;
	}
	fieldset + fieldset {
		padding-top: 0 !important;
		border-top: 0 !important;
		margin-top: var(--space-2);
	}
	legend {
		float: left;
		width: 100%;
		margin-bottom: var(--space-3) !important;
	}
	legend + * {
		clear: both;
	}
</style>
