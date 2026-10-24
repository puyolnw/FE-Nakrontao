<script lang="ts">
	import { api, ApiError } from '#lib/api.ts';
	import { session } from '#lib/admin/session.svelte.ts';

	interface Run {
		id: number;
		mode: string;
		k: number;
		note: string;
		recall_at_k: number | null;
		mrr: number | null;
		n: number;
		status: string;
		created_at: string;
	}
	interface Result {
		id: number;
		code: string;
		lang: string;
		question: string;
		reference_answer: string;
		relevant_docs: string[];
		retrieved_docs: string[];
		recall: number;
		rr: number;
		answer: string;
		latency_ms: number;
		expert_correct: number | null;
		expert_faithful: number | null;
		expert_note: string;
	}

	const modes = [
		{ v: 'llm_only', l: 'A · LLM อย่างเดียว (baseline)' },
		{ v: 'vector', l: 'B · Standard RAG (ภาษาเดียวกัน)' },
		{ v: 'multilingual', l: 'C · Multilingual RAG' },
		{ v: 'hybrid', l: 'D · Hybrid + Rerank (ระบบจริง)' }
	];

	let runs = $state<Run[]>([]);
	let qCount = $state(0);
	let mode = $state('hybrid');
	let k = $state(5);
	let note = $state('');
	let withAnswers = $state(false);
	let msg = $state('');
	let selected = $state<Run | null>(null);
	let results = $state<Result[]>([]);

	async function load() {
		runs = await api.get<Run[]>('/api/v1/admin/eval/runs');
		qCount = (await api.get<unknown[]>('/api/v1/admin/eval/questions')).length;
	}
	$effect(() => {
		load().catch(() => {});
		const t = setInterval(() => runs.some((r) => r.status === 'running') && load().catch(() => {}), 3000);
		return () => clearInterval(t);
	});

	async function importCsv(e: Event & { currentTarget: HTMLInputElement }) {
		const f = e.currentTarget.files?.[0];
		if (!f) return;
		msg = '';
		try {
			const res = await fetch('/api/v1/admin/eval/questions/import', {
				method: 'POST',
				headers: { 'X-Requested-With': 'fetch', 'Content-Type': 'text/csv' },
				body: await f.text()
			});
			const d = await res.json();
			msg = res.ok ? `นำเข้า ${d.imported} ข้อ` : d.message;
			load();
		} finally {
			e.currentTarget.value = '';
		}
	}

	async function start(e: SubmitEvent) {
		e.preventDefault();
		msg = '';
		if (withAnswers && !confirm('การสร้างคำตอบจะเรียก LLM API ทุกข้อ (มีค่าใช้จ่าย) ดำเนินการต่อ?')) return;
		try {
			await api.post('/api/v1/admin/eval/runs', { mode, k, note, with_answers: withAnswers });
			load();
		} catch (e) {
			msg = e instanceof ApiError ? e.message : 'เริ่มไม่สำเร็จ';
		}
	}

	async function open(r: Run) {
		selected = r;
		results = await api.get<Result[]>(`/api/v1/admin/eval/runs/${r.id}`);
	}

	async function grade(r: Result) {
		if (!r.expert_correct || !r.expert_faithful) return;
		await api.put(`/api/v1/admin/eval/results/${r.id}`, { correct: r.expert_correct, faithful: r.expert_faithful, note: r.expert_note });
	}
	const f3 = (x: number | null) => (x === null ? '—' : x.toFixed(3));
</script>

<h1>ทดสอบและประเมินประสิทธิภาพ AI</h1>
<p class="muted small">
	เปรียบเทียบรูปแบบการค้นคืน A–D ด้วย Recall@K และ MRR บนชุดคำถามอ้างอิง (R1–R5) · ผู้เชี่ยวชาญให้คะแนนความถูกต้องและ faithfulness
	(R6–R7) · ส่งออก CSV (R8)
</p>

<section>
	<h2>1. ชุดคำถามทดสอบ ({qCount} ข้อ)</h2>
	<p class="small">นำเข้า CSV ตามชีต AI_Test_Set: <code>test_id, lang, question, reference_answer, relevant_doc_ids, category, difficulty, reviewer</code> (หลาย doc คั่นด้วย ;)</p>
	<input type="file" accept=".csv,text/csv" onchange={importCsv} />
</section>

<section>
	<h2>2. เริ่มการทดลอง</h2>
	<form class="run" onsubmit={start}>
		<label class="field">รูปแบบ<select bind:value={mode}>{#each modes as m (m.v)}<option value={m.v}>{m.l}</option>{/each}</select></label>
		<label class="field">K<input type="number" min="1" max="20" bind:value={k} /></label>
		<label class="field">บันทึก<input bind:value={note} maxlength="500" /></label>
		<label class="check"><input type="checkbox" bind:checked={withAnswers} /> สร้างคำตอบด้วย LLM ด้วย</label>
		<button class="btn" disabled={session.user?.role !== 'admin'}>เริ่ม</button>
	</form>
	{#if session.user?.role !== 'admin'}<p class="small muted">เฉพาะผู้ดูแลระบบเริ่มการทดลองได้</p>{/if}
	{#if msg}<p class="notice small">{msg}</p>{/if}
</section>

<section>
	<h2>3. ผลการทดลอง</h2>
	<a class="btn quiet small" href="/api/v1/admin/eval/export">ส่งออกผลทั้งหมด CSV</a>
	<div class="scroll">
		<table class="data">
			<thead><tr><th>#</th><th>รูปแบบ</th><th class="num-cell">K</th><th class="num-cell">n</th><th class="num-cell">Recall@K</th><th class="num-cell">MRR</th><th>สถานะ</th><th>บันทึก</th><th></th></tr></thead>
			<tbody>
				{#each runs as r (r.id)}
					<tr>
						<td>{r.id}</td><td>{r.mode}</td><td class="num-cell">{r.k}</td><td class="num-cell">{r.n}</td>
						<td class="num-cell">{f3(r.recall_at_k)}</td><td class="num-cell">{f3(r.mrr)}</td>
						<td>{r.status}</td><td class="small">{r.note}</td>
						<td><button class="btn quiet small" onclick={() => open(r)}>ดู</button></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

{#if selected}
	<section>
		<h2>รายละเอียดรอบ #{selected.id} · {selected.mode}</h2>
		{#each results as r (r.id)}
			<article class="res">
				<p><strong>{r.code}</strong> <span class="tag">{r.lang}</span> {r.question}</p>
				<p class="small">ควรพบ: {r.relevant_docs.join(', ')} · พบ: {r.retrieved_docs.join(', ') || '—'} · recall {r.recall.toFixed(2)} · RR {r.rr.toFixed(2)}</p>
				<p class="small muted">คำตอบอ้างอิง: {r.reference_answer}</p>
				{#if r.answer}<p class="small">คำตอบระบบ: {r.answer}</p>{/if}
				<div class="grade">
					<label class="field">ถูกต้อง 1–5<input type="number" min="1" max="5" bind:value={r.expert_correct} /></label>
					<label class="field">Faithful 1–5<input type="number" min="1" max="5" bind:value={r.expert_faithful} /></label>
					<label class="field note">หมายเหตุ<input bind:value={r.expert_note} maxlength="2000" /></label>
					<button class="btn quiet small" onclick={() => grade(r)}>บันทึกคะแนน</button>
				</div>
			</article>
		{/each}
	</section>
{/if}

<style>
	h1 {
		font-size: var(--text-h3);
	}
	h2 {
		font-size: var(--text-lead);
		margin-top: var(--space-6);
	}
	.run {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-3);
		align-items: end;
	}
	.check {
		display: flex;
		gap: var(--space-2);
		align-items: center;
		min-height: 44px;
	}
	.scroll {
		overflow-x: auto;
		margin-top: var(--space-3);
	}
	.res {
		border-top: var(--hair) solid var(--line);
		padding: var(--space-3) 0;
	}
	.res p {
		margin-bottom: var(--space-1);
	}
	.grade {
		display: grid;
		grid-template-columns: 120px 120px 1fr auto;
		gap: var(--space-2);
		align-items: end;
	}
	@media (max-width: 700px) {
		.grade {
			grid-template-columns: 1fr 1fr;
		}
	}
	code {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
	}
</style>
