<script lang="ts">
	import Thumb from './Thumb.svelte';
	import { t, tx, tr, fmtDate } from '#lib/i18n.svelte.ts';
	import { paragraphs, safeUrl, youtubeId } from '#lib/util.ts';
	import type { Knowledge } from '#lib/types.ts';

	let { k, bare = false }: { k: Knowledge; bare?: boolean } = $props();
	const yt = $derived(youtubeId(k.video_url));
	// A dash or blank means "not provided"; such rows are hidden rather than shown as "—".
	const filled = (v: string | null | undefined) => !!v && !/^[\s\-–—]*$/.test(v);
</script>

<article>
	{#if !bare}
	<p class="meta"><span class="tag {k.kind}">{tx(`kind.${k.kind}`)}</span></p>
	<h1>{tr(k.title)}</h1>
	{/if}
	{#if k.kind === 'belief'}
		<p class="notice small">{t('kind.beliefNote')}</p>
	{/if}
	{#if !bare}{#if safeUrl(k.cover_url)}<img class="cover" src={safeUrl(k.cover_url)} alt="" />{:else}<div class="art"><Thumb kind={k.kind} ratio="21 / 9" /></div>{/if}{/if}
	<!-- Plain text only: content is rendered as paragraphs, never as HTML. -->
	<div class="body">
		{#each paragraphs(tr(k.body)) as para, i (i)}<p>{para}</p>{/each}
	</div>
	{#if yt}
		<div class="video">
			<iframe
				src="https://www.youtube-nocookie.com/embed/{yt}"
				title={tr(k.title)}
				loading="lazy"
				sandbox="allow-scripts allow-same-origin allow-presentation"
				referrerpolicy="strict-origin-when-cross-origin"
				allowfullscreen
			></iframe>
		</div>
	{/if}
	<!-- Provenance: where this came from, who checked it, and when. -->
	<dl class="src">
		{#if k.source && !/รอ|pending|TBD/i.test(k.source)}<dt>{t('common.source')}</dt><dd>{k.source}</dd>{/if}
		{#if filled(k.informant)}<dt>{t('src.informant')}</dt><dd>{k.informant}</dd>{/if}
		{#if filled(k.reviewer)}<dt>{t('src.reviewer')}</dt><dd>{k.reviewer}</dd>{/if}
		{#if k.updated_at}<dt>{t('src.updated')}</dt><dd><time datetime={k.updated_at}>{fmtDate(k.updated_at)}</time></dd>{/if}
	</dl>
</article>

<style>
	.meta {
		margin-bottom: var(--space-2);
	}
	.cover {
		width: 100%;
		max-height: 460px;
		object-fit: cover;
		margin: var(--space-5) 0;
	}
	.art {
		margin: var(--space-5) 0;
	}
	.body {
		font-size: var(--text-title);
		line-height: 1.75;
		margin-top: var(--space-5);
	}
	.video {
		aspect-ratio: 16 / 9;
		margin: var(--space-5) 0;
	}
	.video iframe {
		width: 100%;
		height: 100%;
		border: 0;
	}
	.src {
		border-top: var(--hair) solid var(--line);
		padding-top: var(--space-3);
		font-size: var(--text-small);
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-1) var(--space-4);
	}
	.src dt {
		color: var(--fg-muted);
	}
	.src dd {
		margin: 0;
	}
</style>
