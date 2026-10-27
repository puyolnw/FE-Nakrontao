<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Store from '@lucide/svelte/icons/store';
	import Truck from '@lucide/svelte/icons/truck';
	import { photos } from '#lib/photos.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import { t, tr, fmtDate } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { site } from '#lib/settings.svelte.ts';
	import { paragraphs, safeUrl, youtubeId } from '#lib/util.ts';
	import { iconFor, kindLabel, priceText, sellerCount } from '#lib/shop.ts';
	import Status from '#lib/components/Status.svelte';
	import type { I18n, News, Shop } from '#lib/types.ts';

	const shops = resource<Shop[]>(() => '/api/v1/shops');
	const news = resource<News[]>(() => '/api/v1/news');
	let openNews = $state<number | null>(null);
	let kind = $state<string>('');

	const L = (v: I18n) => tr(v);
	const kinds = $derived([...new Set((shops.data ?? []).map((s) => s.kind))]);
	const list = $derived((shops.data ?? []).filter((s) => !kind || s.kind === kind));
	const img = (s: Shop) => safeUrl(s.images[0])?.replace(/([?&])w=\d+/, '$1w=720');
</script>

<PageHead n={7} section={t('nav.community')} title={t('community.title')} lead={t('lead.community')} art="food" photo={photos.community} />
<div class="wrap page">
	<section>
		<div class="section-head"><div><p class="eyebrow">{t('nav.community')}</p><h2>{t('community.shops')}</h2></div></div>
		{#if kinds.length > 1}
			<div class="filters" role="group" aria-label={t('common.all')}>
				<button type="button" class="chip" aria-pressed={kind === ''} onclick={() => (kind = '')}>{t('common.all')}</button>
				{#each kinds as k (k)}
					<button type="button" class="chip" aria-pressed={kind === k} onclick={() => (kind = k)}>{L(kindLabel[k] ?? kindLabel.shop)}</button>
				{/each}
			</div>
		{/if}
		<Status loading={shops.loading} error={shops.error} empty={shops.data?.length === 0} />

		<ul class="prods">
			{#each list as s (s.id)}
				{@const Icon = iconFor(s)}
				{@const n = sellerCount(s)}
				<li>
					<a class="prod" href="/community/{s.id}">
						<div class="media">
							{#if img(s)}
								<img src={img(s)} alt={tr(s.name)} loading="lazy" decoding="async" />
							{:else}
								<div class="motif" aria-hidden="true"><span class="ring"><Icon size={44} strokeWidth={1.4} /></span></div>
							{/if}
							<span class="kind">{L(kindLabel[s.kind] ?? kindLabel.shop)}</span>
							{#if s.images.length > 1}<span class="count">{s.images.length} {L({ th: 'ภาพ', zh: '张', en: 'photos' })}</span>{/if}
						</div>
						<div class="body">
							<h3>{tr(s.name)}</h3>
							{#if priceText(s)}<p class="price">{priceText(s)}</p>{/if}
							{#if tr(s.products)}<p class="what">{tr(s.products)}</p>{/if}
							<p class="desc">{tr(s.description)}</p>
							<div class="foot">
								{#if n}
									<span class="sellers"><span class="dot on"></span>{n} {L({ th: 'ผู้ขาย', zh: '位卖家', en: n > 1 ? 'sellers' : 'seller' })}</span>
								{:else}
									<span class="pending"><span class="dot"></span>{L({ th: 'รอข้อมูลผู้ขาย', zh: '卖家信息收集中', en: 'Seller details soon' })}</span>
								{/if}
								{#if s.ships}<span class="ship"><Truck size={15} /> {L({ th: 'ส่งได้', zh: '可邮寄', en: 'Ships' })}</span>{/if}
								<span class="more">{L({ th: 'ดูรายละเอียด', zh: '查看详情', en: 'Details' })} <ChevronRight size={16} /></span>
							</div>
						</div>
					</a>
				</li>
			{/each}
		</ul>

		{#if shops.data?.length}
			<aside class="join">
				<span class="join-ic" aria-hidden="true"><Store size={26} /></span>
				<div>
					<h3>{L({ th: 'มีสินค้าหรือร้านในบ้านเมืองเตา?', zh: '您在孟涛村有产品或店铺吗？', en: 'Selling something in Ban Mueang Tao?' })}</h3>
					<p>{L({ th: 'ลงข้อมูลบนแพลตฟอร์มได้ฟรี ให้นักท่องเที่ยวไทยและจีนติดต่อซื้อได้โดยตรง', zh: '可免费登记，让中泰游客直接联系购买。', en: 'List it here for free so Thai and Chinese visitors can reach you directly.' })}</p>
				</div>
				{#if site.value.site?.contact}
					<p class="join-contact">{site.value.site.contact}</p>
				{:else}
					<a class="btn quiet" href="/about">{L({ th: 'ติดต่อโครงการ', zh: '联系项目组', en: 'Contact the project' })}</a>
				{/if}
			</aside>
		{/if}
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
	/* ---------- Shops & products ---------- */
	.filters {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-2);
		margin: 0 0 var(--space-5);
	}
	.prods {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-5);
		grid-template-columns: 1fr;
	}
	@media (min-width: 640px) {
		.prods {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1024px) {
		.prods {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	.prods > li {
		display: flex;
	}
	.prod {
		width: 100%;
		color: inherit;
		text-decoration: none;
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-l);
		overflow: hidden;
		background: var(--bg-raised);
		box-shadow: inset 0 0 0 1px var(--line);
		transition:
			transform 400ms var(--ease-out),
			box-shadow 400ms var(--ease-out);
	}
	.prod:hover,
	.prod:focus-visible {
		transform: translateY(-4px);
		box-shadow: inset 0 0 0 1px var(--line-strong), var(--shadow-1);
	}
	.media {
		position: relative;
		aspect-ratio: 16 / 10;
		background: var(--bg-sunken);
		overflow: hidden;
	}
	.media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 700ms var(--ease-out);
	}
	.prod:hover .media img {
		transform: scale(1.05);
	}
	.count {
		position: absolute;
		right: var(--space-3);
		bottom: var(--space-3);
		padding: 2px 10px;
		border-radius: var(--radius-pill);
		background: var(--glass-solid);
		font-size: var(--text-caption);
	}
	.price {
		margin: 0;
		color: var(--gold-300);
		font-size: var(--text-lead);
		font-weight: 600;
	}
	.motif {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 50% 55%, rgb(233 190 98 / 0.16), transparent 58%),
			repeating-radial-gradient(circle at 50% 55%, rgb(233 190 98 / 0.07) 0 1px, transparent 1px 22px),
			var(--bg-sunken);
	}
	.ring {
		display: grid;
		place-items: center;
		width: 104px;
		height: 104px;
		border-radius: 50%;
		color: var(--gold-300);
		background: rgb(18 4 6 / 0.55);
		box-shadow:
			inset 0 0 0 1px var(--line-strong),
			0 0 40px rgb(233 190 98 / 0.18);
	}
	.kind {
		position: absolute;
		top: var(--space-3);
		left: var(--space-3);
		padding: 2px 12px;
		border-radius: var(--radius-pill);
		background: var(--glass-solid);
		box-shadow: inset 0 0 0 1px var(--glass-line);
		color: var(--fg);
		font-size: var(--text-caption);
		font-weight: 500;
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-5);
		flex: 1;
	}
	.body h3 {
		margin: 0;
		font-size: var(--text-title);
		line-height: 1.35;
	}
	.what {
		margin: 0;
		color: var(--accent);
		font-size: var(--text-small);
		font-weight: 500;
	}
	.desc {
		margin: 0;
		color: var(--fg-muted);
		font-size: var(--text-small);
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.foot {
		margin-top: auto;
		padding-top: var(--space-3);
		border-top: 1px solid var(--line);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		min-height: 44px;
		gap: var(--space-2) var(--space-4);
		font-size: var(--text-small);
	}
	.sellers,
	.ship {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--fg);
	}
	.more {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: 2px;
		color: var(--accent);
		font-weight: 500;
	}
	.prod:hover .more {
		color: var(--accent-strong);
	}
	.pending {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--fg-muted);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--gold-500);
		box-shadow: 0 0 0 4px rgb(212 163 65 / 0.18);
	}
	.dot.on {
		background: var(--ok);
		box-shadow: 0 0 0 4px var(--ok-soft);
	}
	.join {
		margin-top: var(--space-6);
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--space-4) var(--space-5);
		padding: var(--space-5) var(--space-6);
		border-radius: var(--radius-l);
		background: radial-gradient(120% 140% at 0% 0%, rgb(200 32 44 / 0.22), transparent 60%), var(--bg-raised);
		box-shadow: inset 0 0 0 1px var(--line-strong);
	}
	.join h3 {
		margin: 0 0 4px;
		font-size: var(--text-title);
	}
	.join p {
		margin: 0;
		color: var(--fg-muted);
	}
	.join-ic {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		color: var(--night-950);
		background: var(--gold-grad);
	}
	.join .join-contact,
	.join .btn {
		grid-column: 1 / -1;
		color: var(--fg);
		justify-self: start;
	}
	@media (min-width: 900px) {
		.join {
			grid-template-columns: auto 1fr auto;
		}
		.join .join-contact,
		.join .btn {
			grid-column: auto;
			justify-self: end;
		}
	}

	/* ---------- News ---------- */
	.news {
		margin-top: var(--space-7);
	}
	.newslist {
		display: grid;
		gap: var(--space-3);
	}
	@media (min-width: 1100px) {
		.newslist {
			max-width: 760px;
			margin-inline: auto;
		}
	}
	.newslist > li {
		border: 0;
		border-radius: var(--radius-l);
		background: linear-gradient(180deg, rgb(255 255 255 / 0.035), transparent 50%), var(--bg-raised);
		box-shadow: inset 0 0 0 1px rgb(241 198 106 / 0.18), var(--shadow-1);
		padding-inline: var(--space-5);
	}
	.nrow {
		all: unset;
		box-sizing: border-box;
		cursor: pointer;
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4) 0;
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
			gap: var(--space-3);
		}
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
</style>
