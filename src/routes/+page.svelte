<script lang="ts">
	import { goto } from '$app/navigation';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Clock from '@lucide/svelte/icons/clock';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Flame from '@lucide/svelte/icons/flame';
	import Flower from '@lucide/svelte/icons/flower';
	import Shirt from '@lucide/svelte/icons/shirt';
	import HandHeart from '@lucide/svelte/icons/hand-heart';
	import Gift from '@lucide/svelte/icons/gift';
	import { i18n, t, tr, tx, fmtDate, fmtTime } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { site } from '#lib/settings.svelte.ts';
	import { useOverPhoto } from '#lib/chrome.svelte.ts';
	import { photos } from '#lib/photos.ts';
	import { safeUrl } from '#lib/util.ts';
	import { qs } from '#lib/api.ts';
	import { todayColor } from '#lib/luck.ts';
	import { clipReveal, horizontal, parallax, reveal, scrubText, splitReveal, spotlight } from '#lib/motion.ts';
	import Thumb from '#lib/components/Thumb.svelte';
	import StoryCard from '#lib/components/StoryCard.svelte';
	import Embers from '#lib/components/Embers.svelte';
	import Smoke from '#lib/components/Smoke.svelte';
	import Yantra from '#lib/components/Yantra.svelte';
	import type { EventItem, I18n, Knowledge, Place } from '#lib/types.ts';

	useOverPhoto();
	const L = (v: I18n) => tr(v);
	const today = new Date().toISOString().slice(0, 10);
	const events = resource<EventItem[]>(() => `/api/v1/events${qs({ from: today })}`);
	const places = resource<Place[]>(() => '/api/v1/places');
	const stories = resource<Knowledge[]>(() => '/api/v1/knowledge');

	const next = $derived(events.data?.[0]);
	const shrine = $derived((places.data ?? []).find((p) => p.category === 'sacred'));
	const openNow = $derived.by(() => {
		const m = shrine?.open_hours?.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
		if (!m) return null;
		const d = new Date(now);
		const mins = d.getHours() * 60 + d.getMinutes();
		return mins >= +m[1] * 60 + +m[2] && mins < +m[3] * 60 + +m[4];
	});
	const hero = $derived(safeUrl(site.value.site?.hero_url) ?? photos.hero);
	const name = $derived(tr(site.value.site?.name) || 'เจ้าพ่อศรีนครเตา');
	const color = todayColor();

	let q = $state('');
	function ask(e: SubmitEvent) {
		e.preventDefault();
		if (q.trim()) goto(`/ask?q=${encodeURIComponent(q.trim())}`);
	}

	let now = $state(Date.now());
	$effect(() => {
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});
	const left = $derived.by(() => {
		if (!next) return null;
		const ms = Math.max(0, new Date(next.starts_at).getTime() - now);
		return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
	});
	const pad = (n: number) => String(n).padStart(2, '0');

	const marquee = $derived(
		i18n.lang === 'zh'
			? ['祈福', '平安', '吉祥', '还愿', '祭拜', '古城', '传说', '信仰']
			: i18n.lang === 'en'
				? ['Make a wish', 'Blessings', 'Good fortune', 'Offerings', 'Ancient town', 'Legends', 'Faith', 'Gratitude']
				: ['ขอพร', 'โชคลาภ', 'แก้บน', 'สักการะ', 'เมืองโบราณ', 'ตำนาน', 'ศรัทธา', 'สิริมงคล']
	);
	const statement = $derived(
		L({
			th: 'ศาลเจ้ากลางเมืองโบราณคูน้ำคันดิน ที่ชาวบ้านเมืองเตาเคารพบูชามาหลายชั่วอายุคน ผู้คนมาที่นี่เพื่อขอพร แก้บน และฝากความหวังไว้กับเจ้าพ่อ',
			zh: '这座神祠坐落在古老护城河小镇中央，孟涛村民世代供奉。人们来这里祈福、还愿，把心愿托付给神明。',
			en: 'A shrine at the heart of an ancient moated town, honoured by the people of Mueang Tao for generations. People come here to make wishes, give thanks and leave their hopes with Chao Pho.'
		})
	);
	const ritual = $derived([
		{ icon: Shirt, title: L({ th: 'แต่งกายสุภาพ', zh: '穿着得体', en: 'Dress modestly' }), text: L({ th: 'สำรวมกายใจก่อนเข้าเขตศาล', zh: '进入神祠前保持庄重', en: 'Enter the shrine with a calm mind' }) },
		{ icon: Flower, title: L({ th: 'เตรียมของไหว้', zh: '准备供品', en: 'Prepare offerings' }), text: L({ th: 'ดอกไม้ ธูป เทียน', zh: '鲜花、香、蜡烛', en: 'Flowers, incense, candles' }) },
		{ icon: Flame, title: L({ th: 'จุดธูปเทียน', zh: '点香烛', en: 'Light incense' }), text: L({ th: 'กล่าวคำบูชาด้วยใจสงบ', zh: '静心诵念祭词', en: 'Recite the offering words' }) },
		{ icon: HandHeart, title: L({ th: 'อธิษฐานขอพร', zh: '许愿祈福', en: 'Make your wish' }), text: L({ th: 'บอกชื่อ ที่อยู่ และสิ่งที่ขอ', zh: '报上姓名住址与心愿', en: 'Say your name, home and wish' }) },
		{ icon: Gift, title: L({ th: 'แก้บนเมื่อสมหวัง', zh: '如愿后还愿', en: 'Give thanks' }), text: L({ th: 'กลับมาขอบคุณตามที่ได้ตั้งใจ', zh: '回来感谢神恩', en: 'Return to fulfil your vow' }) }
	]);
	const bento = $derived([
		{ href: '/history', title: t('nav.history'), sub: L({ th: 'ตำนาน ความเชื่อ และหลักฐานทางประวัติศาสตร์', zh: '传说、信仰与历史', en: 'Legends, beliefs and history' }), img: photos.history, cls: 'b1' },
		{ href: '/guide', title: t('nav.guide'), sub: L({ th: 'ของไหว้ ขั้นตอน และข้อปฏิบัติ', zh: '供品、步骤与礼仪', en: 'Offerings, steps and etiquette' }), img: photos.guide, cls: 'b2' },
		{ href: '/ask', title: t('nav.ask'), sub: L({ th: 'ถามได้ทั้งไทยและจีน ตอบพร้อมแหล่งอ้างอิง', zh: '中泰双语，附带出处', en: 'Thai & Chinese, always with sources' }), img: photos.ask, cls: 'b3' },
		{ href: '/calendar', title: t('nav.calendar'), sub: L({ th: 'วันสำคัญและงานประเพณีตลอดปี', zh: '全年重要节日', en: 'Ceremonies all year round' }), img: photos.calendar, cls: 'b4' },
		{ href: '/plan', title: t('nav.plan'), sub: L({ th: 'บอกเวลาที่มี เราจัดเส้นทางให้', zh: '告诉我们时间，自动规划路线', en: 'Tell us your time, get a route' }), img: photos.plan, cls: 'b5' },
		{ href: '/community', title: t('nav.community'), sub: L({ th: 'ผ้าทอ อาหารอีสาน ของฝาก', zh: '织物、东北菜、特产', en: 'Weaving, Isan food, souvenirs' }), img: photos.community, cls: 'b6' }
	]);
</script>

<svelte:head><link rel="preload" as="image" href={hero} fetchpriority="high" /></svelte:head>

<!-- 1 · Hero: night shrine with gold dust, incense smoke and a turning yantra -->
<section class="hero">
	<div class="bg" use:parallax={0.25}><img src={hero} alt="" fetchpriority="high" /></div>
	<Smoke plumes={3} />
	<Embers count={20} />
	<div class="yantra-wrap" aria-hidden="true"><Yantra size="100%" speed={0.5} /></div>
	<div class="wrap inner">
		<p class="kicker"><MapPin size={14} /> {L({ th: 'บ้านเมืองเตา · มหาสารคาม', zh: '孟涛村 · 玛哈沙拉堪', en: 'Ban Mueang Tao · Maha Sarakham' })}</p>
		{#key name + i18n.lang}
			<h1 class="gold-text">{name}</h1>
		{/key}
		<p class="tagline">{(tr(site.value.site?.tagline) || L({ th: 'แพลตฟอร์มท่องเที่ยวเชิงศรัทธา', zh: '信仰旅游平台', en: 'A faith tourism guide' })).replace(/\s*บ้านเมืองเตา\s*มหาสารคาม\s*$/, '')}</p>
		<div class="ctas">
			<a class="btn accent big" href="/wish"><Flame size={20} /> {L({ th: 'จุดธูปขอพรออนไลน์', zh: '在线上香祈福', en: 'Light incense & wish' })}</a>
			<a class="btn quiet big" href="/guide">{t('nav.guide')} <ArrowUpRight size={18} /></a>
		</div>
		<form class="askbar" onsubmit={ask}>
			<Sparkles size={18} />
			<label class="askl" for="home-q">{t('nav.ask')}</label>
			<input id="home-q" bind:value={q} maxlength="500" placeholder={t('ask.placeholder')} />
			<button type="submit" aria-label={t('ask.send')}><ArrowUpRight size={20} /></button>
		</form>
	</div>
</section>

<!-- 2 · Marquee on a lacquer band -->
<div class="marquee" aria-hidden="true">
	<div class="track">
		{#each [0, 1] as copy (copy)}
			<span class="run">{#each marquee as w (w)}<span>{w}</span><i>✦</i>{/each}</span>
		{/each}
	</div>
</div>

<!-- Visit essentials, one glance below the hero -->
<section class="wrap infostrip" aria-label={t('nav.visit')}>
	<div><MapPin size={20} /><span>{L({ th: 'บ้านเมืองเตา มหาสารคาม', zh: '玛哈沙拉堪 孟涛村', en: 'Ban Mueang Tao, Maha Sarakham' })}</span></div>
	<a class="btn" href="/visit">{L({ th: 'ข้อมูลการเยี่ยมชม', zh: '参观信息', en: 'Plan your visit' })} <ArrowUpRight size={18} /></a>
</section>

<!-- 3 · Today at the shrine -->
<section class="wrap today-wrap">
	<div class="almanac lux" use:reveal={{ children: true, y: 20 }}>
		<div class="ev-col">
			<p class="eyebrow">{t('home.upcoming')}</p>
			{#if next && left}
				<div class="ev-row">
					<div>
						<h3 class="val">{tr(next.title)}</h3>
						<p class="sub">{fmtDate(next.starts_at, { day: 'numeric', month: 'long' })} · {fmtTime(next.starts_at)}</p>
						<a class="link" href="/calendar">{t('nav.calendar')} <ArrowUpRight size={16} /></a>
					</div>
					<div class="count" aria-label={L({ th: 'นับถอยหลัง', zh: '倒计时', en: 'Countdown' })}>
						{#each [[left.d, L({ th: 'วัน', zh: '天', en: 'd' })], [left.h, L({ th: 'ชม.', zh: '时', en: 'h' })], [left.m, L({ th: 'นาที', zh: '分', en: 'm' })], [left.s, L({ th: 'วิ', zh: '秒', en: 's' })]] as [n, u], i (i)}
							<div><strong>{pad(n as number)}</strong><span>{u}</span></div>
						{/each}
					</div>
				</div>
			{:else}
				<p class="sub">{t('home.noUpcoming')}</p>
			{/if}
		</div>
		<div class="side">
			<div class="mini">
				<span class="swatch" style:--c={color.hex}></span>
				<div>
					<p class="eyebrow">{L({ th: 'สีมงคลวันนี้', zh: '今日吉色', en: "Today's lucky colour" })}</p>
					<p class="mval">{tr(color.name)}</p>
					<p class="sub">{tr(color.day)} · {L({ th: 'ตามความเชื่อไทย', zh: '泰国传统信仰', en: 'by Thai tradition' })}</p>
				</div>
			</div>
			<a class="mini mini-link" href="/visit">
				<span class="ico"><Clock size={22} /></span>
				<div>
					<p class="eyebrow">{t('place.hours')}</p>
					<p class="mval num">{shrine?.open_hours || '06:00–18:00'}</p>
					<p class="sub">{L({ th: 'เปิดให้สักการะทุกวัน', zh: '每日开放参拜', en: 'Open for worship daily' })}</p>
				</div>
			</a>
		</div>
	</div>
</section>

<!-- 4 · Statement -->
<section class="wrap statement center">
	<p class="eyebrow">{t('nav.about')}</p>
	{#key statement}
		<p class="lede" use:scrubText>{statement}</p>
	{/key}
</section>

<!-- 5 · How to make a wish -->
<div class="ornament-divider" aria-hidden="true"><span></span></div>
<section class="ritual paper">
	<div class="wrap">
		<div class="section-head">
			<div>
				<p class="eyebrow">{t('nav.guide')}</p>
				<h2 class="gold-text" use:splitReveal={{ scroll: true }}>{L({ th: 'ขอพรอย่างไรให้ถูกต้อง', zh: '如何正确祈福', en: 'How to make a wish properly' })}</h2>
			</div>
			<a class="more" href="/guide">{t('common.more')} <ArrowUpRight size={16} /></a>
		</div>
		<ol class="steps" use:reveal={{ children: true, y: 50 }}>
			{#each ritual as s, i (i)}
				{@const Icon = s.icon}
				<li>
					<span class="orb"><Icon size={26} /></span>
					<span class="no">{pad(i + 1)}</span>
					<h3>{s.title}</h3>
					<p>{s.text}</p>
				</li>
			{/each}
		</ol>
		<p class="small muted note">{L({ th: 'แนวทางทั่วไป ขั้นตอนที่ผ่านการตรวจสอบจากชุมชนอยู่ในหน้าการสักการะ', zh: '一般指引；经社区核实的步骤见参拜指南', en: 'General guidance; the community-verified steps are on the guide page' })}</p>
	</div>
</section>

<!-- 6 · Bento -->
<section class="wrap section">
	<div class="section-head">
		<div>
			<p class="eyebrow">{t('home.story')}</p>
			<h2 use:splitReveal={{ scroll: true }}>{L({ th: 'เริ่มสำรวจจากตรงไหนดี', zh: '从哪里开始探索', en: 'Where would you like to begin' })}</h2>
		</div>
	</div>
	<div class="bento" use:reveal={{ children: true, y: 60 }}>
		{#each bento as b (b.href)}
			<a class="tile {b.cls}" href={b.href} use:spotlight>
				{#if b.img}<img src={b.img} alt="" loading="lazy" />{/if}
				<div class="tile-text"><h3>{b.title}</h3><p>{b.sub}</p></div>
			</a>
		{/each}
	</div>
</section>

<!-- 7 · Places, sideways -->
<section class="hscroll">
	<div class="hs-head section-head wrap">
		<div>
			<p class="eyebrow">{t('home.places')}</p>
			<h2 class="gold-text">{t('nav.places')}</h2>
		</div>
		<a class="btn quiet small" href="/places">{t('common.more')} <ArrowUpRight size={16} /></a>
	</div>
	<div class="hs-track" data-track>
		{#each places.data ?? [] as p, i (p.id)}
			<a class="hs-card" href="/places/{p.id}">
				<div class="hs-media gold-frame"><Thumb src={p.images[0]} kind={p.category} ratio="3 / 4" alt={tr(p.name)} /></div>
				<div class="hs-meta">
					<span class="idx">{pad(i + 1)}</span>
					<div>
						<h3>{tr(p.name)}</h3>
						<p><span>{tx(`cat.${p.category}`)}</span> · <Clock size={13} /> {p.visit_minutes} {t('common.minutes')}</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
</section>

<!-- 8 · Wish call-out -->
<div class="ornament-divider" aria-hidden="true"><span></span></div>
<section class="wish-cta">
	<div class="wrap wc-inner">
		<div class="wc-yantra" use:reveal={{ y: 0 }}><Yantra size="100%" speed={0.2} /></div>
		<div use:reveal={{ children: true }}>
			<p class="eyebrow">{L({ th: 'ขอพรออนไลน์', zh: '在线祈福', en: 'Wish online' })}</p>
			<h2 class="gold-text">{L({ th: 'ฝากคำอธิษฐาน ถึงเจ้าพ่อ', zh: '把心愿托付给神明', en: 'Leave your wish with Chao Pho' })}</h2>
			<p class="muted">{L({ th: 'จุดธูปสามดอก ตั้งจิตอธิษฐาน แล้วเตรียมตัวมาสักการะที่ศาลจริงเมื่อมีโอกาส คำอธิษฐานของคุณอยู่แค่ในเครื่องของคุณ ไม่มีการบันทึก', zh: '点三炷香，静心许愿，有机会再亲临神祠参拜。您的心愿只留在您的设备上，不会被保存。', en: 'Light three sticks of incense, make your wish, and visit the shrine in person when you can. Your wish stays on your device — nothing is stored.' })}</p>
			<a class="btn accent big" href="/wish"><Flame size={20} /> {L({ th: 'เริ่มขอพร', zh: '开始祈福', en: 'Begin' })}</a>
		</div>
	</div>
</section>

<!-- 9 · Stories -->
<section class="wrap section">
	<div class="section-head">
		<div>
			<p class="eyebrow">{t('nav.history')}</p>
			<h2 use:splitReveal={{ scroll: true }}>{t('home.story')}</h2>
		</div>
		<a class="more" href="/history">{t('common.more')} <ArrowUpRight size={16} /></a>
	</div>
	<div class="grid stories">
		{#each (stories.data ?? []).slice(0, 3) as k (k.id)}<StoryCard {k} />{/each}
	</div>
</section>


<style>
	/* ---------- hero ---------- */
	.hero {
		position: relative;
		min-height: 100svh;
		display: flex;
		align-items: center;
		overflow: hidden;
		isolation: isolate;
		text-align: center;
		border-radius: 0 0 48px 48px;
	}
	.bg {
		position: absolute;
		inset: -10% 0 0;
		z-index: -3;
	}
	.bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 25%;
		filter: saturate(1.15) contrast(1.05);
		animation: kenburns 30s ease-out both;
	}
	@keyframes kenburns {
		from {
			transform: scale(1.2);
		}
	}
	.hero::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -2;
		background:
			radial-gradient(60% 55% at 50% 50%, rgb(18 4 6 / 0.25), rgb(18 4 6 / 0.7) 80%),
			linear-gradient(180deg, rgb(90 8 16 / 0.35), rgb(18 4 6 / 0.15) 40%, rgb(18 4 6 / 0.9));
	}
	.yantra-wrap {
		position: absolute;
		left: 50%;
		top: 46%;
		translate: -50% -50%;
		z-index: -1;
		opacity: 0.3;
		pointer-events: none;
	}
	.inner {
		position: relative;
		padding-block: 150px var(--space-7);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.kicker {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 16px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--line-strong);
		background: rgb(20 5 8 / 0.7);
		font-size: var(--text-caption);
		color: var(--gold-300);
	}
	.pre {
		margin: var(--space-5) 0 0;
		font-family: var(--font-head);
		font-size: var(--text-lead);
		letter-spacing: 0.06em;
		color: var(--gold-300);
		text-transform: uppercase;
	}
	.hero h1 {
		font-size: clamp(3rem, 9vw, 7.6rem);
		line-height: 1.1;
		margin: var(--space-3) 0 var(--space-4);
		max-width: none;
		filter: drop-shadow(0 6px 30px rgb(233 190 98 / 0.35));
	}
	.tagline {
		font-size: var(--text-title);
		color: var(--smoke-200);
		margin: 0 auto var(--space-5);
	}
	.ctas {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
	}
	@media (max-width: 520px) {
		.ctas {
			width: 100%;
			flex-direction: column;
		}
		.ctas :global(.btn) {
			width: 100%;
			justify-content: center;
		}
	}
	:global(.btn.big) {
		min-height: 58px;
		padding: 0 32px;
		font-size: var(--text-lead);
	}
	.askbar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: min(100%, 640px);
		margin-top: var(--space-6);
		padding: 8px 8px 8px 22px;
		border-radius: var(--radius-pill);
		background: rgb(20 5 8 / 0.82);
		border: 1px solid var(--line-strong);
		color: var(--gold-300);
	}
	.askbar input {
		border: 0;
		background: transparent;
		color: var(--smoke-50);
		padding: 0;
		min-height: 46px;
		box-shadow: none;
	}
	.askbar input::placeholder {
		color: var(--smoke-400);
	}
	.askbar button {
		flex: none;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 0;
		background: var(--gold-grad);
		color: var(--night-950);
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: transform 400ms var(--ease-out);
	}
	.askbar button:hover {
		transform: rotate(45deg);
	}

	/* ---------- marquee ---------- */
	.marquee {
		overflow: clip;
		contain: paint;
		background: var(--night-950);
		border-block: 2px solid transparent;
		border-image: var(--gold-grad) 1;
		margin: 0;
		padding-block: 10px 6px;
		position: relative;
		z-index: 3;
	}
	.track {
		display: flex;
		width: max-content;
		animation: marquee 45s linear infinite;
	}
	.run {
		display: flex;
		align-items: center;
		gap: 28px;
		padding-right: 28px;
		font-family: var(--font-display);
		line-height: 1.5;
		font-size: clamp(1.5rem, 3vw, 2.4rem);
		line-height: 1.7;
		white-space: nowrap;
		color: var(--gold-200);
	}
	.run i {
		font-style: normal;
		color: var(--gold-400);
		font-size: 0.6em;
	}
	@keyframes marquee {
		to {
			transform: translateX(-50%);
		}
	}

	/* ---------- today ---------- */
	/* Readability scrim: a soft dark pool behind the hero copy. */
	.inner::before {
		content: '';
		position: absolute;
		inset: 15% -10% 0;
		z-index: -1;
		background: radial-gradient(closest-side, rgb(12 3 5 / 0.6), transparent);
		pointer-events: none;
	}
	.tagline {
		text-shadow: 0 2px 12px rgb(0 0 0 / 0.6);
		word-break: keep-all;
		text-wrap: balance;
	}
	.askl {
		flex: none;
		font-weight: 600;
		color: var(--gold-300);
		white-space: nowrap;
	}
	@media (max-width: 480px) {
		.askl {
			display: none;
		}
	}
	.infostrip {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-3) var(--space-5);
		margin-top: var(--space-7);
		padding: var(--space-4) var(--space-5);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-1);
	}
	.infostrip div {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-body);
	}
	.infostrip :global(svg) {
		color: var(--accent);
		flex: none;
	}

	@media (max-width: 640px) {
		.infostrip .btn {
			width: 100%;
			justify-content: center;
		}
	}
	.today {
		display: grid;
		gap: var(--space-4);
		margin-top: var(--space-8);
	}
	@media (min-width: 900px) {
		.today {
			grid-template-columns: 1fr 1.3fr 1fr;
		}
	}
	.today-wrap {
		margin-top: var(--space-6);
	}
	.almanac {
		display: grid;
		align-items: center;
		gap: 0;
		padding: var(--space-5);
	}
	@media (min-width: 700px) {
		.almanac {
			grid-template-columns: 1fr 1fr;
			padding: var(--space-5) var(--space-6);
		}
	}
	.almanac .eyebrow {
		margin: 0 0 var(--space-1);
	}
	.ev-col {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-2);
		padding-bottom: var(--space-5);
	}
	@media (min-width: 700px) {
		.ev-col {
			padding: 0 var(--space-6) 0 0;
			border-right: 1px solid rgb(241 198 106 / 0.18);
		}
	}
	.ev-row {
		display: grid;
		gap: var(--space-4);
		align-items: center;
	}
	@media (min-width: 1100px) {
		/* Title on the left, countdown on the right: the row reads as one line. */
		.ev-row {
			grid-template-columns: 1fr;
		}
	}
	.val {
		font-family: var(--font-head);
		font-size: clamp(1.4rem, 2.2vw, 1.8rem);
		font-weight: 700;
		line-height: 1.35;
		margin: 0 0 4px;
	}
	.sub {
		margin: 0;
		color: var(--fg-muted);
		font-size: var(--text-small);
	}
	.link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 40px;
		margin-top: 2px;
		align-self: start;
		color: var(--gold-300);
		font-weight: 500;
	}
	.side {
		display: grid;
		border-top: 1px solid rgb(241 198 106 / 0.18);
	}
	@media (min-width: 700px) {
		.side {
			border-top: 0;
			padding-left: var(--space-6);
		}
	}
	.mini {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--space-2) var(--space-4);
		padding-block: var(--space-4);
	}
	.mini + .mini {
		border-top: 1px solid rgb(241 198 106 / 0.12);
	}
	.mini {
		grid-template-columns: 52px 1fr;
		color: inherit;
	}
	.mini .swatch,
	.mini .ico {
		justify-self: center;
	}
	.mini-link {
		border-radius: var(--radius-m);
		transition: background-color 250ms;
	}
	.mini-link:hover {
		background: rgb(241 198 106 / 0.06);
		color: inherit;
	}
	.mval {
		margin: 0;
		font-family: var(--font-head);
		font-size: var(--text-h4);
		font-weight: 700;
		line-height: 1.3;
	}
	.mval.num {
		color: var(--gold-300);
		font-variant-numeric: tabular-nums;
	}
	.ico {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid var(--line-strong);
		color: var(--gold-300);
	}
	.swatch {
		width: 36px;
		height: 36px;
		margin: 4px;
		flex: none;
		border-radius: 50%;
		background: color-mix(in srgb, var(--c) 78%, #7a5a3a);
		box-shadow:
			0 0 0 3px var(--night-900),
			0 0 0 5px var(--gold-400),
			0 0 24px color-mix(in srgb, var(--c) 70%, transparent);
	}
	.count {
		display: grid;
		grid-template-columns: repeat(4, 64px);
		gap: var(--space-2);
	}
	.count div {
		text-align: center;
		border-radius: var(--radius-m);
		background: rgb(0 0 0 / 0.25);
		border: 1px solid var(--line);
		padding: var(--space-3) 0;
	}
	.count strong {
		display: block;
		font-family: var(--font-head);
		font-size: clamp(1.4rem, 2.4vw, 1.9rem);
		font-weight: 600;
		line-height: 1.2;
		color: var(--gold-300);
		font-variant-numeric: tabular-nums;
	}
	.count span {
		font-size: var(--text-caption);
		color: var(--fg-muted);
	}

	/* ---------- statement ---------- */
	.statement {
		padding-block: var(--space-7);
	}
	.lede {
		font-family: var(--font-head);
		font-size: clamp(1.15rem, 1.9vw, 1.5rem);
		font-weight: 400;
		line-height: 1.8;
		max-width: 34em;
		color: var(--smoke-200);
		margin-inline: auto;
	}

	/* ---------- ritual ---------- */
	.ritual {
		position: relative;
		padding-block: var(--space-8);
	}
	.steps {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-4);
		grid-template-columns: none;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		counter-reset: s;
	}
	.steps li {
		flex: 1 1 200px;
		max-width: 260px;
		position: relative;
		padding: var(--space-6) var(--space-5) var(--space-5);
		border-radius: var(--radius-l);
		background: rgb(255 255 255 / 0.03);
		border: 1px solid var(--line);
		transition:
			transform 500ms var(--ease-out),
			border-color 400ms,
			box-shadow 400ms;
	}
	.steps li:hover {
		transform: translateY(-6px);
		border-color: var(--gold-500);
		box-shadow: var(--glow);
	}
	.orb {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #ffe9a8, #d4a341 55%, #8f6420);
		color: var(--night-950);
		box-shadow: 0 0 30px rgb(233 190 98 / 0.45);
		margin-bottom: var(--space-4);
	}
	.no {
		position: absolute;
		top: var(--space-4);
		right: var(--space-5);
		font-family: var(--font-head);
		font-weight: 700;
		font-size: 1.25rem;
		color: transparent;
		-webkit-text-stroke: 1px var(--gold-500);
		opacity: 0.6;
	}
	.steps h3 {
		font-family: var(--font-head);
		font-size: var(--text-title);
		margin-bottom: 4px;
	}
	.steps p {
		margin: 0;
		color: var(--fg-muted);
		font-size: var(--text-small);
	}
	.note {
		margin-top: var(--space-7) !important;
		margin-inline: auto;
		max-width: 40em;
		text-align: center !important;
		text-align: center;
		position: relative;
	}
	@media (max-width: 1099px) {
		.steps li {
			display: grid;
			grid-template-columns: 52px 1fr;
			column-gap: var(--space-4);
			align-items: center;
			padding: var(--space-4);
		}
		.orb {
			width: 52px;
			height: 52px;
			margin: 0;
			grid-row: span 2;
		}
		.no {
			top: var(--space-3);
			font-size: 1.6rem;
		}
		.steps h3 {
			margin: 0;
		}
	}

	/* ---------- bento ---------- */
	.bento {
		display: grid;
		gap: var(--space-4);
	}
	@media (min-width: 760px) {
		.bento {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1100px) {
		.bento {
			grid-template-columns: repeat(4, 1fr);
			grid-auto-rows: 260px;
			grid-auto-flow: dense;
		}
		.b1 {
			grid-column: span 2;
			grid-row: span 2;
		}
		.b3,
		.b5,
		.b6 {
			grid-column: span 2;
		}
	}
	.tile {
		position: relative;
		min-height: 260px;
		border-radius: var(--radius-l);
		overflow: hidden;
		color: var(--smoke-50);
		background: var(--night-800);
		display: flex;
		align-items: end;
		isolation: isolate;
		border: 1px solid var(--line);
	}
	.tile img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: -2;
		transition: transform 1s var(--ease-out);
	}
	.tile::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(180deg, rgb(18 4 6 / 0.2) 10%, rgb(18 4 6 / 0.97) 75%);
	}
	.tile::after {
		content: '';
		position: absolute;
		inset: 0;
		opacity: 0;
		background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgb(233 190 98 / 0.25), transparent 60%);
		transition: opacity 400ms;
		pointer-events: none;
	}
	.tile:hover::after {
		opacity: 1;
	}
	.tile:hover {
		color: var(--smoke-50);
		border-color: var(--gold-500);
	}
	.tile:hover img {
		transform: scale(1.07);
	}
	.tile-text {
		position: relative;
		z-index: 1;
		padding: var(--space-5);
	}
	.tile h3 {
		font-family: var(--font-head);
		font-weight: 700;
		line-height: 1.35;
		font-size: clamp(1.25rem, 1.8vw, 1.6rem);
		margin: 0 0 4px;
	}
	.b1 h3 {
		font-size: clamp(1.5rem, 2.4vw, 2rem);
	}
	.tile p {
		margin: 0;
		color: var(--smoke-200);
	}

	/* ---------- places ---------- */
	.hscroll {
		padding-block: var(--space-7);
		overflow: hidden;
	}
	.hs-head h2 {
		margin: 0;
	}
	.hs-track {
		display: flex;
		gap: var(--space-5);
		padding-inline: max(20px, calc((100vw - 1320px) / 2 + var(--space-6)));
		scroll-padding-inline: 20px;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
	}
	@media (min-width: 900px) {
		.hs-track {
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			overflow: visible;
			max-width: 1320px;
			margin-inline: auto;
			padding-inline: var(--space-6);
		}
		.hs-track .hs-card {
			width: auto;
		}
	}
	.hs-card {
		flex: none;
		width: min(78vw, 380px);
		scroll-snap-align: start;
		color: var(--fg);
		display: flex;
		flex-direction: column;
	}
	.hs-meta > div {
		display: flex;
		flex-direction: column;
	}
	.hs-meta > div > p {
		margin-top: auto;
		padding-top: 4px;
	}
	.hs-media {
		border-radius: var(--radius-l);
		overflow: hidden;
	}
	.hs-media :global(img) {
		transition: transform 900ms var(--ease-out);
	}
	.hs-card:hover :global(img) {
		transform: scale(1.06);
	}
	.hs-meta {
		display: flex;
		flex: 1;
		gap: var(--space-3);
		padding-top: var(--space-4);
	}
	.idx {
		font-family: var(--font-mono);
		color: var(--gold-400);
		font-size: var(--text-small);
		padding-top: 6px;
	}
	.hs-meta h3 {
		font-size: var(--text-h4);
		margin: 0;
	}
	.hs-meta p {
		font-size: var(--text-small);
		color: var(--smoke-200);
		margin: 0;
		color: var(--fg-muted);
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: var(--text-small);
	}

	/* ---------- wish cta ---------- */
	.wish-cta {
		position: relative;
		overflow: hidden;
		margin-block: var(--space-7);
		padding-block: var(--space-8);
		/* A glow that fades out inside the band, so the page background runs through unbroken. */
		background: radial-gradient(45% 50% at 25% 50%, rgb(200 32 44 / 0.3), transparent 100%);
	}
	.wc-inner {
		position: relative;
		display: grid;
		gap: var(--space-6);
		align-items: center;
	}
	@media (min-width: 900px) {
		.wc-inner {
			grid-template-columns: 1fr 1.1fr;
		}
	}
	.wc-yantra {
		max-width: min(460px, 60vw);
		justify-self: center;
		width: 100%;
	}
	.wish-cta h2 {
		margin-bottom: var(--space-4);
	}

	.stories {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
	}
	.photo-credit {
		margin-top: var(--space-6);
	}
	@media (max-width: 1099px) {
		.steps {
			max-width: 640px;
			margin-inline: auto;
		}
		.steps li {
			flex-basis: 100%;
			max-width: none;
		}
	}
	@media (max-width: 640px) {
		.wc-yantra {
			max-width: 200px;
		}
	}
	@media (max-width: 759px) {
		.bento {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-3);
		}
		.tile {
			min-height: 190px;
		}
		.b1 {
			grid-column: auto;
			grid-row: auto;
		}
		.tile-text {
			padding: var(--space-3);
		}
		.tile h3 {
			font-size: var(--text-lead);
		}

	}
	@media (max-width: 899px) {
		.wc-inner {
			text-align: center;
			justify-items: center;
			gap: var(--space-3);
		}
		.wc-inner .eyebrow {
			justify-content: center;
		}
		.wc-yantra {
			max-width: 160px;
		}
	}

	.bg {
		background: radial-gradient(80% 70% at 50% 40%, #5a1a1c, #1a0507);
	}
	@media (max-width: 640px) {
		.infostrip {
			margin-inline: 16px;
			width: auto;
		}
	}
	@media (max-width: 1099px) {
		.stories :global(.card .body h3) {
			font-size: var(--text-lead);
		}
	}
	.tile p {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		/* steps: 3 + 2, centred, every card the same width */
		.steps {
			display: flex !important;
			flex-wrap: wrap;
			justify-content: center;
			max-width: none !important;
			gap: var(--space-3);
		}
		.steps li {
			flex: 0 0 calc((100% - 2 * var(--space-3)) / 3) !important;
			max-width: none !important;
			display: block !important;
			padding: var(--space-5) var(--space-4) !important;
		}
		.steps li .orb {
			width: 52px !important;
			height: 52px !important;
			margin-bottom: var(--space-3) !important;
		}
		/* explore: an even 2 × 3 */
		.bento {
			grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
			grid-auto-rows: 220px;
		}
		.bento > * {
			grid-column: auto !important;
			grid-row: auto !important;
		}
		.tile p {
			display: -webkit-box !important;
		}
		/* places: 2 × 2 grid instead of a swipe row */
		.hs-track {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			overflow: visible;
			padding-inline: 32px;
			gap: var(--space-5) var(--space-4);
		}
		.hs-track .hs-card {
			width: auto;
		}
		.hs-media :global(.thumb) {
			aspect-ratio: 4 / 3 !important;
		}

		/* wish call-out: emblem beside the words */
		.wc-inner {
			grid-template-columns: 0.8fr 1.2fr;
			text-align: left !important;
			justify-items: start !important;
		}
		.wc-inner .eyebrow {
			justify-content: flex-start !important;
		}
		.wc-yantra {
			max-width: 300px !important;
		}
	}
	@media (min-width: 1100px) {
		.today-wrap .almanac {
			max-width: 1040px;
			margin-inline: auto;
		}
		.steps li {
			padding: var(--space-6) var(--space-5) var(--space-5);
		}
		.steps h3 {
			font-size: var(--text-h4) !important;
		}
		.steps p {
			font-size: var(--text-body) !important;
		}
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.bento {
			grid-auto-rows: 240px !important;
		}
		.tile {
			min-height: 0 !important;
			height: 100%;
		}
	}
	@media (max-width: 699px) {
		.tile p {
			display: none !important;
		}
	}
	@media (min-width: 1100px) {
		.today-wrap .almanac {
			max-width: none !important;
		}
	}
	@media (min-width: 1100px) {
		.infostrip {
			width: fit-content;
			margin-inline: auto;
			padding-inline: var(--space-6);
		}
	}

	.count {
		grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
		width: 100%;
		max-width: 420px;
	}
	@media (max-width: 699px) {
		.ritual,
		.wish-cta {
			padding-block: var(--space-7) !important;
		}
	}
	.note {
		text-wrap: balance;
	}
	@media (max-width: 699px) {
		.note {
			text-align: left;
		}
	}
	@media (max-width: 699px) {
		.infostrip {
			margin-top: var(--space-5) !important;
		}
		.wish-cta {
			margin-block: var(--space-6) !important;
		}
	}
	@media (max-width: 699px) {
		.wc-yantra {
			max-width: 120px !important;
		}
	}
	/* ---- Hero: single source of truth for size and vertical rhythm ---- */
	.hero {
		--hdr: 74px; /* bottom of the floating header */
		--g-top: 56px;
		--g-kt: 24px;
		--g-tt: 20px;
		--g-tc: 32px;
		--g-ca: 32px;
		--g-bot: 56px;
		--h1: clamp(2.75rem, 12vw, 3.25rem);
		min-height: auto;
	}
	@media (min-width: 700px) {
		.hero {
			--g-top: 72px;
			--g-kt: 32px;
			--g-tt: 24px;
			--g-tc: 40px;
			--g-ca: 40px;
			--g-bot: 88px;
			--h1: clamp(4rem, 7vw, 4.75rem);
		}
	}
	@media (min-width: 1100px) {
		.hero {
			--hdr: 80px;
			--g-top: 88px;
			--g-kt: 36px;
			--g-tt: 28px;
			--g-tc: 44px;
			--g-ca: 48px;
			--g-bot: 104px;
			--h1: clamp(4.75rem, 5vw, 6rem);
		}
	}
	.hero .inner {
		padding-block: calc(var(--hdr) + var(--g-top)) var(--g-bot);
		width: 100%;
	}
	.hero h1 {
		font-size: var(--h1);
		line-height: 1.25;
		/* .gold-text pads 0.75em / 0.2em; Charm tone marks rise ~0.2em above the ascent, so give that back. */
		/* The title has no descenders, so the space under its ink is taken back as well. */
		margin: calc(var(--g-kt) + 0.2em - 0.75em) 0 calc(var(--g-tt) - 0.45em);
		filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.85)) drop-shadow(0 8px 28px rgb(0 0 0 / 0.75));
	}
	.hero .kicker {
		margin: 0;
	}
	.hero .tagline {
		margin: 0 auto var(--g-tc);
	}
	.hero .askbar {
		margin-top: var(--g-ca);
		width: min(100%, 560px);
	}
	.inner::before {
		inset: 8% -20% 0;
		background: radial-gradient(closest-side, rgb(10 2 4 / 0.78), rgb(10 2 4 / 0.35) 70%, transparent);
	}
	/* The emblem sits behind the content, not the box: the top padding is larger than the bottom. */
	.yantra-wrap {
		top: calc(50% + (var(--hdr) + var(--g-top) - var(--g-bot)) / 2);
		width: min(78vw, 300px);
		opacity: 0.16;
	}
	.yantra-wrap :global(svg) {
		width: 100%;
		height: auto;
	}
	@media (min-width: 700px) {
		.yantra-wrap {
			width: min(60vw, 460px);
			opacity: 0.25;
		}
	}
	@media (min-width: 1100px) {
		.yantra-wrap {
			width: min(42vw, 600px);
			opacity: 0.3;
		}
	}
	/* ---- Distinct bands: three sections, each its own material and edge; the rest sits on the base ---- */
	.ornament-divider {
		display: flex;
		align-items: center;
		gap: 14px;
		max-width: 420px;
		margin: var(--space-6) auto;
		padding-inline: var(--space-5);
	}
	.ornament-divider::before,
	.ornament-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--gold-500));
	}
	.ornament-divider::after {
		transform: scaleX(-1);
	}
	.ornament-divider span {
		width: 9px;
		height: 9px;
		rotate: 45deg;
		background: var(--gold-grad);
		box-shadow:
			0 0 0 4px var(--night-950),
			0 0 0 5px rgb(212 163 65 / 0.6);
	}

	/* 1 · Ritual: a parchment leaf with lotus-scalloped edges, the page's brightest moment. */
	.ritual {
		background: linear-gradient(180deg, var(--parchment-100), var(--parchment-200));
		padding-block: clamp(72px, 9vw, 120px);
		-webkit-mask:
			radial-gradient(14px at 50% 0, #0000 98%, #000) top / 28px 51% repeat-x,
			radial-gradient(14px at 50% 100%, #0000 98%, #000) bottom / 28px 51% repeat-x;
		mask:
			radial-gradient(14px at 50% 0, #0000 98%, #000) top / 28px 51% repeat-x,
			radial-gradient(14px at 50% 100%, #0000 98%, #000) bottom / 28px 51% repeat-x;
	}
	.ritual h2 {
		background: none;
		color: var(--lacquer-600);
		filter: none;
	}
	.ritual .eyebrow {
		color: var(--lacquer-600);
	}
	.ritual .steps li {
		background: var(--parchment-50);
		border-color: #d9bf8a;
		box-shadow: 0 6px 18px -10px rgb(143 100 32 / 0.35);
	}
	.ritual .steps h3 {
		color: var(--ink-900);
	}
	.ritual .steps p,
	.ritual .note {
		color: var(--ink-500);
	}
	.ritual .no {
		color: rgb(163 20 31 / 0.55);
	}

	/* 2 · Places: an inset lacquered-wood panel, darker than the page so the photos glow. */
	.hscroll {
		margin-inline: clamp(12px, 3vw, 40px);
		margin-block: var(--space-7);
		border-radius: 28px;
		padding-block: clamp(48px, 6vw, 88px);
		background:
			radial-gradient(120% 70% at 50% 0, rgb(160 60 40 / 0.22), transparent 70%),
			linear-gradient(180deg, #2e1210, #1d0a09);
		border: 1px solid rgb(212 163 65 / 0.7);
		box-shadow:
			inset 0 0 0 8px #241010,
			inset 0 0 0 9px rgb(212 163 65 / 0.4),
			0 30px 60px -30px #000;
	}

	/* 3 · Wish: a vermilion lacquer band with slanted edges, the page's call to action. */
	.wish-cta {
		--cut: 3vw;
		margin-block: 0;
		padding-block: calc(var(--cut) + clamp(56px, 7vw, 104px));
		background:
			radial-gradient(circle, rgb(246 216 139 / 0.07) 0 2px, transparent 3px) 0 0 / 34px 34px,
			var(--lacquer-grad);
		clip-path: polygon(0 var(--cut), 100% 0, 100% calc(100% - var(--cut)), 0 100%);
		color: #fbe9e0;
	}
	.wish-cta .muted {
		color: rgb(251 233 224 / 0.82);
	}
	.wish-cta .eyebrow {
		color: var(--gold-200);
	}
	@media (max-width: 699px) {
		.wish-cta {
			--cut: 24px;
		}
		.ritual {
			padding-block: 64px;
		}
	}
</style>
