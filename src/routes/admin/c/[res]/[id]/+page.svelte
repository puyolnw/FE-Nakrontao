<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import qrcode from 'qrcode-generator';
	import { api, ApiError } from '#lib/api.ts';
	import { schemas } from '#lib/admin/schemas.ts';
	import FieldInput from '#lib/admin/FieldInput.svelte';
	import type { Place } from '#lib/types.ts';

	const schema = $derived(schemas[page.params.res ?? '']);
	const id = $derived(page.params.id ?? 'new');
	const isNew = $derived(id === 'new');

	let form = $state<Record<string, unknown> | null>(null);
	let places = $state<Place[]>([]);
	let err = $state('');
	let saved = $state('');
	let busy = $state(false);

	$effect(() => {
		if (!schema) return;
		err = '';
		const needsPlaces = schema.fields.some((f) => f.type === 'place' || f.type === 'places');
		if (needsPlaces) api.get<Place[]>('/api/v1/admin/places').then((p) => (places = p)).catch(() => {});
		if (isNew) {
			form = structuredClone(schema.defaults);
			return;
		}
		if (!/^\d+$/.test(id)) return;
		api
			.get<Record<string, unknown>>(`/api/v1/admin/${schema.path}/${id}`)
			.then((row) => {
				// Keep only editable fields so the strict server decoder accepts the payload.
				const out: Record<string, unknown> = {};
				for (const f of schema.fields) out[f.key] = row[f.key] ?? schema.defaults[f.key];
				form = out;
			})
			.catch((e) => (err = e.message));
	});

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!form || !schema) return;
		busy = true;
		err = '';
		saved = '';
		try {
			if (isNew) {
				const r = await api.post<{ id: number }>(`/api/v1/admin/${schema.path}`, form);
				goto(`/admin/c/${schema.path}/${r.id}`, { replace: true });
			} else {
				await api.put(`/api/v1/admin/${schema.path}/${id}`, form);
			}
			saved = 'บันทึกแล้ว';
		} catch (e) {
			err = e instanceof ApiError ? e.message : 'บันทึกไม่สำเร็จ';
		} finally {
			busy = false;
		}
	}

	async function remove() {
		if (!schema || !confirm('ลบรายการนี้ถาวร?')) return;
		try {
			await api.del(`/api/v1/admin/${schema.path}/${id}`);
			goto(`/admin/c/${schema.path}`);
		} catch (e) {
			err = e instanceof ApiError ? e.message : 'ลบไม่สำเร็จ';
		}
	}

	// QR code for printed signs at each place (scope 7.4). Rendered as a data URL image, not HTML.
	const qrSrc = $derived.by(() => {
		if (!schema?.qr || isNew) return '';
		const qr = qrcode(0, 'M');
		qr.addData(`${location.origin}${schema.publicPath}/${id}`);
		qr.make();
		return qr.createDataURL(6, 2);
	});
</script>

{#if schema}
	<p class="small"><a href="/admin/c/{schema.path}">← {schema.title}</a></p>
	<h1>{isNew ? 'เพิ่มใหม่' : 'แก้ไข'} · {schema.title.split(' (')[0]}</h1>
	{#if form}
		<form onsubmit={save}>
			{#each schema.fields as f (f.key)}
				<FieldInput field={f} bind:value={form[f.key]} {places} />
			{/each}
			<div class="bar">
				<button class="btn" disabled={busy}>บันทึก</button>
				{#if !isNew}<button type="button" class="btn danger" onclick={remove}>ลบ</button>{/if}
				{#if saved}<span class="ok" role="status">{saved}</span>{/if}
				{#if err}<span class="error" role="alert">{err}</span>{/if}
			</div>
		</form>
		{#if qrSrc}
			<section class="qr">
				<h2>QR Code สำหรับป้าย</h2>
				<img src={qrSrc} alt="QR" width="220" height="220" />
				<a class="btn quiet small" href={qrSrc} download="qr-{id}.gif">ดาวน์โหลด</a>
			</section>
		{/if}
	{:else if err}
		<p class="error">{err}</p>
	{/if}
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
		position: sticky;
		bottom: 0;
		background: var(--bg);
		display: flex;
		gap: var(--space-3);
		align-items: center;
		padding: var(--space-3) 0;
		border-top: var(--hair) solid var(--line-strong);
	}
	.ok {
		color: var(--ok);
	}
	.qr {
		margin-top: var(--space-6);
		display: grid;
		gap: var(--space-2);
		justify-items: start;
	}
	.qr img {
		image-rendering: pixelated;
		background: #fff;
	}
</style>
