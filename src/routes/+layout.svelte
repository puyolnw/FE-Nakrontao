<script lang="ts">
	import { startThaiWrap } from '#lib/thaiwrap.ts';
	import '#lib/styles/base.css';
	import { page } from '$app/state';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Header from '#lib/components/Header.svelte';
	import { i18n, t, tr, type Key } from '#lib/i18n.svelte.ts';
	import { loadSettings, site } from '#lib/settings.svelte.ts';
	import { refreshTriggers, scrollTop, splitReveal, startSmoothScroll } from '#lib/motion.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	$effect(() => {
		loadSettings();
		document.documentElement.lang = i18n.lang === 'zh' ? 'zh-Hans' : i18n.lang;
		if ('serviceWorker' in navigator && !import.meta.env.DEV) {
			navigator.serviceWorker.register('/sw.js').catch(() => {});
		}
	});
	$effect(() => (isAdmin ? undefined : startSmoothScroll()));

	// Smooth cross-fade between pages where the browser supports View Transitions.
	onNavigate((nav) => {
		if (!document.startViewTransition || nav.from?.url.pathname === nav.to?.url.pathname) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await nav.complete;
			});
		});
	});

	afterNavigate(({ to, type }) => {
		if (type !== 'enter' && !to?.url.hash) scrollTop();
		refreshTriggers();
		// Anonymous page-view counter for the dashboard (scope 9.4). Admin pages are not counted.
		const path = to?.url.pathname;
		if (!path || path.startsWith('/admin')) return;
		fetch('/api/v1/track', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ path, lang: i18n.lang }),
			keepalive: true
		}).catch(() => {});
	});

	const explore: { href: string; key: Key }[] = [
		{ href: '/visit', key: 'nav.visit' },
		{ href: '/wish', key: 'nav.wish' },
		{ href: '/places', key: 'nav.places' },
		{ href: '/calendar', key: 'nav.calendar' },
		{ href: '/plan', key: 'nav.plan' }
	];
	const learn: { href: string; key: Key }[] = [
		{ href: '/history', key: 'nav.history' },
		{ href: '/guide', key: 'nav.guide' },
		{ href: '/community', key: 'nav.community' },
		{ href: '/survey', key: 'about.survey' },
		{ href: '/about', key: 'nav.about' }
	];
	const links: { href: string; key: Key }[] = [
		{ href: '/visit', key: 'nav.visit' },
		{ href: '/history', key: 'nav.history' },
		{ href: '/guide', key: 'nav.guide' },
		{ href: '/places', key: 'nav.places' },
		{ href: '/plan', key: 'nav.plan' },
		{ href: '/calendar', key: 'nav.calendar' },
		{ href: '/community', key: 'nav.community' },
		{ href: '/survey', key: 'about.survey' },
		{ href: '/about', key: 'nav.about' }
	];
	const year = new Date().getFullYear() + 543;
	$effect(() => startThaiWrap());
</script>

<svelte:head>
	<title>{tr(site.value.site?.name) || 'เจ้าพ่อศรีนครเตา'}</title>
</svelte:head>

{#if isAdmin}
	<div class="paper admin-root">{@render children()}</div>
{:else}
	<a class="skip visually-hidden" href="#main">skip</a>
	<Header />
	<main id="main">
		{@render children()}
	</main>
	<footer class="dark">
		<div class="wrap">
			<div class="cta">
				<p class="eyebrow">{page.url.pathname === '/plan' ? t('nav.wish') : t('nav.plan')}</p>
				{#key i18n.lang}
					<h2 class="cta-title">
						{i18n.lang === 'zh' ? '来孟涛村，感受信仰之旅' : i18n.lang === 'en' ? 'Come feel the faith of Mueang Tao' : 'มาเยือนเมืองเตา สัมผัสศรัทธา'}
					</h2>
				{/key}
				<div class="cta-row">
					{#if page.url.pathname === '/plan'}
						<a class="btn accent big" href="/wish">{t('nav.wish')} <ArrowUpRight size={18} /></a>
					{:else}
						<a class="btn accent big" href="/plan">{t('plan.build')} <ArrowUpRight size={18} /></a>
					{/if}
					{#if page.url.pathname === '/ask'}
						<a class="btn quiet big" href="/visit">{t('nav.visit')}</a>
					{:else}
						<a class="btn quiet big" href="/ask">{t('nav.ask')}</a>
					{/if}
				</div>
			</div>
			<div class="cols">
				<div class="fbrand">
					<div class="brand">
						<img src="/icon.svg" alt="" width="44" height="44" />
						<strong>{tr(site.value.site?.name) || 'เจ้าพ่อศรีนครเตา'}</strong>
					</div>
					<p class="muted">{tr(site.value.site?.tagline)}</p>
				</div>
				<nav class="fexplore" aria-label={t('nav.visit')}>
					<p class="fh">{t('nav.visit')}</p>
					{#each explore as l (l.href)}<a href={l.href}>{t(l.key)}</a>{/each}
				</nav>
				<nav aria-label={t('nav.history')}>
					<p class="fh">{t('nav.more')}</p>
					{#each learn as l (l.href)}<a href={l.href}>{t(l.key)}</a>{/each}
				</nav>
				<div>
					<p class="fh">{t('place.contact')}</p>
					{#if site.value.site?.contact}
						{#each site.value.site.contact.split(/\s*·\s*/) as line (line)}<p class="contact-line">{line.replace(/(\d)-(\d)/g, '$1\u2011$2')}</p>{/each}
					{/if}
				</div>
			</div>
			<div class="bottom">
				<span>© {year} · {tr(site.value.site?.name) || 'เจ้าพ่อศรีนครเตา'}</span>
				<span>{t('photo.credit')}</span>
				<a href="/about#privacy">{t('about.privacy')}</a>
			</div>
		</div>
	</footer>
{/if}

<style>
	main {
		min-height: 60vh;
	}
	.admin-root {
		min-height: 100vh;
		display: flow-root;
	}
	footer {
		position: relative;
		overflow: hidden;
		margin-top: var(--space-7);
		padding-top: var(--space-7);
		border-radius: 40px 40px 0 0;
	}
	.cta {
		padding-bottom: var(--space-8);
		border-bottom: var(--hair) solid var(--line);
	}
	.cta {
		text-align: center;
	}
	.cta-title {
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 4vw, 3.2rem);
		font-weight: 700;
		line-height: 1.6;
		max-width: none;
		margin-bottom: var(--space-5);
	}
	.cta-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
	}
	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6) var(--space-5);
		padding-block: var(--space-7);
	}
	.fbrand {
		grid-column: 1 / -1;
	}
	@media (min-width: 900px) {
		.cols {
			grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
		}
		.fbrand {
			grid-column: auto;
		}
	}
	.fbrand p {
		text-wrap: balance;
	}
	.fh {
		margin: 0 0 var(--space-2);
		font-weight: 600;
		font-size: var(--text-small);
		color: var(--gold-300);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.brand img {
		border-radius: 12px;
	}
	.brand strong {
		font-family: var(--font-head);
		font-size: var(--text-h4);
		font-weight: 600;
	}
	nav {
		display: grid;
		gap: 0;
		align-content: start;
	}
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		font-size: var(--text-body);
		color: var(--smoke-200);
	}
	footer :global(.btn.big) {
		min-height: 56px;
		padding-inline: 30px;
		font-size: var(--text-lead);
	}
	nav a:hover {
		color: var(--accent);
	}
	.bottom {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-2);
		padding-block: var(--space-4);
		border-top: var(--hair) solid var(--line);
		font-size: var(--text-small);
		color: var(--fg-muted);
		position: relative;
		z-index: 1;
	}
	.skip:focus {
		position: fixed;
		z-index: 2000;
		width: auto;
		height: auto;
		padding: var(--space-2);
		background: var(--bg);
	}
	.bottom a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}
	.fh {
		font-size: var(--text-body) !important;
		letter-spacing: 0.02em;
	}
	nav a {
		font-size: var(--text-small) !important;
	}
	.bottom {
		align-items: center;
		line-height: 1.6;
	}
	.bottom > * {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}
	/* Phones & tablets: the tab bar already offers the main destinations, so the footer
	   keeps only the secondary links, two columns, and a shorter call-out. */
	@media (max-width: 1023px) {
		.fexplore {
			display: none;
		}
		.cols {
			grid-template-columns: 1fr 1fr !important;
			padding-block: var(--space-5) !important;
			gap: var(--space-4) !important;
		}
		.cta {
			padding-bottom: var(--space-5) !important;
		}
		.cta-title {
			font-size: clamp(1.6rem, 6vw, 2.2rem) !important;
			margin-bottom: var(--space-3) !important;
		}
		footer {
			margin-top: var(--space-6) !important;
			padding-top: var(--space-6) !important;
		}
		.bottom {
			flex-direction: column;
			align-items: flex-start;
			gap: 0;
		}
		.bottom > * {
			min-height: 32px;
		}
	}
	@media (max-width: 640px) {
		.cta-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		.cta-row :global(.btn.big) {
			min-height: 48px;
			padding-inline: 12px;
			font-size: var(--text-body);
			justify-content: center;
		}
	}
	@media (min-width: 720px) and (max-width: 1023px) {
		.cols {
			grid-template-columns: 1.4fr 1fr 1fr !important;
		}
		.fbrand {
			grid-column: auto !important;
		}
		.bottom {
			flex-direction: row !important;
			align-items: center !important;
			gap: var(--space-4) !important;
		}
	}
	@media (max-width: 699px) {
		footer {
			margin-top: 0 !important;
		}
		.fbrand p {
			display: none;
		}
		.cols > nav:not(.fexplore) {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: var(--space-4);
		}
		.cols > nav .fh {
			grid-column: 1 / -1;
		}
		.cols {
			grid-template-columns: 1fr !important;
			padding-block: var(--space-4) !important;
			gap: var(--space-3) !important;
		}
		.cols > div:last-child p {
			margin: 0;
		}
	}
	@media (min-width: 700px) and (max-width: 1023px) {
		.cols {
			grid-template-columns: 1fr 1fr !important;
		}
		.fbrand {
			grid-column: 1 / -1 !important;
		}
	}
	.contact-line {
		margin: 0;
		min-height: 44px;
		display: flex;
		align-items: center;
		font-weight: 600;
		color: var(--fg);
	}
</style>
