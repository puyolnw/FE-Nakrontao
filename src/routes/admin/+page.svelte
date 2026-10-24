<script lang="ts">
	import { qs } from '#lib/api.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import Status from '#lib/components/Status.svelte';
	import Bars from '#lib/admin/Bars.svelte';
	import Trend from '#lib/admin/Trend.svelte';

	interface KV {
		key: string;
		count: number;
	}
	interface Dash {
		from: string;
		to: string;
		totals: { Places: number; Knowledge: number; Events: number; News: number; Shops: number; Chunks: number };
		traffic: { views: number; visitors: number };
		chat: { questions: number; refused: number; helpful: number; unhelpful: number; avg_latency_ms: number };
		surveys: number;
		daily_views: KV[];
		top_pages: KV[];
		views_by_lang: KV[];
		chat_by_lang: KV[];
		chat_categories: KV[];
	}

	const iso = (d: Date) => d.toISOString().slice(0, 10);
	let from = $state(iso(new Date(Date.now() - 29 * 864e5)));
	let to = $state(iso(new Date()));
	const dash = resource<Dash>(() => `/api/v1/admin/dashboard${qs({ from, to })}`);
	const langName = (k: string) => ({ th: 'ไทย', zh: '中文', en: 'English' })[k] ?? k;
	const catName = (k: string) =>
		({ ritual: 'พิธีกรรม/การสักการะ', history: 'ประวัติ/ตำนาน', event: 'กิจกรรม/เทศกาล', travel: 'การเดินทาง', community: 'ร้านค้า/ที่พัก', other: 'อื่นๆ' })[k] ?? k;
	const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '—');
	const exportUrl = (kind: string) => `/api/v1/admin/export/${kind}${qs({ from, to })}`;
</script>

<div class="head">
	<h1>ภาพรวม</h1>
	<div class="range">
		<label class="field">ตั้งแต่<input type="date" bind:value={from} /></label>
		<label class="field">ถึง<input type="date" bind:value={to} /></label>
	</div>
</div>

<Status loading={dash.loading} error={dash.error} />
{#if dash.data}
	{@const d = dash.data}
	<dl class="stats">
		<div><dt>ผู้เข้าชม (ไม่ซ้ำ/วัน)</dt><dd>{d.traffic.visitors.toLocaleString()}</dd></div>
		<div><dt>การเปิดหน้า</dt><dd>{d.traffic.views.toLocaleString()}</dd></div>
		<div><dt>คำถามถึง AI</dt><dd>{d.chat.questions.toLocaleString()}</dd></div>
		<div><dt>AI ปฏิเสธตอบ</dt><dd>{pct(d.chat.refused, d.chat.questions)}</dd></div>
		<div><dt>ผู้ใช้กด "มีประโยชน์"</dt><dd>{pct(d.chat.helpful, d.chat.helpful + d.chat.unhelpful)}</dd></div>
		<div><dt>เวลาตอบเฉลี่ย</dt><dd>{(d.chat.avg_latency_ms / 1000).toFixed(1)} s</dd></div>
		<div><dt>แบบประเมิน</dt><dd>{d.surveys}</dd></div>
	</dl>

	<section>
		<h2>การเปิดหน้ารายวัน</h2>
		<Trend rows={d.daily_views} />
	</section>

	<div class="cols">
		<section><h2>หน้าที่เปิดมากที่สุด</h2><Bars rows={d.top_pages} /></section>
		<section><h2>หมวดคำถามยอดนิยม</h2><Bars rows={d.chat_categories} label={catName} /></section>
		<section><h2>การใช้งานตามภาษา (หน้าเว็บ)</h2><Bars rows={d.views_by_lang} label={langName} /></section>
		<section><h2>การใช้งานตามภาษา (AI)</h2><Bars rows={d.chat_by_lang} label={langName} /></section>
	</div>

	<section>
		<h2>ข้อมูลในระบบ</h2>
		<table class="data narrow">
			<tbody>
				<tr><td>สถานที่</td><td class="num-cell">{d.totals.Places}</td></tr>
				<tr><td>องค์ความรู้ / บทความวัฒนธรรม</td><td class="num-cell">{d.totals.Knowledge}</td></tr>
				<tr><td>กิจกรรมในปฏิทิน</td><td class="num-cell">{d.totals.Events}</td></tr>
				<tr><td>ข่าวสาร</td><td class="num-cell">{d.totals.News}</td></tr>
				<tr><td>ร้านค้า</td><td class="num-cell">{d.totals.Shops}</td></tr>
				<tr><td>ชิ้นข้อมูลในฐานความรู้ AI</td><td class="num-cell">{d.totals.Chunks}</td></tr>
			</tbody>
		</table>
	</section>

	<section>
		<h2>ส่งออกข้อมูล (CSV เปิดด้วย Excel ได้)</h2>
		<div class="exports">
			<a class="btn quiet small" href={exportUrl('views')}>สถิติการเข้าชม</a>
			<a class="btn quiet small" href={exportUrl('chat')}>บันทึกคำถาม AI</a>
			<a class="btn quiet small" href={exportUrl('survey')}>คำตอบแบบประเมิน</a>
			<a class="btn quiet small" href={exportUrl('survey-summary')}>สรุปแบบประเมิน (ค่าเฉลี่ย/SD)</a>
		</div>
	</section>
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: end;
		flex-wrap: wrap;
		gap: var(--space-4);
	}
	h1 {
		font-size: var(--text-h3);
	}
	h2 {
		font-size: var(--text-lead);
		margin-top: var(--space-6);
	}
	.range {
		display: flex;
		gap: var(--space-2);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		border-top: var(--rule) solid var(--line-strong);
		margin: var(--space-4) 0 0;
	}
	.stats div {
		padding: var(--space-3) var(--space-3) var(--space-3) 0;
		border-bottom: var(--hair) solid var(--line);
	}
	.stats dt {
		font-size: var(--text-caption);
		color: var(--fg-muted);
	}
	.stats dd {
		margin: 0;
		font-family: var(--font-display);
		line-height: 1.5;
		font-size: var(--text-h3);
		font-variant-numeric: tabular-nums;
	}
	.cols {
		display: grid;
		gap: 0 var(--space-6);
	}
	@media (min-width: 1000px) {
		.cols {
			grid-template-columns: 1fr 1fr;
		}
	}
	.narrow {
		max-width: 480px;
	}
	.exports {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
</style>
