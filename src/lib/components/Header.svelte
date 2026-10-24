<script lang="ts">
	import { page } from '$app/state';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { i18n, setLang, t, tr, type Key } from '#lib/i18n.svelte.ts';
	import { site } from '#lib/settings.svelte.ts';
	import { chrome } from '#lib/chrome.svelte.ts';
	import type { Lang } from '#lib/types.ts';

	import House from '@lucide/svelte/icons/house';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	// Five primary destinations; the rest live under "More" so the bar stays scannable.
	const links: { href: string; key: Key }[] = [
		{ href: '/visit', key: 'nav.visit' },
		{ href: '/wish', key: 'nav.wish' },
		{ href: '/history', key: 'nav.history' },
		{ href: '/places', key: 'nav.places' },
		{ href: '/calendar', key: 'nav.calendar' }
	];
	const more: { href: string; key: Key }[] = [
		{ href: '/guide', key: 'nav.guide' },
		{ href: '/plan', key: 'nav.plan' },
		{ href: '/community', key: 'nav.community' },
		{ href: '/about', key: 'nav.about' }
	];
	const tabs = [
		{ href: '/', key: 'nav.home' as Key, icon: House, owns: ['/'] },
		{ href: '/visit', key: 'nav.visit' as Key, icon: MapPin, owns: ['/visit', '/places'] },
		{ href: '/wish', key: 'nav.wish' as Key, icon: Sparkles, owns: ['/wish'] },
		{ href: '/ask', key: 'nav.ask' as Key, icon: MessageCircle, owns: ['/ask'] }
	];
	const tabOn = (owns: string[]) => owns.some((h) => current(h));
	let moreEl = $state<HTMLDetailsElement>();
	const langs: { code: Lang; label: string }[] = [
		{ code: 'th', label: 'TH' },
		{ code: 'zh', label: '中' },
		{ code: 'en', label: 'EN' }
	];

	let open = $state(false);
	let scrolled = $state(false);
	let hidden = $state(false);
	$effect(() => {
		page.url.pathname;
		open = false;
		if (moreEl) moreEl.open = false;
	});
	$effect(() => {
		let last = window.scrollY;
		const on = () => {
			const y = window.scrollY;
			scrolled = y > 40;
			// Hide while scrolling down a long page; short pages keep the menu in view.
			const long = document.documentElement.scrollHeight > innerHeight * 3;
			hidden = long && y > 400 && y > last;
			last = y;
		};
		on();
		window.addEventListener('scroll', on, { passive: true });
		return () => window.removeEventListener('scroll', on);
	});
	$effect(() => {
		document.documentElement.style.overflow = open ? 'hidden' : '';
	});
	const clear = $derived(chrome.overPhoto > 0 && !scrolled && !open);
	const current = (href: string) => (href === '/' ? page.url.pathname === '/' : page.url.pathname === href || page.url.pathname.startsWith(href + '/'));
</script>

<header class:clear class:hidden={hidden && !open} class:open>
	<div class="pill">
		<a class="brand" href="/">
			<img src="/icon.svg" alt="" width="34" height="34" />
			<strong>{tr(site.value.site?.name) || 'เจ้าพ่อศรีนครเตา'}</strong>
		</a>
		<nav class="main" aria-label={t('a11y.mainNav')}>
			{#each links as l (l.href)}
				<a href={l.href} aria-current={current(l.href) ? 'page' : undefined}>{t(l.key)}</a>
			{/each}
			<details class="more" bind:this={moreEl}>
				<summary>{t('nav.more')} <ChevronDown size={16} /></summary>
				<div class="menu">
					{#each more as l (l.href)}
						<a href={l.href} aria-current={current(l.href) ? 'page' : undefined}>{t(l.key)}</a>
					{/each}
				</div>
			</details>
		</nav>
		<div class="lang" role="group" aria-label={t('lang.label')}>
			{#each langs as l (l.code)}
				<button class:on={i18n.lang === l.code} aria-pressed={i18n.lang === l.code} onclick={() => setLang(l.code)}>{l.label}</button>
			{/each}
		</div>
		<a class="ask" class:here={current('/ask')} href="/ask" aria-label={t('nav.ask')} title={t('nav.ask')}><span class="ask-ic"><MessageCircle size={18} /></span>{t('nav.ask')} <span class="ask-arrow"><ArrowUpRight size={16} /></span></a>
		<button class="burger" aria-expanded={open} aria-controls="overlay-nav" aria-label={t('nav.menu')} onclick={() => (open = !open)}>
			<span></span><span></span>
		</button>
	</div>
</header>

<!-- Full-screen menu on small screens. -->
<div id="overlay-nav" class="overlay dark" class:open aria-hidden={!open}>
	<nav aria-label={t('nav.menu')}>
		{#each [...links, ...more, { href: '/ask', key: 'nav.ask' as Key }] as l, i (l.href)}
			<a href={l.href} style:--i={i} tabindex={open ? 0 : -1}>
				<span class="n">{String(i + 1).padStart(2, '0')}</span>{t(l.key)}
			</a>
		{/each}
	</nav>
	<div class="olang">
		{#each langs as l (l.code)}
			<button class:on={i18n.lang === l.code} aria-pressed={i18n.lang === l.code} onclick={() => setLang(l.code)} tabindex={open ? 0 : -1}>{l.label}</button>
		{/each}
	</div>
</div>

<!-- Thumb-reach tab bar on phones and small tablets. -->
<nav class="tabbar" aria-label={t('nav.menu')}>
	{#each tabs as tb (tb.href)}
		{@const Icon = tb.icon}
		<a href={tb.href} aria-current={tabOn(tb.owns) ? 'page' : undefined}><Icon size={22} /><span>{t(tb.key)}</span></a>
	{/each}
</nav>

<style>
	header {
		position: fixed;
		top: 14px;
		left: 0;
		right: 0;
		z-index: 1000;
		display: flex;
		justify-content: center;
		padding-inline: var(--space-3);
		pointer-events: none;
		transition: transform 600ms var(--ease-out);
	}
	header.hidden {
		transform: translateY(-120%);
	}
	.pill {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		max-width: 1240px;
		padding: 7px 7px 7px 10px;
		border-radius: var(--radius-pill);
		background: var(--glass-solid);
		border: var(--hair) solid var(--glass-line);
		box-shadow: var(--shadow-1);
		color: var(--fg);
		transition:
			background-color 400ms,
			color 400ms,
			border-color 400ms;
	}
	.clear .pill {
		background: rgb(255 255 255 / 0.08);
		border-color: rgb(255 255 255 / 0.18);
		color: var(--white);
		box-shadow: none;
	}
	.brand {
		min-height: 44px;
		display: flex;
		align-items: center;
		gap: 10px;
		margin-right: auto;
		color: inherit;
		padding-right: var(--space-2);
	}
	.brand img {
		border-radius: 10px;
	}
	.brand strong {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: var(--text-body);
		white-space: nowrap;
	}
	nav {
		display: flex;
		gap: 2px;
	}
	nav a {
		position: relative;
		padding: 8px 14px;
		border-radius: var(--radius-pill);
		font-family: var(--font-body);
		font-size: var(--text-small);
		color: inherit;
		white-space: nowrap;
		transition: background-color 250ms;
	}
	nav a:hover {
		background: color-mix(in srgb, currentColor 10%, transparent);
		color: inherit;
	}
	nav a[aria-current='page'] {
		color: var(--gold-300);
	}
	nav a[aria-current='page']::after {
		content: '';
		position: absolute;
		left: 14px;
		right: 14px;
		bottom: 6px;
		height: 2px;
		border-radius: 2px;
		background: var(--gold-grad);
	}
	.lang {
		display: flex;
		padding: 3px;
		border-radius: var(--radius-pill);
		background: color-mix(in srgb, currentColor 8%, transparent);
	}
	.lang button,
	.olang button {
		font: 700 16px var(--font-body);
		border: 0;
		background: none;
		color: color-mix(in srgb, currentColor 70%, transparent);
		min-width: 44px;
		min-height: 44px;
		padding: 0 10px;
		border-radius: var(--radius-pill);
		cursor: pointer;
	}
	.lang button.on {
		background: rgb(241 198 106 / 0.16);
		color: var(--gold-300);
		box-shadow: inset 0 0 0 1px rgb(241 198 106 / 0.45);
	}
	.ask {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 18px;
		border-radius: var(--radius-pill);
		background: var(--gold-grad);
		color: var(--night-950);
		font-family: var(--font-body);
		font-size: var(--text-small);
		font-weight: 500;
		white-space: nowrap;
	}
	.ask:hover {
		color: var(--night-950);
		box-shadow: var(--glow);
	}
	.burger {
		display: none;
		width: 44px;
		height: 44px;
		border: 1px solid rgb(241 198 106 / 0.45);
		border-radius: 50%;
		background: rgb(241 198 106 / 0.1);
		cursor: pointer;
		position: relative;
	}
	.burger span {
		position: absolute;
		left: 14px;
		right: 14px;
		height: 2px;
		background: var(--gold-300);
		transition: transform 400ms var(--ease-out);
	}
	.burger span:first-child {
		top: 18px;
	}
	.burger span:last-child {
		top: 24px;
	}
	.open .burger span:first-child {
		transform: translateY(3px) rotate(45deg);
	}
	.open .burger span:last-child {
		transform: translateY(-3px) rotate(-45deg);
	}

	.overlay {
		position: fixed;
		inset: 0;
		z-index: 999;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 100px var(--space-5) var(--space-6);
		clip-path: circle(0% at calc(100% - 40px) 40px);
		transition: clip-path 450ms var(--ease-out);
		pointer-events: none;
	}
	.overlay.open {
		clip-path: circle(150% at calc(100% - 40px) 40px);
		pointer-events: auto;
	}
	.overlay nav {
		flex-direction: column;
		gap: 0;
	}
	.overlay nav a {
		font-family: var(--font-display);
		font-size: clamp(2rem, 9vw, 3.2rem);
		font-weight: 600;
		line-height: 1.5;
		padding: 6px 0;
		border-radius: 0;
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		opacity: 0;
		transform: translateY(30px);
		transition:
			opacity 600ms var(--ease-out),
			transform 600ms var(--ease-out);
		transition-delay: calc(var(--i) * 50ms + 200ms);
	}
	.overlay.open nav a {
		opacity: 1;
		transform: none;
	}
	.overlay nav a:hover {
		background: none;
		color: var(--accent);
	}
	.n {
		font-size: var(--text-small);
		color: var(--accent);
		font-family: var(--font-mono);
	}
	.olang {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-6);
	}
	.olang button.on {
		background: rgb(241 198 106 / 0.16);
		color: var(--gold-300);
		box-shadow: inset 0 0 0 1px rgb(241 198 106 / 0.45);
	}

	.more {
		position: relative;
	}
	.more summary {
		list-style: none;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 8px 14px;
		min-height: 44px;
		border-radius: var(--radius-pill);
		font-size: var(--text-small);
		cursor: pointer;
		white-space: nowrap;
	}
	.more summary::-webkit-details-marker {
		display: none;
	}
	.more[open] summary :global(svg) {
		transform: rotate(180deg);
	}
	.menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		display: grid;
		min-width: 220px;
		padding: 6px;
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		color: var(--fg);
		box-shadow: var(--shadow-1);
		border: var(--hair) solid var(--line);
	}
	.menu a {
		border-radius: 12px;
		padding: 10px 14px;
	}
	nav a {
		min-height: 44px;
		display: inline-flex;
		align-items: center;
	}
	.tabbar {
		display: none;
	}
	@media (max-width: 1023px) {
		.tabbar {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 998;
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 0;
			padding: 6px 6px calc(6px + env(safe-area-inset-bottom));
			background: rgb(20 5 8 / 0.96);
			border-top: 1px solid rgb(241 198 106 / 0.25);
		}
		.tabbar a {
			flex-direction: column;
			justify-content: center;
			gap: 2px;
			min-height: 56px;
			padding: 4px;
			border-radius: 14px;
			font-size: var(--text-caption);
			color: var(--fg-muted);
		}
		.tabbar a[aria-current='page'] {
			color: var(--gold-300);
			background: color-mix(in srgb, var(--gold-300) 12%, transparent);
		}
		.tabbar a[href='/wish']::before {
			content: none;
		}
	}
	@media (max-width: 1023px) {
		.tabbar {
			left: 50%;
			right: auto;
			bottom: calc(12px + env(safe-area-inset-bottom));
			translate: -50% 0;
			width: min(480px, calc(100% - 24px));
			border: 1px solid rgb(241 198 106 / 0.3);
			border-radius: 999px;
			padding: 6px;
			box-shadow: var(--shadow-2, 0 12px 40px rgb(0 0 0 / 0.5));
		}
		.tabbar a {
			border-radius: 999px;
		}
	}

	@media (max-width: 1023px) {
		nav.main,
		.lang {
			display: none;
		}
		.burger {
			display: block;
		}
	}
	@media (min-width: 1024px) and (max-width: 1199px) {
		.ask {
			font-size: 0;
			gap: 0;
			width: 44px;
			height: 44px;
			padding: 0;
			justify-content: center;
		}
		nav.main a,
		.more summary {
			padding-inline: 10px;
		}
		.brand strong {
			font-size: var(--text-body);
		}
	}
	@media (max-width: 899px) {
		.ask {
			display: none;
		}
		.brand strong {
			font-size: var(--text-small);
		}
	}
	.ask.here {
		display: none !important;
	}
	.ask-ic {
		display: none;
	}
	@media (min-width: 1024px) and (max-width: 1199px) {
		.ask-ic {
			display: inline-grid;
			place-items: center;
		}
		.ask-arrow {
			display: none;
		}
	}
</style>
