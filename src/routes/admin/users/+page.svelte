<script lang="ts">
	import { api, ApiError } from '#lib/api.ts';
	import { session } from '#lib/admin/session.svelte.ts';
	import type { User } from '#lib/types.ts';

	let users = $state<User[]>([]);
	let editing = $state<(Partial<User> & { password?: string }) | null>(null);
	let err = $state('');

	const load = async () => (users = await api.get<User[]>('/api/v1/admin/users'));
	$effect(() => {
		load().catch((e) => (err = e.message));
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!editing) return;
		err = '';
		const body = { email: editing.email, name: editing.name, role: editing.role, active: editing.active ?? true, password: editing.password ?? '' };
		try {
			if (editing.id) await api.put(`/api/v1/admin/users/${editing.id}`, body);
			else await api.post('/api/v1/admin/users', body);
			editing = null;
			load();
		} catch (e) {
			err = e instanceof ApiError ? e.message : 'บันทึกไม่สำเร็จ';
		}
	}
</script>

<div class="head">
	<h1>ผู้ใช้งานระบบหลังบ้าน</h1>
	<button class="btn" onclick={() => (editing = { role: 'editor', active: true, email: '', name: '' })}>+ เพิ่มผู้ใช้</button>
</div>
<p class="small muted">ผู้ดูแลระบบ: จัดการผู้ใช้ ตั้งค่า และเริ่มการทดลอง AI · ผู้จัดการเนื้อหา: แก้ไขเนื้อหาและดูรายงาน</p>

<table class="data">
	<thead><tr><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>สถานะ</th><th></th></tr></thead>
	<tbody>
		{#each users as u (u.id)}
			<tr>
				<td>{u.name}</td><td>{u.email}</td>
				<td>{u.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้จัดการเนื้อหา'}</td>
				<td>{u.active ? 'ใช้งาน' : 'ระงับ'}</td>
				<td><button class="btn quiet small" onclick={() => (editing = { ...u, password: '' })}>แก้ไข</button></td>
			</tr>
		{/each}
	</tbody>
</table>

{#if editing}
	<form class="edit" onsubmit={save}>
		<h2>{editing.id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}</h2>
		<label class="field">ชื่อ<input bind:value={editing.name} required /></label>
		<label class="field">อีเมล<input type="email" bind:value={editing.email} required /></label>
		<label class="field">บทบาท
			<select bind:value={editing.role} disabled={editing.id === session.user?.id}>
				<option value="editor">ผู้จัดการเนื้อหา</option>
				<option value="admin">ผู้ดูแลระบบ</option>
			</select>
		</label>
		{#if editing.id && editing.id !== session.user?.id}
			<label class="check"><input type="checkbox" bind:checked={editing.active} /> เปิดใช้งาน (ปิด = ระงับและออกจากระบบทันที)</label>
		{/if}
		<label class="field">{editing.id ? 'ตั้งรหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่านเริ่มต้น'}
			<input type="password" bind:value={editing.password} minlength="10" maxlength="128" autocomplete="new-password" required={!editing.id} />
		</label>
		{#if err}<p class="error">{err}</p>{/if}
		<div class="bar">
			<button class="btn">บันทึก</button>
			<button type="button" class="btn quiet" onclick={() => (editing = null)}>ยกเลิก</button>
		</div>
	</form>
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-3);
	}
	h1 {
		font-size: var(--text-h3);
	}
	.edit {
		display: grid;
		gap: var(--space-3);
		max-width: 480px;
		margin-top: var(--space-6);
		border-top: var(--rule) solid var(--accent);
		padding-top: var(--space-4);
	}
	.check {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	.bar {
		display: flex;
		gap: var(--space-2);
	}
</style>
