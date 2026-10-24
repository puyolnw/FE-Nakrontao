<script lang="ts">
	import { qs } from '#lib/api.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import Status from '#lib/components/Status.svelte';
	import type { I18n } from '#lib/types.ts';

	interface Stat {
		id: number;
		section: string;
		text: I18n;
		n: number;
		mean: number;
		sd: number;
		level: string;
		distribution: number[];
	}
	let from = $state('2026-01-01');
	let to = $state(new Date().toISOString().slice(0, 10));
	const stats = resource<Stat[]>(() => `/api/v1/admin/survey-report${qs({ from, to })}`);
	const levels: Record<string, string> = { highest: 'มากที่สุด', high: 'มาก', moderate: 'ปานกลาง', low: 'น้อย', lowest: 'น้อยที่สุด' };
	const sections: Record<string, string> = { satisfaction: 'ความพึงพอใจ', usability: 'ความสะดวกในการใช้งาน', ai_quality: 'คุณภาพข้อมูลและ AI' };
	const grouped = $derived(Object.keys(sections).map((s) => ({ s, rows: (stats.data ?? []).filter((x) => x.section === s) })).filter((g) => g.rows.length));
	const overall = (rows: Stat[]) => {
		const n = rows.reduce((a, r) => a + r.n, 0);
		return n ? rows.reduce((a, r) => a + r.mean * r.n, 0) / n : 0;
	};
</script>

<h1>ผลแบบประเมิน</h1>
<p class="muted small">มาตราส่วน 5 ระดับ · ค่าเฉลี่ย (x̄) และส่วนเบี่ยงเบนมาตรฐาน (S.D.) · เกณฑ์แปลผล Best (1977)</p>
<div class="range">
	<label class="field">ตั้งแต่<input type="date" bind:value={from} /></label>
	<label class="field">ถึง<input type="date" bind:value={to} /></label>
	<a class="btn quiet small" href="/api/v1/admin/export/survey-summary{qs({ from, to })}">ส่งออกสรุป CSV</a>
	<a class="btn quiet small" href="/api/v1/admin/export/survey{qs({ from, to })}">ส่งออกคำตอบดิบ CSV</a>
</div>

<Status loading={stats.loading} error={stats.error} empty={stats.data?.length === 0} />
{#each grouped as g (g.s)}
	<h2>{sections[g.s]} <span class="muted small">x̄ รวม {overall(g.rows).toFixed(2)}</span></h2>
	<div class="scroll">
		<table class="data">
			<thead>
				<tr><th>ข้อคำถาม</th><th class="num-cell">n</th><th class="num-cell">x̄</th><th class="num-cell">S.D.</th><th>ระดับ</th><th>การกระจาย 1→5</th></tr>
			</thead>
			<tbody>
				{#each g.rows as r (r.id)}
					<tr>
						<td>{r.text.th}</td>
						<td class="num-cell">{r.n}</td>
						<td class="num-cell">{r.mean.toFixed(2)}</td>
						<td class="num-cell">{r.sd.toFixed(2)}</td>
						<td>{r.n ? levels[r.level] : '—'}</td>
						<td>
							<span class="dist">
								{#each r.distribution as c, i (i)}
									<span style:flex-grow={c || 0.0001} class="s{i + 1}" title="{i + 1}: {c}"></span>
								{/each}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/each}

<style>
	h1 {
		font-size: var(--text-h3);
	}
	h2 {
		font-size: var(--text-lead);
		margin-top: var(--space-6);
	}
	.range {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: end;
		margin-bottom: var(--space-4);
	}
	.scroll {
		overflow-x: auto;
	}
	.dist {
		display: flex;
		width: 160px;
		height: 12px;
		background: var(--bg-sunken);
	}
	.dist span {
		flex-basis: 0;
	}
	.s1 {
		background: var(--line);
	}
	.s2 {
		background: var(--fg-faint);
	}
	.s3 {
		background: var(--fg-muted);
	}
	.s4 {
		background: var(--accent);
	}
	.s5 {
		background: var(--accent-strong);
	}
</style>
