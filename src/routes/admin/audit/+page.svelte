<script lang="ts">
	import { resource } from '#lib/resource.svelte.ts';
	import Status from '#lib/components/Status.svelte';

	interface Row {
		id: number;
		action: string;
		entity: string;
		entity_id: string;
		detail: unknown;
		created_at: string;
		email: string | null;
	}
	const rows = resource<Row[]>(() => '/api/v1/admin/audit');
</script>

<h1>ประวัติการแก้ไขข้อมูล</h1>
<p class="small muted">300 รายการล่าสุด</p>
<Status loading={rows.loading} error={rows.error} empty={rows.data?.length === 0} />
<div class="scroll">
	<table class="data">
		<thead><tr><th>เวลา</th><th>ผู้ใช้</th><th>การกระทำ</th><th>ข้อมูล</th><th>รายละเอียด</th></tr></thead>
		<tbody>
			{#each rows.data ?? [] as r (r.id)}
				<tr>
					<td>{new Date(r.created_at).toLocaleString('th-TH')}</td>
					<td>{r.email ?? '—'}</td>
					<td>{r.action}</td>
					<td>{r.entity} #{r.entity_id}</td>
					<td class="small">{r.detail ? JSON.stringify(r.detail) : ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	h1 {
		font-size: var(--text-h3);
	}
	.scroll {
		overflow-x: auto;
	}
</style>
