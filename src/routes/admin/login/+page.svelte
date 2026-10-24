<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, ApiError } from '#lib/api.ts';
	import { refreshSession } from '#lib/admin/session.svelte.ts';

	let email = $state('');
	let password = $state('');
	let err = $state('');
	let busy = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		err = '';
		try {
			await api.post('/api/v1/auth/login', { email, password });
			await refreshSession();
			goto('/admin');
		} catch (e) {
			err =
				e instanceof ApiError && e.status === 429
					? 'พยายามเข้าสู่ระบบบ่อยเกินไป รอสักครู่'
					: e instanceof ApiError && e.status === 423
						? 'บัญชีถูกล็อกชั่วคราว 15 นาที'
						: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
		} finally {
			busy = false;
			password = '';
		}
	}
</script>

<div class="box">
	<h1>เข้าสู่ระบบหลังบ้าน</h1>
	<form onsubmit={submit}>
		<label class="field">อีเมล<input type="email" bind:value={email} autocomplete="username" required /></label>
		<label class="field">รหัสผ่าน<input type="password" bind:value={password} autocomplete="current-password" required /></label>
		{#if err}<p class="error" role="alert">{err}</p>{/if}
		<button class="btn" disabled={busy}>เข้าสู่ระบบ</button>
	</form>
</div>

<style>
	.box {
		max-width: 380px;
		margin: 12vh auto;
		padding: var(--space-5);
		border-top: var(--rule) solid var(--accent);
	}
	h1 {
		font-size: var(--text-h3);
	}
	form {
		display: grid;
		gap: var(--space-4);
	}
</style>
