<script lang="ts">
	import { page } from '$app/state';
	import { t, tx, tr } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { safeUrl } from '#lib/util.ts';
	import { photos } from '#lib/photos.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Status from '#lib/components/Status.svelte';
	import Article from '#lib/components/Article.svelte';
	import StoryCard from '#lib/components/StoryCard.svelte';
	import type { Knowledge } from '#lib/types.ts';

	const all = resource<Knowledge[]>(() => '/api/v1/knowledge');
	const related = $derived((all.data ?? []).filter((x) => x.id !== k.data?.id).slice(0, 3));
	const k = resource<Knowledge>(() => (/^\d+$/.test(page.params.id ?? '') ? `/api/v1/knowledge/${page.params.id}` : null));
</script>

{#if k.data}
	<PageHead section={tx(`kind.${k.data.kind}`)} title={tr(k.data.title)} photo={safeUrl(k.data.cover_url) ?? photos.history} />
	<div class="wrap section narrow article-col">
		<Article k={k.data} bare />
		<p class="acts"><a class="btn" href="/ask">{t('nav.ask')}</a> <a class="btn quiet" href="/history">{t('common.back')}</a></p>
	</div>
	{#if related.length}
		<section class="wrap related">
			<div class="section-head"><div><p class="eyebrow">{t('nav.history')}</p><h2>{t('common.related')}</h2></div></div>
			<div class="grid">{#each related as r (r.id)}<StoryCard k={r} />{/each}</div>
		</section>
	{/if}
{:else}
	<div class="wrap page"><Status loading={k.loading} error={k.error} /></div>
{/if}

<style>
	.narrow {
		max-width: 820px;
	}
	.acts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-top: var(--space-5);
	}
	.related {
		padding-bottom: var(--space-7);
	}
	.narrow {
		margin-inline: auto;
	}

	.article-col {
		max-width: 760px !important;
		margin-left: auto !important;
		margin-right: auto !important;
	}
	@media (min-width: 700px) and (max-width: 899px) {
		.related :global(.grid) {
			grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
		}
		.related :global(.grid > :last-child:nth-child(odd)) {
			grid-column: 1 / -1;
		}
	}
	@media (min-width: 700px) and (max-width: 899px) {
		.related :global(.grid > .card:last-child:nth-child(odd)) {
			flex-direction: row;
		}
		.related :global(.grid > .card:last-child:nth-child(odd) .media) {
			flex: 0 0 46%;
			aspect-ratio: 16 / 10 !important;
		}
		.related :global(.grid > .card:last-child:nth-child(odd) .body) {
			padding: var(--space-5);
			justify-content: center;
		}
	}
	.related :global(.grid > .card:last-child:nth-child(odd) .body) {
		align-self: center;
	}
	.related {
		margin-top: var(--space-7);
		padding-top: var(--space-7);
		border-top: 1px solid var(--line);
	}
	.related .section-head h2 {
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 3.4vw, 2.4rem) !important;
	}
</style>
