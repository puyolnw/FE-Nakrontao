<script lang="ts">
	import { page } from '$app/state';
	import { schemas } from '#lib/admin/schemas.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import Status from '#lib/components/Status.svelte';
	import type { I18n } from '#lib/types.ts';

	const schema = $derived(schemas[page.params.res ?? '']);
	const list = resource<Record<string, unknown>[]>(() => (schema ? `/api/v1/admin/${schema.path}` : null));
	let filter = $state('');

	const cell = (row: Record<string, unknown>, key: string, i18n?: boolean) => {
		const v = row[key];
		if (i18n) return (v as I18n)?.th ?? '';
		if (typeof v === 'boolean') return v ? '✓' : '—';
		if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString('th-TH');
		return v === null || v === undefined ? '—' : String(v);
	};
	const rows = $derived(
		(list.data ?? []).filter((r) => !filter || JSON.stringify(r).toLowerCase().includes(filter.toLowerCase()))
	);
</script>

{#if !schema}
	<p>ไม่พบหมวดนี้</p>
{:else}
	<div class="head">
		<h1>{schema.title}</h1>
		<a class="btn" href="/admin/c/{schema.path}/new">+ เพิ่มใหม่</a>
	</div>
	<input class="filter" type="search" bind:value={filter} placeholder="กรองรายการ" />
	<Status loading={list.loading} error={list.error} empty={list.data?.length === 0} />
	{#if rows.length}
		<div class="scroll">
			<table class="data">
				<thead>
					<tr>
						{#each schema.columns as c (c.key)}<th>{c.label}</th>{/each}
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each rows as r (r.id)}
						<tr>
							{#each schema.columns as c (c.key)}<td>{cell(r, c.key, c.i18n)}</td>{/each}
							<td><a href="/admin/c/{schema.path}/{r.id}">แก้ไข</a></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	h1 {
		font-size: var(--text-h3);
	}
	.filter {
		max-width: 360px;
		margin: var(--space-3) 0 var(--space-4);
	}
	.scroll {
		overflow-x: auto;
	}
</style>
