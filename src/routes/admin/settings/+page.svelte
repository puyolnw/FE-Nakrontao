<script lang="ts">
	import { api, ApiError } from '#lib/api.ts';
	import { loadSettings } from '#lib/settings.svelte.ts';
	import FieldInput from '#lib/admin/FieldInput.svelte';
	import type { SiteSettings, I18n } from '#lib/types.ts';

	let s = $state<{ name: I18n; tagline: I18n; contact: string; survey_url: string; privacy: I18n; consent: I18n } | null>(null);
	let msg = $state('');
	let err = $state('');

	$effect(() => {
		api.get<SiteSettings>('/api/v1/settings').then((v) => {
			s = {
				name: v.site?.name ?? { th: '' },
				tagline: v.site?.tagline ?? { th: '' },
				contact: v.site?.contact ?? '',
				survey_url: v.site?.survey_url ?? '',
				privacy: v.privacy ?? { th: '' },
				consent: v.consent ?? { th: '' }
			};
		});
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!s) return;
		msg = err = '';
		try {
			await api.put('/api/v1/admin/settings/site', { name: s.name, tagline: s.tagline, contact: s.contact, survey_url: s.survey_url });
			await api.put('/api/v1/admin/settings/privacy', s.privacy);
			await api.put('/api/v1/admin/settings/consent', s.consent);
			await loadSettings();
			msg = 'บันทึกแล้ว';
		} catch (e) {
			err = e instanceof ApiError ? e.message : 'บันทึกไม่สำเร็จ';
		}
	}
	async function reindex() {
		msg = err = '';
		try {
			const r = await api.post<{ chunks: number }>('/api/v1/admin/reindex');
			msg = `สร้างฐานความรู้ AI ใหม่แล้ว (${r.chunks} ชิ้น)`;
		} catch (e) {
			err = e instanceof ApiError ? e.message : 'ไม่สำเร็จ';
		}
	}
</script>

<h1>ตั้งค่าแพลตฟอร์ม</h1>
{#if s}
	<form onsubmit={save}>
		<FieldInput field={{ key: 'name', label: 'ชื่อโครงการ', type: 'i18n' }} bind:value={s.name} />
		<FieldInput field={{ key: 'tagline', label: 'คำโปรย', type: 'i18n' }} bind:value={s.tagline} />
		<FieldInput field={{ key: 'contact', label: 'ข้อมูลติดต่อ', type: 'text' }} bind:value={s.contact} />
		<FieldInput field={{ key: 'survey_url', label: 'ลิงก์แบบสอบถามภายนอก (ถ้ามี)', type: 'url' }} bind:value={s.survey_url} />
		<FieldInput field={{ key: 'privacy', label: 'นโยบายความเป็นส่วนตัว', type: 'i18n', long: true }} bind:value={s.privacy} />
		<FieldInput field={{ key: 'consent', label: 'คำชี้แจงและขอความยินยอมก่อนตอบแบบประเมิน', type: 'i18n', long: true }} bind:value={s.consent} />
		<div class="bar">
			<button class="btn">บันทึก</button>
			<button type="button" class="btn quiet" onclick={reindex}>สร้างฐานความรู้ AI ใหม่</button>
			{#if msg}<span class="ok">{msg}</span>{/if}
			{#if err}<span class="error">{err}</span>{/if}
		</div>
	</form>
{/if}

<style>
	h1 {
		font-size: var(--text-h3);
	}
	form {
		display: grid;
		gap: var(--space-5);
		max-width: 860px;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		align-items: center;
	}
	.ok {
		color: var(--ok);
	}
</style>
