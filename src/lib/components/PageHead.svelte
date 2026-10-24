<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IllustrationName } from './Illustration.svelte';
	import { useOverPhoto } from '#lib/chrome.svelte.ts';
	import { i18n } from '#lib/i18n.svelte.ts';
	import { parallax } from '#lib/motion.ts';
	import Yantra from './Yantra.svelte';

	// Section page header: rounded photo stage with parallax and a word-by-word title.
	let {
		section,
		title,
		lead = '',
		photo,
		children
	}: { n?: number; section: string; title: string; lead?: string; art?: IllustrationName; photo: string; children?: Snippet } = $props();
	useOverPhoto();
</script>

<header class="ph dark">
	{#if photo}<div class="bg" use:parallax={0.3}><img src={photo} alt="" /></div>{:else}<div class="bg pattern"><div class="emblem"><Yantra size="min(90vw, 620px)" speed={0.2} /></div></div>{/if}
	<div class="wrap inner">
		<p class="kicker">{section}</p>
		{#key title + i18n.lang}
			<h1 class="gold-text">{title}</h1>
		{/key}
		<span class="ornament" aria-hidden="true"></span>
		{#if lead}<p class="lead">{lead}</p>{/if}
		{@render children?.()}
	</div>
</header>

<style>
	.ph {
		position: relative;
		overflow: hidden;
		border-radius: 0 0 40px 40px;
		isolation: isolate;
	}
	.bg {
		position: absolute;
		inset: -15% 0 0;
		z-index: -2;
	}
	.pattern {
		background:
			radial-gradient(60% 80% at 50% 0%, rgb(200 32 44 / 0.45), transparent 70%),
			repeating-linear-gradient(45deg, rgb(241 198 106 / 0.05) 0 1px, transparent 1px 22px),
			repeating-linear-gradient(-45deg, rgb(241 198 106 / 0.05) 0 1px, transparent 1px 22px),
			var(--night-900);
	}
	.bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		animation: zoom 18s ease-out both;
	}
	@keyframes zoom {
		from {
			transform: scale(1.15);
		}
	}
	.ph::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			radial-gradient(80% 70% at 50% 66%, rgb(14 3 5 / 0.92), rgb(14 3 5 / 0.35) 85%),
			linear-gradient(180deg, rgb(60 6 12 / 0.55), rgb(18 4 6 / 0.45) 40%, rgb(14 3 5 / 0.95));
	}
	.inner {
		min-height: clamp(340px, 52vh, 540px);
		display: flex;
		flex-direction: column;
		justify-content: end;
		align-items: center;
		text-align: center;
		padding-block: 140px var(--space-7);
	}
	.kicker {
		align-self: center;
		font-family: var(--font-head);
		font-size: var(--text-caption);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 6px 14px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--line-strong);
		color: var(--gold-300);
		background: rgb(20 5 8 / 0.7);
		margin-bottom: var(--space-4);
	}
	h1 {
		font-family: var(--font-display);
		font-size: clamp(2.2rem, 6vw, 4.6rem);
		font-weight: 700;
		line-height: 1.55;
		text-wrap: balance;
		filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.8)) drop-shadow(0 6px 24px rgb(0 0 0 / 0.6));
		margin: 0;
		max-width: none;
	}
	.lead {
		margin: var(--space-4) auto 0;
		font-size: var(--text-lead);
		color: rgb(255 255 255 / 0.88);
		text-shadow: 0 2px 10px rgb(0 0 0 / 0.7);
		max-width: min(52ch, 100%);
		padding-inline: var(--space-2);
		text-wrap: balance;
	}
	.ornament::after {
		margin-top: var(--space-3);
	}
	.inner :global(.hero-actions) {
		justify-content: center;
	}
	.emblem {
		position: absolute;
		left: 50%;
		top: 55%;
		translate: -50% -50%;
		opacity: 0.22;
		pointer-events: none;
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.inner {
			min-height: 360px;
			padding-block: 120px var(--space-6);
		}
		h1 {
			font-size: clamp(2.6rem, 5.4vw, 3.4rem);
			max-width: 100%;
		}
		.lead {
			max-width: 34em;
		}
	}
	@media (max-width: 699px) {
		.inner {
			min-height: 0 !important;
			padding-bottom: var(--space-6) !important;
		}
	}
	.ph::after {
		background:
			radial-gradient(80% 70% at 50% 66%, rgb(14 3 5 / 0.92), rgb(14 3 5 / 0.35) 85%),
			linear-gradient(180deg, rgb(60 6 12 / 0.55), rgb(18 4 6 / 0.45) 40%, rgb(14 3 5 / 0.97) 92%) !important;
	}
	@media (min-width: 700px) {
		.inner {
			padding-top: 120px !important;
			min-height: 0 !important;
		}
		h1 {
			line-height: 1.3 !important;
		}
	}
	h1 {
		margin: -0.75em 0 -0.2em !important;
	}
</style>
