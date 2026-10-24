<script lang="ts">
	import { api, ApiError } from '#lib/api.ts';

	let current = $state('');
	let next = $state('');
	let confirmPw = $state('');
	let msg = $state('');
	let err = $state('');

	async function save(e: SubmitEvent) {
		e.preventDefault();
		msg = err = '';
		if (next !== confirmPw) {
			err = 'รหัสผ่านใหม่ไม่ตรงกัน';
			return;
		}
		try {
			await api.post('/api/v1/auth/password', { current, new: next });
			msg = 'เปลี่ยนรหัสผ่านแล้ว อุปกรณ์อื่นถูกออกจากระบบ';
			current = next = confirmPw = '';
		} catch (e) {
			err = e instanceof ApiError ? e.message : 'ไม่สำเร็จ';
		}
	}
</script>

<h1>เปลี่ยนรหัสผ่าน</h1>
<form onsubmit={save}>
	<label class="field">รหัสผ่านปัจจุบัน<input type="password" bind:value={current} autocomplete="current-password" required /></label>
	<label class="field">รหัสผ่านใหม่ (10–128 ตัวอักษร)<input type="password" bind:value={next} minlength="10" maxlength="128" autocomplete="new-password" required /></label>
	<label class="field">ยืนยันรหัสผ่านใหม่<input type="password" bind:value={confirmPw} autocomplete="new-password" required /></label>
	{#if msg}<p class="notice">{msg}</p>{/if}
	{#if err}<p class="error">{err}</p>{/if}
	<button class="btn">บันทึก</button>
</form>

<style>
	h1 {
		font-size: var(--text-h3);
	}
	form {
		display: grid;
		gap: var(--space-3);
		max-width: 420px;
	}
</style>
