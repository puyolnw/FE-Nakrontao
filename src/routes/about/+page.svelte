<script lang="ts">
	import PageHead from '#lib/components/PageHead.svelte';
	import { photos } from '#lib/photos.ts';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import { t, tr } from '#lib/i18n.svelte.ts';
	import { site } from '#lib/settings.svelte.ts';
	import { paragraphs, safeUrl } from '#lib/util.ts';
</script>

<PageHead section={t('nav.about')} title={t('about.title')} lead={tr(site.value.site?.tagline)} photo="" />
<div class="wrap section about">
	<section class="lux box">
		<h2 class="bh"><GraduationCap size={24} /> {t('about.research')}</h2>
		<p>{t('footer.research')}</p>
		<a class="btn quiet" href="/history">{t('nav.history')}</a>
	</section>

	<section class="lux box" id="privacy">
		<h2 class="bh"><ShieldCheck size={24} /> {t('about.privacy')}</h2>
		{#each paragraphs(tr(site.value.privacy)) as p, i (i)}<p>{p}</p>{/each}
		<a class="btn quiet" href="/ask">{t('nav.ask')}</a>
	</section>

	<section class="lux box">
	<h2 class="bh"><ClipboardList size={24} /> {t('about.survey')}</h2>
	<p>{t('about.surveyText')}</p>
	<p>
		<a class="btn quiet" href="/survey">{t('about.survey')}</a>
		{#if safeUrl(site.value.site?.survey_url)}
			<a class="btn quiet" href={safeUrl(site.value.site?.survey_url)} target="_blank" rel="noopener noreferrer">↗</a>
		{/if}
	</p>
	</section>
</div>

<style>
	.about {
		display: grid;
		gap: var(--space-4);
	}
	@media (min-width: 900px) {
		.about {
			grid-template-columns: repeat(3, 1fr);
			align-items: stretch;
		}
	}
	.box {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-5);
		scroll-margin-top: 110px;
	}
	.bh {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-family: var(--font-head);
		font-size: var(--text-h4);
		line-height: 1.5;
	}
	.bh :global(svg) {
		color: var(--gold-300);
		flex: none;
	}
	h2 {
		margin-top: var(--space-7);
	}
	.box .bh {
		margin: 0 0 var(--space-1);
	}
	.box p {
		margin: 0;
	}
	.box :global(.btn) {
		margin-top: auto;
	}
	.box > p:last-of-type:not(:has(:global(.btn))) {
		margin-bottom: var(--space-3);
	}
	.box > p:has(:global(.btn)) {
		margin-bottom: 0;
	}
	.box > p:has(:global(.btn)) {
		margin-top: auto;
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.about {
			grid-template-columns: 1fr;
		}
	}
	@media (min-width: 900px) {
		.about {
			grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
			align-items: stretch;
		}
	}
	.box :global(.btn) {
		max-width: 100%;
		white-space: normal;
	}
	.bh {
		min-width: 0;
		overflow-wrap: anywhere;
		font-size: clamp(1.25rem, 1.8vw, 1.5rem) !important;
	}
	@media (min-width: 700px) and (max-width: 899px) {
		.about {
			grid-template-columns: 1fr !important;
			max-width: 640px;
			margin-inline: auto;
		}
	}

</style>
