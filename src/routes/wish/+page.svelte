<script lang="ts">
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Coins from '@lucide/svelte/icons/coins';
	import Heart from '@lucide/svelte/icons/heart';
	import HeartPulse from '@lucide/svelte/icons/heart-pulse';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import House from '@lucide/svelte/icons/house';
	import Flame from '@lucide/svelte/icons/flame';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { t, tr } from '#lib/i18n.svelte.ts';
	import { useOverPhoto } from '#lib/chrome.svelte.ts';
	import { reveal, splitReveal } from '#lib/motion.ts';
	import Embers from '#lib/components/Embers.svelte';
	import Smoke from '#lib/components/Smoke.svelte';
	import Yantra from '#lib/components/Yantra.svelte';
	import type { I18n } from '#lib/types.ts';

	// A private, symbolic ritual. The wish never leaves the browser: nothing is sent or stored
	// on the server, and the page gives blessings only — never predictions (project AI rules).
	useOverPhoto();
	const L = (v: I18n) => tr(v);

	const topics = [
		{ id: 'work', icon: Briefcase, label: { th: 'การงาน', zh: '事业', en: 'Work' } },
		{ id: 'wealth', icon: Coins, label: { th: 'โชคลาภ', zh: '财运', en: 'Fortune' } },
		{ id: 'love', icon: Heart, label: { th: 'ความรัก', zh: '爱情', en: 'Love' } },
		{ id: 'health', icon: HeartPulse, label: { th: 'สุขภาพ', zh: '健康', en: 'Health' } },
		{ id: 'study', icon: GraduationCap, label: { th: 'การเรียน', zh: '学业', en: 'Studies' } },
		{ id: 'family', icon: House, label: { th: 'ครอบครัว', zh: '家庭', en: 'Family' } }
	] as const;

	let step = $state<'choose' | 'write' | 'lit'>('choose');
	let topic = $state<string>('');
	let wish = $state('');
	let lit = $state(false);
	let count = $state(0);

	$effect(() => {
		try {
			count = Number(localStorage.getItem('wish_count') ?? 0) || 0;
		} catch {
			count = 0;
		}
	});

	function light() {
		lit = true;
		setTimeout(() => (step = 'lit'), 2600);
		try {
			localStorage.setItem('wish_count', String(++count));
		} catch {
			/* private mode: counter just won't persist */
		}
	}
	function again() {
		step = 'choose';
		topic = '';
		wish = '';
		lit = false;
	}
	const chosen = $derived(topics.find((x) => x.id === topic));
</script>

<section class="stage">
	<Smoke plumes={lit ? 5 : 3} />
	<Embers count={lit ? 40 : 16} />
	<div class="yantra" aria-hidden="true"><Yantra size="min(110vw, 820px)" speed={lit ? 4 : 1} /></div>

	<div class="wrap inner">
		<p class="eyebrow">{L({ th: 'ขอพรออนไลน์', zh: '在线祈福', en: 'Wish online' })}</p>
		<h1 class="gold-text">{L({ th: 'ตั้งจิต อธิษฐาน', zh: '静心 · 许愿', en: 'Still your mind, make a wish' })}</h1>
		<p class="intro">{L({ th: 'เลือกเรื่องที่อยากขอ เขียนคำอธิษฐาน แล้วจุดธูปสามดอก คำอธิษฐานไม่ถูกบันทึกที่ใด', zh: '选择心愿类别，写下祈愿，再点三炷香。心愿不会被保存。', en: 'Pick what you wish for, write it, then light three incense sticks. Nothing is stored.' })}</p>

		<!-- Altar -->
		<div class="altar" class:lit aria-hidden="true">
			<div class="candle l"><span class="flame"></span></div>
			<svg viewBox="0 0 240 200" class="urn">
				<defs>
					<linearGradient id="urn-g" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stop-color="#f6d88b" />
						<stop offset="0.5" stop-color="#c69538" />
						<stop offset="1" stop-color="#7a5418" />
					</linearGradient>
					<radialGradient id="tip-g">
						<stop offset="0" stop-color="#fff2b0" />
						<stop offset="0.4" stop-color="#ff7a2e" />
						<stop offset="1" stop-color="#ff7a2e" stop-opacity="0" />
					</radialGradient>
				</defs>
				{#each [-26, 0, 26] as dx, i (i)}
					<g class="stick" style:--d="{i * 0.25}s">
						<path class="smoke-line" d="M{120 + dx} 40 C {110 + dx} 20, {135 + dx} 5, {118 + dx} -30 S {128 + dx} -80, {116 + dx} -120" />
						<line x1={120 + dx * 0.4} y1="132" x2={120 + dx} y2="42" stroke="#7a1b1b" stroke-width="3" stroke-linecap="round" />
						<circle class="tip" cx={120 + dx} cy="42" r="9" fill="url(#tip-g)" />
					</g>
				{/each}
				<path d="M48 130 H192 L178 186 Q120 200 62 186 Z" fill="url(#urn-g)" />
				<rect x="40" y="122" width="160" height="14" rx="7" fill="#f6d88b" />
				<path d="M70 156 H170" stroke="#8f6420" stroke-width="2" />
				<circle cx="120" cy="166" r="9" fill="none" stroke="#8f6420" stroke-width="2" />
			</svg>
			<div class="candle r"><span class="flame"></span></div>
		</div>

		{#if step === 'choose'}
			<ol class="how" aria-label="steps">
				{#each ['wish.how1', 'wish.how2', 'wish.how3'] as k, i (k)}<li><span>{i + 1}</span>{t(k as 'wish.how1')}</li>{/each}
			</ol>
			<div class="panel" use:reveal={{ y: 20 }}>
				<p class="q">{L({ th: 'วันนี้อยากขอพรเรื่องใด', zh: '今天想祈求什么？', en: 'What would you like to wish for today?' })}</p>
				<div class="topics">
					{#each topics as tp (tp.id)}
						{@const Icon = tp.icon}
						<button class="topic" class:on={topic === tp.id} onclick={() => ((topic = tp.id), (step = 'write'))}>
							<span class="ic"><Icon size={26} /></span>{L(tp.label)}
						</button>
					{/each}
				</div>
			</div>
		{:else if step === 'write'}
			<div class="panel" use:reveal={{ y: 20 }}>
				<p class="q">
					{#if chosen}<span class="chip">{L(chosen.label)}</span>{/if}
					{L({ th: 'ตั้งจิตให้สงบ แล้วเขียนคำอธิษฐานของคุณ', zh: '静下心来，写下您的心愿', en: 'Calm your mind and write your wish' })}
				</p>
				<label class="field-label" for="wish">{t('wish.label')}</label>
				<textarea id="wish" bind:value={wish} maxlength="300" rows="3" placeholder={L({ th: 'ข้าพเจ้า (ชื่อ) ขอให้…', zh: '弟子（姓名）祈求……', en: 'I, (your name), wish that…' })}></textarea>
				<p class="private small">{L({ th: 'คำอธิษฐานอยู่ในเครื่องของคุณเท่านั้น ไม่ถูกส่งหรือบันทึกที่ใด', zh: '心愿只留在您的设备上，不会被发送或保存', en: 'Your wish stays on this device. It is never sent or stored.' })}</p>
				<div class="row">
					<button class="btn quiet" onclick={() => (step = 'choose')}>{t('common.back')}</button>
					<button class="btn accent big" onclick={light} disabled={lit || wish.trim().length < 2}>
						<Flame size={20} /> {L({ th: 'จุดธูปสามดอก', zh: '点燃三炷香', en: 'Light three incense sticks' })}
					</button>
				</div>
			</div>
		{:else}
			<div class="panel blessing" use:reveal={{ y: 20 }}>
				<p class="gold-text bless">{L({ th: 'ขอให้คำอธิษฐานของท่านสัมฤทธิ์ผล', zh: '愿您心想事成', en: 'May your wish be fulfilled' })}</p>
				{#if wish}<blockquote>“{wish}”</blockquote>{/if}
				<ul class="next">
					<li>{L({ th: 'เมื่อมีโอกาส มาสักการะที่ศาลด้วยตนเอง พร้อมดอกไม้ ธูป เทียน', zh: '有机会请亲临神祠，带上鲜花香烛参拜', en: 'When you can, visit the shrine in person with flowers, incense and candles' })}</li>
					<li>{L({ th: 'หากสมหวัง อย่าลืมกลับมาแก้บนตามที่ตั้งใจไว้', zh: '如愿以偿，请记得回来还愿', en: 'If your wish comes true, remember to return and give thanks' })}</li>
				</ul>
				<p class="small muted">{L({ th: 'จุดธูปไปแล้ว', zh: '已上香', en: 'Incense lit' })}: {count} {L({ th: 'ครั้งในเครื่องนี้', zh: '次（本设备）', en: 'times on this device' })}</p>
				<div class="row">
					<a class="btn big" href="/guide">{t('nav.guide')} <ArrowUpRight size={18} /></a>
					<a class="btn quiet" href="/places/1">{t('place.walk')}</a>
					<button class="btn quiet" onclick={again}><RotateCcw size={16} /> {L({ th: 'ขอพรอีกครั้ง', zh: '再次祈福', en: 'Wish again' })}</button>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.intro {
		max-width: 40em;
		margin: var(--space-2) auto var(--space-4);
		text-align: center;
		color: var(--smoke-200);
		font-size: var(--text-lead);
	}
	.stage {
		position: relative;
		min-height: 0;
		overflow: hidden;
		isolation: isolate;
		text-align: center;
		background:
			radial-gradient(50% 45% at 50% 58%, rgb(255 122 46 / 0.22), transparent 70%),
			radial-gradient(80% 60% at 50% 0%, rgb(200 32 44 / 0.4), transparent 70%),
			var(--night-950);
	}
	.yantra {
		position: absolute;
		left: 50%;
		top: 55%;
		translate: -50% -50%;
		z-index: -1;
		opacity: 0.18;
	}
	.inner {
		position: relative;
		padding-block: 130px var(--space-8);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	h1 {
		font-size: clamp(2.2rem, 6vw, 4.6rem);
		margin-bottom: var(--space-4);
	}

	/* ---------- altar ---------- */
	.altar {
		display: flex;
		align-items: end;
		justify-content: center;
		gap: var(--space-5);
		margin: var(--space-4) 0 var(--space-5);
	}
	.urn {
		width: min(62vw, 300px);
		overflow: visible;
	}
	.tip {
		opacity: 0;
		transition: opacity 600ms;
		transition-delay: var(--d);
	}
	.lit .tip {
		opacity: 1;
		animation: glow 1.6s ease-in-out infinite;
		animation-delay: var(--d);
	}
	@keyframes glow {
		50% {
			opacity: 0.55;
		}
	}
	.smoke-line {
		fill: none;
		stroke: rgb(251 246 238 / 0.45);
		stroke-width: 2.5;
		stroke-linecap: round;
		filter: blur(1.2px);
		stroke-dasharray: 260;
		stroke-dashoffset: 260;
		opacity: 0;
	}
	.lit .smoke-line {
		opacity: 1;
		animation: drift 5s ease-in-out infinite;
		animation-delay: calc(var(--d) + 0.6s);
	}
	@keyframes drift {
		0% {
			stroke-dashoffset: 260;
			opacity: 0;
		}
		30% {
			opacity: 0.9;
		}
		100% {
			stroke-dashoffset: -260;
			opacity: 0;
			transform: translateX(8px);
		}
	}
	.candle {
		position: relative;
		width: 22px;
		height: 90px;
		border-radius: 6px 6px 3px 3px;
		background: linear-gradient(90deg, #a3141f, #e8606a 45%, #7d0f18);
		margin-bottom: 18px;
	}
	.flame {
		position: absolute;
		left: 50%;
		top: -30px;
		width: 14px;
		height: 26px;
		translate: -50% 0;
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		background: radial-gradient(circle at 50% 70%, #fff7d1 0%, #ffcf5a 35%, #ff7a2e 70%, transparent 72%);
		box-shadow: 0 0 30px 10px rgb(255 160 60 / 0.35);
		animation: flicker 0.18s ease-in-out infinite alternate;
		transform-origin: 50% 100%;
	}
	@keyframes flicker {
		from {
			transform: scaleY(1) rotate(-2deg);
		}
		to {
			transform: scaleY(1.12) rotate(2deg);
		}
	}

	/* ---------- panel ---------- */
	.panel {
		width: min(100%, 720px);
		padding: var(--space-6);
		border-radius: var(--radius-l);
		background: rgb(24 6 9 / 0.86);
		border: 1px solid var(--line-strong);
		box-shadow: var(--shadow-2);
	}
	.q {
		font-family: var(--font-head);
		font-size: var(--text-title);
		margin: 0 auto var(--space-5);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.chip {
		padding: 2px 12px;
		border-radius: var(--radius-pill);
		background: var(--gold-grad);
		color: var(--night-950);
		font-size: var(--text-small);
	}
	.topic {
		white-space: nowrap;
	}
	.topics {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
	}
	@media (min-width: 960px) {
		.topics {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}
	.topic {
		display: grid;
		justify-items: center;
		gap: var(--space-2);
		padding: var(--space-5) var(--space-3);
		border-radius: var(--radius-m);
		border: 1px solid var(--line);
		background: rgb(255 255 255 / 0.03);
		color: var(--fg);
		font: 500 var(--text-body) var(--font-head);
		cursor: pointer;
		transition:
			transform 400ms var(--ease-out),
			border-color 300ms,
			box-shadow 300ms;
	}
	.topic:hover,
	.topic.on {
		transform: translateY(-4px);
		border-color: var(--gold-500);
		box-shadow: var(--glow);
	}
	.ic {
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #ffe9a8, #d4a341 55%, #8f6420);
		color: var(--night-950);
	}
	textarea {
		background: rgb(0 0 0 / 0.3);
		border-color: var(--line-strong);
		text-align: center;
		font-size: var(--text-lead);
		min-height: 110px;
	}
	.private {
		color: var(--fg-muted);
		margin: var(--space-2) auto var(--space-4);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
	}
	.bless {
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 4vw, 2.8rem);
		line-height: 1.5;
		margin: 0 auto var(--space-4);
	}
	blockquote {
		margin: 0 0 var(--space-4);
		font-size: var(--text-lead);
		color: var(--smoke-200);
		font-style: italic;
	}
	.next {
		text-align: left;
		margin: 0 auto var(--space-4);
		max-width: 52ch;
		color: var(--smoke-200);
	}
	.next li {
		margin-bottom: var(--space-2);
	}
	.next li::marker {
		content: '✦  ';
		color: var(--gold-400);
	}
	.how {
		list-style: none;
		padding: 0;
		margin: 0 auto var(--space-5);
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		max-width: 560px;
		gap: var(--space-3);
		color: var(--smoke-200);
		font-size: var(--text-small);
	}
	.how li {
		display: grid;
		justify-items: center;
		align-content: start;
		text-align: center;
		gap: var(--space-2);
		min-width: 0;
		padding-inline: 4px;
		line-height: 1.5;
	}
	.how span {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--gold-grad);
		color: var(--night-950);
		font-weight: 700;
		font-size: var(--text-small);
	}
	@media (max-width: 420px) {
		.topic {
			font-size: var(--text-small);
		}
	}
	@media (max-width: 640px) {
		.inner {
			padding-bottom: var(--space-6);
			min-height: 0;
		}
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.topics {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			max-width: 620px;
			margin-inline: auto;
		}
		.panel {
			max-width: 720px;
			margin-inline: auto;
		}
	}
	@media (max-width: 480px) {
		.panel {
			padding: var(--space-4) !important;
		}
	}
</style>
