<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import { photos } from '#lib/photos.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import { t, tr, tx } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { paragraphs } from '#lib/util.ts';
	import { reveal } from '#lib/motion.ts';
	import Status from '#lib/components/Status.svelte';
	import type { Knowledge } from '#lib/types.ts';

	// TOR module 5: preparation, offerings, steps, dress and etiquette — from ritual/practice entries.
	const ritual = resource<Knowledge[]>(() => '/api/v1/knowledge?kind=ritual');
	const practice = resource<Knowledge[]>(() => '/api/v1/knowledge?kind=practice');
	const items = $derived([...(practice.data ?? []), ...(ritual.data ?? [])]);
	const steps = (k: Knowledge) => paragraphs(tr(k.body)).map((s) => s.replace(/^\[[^\]]*\]\s*/, '').replace(/^\d+[.)]\s*/, ''));
</script>

<PageHead section={t('nav.guide')} title={t('guide.title')} lead={t('lead.guide')} photo={photos.guide} />

<div class="wrap page">
	<Status loading={ritual.loading || practice.loading} error={ritual.error || practice.error} empty={!items.length} />

	{#each items as k (k.id)}
		<section class="block">
			<div class="head center" use:reveal>
				<p class="eyebrow">{tx(`kind.${k.kind}`)}</p>
				<h2>{t('guide.title').includes(tr(k.title)) ? t('guide.stepsTitle') : tr(k.title)}</h2>
				{#if k.source && !/รอ|pending|TBD/i.test(k.source)}<p class="small muted">{t('common.source')}: {k.source}</p>{/if}
			</div>
			{#if steps(k).length === 1}
				<div class="solo lux">
					<span class="solo-ic" aria-hidden="true"><CalendarDays size={28} /></span>
					<p>{steps(k)[0]}</p>
					<a class="btn" href="/calendar">{t('nav.calendar')}</a>
				</div>
			{:else}
			<ol class="steps">
				{#each steps(k) as step, i (i)}
					<li use:reveal={{ delay: Math.min(i * 0.04, 0.12) }}>
						<span class="n">{String(i + 1).padStart(2, '0')}</span>
						<p>{step}</p>
					</li>
				{/each}
			</ol>
			{/if}
		</section>
	{/each}
</div>

<style>
	.block {
		display: grid;
		gap: var(--space-6);
		padding-block: var(--space-7);
		border-bottom: 1px solid var(--line);
	}
	@media (min-width: 960px) {
		.block {
			grid-template-columns: 1fr;
		}
	}

	.steps {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-3);
		grid-template-columns: 1fr;
	}
	@media (min-width: 641px) {
		.steps {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1100px) {
		.steps {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
	.steps li {
		position: relative;
		overflow: hidden;
		min-height: 150px;
		padding: var(--space-5);
		border-radius: var(--radius-l);
		background: var(--bg-raised);
		box-shadow: var(--shadow-1);
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: var(--space-3);
		transition:
			transform 500ms var(--ease-out),
			background-color 400ms;
	}
	.steps li:hover {
		transform: translateY(-4px);
		background: var(--ink-950);
		color: var(--cream-50);
	}
	.n {
		font-family: var(--font-display);
		font-size: 4rem;
		font-weight: 700;
		line-height: 1;
		color: transparent;
		-webkit-text-stroke: 1.5px var(--accent);
	}
	.steps li:hover .n {
		color: var(--accent);
	}
	.steps p {
		margin: 0;
		font-family: var(--font-head);
		font-size: var(--text-title);
		line-height: 1.35;
	}
	.head {
		text-align: center;
	}
	@media (max-width: 640px) {
		.steps li {
			flex: 1 1 100%;
			min-height: 0;
			flex-direction: row;
			align-items: center;
			justify-content: start;
			gap: var(--space-4);
			padding: var(--space-4);
		}
		.n {
			font-size: 2rem;
			flex: none;
		}
	}
	.solo {
		max-width: 760px;
		margin: 0 auto;
		padding: var(--space-5) var(--space-6);
		font-size: var(--text-lead);
		line-height: 1.8;
		text-align: center;
	}

	.solo {
		display: grid;
		justify-items: center;
		gap: var(--space-4);
	}
	.solo p {
		margin: 0;
	}
	@media (min-width: 641px) {
		.steps p {
			min-height: 2lh;
		}
	}
	.steps {
		align-items: stretch;
	}
	.solo {
		max-width: none;
	}
	@media (min-width: 1100px) {
		.steps li {
			min-height: 0 !important;
		}
	}
	@media (min-width: 641px) and (max-width: 1099px) {
		.steps li {
			min-height: 0 !important;
			flex-direction: row;
			align-items: center;
			gap: var(--space-4);
			padding: var(--space-4) var(--space-5);
		}
		.n {
			font-size: 2.4rem;
			flex: none;
		}
		.steps p {
			min-height: 0 !important;
		}
	}
	.block:first-of-type {
		padding-top: var(--space-4);
	}
	@media (min-width: 1100px) {
		.steps li {
			min-height: 150px !important;
			justify-content: space-between !important;
		}
	}
	.solo {
		max-width: none !important;
		display: grid !important;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		justify-items: start !important;
		gap: var(--space-5) !important;
		padding: var(--space-5) var(--space-6) !important;
		text-align: left !important;
	}
	.solo-ic {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #ffe9a8, #d4a341 55%, #8f6420);
		color: var(--night-950);
	}
	@media (max-width: 640px) {
		.solo {
			grid-template-columns: auto 1fr;
		}
		.solo :global(.btn) {
			grid-column: 1 / -1;
			width: 100%;
			justify-content: center;
		}
	}
	@media (min-width: 641px) {
		.steps {
			grid-auto-rows: 1fr;
		}
	}
	.solo {
		width: 100%;
		box-sizing: border-box;
	}
	.block:last-of-type {
		border-bottom: 0;
		padding-bottom: 0;
	}
</style>
