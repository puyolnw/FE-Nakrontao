<script lang="ts">
	import { photos } from '#lib/photos.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import { i18n, t, tr, fmtDate, fmtTime } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { downloadIcs, numeral, paragraphs } from '#lib/util.ts';
	import { qs } from '#lib/api.ts';
	import { reveal } from '#lib/motion.ts';
	import Thumb from '#lib/components/Thumb.svelte';
	import Status from '#lib/components/Status.svelte';
	import type { EventItem } from '#lib/types.ts';

	const now = new Date();
	let cursor = $state(new Date(now.getFullYear(), now.getMonth(), 1));
	const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	const monthEnd = $derived(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0));
	const events = resource<EventItem[]>(() => `/api/v1/events${qs({ from: ymd(cursor), to: ymd(monthEnd) })}`);
	const upcoming = resource<EventItem[]>(() => `/api/v1/events${qs({ from: ymd(now) })}`);

	const locale = $derived(i18n.lang === 'th' ? 'th-TH' : i18n.lang === 'zh' ? 'zh-CN' : 'en-GB');
	const weekdays = $derived(Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2024, 0, 7 + i))));
	const cells = $derived.by(() => {
		const first = cursor.getDay();
		const days = monthEnd.getDate();
		const out: { day: number | null; key: string; items: EventItem[] }[] = [];
		for (let i = 0; i < first; i++) out.push({ day: null, key: `b${i}`, items: [] });
		for (let d = 1; d <= days; d++) {
			const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
			const next = new Date(cursor.getFullYear(), cursor.getMonth(), d + 1);
			out.push({
				day: d,
				key: `d${d}`,
				items: (events.data ?? []).filter((e) => new Date(e.starts_at) < next && new Date(e.ends_at) >= date)
			});
		}
		while (out.length % 7) out.push({ day: null, key: `a${out.length}`, items: [] });
		return out;
	});
	const isToday = (d: number | null) => d !== null && cursor.getFullYear() === now.getFullYear() && cursor.getMonth() === now.getMonth() && d === now.getDate();
	const shift = (n: number) => (cursor = new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
	// An empty month is a dead end: start on the month of the next ceremony instead.
	let jumped = false;
	$effect(() => {
		const first = upcoming.data?.[0];
		if (jumped || !first || events.loading || (events.data?.length ?? 0) > 0) return;
		jumped = true;
		const d = new Date(first.starts_at);
		cursor = new Date(d.getFullYear(), d.getMonth(), 1);
	});
</script>

<PageHead n={5} section={t('nav.calendar')} title={t('cal.title')} lead={t('lead.calendar')} art="rain" photo={photos.calendar} />
<div class="wrap page">
<div class="cal-layout">
	<div class="month">
	<div class="cal-head">
		<button class="icon-btn" onclick={() => shift(-1)} aria-label={t('a11y.prev')}>←</button>
		<h2>{new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(cursor)}</h2>
		<button class="icon-btn" onclick={() => shift(1)} aria-label={t('a11y.next')}>→</button>
	</div>
	<div class="cal lux" role="grid">
		{#each weekdays as w (w)}<div class="wd" role="columnheader">{w}</div>{/each}
		{#each cells as c (c.key)}
			<div class="cell" class:empty={c.day === null} class:today={isToday(c.day)} class:has={c.items.length > 0} role="gridcell">
				{#if c.day}
					<span class="d">{c.day}</span>
					{#each c.items as e (e.id)}<a class="ev" href="#e{e.id}" title={tr(e.title)} aria-label={tr(e.title)}><span class="ev-name">{tr(e.title)}</span></a>{/each}
				{/if}
			</div>
		{/each}
	</div>
	</div>
	<div class="side">
	<div class="section-head up"><div><p class="eyebrow">{t('nav.calendar')}</p><h2>{t('cal.upcoming')}</h2></div></div>
	<Status loading={upcoming.loading} error={upcoming.error} empty={upcoming.data?.length === 0} />
	<ul class="list" use:reveal={{ children: true }}>
		{#each upcoming.data ?? [] as e (e.id)}
			<li id="e{e.id}">
				<div class="pic"><Thumb src={e.cover_url} kind="event" ratio="4 / 3" alt={tr(e.title)} /></div>
				<div class="when">
					<span>{fmtDate(e.starts_at)}</span>
					<span class="muted small">{fmtTime(e.starts_at)} – {fmtTime(e.ends_at)}</span>
				</div>
				<div>
					<h3>{tr(e.title)}</h3>
					{#each paragraphs(tr(e.description)) as p, i (i)}<p>{p}</p>{/each}
					{#if tr(e.preparation)}
						<p class="prep"><strong>{t('cal.prepare')}:</strong> {tr(e.preparation)}</p>
					{/if}
					<button class="btn quiet" onclick={() => downloadIcs(e)}>{t('cal.addToCalendar')}</button>
				</div>
			</li>
		{/each}
	</ul>
	</div>
</div>
</div>

<style>
	.cal-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}
	.cal-head h2 {
		margin: 0;
		font-size: clamp(1.8rem, 3vw, 2.6rem);
	}
	.cal {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 6px;
	}
	.cal {
		padding: var(--space-3);
	}
	.wd {
		font-family: var(--font-body);
		font-weight: 600;
		color: var(--gold-300) !important;
		font-size: var(--text-caption);
		color: var(--fg-muted);
		text-align: center;
		padding-block: var(--space-2);
	}
	.cell {
		min-height: 104px;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-m);
		background: rgb(255 255 255 / 0.025);
		border: 1px solid rgb(255 255 255 / 0.04);
		display: grid;
		align-content: start;
		gap: 4px;
		font-size: var(--text-caption);
		transition: transform 400ms var(--ease-out);
	}
	.cell.empty {
		background: transparent;
	}
	.d {
		font-family: var(--font-body);
		font-weight: 500;
		color: var(--fg-muted);
		font-size: var(--text-small);
		display: grid;
		place-items: center;
		min-width: 30px;
		height: 30px;
		font-variant-numeric: tabular-nums;
		justify-self: start;
	}
	.cell.empty {
		border-color: rgb(255 255 255 / 0.03);
		background: rgb(255 255 255 / 0.012);
	}
	.cell.today .d {
		background: var(--gold-grad);
		color: var(--night-950);
		border-radius: 50%;
		font-weight: 700;
	}
	.cell.today {
		border-color: rgb(241 198 106 / 0.5);
	}
	.cell.has {
		background: linear-gradient(160deg, rgb(200 32 44 / 0.45), rgb(120 10 20 / 0.35));
		border-color: rgb(241 198 106 / 0.35);
	}
	.cell.has .d {
		color: var(--fg);
	}
	.cell.has:hover {
		transform: translateY(-2px);
	}
	.ev {
		color: var(--gold-300);
		font-size: var(--text-small);
		padding: 2px 8px !important;
		border-radius: 8px;
		background: rgb(0 0 0 / 0.25);
		line-height: 1.3;
		font-weight: 500;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
	}
	@media (max-width: 767px) {
		.cell {
			min-height: 54px;
			padding: 6px;
		}
		.ev {
			font-size: 0;
			width: 8px;
			height: 8px;
			padding: 0 !important;
			border-radius: 50%;
			background: var(--gold-300);
			justify-self: center;
		}
		.d {
			justify-self: center;
		}
	}
	.up {
		margin-top: var(--space-8);
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-4);
	}
	.list li {
		display: grid;
		gap: var(--space-5);
		padding: var(--space-4);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: inset 0 0 0 1px rgb(241 198 106 / 0.14), var(--shadow-1);
		scroll-margin-top: 120px;
	}
	@media (min-width: 860px) {
		.list li {
			grid-template-columns: 260px 240px 1fr;
			align-items: center;
		}
	}
	.pic {
		border-radius: var(--radius-m);
		overflow: hidden;
	}
	.when {
		display: grid;
		font-family: var(--font-head);
		font-variant-numeric: tabular-nums;
		font-size: var(--text-h4);
		font-weight: 600;
		color: var(--accent);
		line-height: 1.5;
	}
	.prep {
		background: var(--accent-soft);
		border-radius: var(--radius-m);
		padding: var(--space-3) var(--space-4);
	}
	@media (max-width: 859px) {
		.pic :global(.thumb) {
			aspect-ratio: 16 / 9 !important;
			max-height: 240px;
		}
	}
	.when span:first-child {
		white-space: nowrap;
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.list li {
			grid-template-columns: 240px 1fr;
			grid-template-rows: auto 1fr;
			align-items: start;
			column-gap: var(--space-5);
			row-gap: var(--space-2);
		}
		.list li .pic {
			grid-row: 1 / span 2;
		}
		.list li .when {
			grid-column: 2;
			grid-row: 1;
		}
		.list li > div:last-child {
			grid-column: 2;
			grid-row: 2;
		}
		.pic :global(.thumb) {
			aspect-ratio: 4 / 3 !important;
			max-height: none !important;
		}
		.cell {
			min-height: 84px;
		}
	}
	.cell {
		background: rgb(255 255 255 / 0.05) !important;
		border-color: rgb(255 255 255 / 0.08) !important;
	}
	.cell.empty {
		background: rgb(255 255 255 / 0.015) !important;
		border-color: rgb(255 255 255 / 0.04) !important;
	}
	.cell .d {
		font-size: var(--text-body);
	}
	@media (min-width: 900px) {
		.cal-layout {
			display: grid;
			grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
			gap: var(--space-6);
			align-items: start;
		}
		.cell {
			min-height: 72px !important;
			place-content: center;
			justify-items: center;
		}
		.cell .d {
			justify-self: center;
		}
		.cell .ev {
			font-size: 12px !important;
			line-height: 1.35;
			width: 100%;
			text-align: center;
		}
		.side .up {
			margin-top: 0 !important;
		}
		.side .list li {
			grid-template-columns: 1fr !important;
			gap: var(--space-3) !important;
		}
		.side .list li .pic,
		.side .list li .when,
		.side .list li > div:last-child {
			grid-column: auto !important;
			grid-row: auto !important;
		}
		.side .pic :global(.thumb) {
			aspect-ratio: 16 / 9 !important;
		}
		.side .list li > div:last-child {
			grid-column: 1 / -1;
		}
		.side .when {
			font-size: var(--text-lead) !important;
		}
	}
	@media (min-width: 1100px) {
		.side {
			position: sticky;
			top: 110px;
		}
	}
	@media (min-width: 900px) {
		.side .section-head {
			margin-top: 0 !important;
			min-height: 56px;
			justify-content: center;
		}
		.side .section-head .eyebrow {
			display: none;
		}
		.side .section-head h2 {
			margin: 0;
			font-size: clamp(1.8rem, 2.4vw, 2.4rem);
		}
		.side .section-head h2::after {
			display: none;
		}
		.month .cal-head {
			min-height: 56px;
		}
	}
	@media (min-width: 768px) {
		.cell.has {
			background: linear-gradient(160deg, rgb(200 32 44 / 0.5), rgb(120 10 20 / 0.4)) !important;
			border-color: rgb(241 198 106 / 0.45) !important;
		}
		.cell .ev {
			padding: 2px 6px !important;
			max-width: 100%;
		}
	}
	@media (min-width: 768px) {
		.cell .ev {
			display: -webkit-box !important;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			white-space: normal;
			font-size: 12px !important;
		}
	}
	/* Final calendar cell design (all sizes): number centred; events as a gold bar. */
	.cell {
		display: flex !important;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 6px !important;
		padding: var(--space-2) 6px !important;
	}
	.cell .d {
		justify-self: center !important;
		align-self: center !important;
	}
	.cell .ev {
		display: block !important;
		width: min(70%, 48px) !important;
		height: 5px !important;
		padding: 0 !important;
		border-radius: 3px;
		background: var(--gold-grad) !important;
		font-size: 0 !important;
		-webkit-line-clamp: unset !important;
		line-clamp: unset !important;
	}
	.cell .ev-name {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	.wd {
		text-align: center;
	}
	@media (min-width: 900px) {
		.cal-layout {
			align-items: stretch !important;
		}
		.side {
			display: flex;
			flex-direction: column;
			position: static !important;
		}
		.side .list {
			flex: 1;
			display: flex !important;
			flex-direction: column;
		}
		.side .list li {
			flex: 1;
		}
	}
	@media (min-width: 900px) and (max-width: 1099px) {
		.cal-layout {
			grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
			gap: var(--space-5);
		}
		.cell {
			min-height: 60px !important;
		}
		.side .list li {
			grid-template-columns: 1fr !important;
		}
		.side .list li .when,
		.side .list li > div:last-child,
		.side .list li .pic {
			grid-column: auto !important;
			grid-row: auto !important;
		}
	}
	@media (min-width: 700px) and (max-width: 899px) {
		.list li .pic {
			align-self: start;
		}
		.list li .pic :global(.thumb) {
			aspect-ratio: 4 / 3 !important;
		}
		.list li > div:last-child {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			height: 100%;
		}
		.list li > div:last-child :global(.btn) {
			margin-top: auto;
		}
	}
	@media (min-width: 900px) {
		.side .pic :global(.thumb) {
			aspect-ratio: 16 / 9 !important;
			max-height: 200px;
		}
	}
	@media (min-width: 900px) {
		.month .cal-head h2,
		.side .section-head h2 {
			font-size: clamp(1.8rem, 2.4vw, 2.4rem) !important;
			line-height: 1.4;
		}
	}
	@media (min-width: 900px) and (max-width: 1099px) {
		.side .pic :global(.thumb) {
			max-height: 150px;
		}
		.side .list li > div:last-child :global(p) {
			display: -webkit-box;
			-webkit-line-clamp: 3;
			line-clamp: 3;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
	}
	@media (min-width: 700px) and (max-width: 899px) {
		.list li {
			grid-template-columns: 1fr !important;
		}
		.list li .pic,
		.list li .when,
		.list li > div:last-child {
			grid-column: auto !important;
			grid-row: auto !important;
		}
		.list li .pic {
			align-self: stretch;
		}
		.list li .pic :global(.thumb) {
			aspect-ratio: 21 / 9 !important;
		}
	}
	.pic :global(.thumb) {
		background-color: var(--night-900, #1a0709);
	}
	@media (min-width: 900px) {
		.month {
			display: flex;
			flex-direction: column;
		}
		.month .cal {
			flex: 1;
			grid-template-rows: auto;
			grid-auto-rows: 1fr;
		}
	}
	.cell.has {
		position: relative;
	}
	.cell.has .ev::after {
		content: '';
		position: absolute;
		inset: 0;
	}
</style>
