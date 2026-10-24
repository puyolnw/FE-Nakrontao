<script lang="ts">
	import { t } from '#lib/i18n.svelte.ts';
	let { loading, error, empty = false }: { loading: boolean; error: string | null; empty?: boolean } = $props();
</script>

{#if loading}
	<p class="muted" aria-live="polite">{t('common.loading')}</p>
{:else if error}
	<p class="notice error" role="alert">{t('common.error')}</p>
{:else if empty}
	<p class="muted">{t('common.empty')}</p>
{/if}
