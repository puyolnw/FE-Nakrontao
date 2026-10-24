<script lang="ts">
	// Everything a first-time visitor needs before setting off, reachable in one tap:
	// hours and open-now, directions, parking, dress, offerings, etiquette, contact.
	import Clock from '@lucide/svelte/icons/clock';
	import Footprints from '@lucide/svelte/icons/footprints';
	import Car from '@lucide/svelte/icons/car';
	import ParkingCircle from '@lucide/svelte/icons/circle-parking';
	import Shirt from '@lucide/svelte/icons/shirt';
	import Flame from '@lucide/svelte/icons/flame';
	import HandHeart from '@lucide/svelte/icons/hand-heart';
	import Phone from '@lucide/svelte/icons/phone';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { i18n, t, tr } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { directionsUrl } from '#lib/util.ts';
	import { photos } from '#lib/photos.ts';
	import { reveal } from '#lib/motion.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Status from '#lib/components/Status.svelte';
	import MapView from '#lib/components/MapView.svelte';
	import type { Place } from '#lib/types.ts';

	const places = resource<Place[]>(() => '/api/v1/places');
	const shrine = $derived((places.data ?? []).find((p) => p.category === 'sacred') ?? places.data?.[0]);

	// "06:00–18:00" → open now? Anything else (e.g. "all day") is shown as written.
	let now = $state(new Date());
	$effect(() => {
		const id = setInterval(() => (now = new Date()), 60_000);
		return () => clearInterval(id);
	});
	const openNow = $derived.by(() => {
		const m = shrine?.open_hours?.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
		if (!m) return null;
		const mins = now.getHours() * 60 + now.getMinutes();
		return mins >= +m[1] * 60 + +m[2] && mins < +m[3] * 60 + +m[4];
	});

	const L = {
		th: {
			title: 'ข้อมูลการเยี่ยมชม',
			lead: 'เวลาเปิด การเดินทาง การแต่งกาย และของไหว้ ครบในหน้าเดียว',
			open: 'เปิดอยู่ตอนนี้',
			closed: 'ปิดอยู่ตอนนี้',
			hours: 'เวลาเปิด',
			getThere: 'การเดินทาง',
			walk: 'เดินเท้า',
			drive: 'ขับรถ',
			parking: 'ที่จอดรถ',
			parkingText: 'จอดได้บริเวณลานหน้าศาลเจ้า ช่วงงานพิธีให้จอดที่ลานวัดหรือลานชุมชนแล้วเดินต่อ',
			dress: 'การแต่งกาย',
			dressText: ['แต่งกายสุภาพ เสื้อมีแขน', 'กางเกงหรือกระโปรงคลุมเข่า', 'ถอดรองเท้าก่อนขึ้นศาล', 'ถอดหมวกและแว่นกันแดด'],
			offer: 'ของไหว้',
			offerText: ['ธูป 9 ดอก และเทียน 1 คู่', 'ดอกไม้ (ดาวเรืองหรือกุหลาบ)', 'ผลไม้มงคล เช่น ส้ม กล้วย', 'น้ำเปล่าหรือน้ำแดง'],
			etiquette: 'มารยาท',
			etiquetteText: ['พูดเสียงเบา ไม่ส่งเสียงดัง', 'ขออนุญาตก่อนถ่ายภาพในศาล', 'ไม่ชี้เท้าไปทางองค์เจ้าพ่อ', 'ปักธูปในกระถาง ดับเทียนให้เรียบร้อย'],
			contact: 'ติดต่อ',
			steps: 'ขั้นตอนการไหว้แบบละเอียด',
			plan: 'วางแผนเที่ยวทั้งวัน',
			minutes: 'ใช้เวลาประมาณ'
		},
		zh: {
			title: '参观信息',
			lead: '开放时间、交通、着装与供品，一页看清',
			open: '现在开放',
			closed: '现在关闭',
			hours: '开放时间',
			getThere: '交通',
			walk: '步行',
			drive: '驾车',
			parking: '停车',
			parkingText: '可停在神祠前广场；祭典期间请停在寺庙或社区广场后步行前往',
			dress: '着装',
			dressText: ['穿着得体，有袖上衣', '裤子或裙子过膝', '进入神祠前脱鞋', '摘下帽子和墨镜'],
			offer: '供品',
			offerText: ['香 9 支、蜡烛 1 对', '鲜花（万寿菊或玫瑰）', '吉祥水果，如橙子、香蕉', '清水或红色饮料'],
			etiquette: '礼仪',
			etiquetteText: ['轻声说话', '在神祠内拍照前先征得同意', '不要用脚指向神像', '香插入香炉，蜡烛熄灭整齐'],
			contact: '联系',
			steps: '详细参拜步骤',
			plan: '规划一日游',
			minutes: '约需'
		},
		en: {
			title: 'Plan your visit',
			lead: 'Opening hours, getting there, what to wear and what to bring — on one page',
			open: 'Open now',
			closed: 'Closed now',
			hours: 'Opening hours',
			getThere: 'Getting there',
			walk: 'Walking',
			drive: 'Driving',
			parking: 'Parking',
			parkingText: 'Park in the yard in front of the shrine. During festivals, use the temple or community yard and walk.',
			dress: 'What to wear',
			dressText: ['Modest clothing, sleeves on', 'Trousers or skirt below the knee', 'Remove shoes before entering', 'Take off hats and sunglasses'],
			offer: 'Offerings',
			offerText: ['9 incense sticks and a pair of candles', 'Flowers (marigold or rose)', 'Auspicious fruit such as oranges or bananas', 'Water or red soda'],
			etiquette: 'Etiquette',
			etiquetteText: ['Keep your voice low', 'Ask before taking photos inside', 'Never point your feet at the deity', 'Place incense in the urn; put candles out neatly'],
			contact: 'Contact',
			steps: 'Step-by-step worship guide',
			plan: 'Plan a full day',
			minutes: 'Allow about'
		}
	};
	const l = $derived(L[i18n.lang]);
</script>

<PageHead section={t('nav.visit')} title={l.title} lead={l.lead} photo={photos.hero} />

<div class="wrap page">
	<Status loading={places.loading} error={places.error} />
	{#if shrine}
		{@const s = shrine}
		<section class="top" use:reveal={{ children: true }}>
			<div class="card lux hours">
				<h2 class="h"><Clock size={22} /> {l.hours}</h2>
				<p class="big num">{s.open_hours || '—'}</p>
				{#if openNow !== null}
					<p class="state" class:on={openNow} role="status"><span class="dot"></span>{openNow ? l.open : l.closed}</p>
				{/if}
				<p class="muted">{l.minutes} {s.visit_minutes} {t('common.minutes')}</p>
				<a class="btn quiet" href="/calendar">{t('nav.calendar')}</a>
			</div>
			<div class="card lux go">
				<h2 class="h"><Footprints size={22} /> {l.getThere}</h2>
				<p class="muted">{tr(s.name)}</p>
				<div class="row">
					<a class="btn" href={directionsUrl(s.lat, s.lon, 'walking')} target="_blank" rel="noopener noreferrer"><Footprints size={18} /> {l.walk}</a>
					<a class="btn quiet" href={directionsUrl(s.lat, s.lon, 'driving')} target="_blank" rel="noopener noreferrer"><Car size={18} /> {l.drive}</a>
				</div>
				<h3 class="h small-h"><ParkingCircle size={20} /> {l.parking}</h3>
				<p>{l.parkingText}</p>
			</div>
		</section>

		<div class="map"><MapView pins={[{ lat: s.lat, lon: s.lon, label: tr(s.name), kind: 'sacred' }]} height="320px" /></div>

		<section class="lists">
			{#each [[Shirt, l.dress, l.dressText], [Flame, l.offer, l.offerText], [HandHeart, l.etiquette, l.etiquetteText]] as const as [Icon, head, items] (head)}
				<div class="card lux" use:reveal>
					<h2 class="h"><Icon size={22} /> {head}</h2>
					<ul>
						{#each items as it (it)}<li>{it}</li>{/each}
					</ul>
				</div>
			{/each}
		</section>

		{#if s.contact}
			<p class="contact"><Phone size={18} /> {l.contact}: <a href="tel:{s.contact.replace(/[^\d+]/g, '')}">{s.contact}</a></p>
		{/if}

		<nav class="next">
			<a href="/guide">{l.steps} <ArrowRight size={18} /></a>
			<a href="/plan">{l.plan} <ArrowRight size={18} /></a>
		</nav>
	{/if}
</div>

<style>
	.top,
	.lists {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-5);
	}
	@media (min-width: 700px) {
		.top {
			grid-template-columns: 1fr 1.4fr;
			align-items: stretch;
		}
		.lists {
			grid-template-columns: 1fr;
		}
	}
	.card {
		padding: var(--space-5);
	}
	.h {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-head);
		font-size: var(--text-h4);
		line-height: 1.5;
		margin-bottom: var(--space-3);
	}
	.h :global(svg) {
		color: var(--accent);
		flex-shrink: 0;
	}
	.small-h {
		font-size: var(--text-lead);
		margin-top: var(--space-5);
	}
	.big {
		white-space: nowrap;
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 600;
		line-height: 1.3;
		margin: 0 0 var(--space-2);
	}
	.state {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: 600;
		color: var(--fg-muted);
		margin: 0 0 var(--space-2);
	}
	.state.on {
		color: #7ed19a;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: currentColor;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.map {
		border-radius: var(--radius-l);
		overflow: hidden;
		margin-bottom: var(--space-5);
	}
	ul {
		margin: 0;
		padding-left: 1.2em;
		display: grid;
		gap: var(--space-2);
	}
	.contact {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.next {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-5);
	}
	@media (min-width: 640px) {
		.next {
			grid-template-columns: 1fr 1fr;
		}
	}
	.next a {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		min-height: 56px;
		padding: var(--space-3) var(--space-5);
		border-radius: var(--radius-l);
		border: var(--hair) solid var(--line-strong);
		font-weight: 500;
	}
	.next a:hover {
		background: var(--bg-raised);
	}

	.hours {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.hours :global(.btn) {
		margin-top: auto;
	}
	@media (min-width: 900px) {
		.lists {
			grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
		}
		.lists :global(li) {
			font-size: var(--text-small);
		}
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.top {
			grid-template-columns: 1fr 1.3fr !important;
		}
	}
	@media (min-width: 700px) and (max-width: 899px) {
		.lists {
			grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
		}
		.lists > :last-child {
			grid-column: 1 / -1;
		}
	}
	@media (min-width: 700px) and (max-width: 899px) {
		.lists > :last-child ul {
			columns: 2;
			column-gap: var(--space-6);
		}
		.lists > :last-child li {
			break-inside: avoid;
			margin-bottom: var(--space-2);
		}
	}
	@media (min-width: 700px) {
		.top {
			align-items: stretch !important;
		}
		.hours {
			height: 100%;
		}
	}
	.lists {
		align-items: stretch !important;
	}
	.lists > * {
		height: 100%;
	}
</style>
