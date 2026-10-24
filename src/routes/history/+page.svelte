<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import StoryCard from '#lib/components/StoryCard.svelte';
	import { photos } from '#lib/photos.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import Thumb from '#lib/components/Thumb.svelte';
	import { i18n, t, tx, tr } from '#lib/i18n.svelte.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { numeral } from '#lib/util.ts';
	import { qs } from '#lib/api.ts';
	import Status from '#lib/components/Status.svelte';
	import type { Knowledge } from '#lib/types.ts';

	const kinds = ['history', 'belief', 'ritual', 'practice', 'community'] as const;
	let kind = $state('');
	let q = $state('');
	let applied = $state('');
	const list = resource<Knowledge[]>(() => `/api/v1/knowledge${qs({ kind, q: applied })}`);
</script>

<PageHead n={1} section={t('nav.history')} title={t('nav.history')} lead={t('lead.history')} art="moat" photo={photos.history} />
<div class="wrap page">

	<form class="filters lux" onsubmit={(e) => (e.preventDefault(), (applied = q.trim()))}>
		<label class="searchbox">
			<Search size={20} />
			<span class="visually-hidden">{t('common.search')}</span>
			<input id="hq" type="search" bind:value={q} maxlength="100" placeholder={t('common.search')} onchange={() => (applied = q.trim())} />
		</label>
		<div class="chips chip-row" role="group">
			<button type="button" class="chip" aria-pressed={kind === ''} onclick={() => (kind = '')}>{t('common.all')}</button>
			{#each kinds as k (k)}
				<button type="button" class="chip" aria-pressed={kind === k} onclick={() => (kind = k)}>{tx(`kind.${k}`)}</button>
			{/each}
		</div>
	</form>

	<Status loading={list.loading} error={list.error} empty={list.data?.length === 0} />
	{#if list.data?.length}
		<div class="grid">
			{#each list.data as k (k.id)}<StoryCard {k} />{/each}
		</div>
	{/if}
</div>

<style>
	.filters {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
		margin: var(--space-5) 0 var(--space-6);
	}

</style>
