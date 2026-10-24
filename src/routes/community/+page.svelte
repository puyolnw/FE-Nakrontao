<script lang="ts">
	import Footprints from '@lucide/svelte/icons/footprints';
	import { photos } from '#lib/photos.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Thumb from '#lib/components/Thumb.svelte';
	import { i18n, t, tr, fmtDate } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { directionsUrl, numeral, paragraphs, safeUrl, youtubeId } from '#lib/util.ts';
	import Status from '#lib/components/Status.svelte';
	import type { News, Shop } from '#lib/types.ts';

	const shops = resource<Shop[]>(() => '/api/v1/shops');
	const news = resource<News[]>(() => '/api/v1/news');
	let openNews = $state<number | null>(null);
</script>

<PageHead n={7} section={t('nav.community')} title={t('community.title')} lead={t('lead.community')} art="food" photo={photos.community} />
<div class="wrap page">

	<section>
		<div class="section-head"><div><p class="eyebrow">{t('nav.community')}</p><h2>{t('community.shops')}</h2></div></div>
		<Status loading={shops.loading} error={shops.error} empty={shops.data?.length === 0} />
		<div class="grid shops">
			{#each shops.data ?? [] as s (s.id)}
				<article class="card">
					<div class="media"><Thumb src={s.images[0]} kind={s.kind} ratio="4 / 3" alt={tr(s.name)} /></div>
					<div class="body">
						<h3>{tr(s.name)}</h3>
						{#if tr(s.products)}<p class="small"><strong>{tr(s.products)}</strong></p>{/if}
						<p class="small muted">{tr(s.description)}</p>
						<p class="small links">
							{#if s.contact}<span>{s.contact}</span>{/if}
							{#if safeUrl(s.link)}<a href={safeUrl(s.link)} target="_blank" rel="noopener noreferrer nofollow">{new URL(safeUrl(s.link)!, location.href).hostname}</a>{/if}
							{#if s.lat !== null && s.lon !== null}<a class="chip" href={directionsUrl(s.lat, s.lon, 'walking')} target="_blank" rel="noopener noreferrer"><Footprints size={16} /> {t('place.walk')}</a>{/if}
						</p>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<section class="news">
		<div class="section-head"><div><p class="eyebrow">{t('nav.community')}</p><h2>{t('community.news')}</h2></div></div>
		<Status loading={news.loading} error={news.error} empty={news.data?.length === 0} />
		<ul class="ledger newslist">
			{#each news.data ?? [] as n (n.id)}
				<li>
					<button class="nrow" aria-expanded={openNews === n.id} onclick={() => (openNews = openNews === n.id ? null : n.id)}>
						{#if n.published_at}<span class="badge"><b>{new Date(n.published_at).getDate()}</b>{fmtDate(n.published_at, { month: 'short' })}</span>{/if}
						<span class="ntext">
							<span class="title">{tr(n.title)}</span>
							{#if paragraphs(tr(n.body))[0]}<span class="excerpt">{paragraphs(tr(n.body))[0]}</span>{/if}
						</span>
					</button>
					{#if openNews === n.id}
						<div class="nbody">
							{#if safeUrl(n.cover_url)}<img src={safeUrl(n.cover_url)} alt="" loading="lazy" />{/if}
							{#each paragraphs(tr(n.body)) as p, i (i)}<p>{p}</p>{/each}
							{#if youtubeId(n.video_url)}
								<iframe class="yt" src="https://www.youtube-nocookie.com/embed/{youtubeId(n.video_url)}" title={tr(n.title)} loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation" allowfullscreen></iframe>
							{/if}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}
	.news {
		margin-top: var(--space-7);
	}
	.nrow {
		all: unset;
		box-sizing: border-box;
		cursor: pointer;
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-4) 0;
	}
	.nrow > :last-child {
		white-space: nowrap;
		flex-shrink: 0;
	}
	.nrow .title {
		font-family: var(--font-head);
		font-weight: 600;
		line-height: 1.5;
		font-size: var(--text-lead);
	}
	.nrow:hover .title {
		color: var(--accent);
	}
	.nbody {
		padding-bottom: var(--space-4);
	}
	.nbody img {
		max-height: 360px;
		object-fit: cover;
		margin-bottom: var(--space-3);
	}
	.yt {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: 0;
	}
	.shops {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 380px));
		justify-content: center;
	}
	.newslist {
		display: grid;
		gap: var(--space-3);

	}
	.newslist > li {
		border: 0;
		border-radius: var(--radius-l);
		background: linear-gradient(180deg, rgb(255 255 255 / 0.035), transparent 50%), var(--bg-raised);
		box-shadow: inset 0 0 0 1px rgb(241 198 106 / 0.18), var(--shadow-1);
		padding-inline: var(--space-5);
	}
	@media (max-width: 640px) {
		.nrow {
			flex-direction: column;
			gap: 4px;
		}
	}

	.shops :global(.card .media) {
		aspect-ratio: 16 / 10;
	}
	.nrow {
		justify-content: flex-start !important;
		align-items: center;
	}
	.nrow > :last-child {
		white-space: normal !important;
		flex-shrink: 1 !important;
	}
	.badge {
		flex: none;
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 14px;
		background: var(--gold-grad);
		color: var(--night-950);
		font-size: var(--text-caption);
		font-weight: 600;
		line-height: 1.1;
	}
	.badge b {
		font-size: 1.5rem;
	}
	@media (max-width: 640px) {
		.nrow {
			flex-direction: row !important;
			gap: var(--space-3) !important;
		}
	}

	@media (min-width: 700px) {
		.shops,
		.newslist {
			max-width: 960px;
			margin-inline: auto;
		}
		.shops {
			grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
		}
	}
	@media (min-width: 1100px) {
		.shops {
			max-width: none !important;
		}
		.shops :global(.card) {
			flex-direction: row;
		}
		.shops :global(.card .media) {
			flex: 0 0 48%;
			aspect-ratio: 4 / 3 !important;
		}
		.shops :global(.card .body) {
			padding: var(--space-5);
			justify-content: center;
		}
		.newslist {
			max-width: none !important;
		}
	}
	@media (min-width: 1100px) {
		.newslist {
			max-width: 860px !important;
			margin-inline: auto !important;
		}
	}
	.newslist {
		max-width: none !important;
		margin-inline: 0 !important;
	}
	.ntext {
		display: grid;
		gap: 4px;
		min-width: 0;
		text-align: left;
	}
	.excerpt {
		color: var(--fg-muted);
		font-size: var(--text-small);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	@media (min-width: 1100px) {
		.newslist {
			max-width: 760px !important;
			margin-inline: auto !important;
		}
	}
	.shops :global(.card .body h3) {
		min-height: 0 !important;
	}
</style>
