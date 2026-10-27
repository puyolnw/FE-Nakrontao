<script lang="ts">
	import { page } from '$app/state';
	import qrcode from 'qrcode-generator';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Copy from '@lucide/svelte/icons/copy';
	import Footprints from '@lucide/svelte/icons/footprints';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Phone from '@lucide/svelte/icons/phone';
	import QrCode from '@lucide/svelte/icons/qr-code';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Store from '@lucide/svelte/icons/store';
	import Truck from '@lucide/svelte/icons/truck';
	import Clock from '@lucide/svelte/icons/clock';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import { i18n, t, tr } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { site } from '#lib/settings.svelte.ts';
	import { directionsUrl, haversineKm, paragraphs, safeUrl, share } from '#lib/util.ts';
	import { iconFor, kindLabel, priceText } from '#lib/shop.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Status from '#lib/components/Status.svelte';
	import MapView from '#lib/components/MapView.svelte';
	import type { I18n, Pin, Place, Seller, Shop } from '#lib/types.ts';

	const L = (v: I18n) => tr(v);
	const id = $derived(/^\d+$/.test(page.params.id ?? '') ? page.params.id : null);
	const shop = resource<Shop>(() => (id ? `/api/v1/shops/${id}` : null));
	const all = resource<Shop[]>(() => '/api/v1/shops');
	const places = resource<Place[]>(() => '/api/v1/places');

	const shrine = $derived((places.data ?? []).find((p) => p.category === 'sacred'));
	const imgs = $derived((shop.data?.images ?? []).map(safeUrl).filter((u): u is string => !!u));
	let shown = $state(0);
	const current = $derived(imgs[Math.min(shown, imgs.length - 1)]);
	const stock = (u: string | undefined) => !!u && /images\.unsplash\.com/.test(u);

	// Sellers; a row filled only with the older single contact/location fields counts as one seller.
	const sellers = $derived.by((): Seller[] => {
		const s = shop.data;
		if (!s) return [];
		if (s.sellers?.length) return s.sellers;
		if (s.contact || (s.lat !== null && s.lon !== null))
			return [{ name: tr(s.name), village: '', phone: s.contact, line: '', wechat: '', hours: '', lat: s.lat, lon: s.lon, note: null }];
		return [];
	});
	const km = (sl: Seller) => (shrine && sl.lat !== null && sl.lon !== null ? haversineKm(shrine.lat, shrine.lon, sl.lat, sl.lon) : null);
	const pins = $derived.by((): Pin[] => {
		const out: Pin[] = sellers.filter((sl) => sl.lat !== null && sl.lon !== null).map((sl) => ({ lat: sl.lat!, lon: sl.lon!, label: sl.name, kind: 'other' }));
		if (out.length && shrine) out.unshift({ lat: shrine.lat, lon: shrine.lon, label: tr(shrine.name), kind: 'sacred' });
		return out;
	});
	const others = $derived((all.data ?? []).filter((x) => String(x.id) !== id).slice(0, 3));

	// Anonymous count of contact clicks, shown on the admin dashboard with page views.
	function track(kind: string) {
		fetch('/api/v1/track', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ path: `/community/${id}/contact/${kind}`, lang: i18n.lang }),
			keepalive: true
		}).catch(() => {});
	}
	const tel = (p: string) => p.replace(/[^\d+]/g, '');
	// LINE: a full URL is used as is; "@shop" is an official account, anything else a personal ID.
	const lineUrl = (v: string) =>
		/^https?:\/\//.test(v) ? v : `https://line.me/R/ti/p/${v.startsWith('@') ? '@' + encodeURIComponent(v.slice(1)) : '~' + encodeURIComponent(v)}`;

	let note = $state('');
	async function copyWechat(v: string) {
		track('wechat');
		try {
			await navigator.clipboard.writeText(v);
			note = L({ th: `คัดลอก WeChat ID “${v}” แล้ว`, zh: `已复制微信号“${v}”`, en: `Copied WeChat ID “${v}”` });
		} catch {
			note = `WeChat: ${v}`;
		}
	}
	async function onShare() {
		const r = await share(location.href, tr(shop.data?.name));
		note = r === 'copied' ? t('common.copied') : '';
	}
	let qrOpen = $state(false);
	const qrSrc = $derived.by(() => {
		if (!qrOpen || !id) return '';
		const qr = qrcode(0, 'M');
		qr.addData(location.href);
		qr.make();
		return qr.createDataURL(6, 2);
	});
	const toSellers = () => document.getElementById('sellers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
</script>

{#if shop.data}
	{@const s = shop.data}
	{@const Icon = iconFor(s)}
	<PageHead section={L(kindLabel[s.kind] ?? kindLabel.shop)} title={tr(s.name)} lead={tr(s.products)} photo={imgs[0] ?? ''}>
		<div class="hero-actions">
			{#if sellers.length}<button class="btn accent" onclick={toSellers}><Store size={18} /> {L({ th: 'ติดต่อผู้ขาย', zh: '联系卖家', en: 'Contact a seller' })}</button>{/if}
			<button class="icon-btn" onclick={onShare} aria-label={t('common.share')} title={t('common.share')}><Share2 size={20} /></button>
			<button class="icon-btn" onclick={() => (qrOpen = !qrOpen)} aria-expanded={qrOpen} aria-label="QR" title="QR"><QrCode size={20} /></button>
		</div>
	</PageHead>

	<div class="wrap section detail">
		<p class="back"><a href="/community"><ArrowLeft size={16} /> {t('community.shops')}</a></p>
		{#if note}<p class="toast" role="status">{note}</p>{/if}
		{#if qrSrc}
			<div class="qrbox">
				<img src={qrSrc} alt="QR" width="180" height="180" />
				<p>{L({ th: 'สแกนเพื่อเปิดหน้านี้ · พิมพ์ติดหน้าร้านหรือแผงขายได้', zh: '扫码打开本页，可打印贴在店铺', en: 'Scan to open this page. Print it for a stall or shop.' })}</p>
				<a class="btn quiet small" href={qrSrc} download="qr-community-{id}.gif">{L({ th: 'ดาวน์โหลด', zh: '下载', en: 'Download' })}</a>
			</div>
		{/if}

		<div class="grid2">
			<!-- Photos (left on wide screens) -->
			<div class="left">
				<figure class="main">
					{#if current}
						<img src={current} alt={tr(s.name)} />
						{#if stock(current)}<figcaption>{t('photo.illustrative')}</figcaption>{/if}
					{:else}
						<div class="motif" aria-hidden="true"><span class="ring"><Icon size={56} strokeWidth={1.3} /></span></div>
					{/if}
				</figure>
				{#if imgs.length > 1}
					<div class="thumbs" role="group" aria-label={L({ th: 'ภาพทั้งหมด', zh: '全部照片', en: 'All photos' })}>
						{#each imgs as src, i (src)}
							<button class:on={i === shown} onclick={() => (shown = i)} aria-label="{tr(s.name)} {i + 1}"><img {src} alt="" loading="lazy" /></button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Right: facts, story, sellers -->
			<div class="right">
				<div class="facts">
					<div>
						<span>{L({ th: 'ราคา', zh: '价格', en: 'Price' })}</span>
						<strong>{priceText(s) || L({ th: 'สอบถามผู้ขาย', zh: '请咨询卖家', en: 'Ask the seller' })}</strong>
					</div>
					<div>
						<span>{L({ th: 'ผู้ขาย', zh: '卖家', en: 'Sellers' })}</span>
						<strong>{sellers.length ? `${sellers.length} ${L({ th: 'ราย', zh: '位', en: '' })}` : L({ th: 'รอข้อมูล', zh: '待补充', en: 'Coming soon' })}</strong>
					</div>
					<div>
						<span>{L({ th: 'การส่ง', zh: '邮寄', en: 'Shipping' })}</span>
						<strong>{s.ships ? L({ th: 'ส่งไปรษณีย์ได้', zh: '可邮寄', en: 'Ships by post' }) : L({ th: 'ซื้อที่ชุมชน', zh: '在社区购买', en: 'Buy in the village' })}</strong>
					</div>
				</div>

				{#each paragraphs(tr(s.description)) as p, i (i)}<p class="lede">{p}</p>{/each}

				{#if tr(s.story)}
					<blockquote class="story">
						<p class="eyebrow">{L({ th: 'เรื่องเล่าจากผู้ผลิต', zh: '匠人的故事', en: 'From the maker' })}</p>
						{#each paragraphs(tr(s.story)) as p, i (i)}<p>{p}</p>{/each}
					</blockquote>
				{/if}

				{#if tr(s.how_to_buy)}
					<h2 class="h">{L({ th: 'วิธีซื้อ', zh: '购买方式', en: 'How to buy' })}</h2>
					{#each paragraphs(tr(s.how_to_buy)) as p, i (i)}<p>{p}</p>{/each}
				{/if}

				<h2 class="h" id="sellers">{L({ th: 'ซื้อได้จาก', zh: '购买地点', en: 'Buy from' })}{#if sellers.length} <small>({sellers.length})</small>{/if}</h2>
				{#if sellers.length}
					<ul class="sellers">
						{#each sellers as sl, i (i)}
							{@const d = km(sl)}
							<li>
								<div class="who">
									<span class="av" aria-hidden="true">{sl.name.trim().charAt(0)}</span>
									<div>
										<strong>{sl.name}</strong>
										<p class="meta">
											{#if sl.village}<span><MapPin size={14} /> {L({ th: 'หมู่', zh: '村组', en: 'Moo' })} {sl.village}</span>{/if}
											{#if d !== null}<span>{d.toFixed(1)} {t('place.km')} {L({ th: 'จากศาล', zh: '距神祠', en: 'from the shrine' })}</span>{/if}
											{#if sl.hours}<span><Clock size={14} /> {sl.hours}</span>{/if}
										</p>
										{#if tr(sl.note)}<p class="snote">{tr(sl.note)}</p>{/if}
									</div>
								</div>
								<div class="acts">
									{#if sl.phone}<a class="btn accent small" href="tel:{tel(sl.phone)}" onclick={() => track('call')}><Phone size={16} /> {L({ th: 'โทร', zh: '电话', en: 'Call' })}</a>{/if}
									{#if sl.line}<a class="btn quiet small" href={lineUrl(sl.line)} target="_blank" rel="noopener noreferrer nofollow" onclick={() => track('line')}><MessageCircle size={16} /> LINE</a>{/if}
									{#if sl.wechat}<button class="btn quiet small" onclick={() => copyWechat(sl.wechat)}><Copy size={16} /> WeChat</button>{/if}
									{#if sl.lat !== null && sl.lon !== null}<a class="btn quiet small" href={directionsUrl(sl.lat, sl.lon, 'walking')} target="_blank" rel="noopener noreferrer" onclick={() => track('directions')}><Footprints size={16} /> {t('place.walk')}</a>{/if}
								</div>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="empty">
						<span class="dot" aria-hidden="true"></span>
						<div>
							<strong>{L({ th: 'กำลังรวบรวมรายชื่อผู้ขายจากชุมชน', zh: '正在向社区收集卖家信息', en: 'We are collecting sellers from the village' })}</strong>
							<p>{L({ th: 'ถ้าคุณผลิตหรือขายสินค้านี้ในบ้านเมืองเตา ลงข้อมูลบนแพลตฟอร์มได้ฟรี', zh: '如果您在孟涛村制作或销售此产品，可免费登记。', en: 'If you make or sell this in Ban Mueang Tao, you can be listed for free.' })}</p>
							{#if site.value.site?.contact}<p class="contact">{site.value.site.contact}</p>{:else}<a class="btn quiet small" href="/about">{L({ th: 'ติดต่อโครงการ', zh: '联系项目组', en: 'Contact the project' })}</a>{/if}
						</div>
					</div>
				{/if}
				{#if s.ships}<p class="shipnote"><Truck size={16} /> {L({ th: 'สินค้านี้ส่งทางไปรษณีย์ได้ สอบถามค่าส่งกับผู้ขาย', zh: '此商品可邮寄，运费请咨询卖家', en: 'This can be posted. Ask the seller about delivery.' })}</p>{/if}
			</div>

			{#if pins.length}
				<div class="mapwrap">
					<h2 class="h">{L({ th: 'ที่ตั้งผู้ขาย', zh: '卖家位置', en: 'Where to buy' })}</h2>
					<MapView {pins} height="300px" />
				</div>
			{/if}
		</div>

		{#if others.length}
			<section class="others">
				<div class="section-head"><div><p class="eyebrow">{t('nav.community')}</p><h2>{L({ th: 'ของดีอื่นในชุมชน', zh: '社区其他特产', en: 'More from the village' })}</h2></div></div>
				<ul>
					{#each others as o (o.id)}
						{@const OIcon = iconFor(o)}
						<li>
							<a href="/community/{o.id}">
								<span class="oimg">{#if safeUrl(o.images[0])}<img src={safeUrl(o.images[0])?.replace(/([?&])w=\d+/, '$1w=360')} alt="" loading="lazy" />{:else}<OIcon size={28} />{/if}</span>
								<span><strong>{tr(o.name)}</strong><small>{priceText(o) || L(kindLabel[o.kind] ?? kindLabel.shop)}</small></span>
								<ChevronRight size={18} />
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>

	{#if sellers.length}
		<div class="bar">
			<button class="btn accent" onclick={toSellers}><Store size={18} /> {L({ th: 'ติดต่อผู้ขาย', zh: '联系卖家', en: 'Contact a seller' })} ({sellers.length})</button>
			<button class="icon-btn" onclick={onShare} aria-label={t('common.share')}><Share2 size={20} /></button>
		</div>
	{/if}
{:else}
	<div class="wrap page"><Status loading={shop.loading} error={shop.error} /></div>
{/if}

<style>
	.detail {
		padding-bottom: var(--space-8);
	}
	.back a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--fg-muted);
		text-decoration: none;
	}
	.back a:hover {
		color: var(--accent);
	}
	.toast {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-pill);
		background: var(--accent-soft);
		color: var(--fg);
		width: fit-content;
	}
	.qrbox {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4);
		margin-bottom: var(--space-5);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: inset 0 0 0 1px var(--line-strong);
	}
	.qrbox img {
		background: #fff;
		border-radius: 8px;
	}
	.qrbox p {
		flex: 1 1 220px;
		margin: 0;
		color: var(--fg-muted);
	}
	.grid2 {
		display: grid;
		gap: var(--space-6);
	}
	/* Phones: photos, details, sellers, then map. Wide: photos and map left, details right. */
	@media (min-width: 960px) {
		.grid2 {
			grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
			grid-template-areas: 'left right' 'map right';
			grid-template-rows: auto 1fr;
			align-items: start;
		}
		.left {
			grid-area: left;
		}
		.right {
			grid-area: right;
		}
		.mapwrap {
			grid-area: map;
		}
		.mapwrap .h {
			margin-top: 0;
		}
	}
	.main {
		position: relative;
		margin: 0;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius-l);
		overflow: hidden;
		background: var(--bg-sunken);
		box-shadow: inset 0 0 0 1px var(--line);
	}
	.main img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.main figcaption {
		position: absolute;
		left: var(--space-3);
		bottom: var(--space-3);
		padding: 2px 10px;
		border-radius: var(--radius-pill);
		background: var(--glass-solid);
		font-size: var(--text-caption);
		color: var(--fg-muted);
	}
	.motif {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 50% 50%, rgb(233 190 98 / 0.16), transparent 60%),
			repeating-radial-gradient(circle at 50% 50%, rgb(233 190 98 / 0.07) 0 1px, transparent 1px 24px),
			var(--bg-sunken);
	}
	.ring {
		display: grid;
		place-items: center;
		width: 132px;
		height: 132px;
		border-radius: 50%;
		color: var(--gold-300);
		background: rgb(18 4 6 / 0.55);
		box-shadow: inset 0 0 0 1px var(--line-strong), 0 0 40px rgb(233 190 98 / 0.18);
	}
	.thumbs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
	.thumbs button {
		all: unset;
		cursor: pointer;
		aspect-ratio: 4 / 3;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: inset 0 0 0 1px var(--line);
		opacity: 0.65;
	}
	.thumbs button.on,
	.thumbs button:hover {
		opacity: 1;
		box-shadow: 0 0 0 2px var(--gold-300);
	}
	.thumbs button:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.thumbs img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.h {
		font-size: var(--text-title);
		margin: var(--space-6) 0 var(--space-3);
	}
	.h small {
		margin-left: 6px;
		color: var(--fg-muted);
		font-weight: 400;
	}
	.facts {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-2);
		margin-bottom: var(--space-5);
	}
	.facts > div {
		display: grid;
		gap: 2px;
		padding: var(--space-3);
		border-radius: 14px;
		background: var(--bg-raised);
		box-shadow: inset 0 0 0 1px var(--line);
		text-align: center;
	}
	.facts span {
		font-size: var(--text-caption);
		color: var(--fg-muted);
	}
	.facts strong {
		font-size: var(--text-small);
		color: var(--gold-300);
	}
	.lede {
		font-size: var(--text-lead);
		line-height: 1.7;
	}
	.story {
		margin: var(--space-5) 0;
		padding: var(--space-2) 0 var(--space-2) var(--space-5);
		border-left: 3px solid var(--gold-400);
		color: var(--fg-muted);
	}
	.story .eyebrow {
		margin-bottom: var(--space-2);
	}
	.sellers {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-3);
	}
	.sellers > li {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: inset 0 0 0 1px var(--line);
	}
	.who {
		display: grid;
		grid-template-columns: 48px 1fr;
		gap: var(--space-3);
		align-items: start;
	}
	.av {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--gold-grad);
		color: var(--night-950);
		font-weight: 700;
		font-size: 1.25rem;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 4px var(--space-3);
		margin: 4px 0 0;
		font-size: var(--text-small);
		color: var(--fg-muted);
	}
	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.snote {
		margin: 6px 0 0;
		font-size: var(--text-small);
	}
	.acts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.empty {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-3);
		padding: var(--space-5);
		border-radius: var(--radius-l);
		background: radial-gradient(120% 140% at 0% 0%, rgb(200 32 44 / 0.2), transparent 60%), var(--bg-raised);
		box-shadow: inset 0 0 0 1px var(--line-strong);
	}
	.empty p {
		margin: 6px 0 0;
		color: var(--fg-muted);
	}
	.empty .contact {
		color: var(--fg);
	}
	.empty .btn {
		margin-top: var(--space-3);
	}
	.dot {
		margin-top: 8px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--gold-500);
		box-shadow: 0 0 0 5px rgb(212 163 65 / 0.18);
	}
	.shipnote {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--fg-muted);
		margin-top: var(--space-4);
	}
	.others {
		margin-top: var(--space-8);
	}
	.others ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-3);
	}
	@media (min-width: 760px) {
		.others ul {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	.others a {
		display: grid;
		grid-template-columns: 64px 1fr auto;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: inset 0 0 0 1px var(--line);
		color: inherit;
		text-decoration: none;
	}
	.others a:hover {
		box-shadow: inset 0 0 0 1px var(--line-strong);
	}
	.oimg {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 12px;
		overflow: hidden;
		background: var(--bg-sunken);
		color: var(--gold-300);
	}
	.oimg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.others small {
		display: block;
		color: var(--fg-muted);
	}
	/* Contact bar on phones, above the tab bar. */
	.bar {
		display: none;
	}
	@media (max-width: 759px) {
		.bar {
			position: fixed;
			left: var(--space-3);
			right: var(--space-3);
			bottom: calc(76px + env(safe-area-inset-bottom));
			z-index: 30;
			display: grid;
			grid-template-columns: 1fr auto;
			gap: var(--space-2);
			padding: var(--space-2);
			border-radius: var(--radius-l);
			background: var(--glass-solid);
			box-shadow: var(--shadow-2);
		}
		.facts {
			grid-template-columns: 1fr 1fr 1fr;
		}
		.facts strong {
			font-size: var(--text-caption);
		}
	}
</style>
