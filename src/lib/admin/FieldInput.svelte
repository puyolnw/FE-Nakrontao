<script lang="ts">
	import { api, ApiError } from '#lib/api.ts';
	import { safeUrl } from '#lib/util.ts';
	import type { Field } from './schemas';
	import type { I18n, Place } from '#lib/types.ts';

	let { field, value = $bindable(), places = [] }: { field: Field; value: unknown; places?: Place[] } = $props();

	const langs = [
		{ code: 'th', label: 'ไทย' },
		{ code: 'zh', label: '中文' },
		{ code: 'en', label: 'EN' }
	] as const;

	let uploadErr = $state('');
	async function upload(file: File | undefined): Promise<string | null> {
		if (!file) return null;
		uploadErr = '';
		const fd = new FormData();
		fd.append('file', file);
		try {
			return (await api.post<{ url: string }>('/api/v1/admin/upload', fd)).url;
		} catch (e) {
			uploadErr = e instanceof ApiError ? e.message : 'อัปโหลดไม่สำเร็จ';
			return null;
		}
	}

	// datetime-local works in local time without zone; the API wants RFC 3339.
	const toLocal = (iso: unknown) => {
		if (typeof iso !== 'string' || !iso) return '';
		const d = new Date(iso);
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
	};
	const fromLocal = (s: string) => (s ? new Date(s).toISOString() : null);

	let tagDraft = $state('');

	// One seller row; keys must match the Go Seller struct exactly (strict decoder).
	type SellerRow = { name: string; village: string; phone: string; line: string; wechat: string; hours: string; lat: number | null; lon: number | null; note: I18n | null };
	const blankSeller = (): SellerRow => ({ name: '', village: '', phone: '', line: '', wechat: '', hours: '', lat: null, lon: null, note: null });
	const sellers = () => list() as SellerRow[];
	const setSeller = (i: number, patch: Partial<SellerRow>) => (value = sellers().map((s, j) => (j === i ? { ...s, ...patch } : s)));
	const num = (v: string) => (v.trim() === '' ? null : Number(v));
	const list = () => (Array.isArray(value) ? (value as unknown[]) : []);
	const i18n = () => (value ?? {}) as I18n;
</script>

<div class="f">
	<span class="label">{field.label}{'required' in field && field.required ? ' *' : ''}</span>

	{#if field.type === 'i18n'}
		<div class="i18n">
			{#each langs as l (l.code)}
				<label>
					<span class="lang">{l.label}</span>
					{#if field.long}
						<textarea rows="6" value={i18n()[l.code] ?? ''} oninput={(e) => (value = { ...i18n(), [l.code]: e.currentTarget.value })}></textarea>
					{:else}
						<input value={i18n()[l.code] ?? ''} oninput={(e) => (value = { ...i18n(), [l.code]: e.currentTarget.value })} />
					{/if}
				</label>
			{/each}
		</div>
	{:else if field.type === 'text' || field.type === 'url'}
		<input type={field.type === 'url' ? 'url' : 'text'} bind:value />
		{#if field.type === 'text' && field.help}<span class="help">{field.help}</span>{/if}
	{:else if field.type === 'number'}
		<input
			type="number"
			min={field.min}
			max={field.max}
			step={field.step ?? 1}
			value={value ?? ''}
			oninput={(e) => (value = e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
		/>
	{:else if field.type === 'select'}
		<select bind:value>
			{#each field.options as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
		</select>
	{:else if field.type === 'bool'}
		<label class="check"><input type="checkbox" checked={!!value} onchange={(e) => (value = e.currentTarget.checked)} /> ใช่</label>
	{:else if field.type === 'datetime'}
		<input type="datetime-local" value={toLocal(value)} oninput={(e) => (value = fromLocal(e.currentTarget.value))} />
	{:else if field.type === 'tags'}
		<div class="chips">
			{#each list() as tag, i (i)}
				<span class="tag">{tag} <button type="button" aria-label="remove" onclick={() => (value = list().filter((_, j) => j !== i))}>×</button></span>
			{/each}
		</div>
		<div class="inline">
			<input bind:value={tagDraft} placeholder="เช่น shrine, archaeology" />
			<button
				type="button"
				class="btn quiet small"
				onclick={() => {
					const v = tagDraft.trim().toLowerCase().replace(/\s+/g, '_');
					if (v && !list().includes(v)) value = [...list(), v];
					tagDraft = '';
				}}>เพิ่ม</button
			>
		</div>
	{:else if field.type === 'image' || field.type === 'images'}
		{@const imgs = field.type === 'image' ? (value ? [value as string] : []) : (list() as string[])}
		<div class="imgs">
			{#each imgs as src, i (i)}
				<figure>
					{#if safeUrl(src)}<img src={safeUrl(src)} alt="" />{/if}
					<button type="button" class="btn danger small" onclick={() => (value = field.type === 'image' ? '' : list().filter((_, j) => j !== i))}>ลบ</button>
				</figure>
			{/each}
		</div>
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			onchange={async (e) => {
				const url = await upload(e.currentTarget.files?.[0]);
				if (url) value = field.type === 'image' ? url : [...list(), url];
				e.currentTarget.value = '';
			}}
		/>
		{#if uploadErr}<span class="error small">{uploadErr}</span>{/if}
	{:else if field.type === 'place'}
		<select value={value ?? ''} onchange={(e) => (value = e.currentTarget.value ? Number(e.currentTarget.value) : null)}>
			<option value="">—</option>
			{#each places as p (p.id)}<option value={p.id}>{p.name.th}</option>{/each}
		</select>
	{:else if field.type === 'sellers'}
		{#if field.help}<span class="help">{field.help}</span>{/if}
		<ol class="sellers">
			{#each sellers() as sl, i (i)}
				<li>
					<div class="sgrid">
						<label>ชื่อร้าน / ครัวเรือน *<input value={sl.name} oninput={(e) => setSeller(i, { name: e.currentTarget.value })} /></label>
						<label>หมู่ที่<input value={sl.village} oninput={(e) => setSeller(i, { village: e.currentTarget.value })} /></label>
						<label>โทร<input type="tel" value={sl.phone} oninput={(e) => setSeller(i, { phone: e.currentTarget.value })} /></label>
						<label>LINE ID<input value={sl.line} oninput={(e) => setSeller(i, { line: e.currentTarget.value })} /></label>
						<label>WeChat ID<input value={sl.wechat} oninput={(e) => setSeller(i, { wechat: e.currentTarget.value })} /></label>
						<label>เวลาขาย / เปิด<input value={sl.hours} placeholder="เช่น ทุกวัน 08:00–17:00" oninput={(e) => setSeller(i, { hours: e.currentTarget.value })} /></label>
						<label>ละติจูด<input type="number" step="0.000001" min="-90" max="90" value={sl.lat ?? ''} oninput={(e) => setSeller(i, { lat: num(e.currentTarget.value) })} /></label>
						<label>ลองจิจูด<input type="number" step="0.000001" min="-180" max="180" value={sl.lon ?? ''} oninput={(e) => setSeller(i, { lon: num(e.currentTarget.value) })} /></label>
						<label class="wide">หมายเหตุ (ไทย)<input value={sl.note?.th ?? ''} oninput={(e) => setSeller(i, { note: { ...(sl.note ?? {}), th: e.currentTarget.value } })} /></label>
						<label class="wide">หมายเหตุ (中文)<input value={sl.note?.zh ?? ''} oninput={(e) => setSeller(i, { note: { ...(sl.note ?? { th: '' }), zh: e.currentTarget.value } })} /></label>
					</div>
					<div class="inline">
						<button type="button" class="btn quiet small" disabled={i === 0} onclick={() => { const a = [...sellers()]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; value = a; }}>↑ เลื่อนขึ้น</button>
						<button type="button" class="btn danger small" onclick={() => (value = sellers().filter((_, j) => j !== i))}>ลบผู้ขาย</button>
					</div>
				</li>
			{/each}
		</ol>
		<button type="button" class="btn quiet small" onclick={() => (value = [...sellers(), blankSeller()])}>+ เพิ่มผู้ขาย</button>
	{:else if field.type === 'places'}
		<ol class="order">
			{#each list() as id, i (i)}
				<li>
					{places.find((p) => p.id === id)?.name.th ?? `#${id}`}
					<button type="button" class="btn quiet small" disabled={i === 0} onclick={() => { const a = [...list()]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; value = a; }}>↑</button>
					<button type="button" class="btn quiet small" onclick={() => (value = list().filter((_, j) => j !== i))}>×</button>
				</li>
			{/each}
		</ol>
		<select onchange={(e) => { const v = Number(e.currentTarget.value); if (v) value = [...list(), v]; e.currentTarget.value = ''; }}>
			<option value="">+ เพิ่มจุดแวะ</option>
			{#each places as p (p.id)}<option value={p.id}>{p.name.th}</option>{/each}
		</select>
	{/if}
</div>

<style>
	.f {
		display: grid;
		gap: var(--space-1);
	}
	.label {
		font-size: var(--text-small);
		font-weight: 600;
	}
	.help {
		font-size: var(--text-caption);
		color: var(--fg-muted);
	}
	.i18n {
		display: grid;
		gap: var(--space-2);
	}
	.i18n label {
		display: grid;
		grid-template-columns: 48px 1fr;
		gap: var(--space-2);
		align-items: start;
	}
	.lang {
		font-size: var(--text-caption);
		color: var(--fg-muted);
		padding-top: var(--space-3);
	}
	.check {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}
	.chips button {
		background: none;
		border: 0;
		color: var(--danger);
		cursor: pointer;
	}
	.inline {
		display: flex;
		gap: var(--space-2);
	}
	.imgs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	figure {
		margin: 0;
		display: grid;
		gap: var(--space-1);
		width: 120px;
	}
	figure img {
		width: 120px;
		height: 90px;
		object-fit: cover;
		border: var(--hair) solid var(--line);
	}
	.order {
		margin: 0;
		padding-left: var(--space-5);
	}
	.order li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) 0;
	}
	.sellers {
		list-style: none;
		margin: 0 0 8px;
		padding: 0;
		display: grid;
		gap: 12px;
	}
	.sellers > li {
		border: 1px solid var(--line-strong);
		border-radius: 10px;
		padding: 12px;
		display: grid;
		gap: 8px;
	}
	.sgrid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 8px 12px;
	}
	.sgrid label {
		display: grid;
		gap: 4px;
		font-size: 0.9rem;
	}
	.sgrid .wide {
		grid-column: 1 / -1;
	}
</style>
