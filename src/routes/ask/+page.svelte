<script lang="ts">
	import { photos } from '#lib/photos.ts';
	import PageHead from '#lib/components/PageHead.svelte';
	import { page } from '$app/state';
	import { i18n, t, tx } from '#lib/i18n.svelte.ts';
	import { api, ApiError } from '#lib/api.ts';
	import { numeral, paragraphs } from '#lib/util.ts';
	import type { ChatAnswer } from '#lib/types.ts';

	interface Turn {
		q: string;
		a?: ChatAnswer;
		error?: string;
		voted?: boolean;
	}

	// Random per-tab id: lets the visitor rate their own answers without any account or cookie.
	const sessionId = (() => {
		try {
			const k = 'chat_sid';
			let v = sessionStorage.getItem(k);
			if (!v) sessionStorage.setItem(k, (v = crypto.randomUUID()));
			return v;
		} catch {
			return crypto.randomUUID();
		}
	})();

	let turns = $state<Turn[]>([]);
	let q = $state(page.url.searchParams.get('q') ?? '');
	let busy = $state(false);
	let input: HTMLTextAreaElement;

	async function send(text = q) {
		const question = text.trim();
		if (question.length < 2 || busy) return;
		busy = true;
		q = '';
		const turn: Turn = { q: question };
		turns.push(turn);
		const idx = turns.length - 1;
		try {
			turns[idx].a = await api.post<ChatAnswer>('/api/v1/chat', { session_id: sessionId, lang: i18n.lang, question });
		} catch (e) {
			turns[idx].error = e instanceof ApiError && e.status === 429 ? t('ask.limit') : e instanceof ApiError ? e.message : t('common.error');
		} finally {
			busy = false;
			input?.focus();
		}
	}

	async function vote(i: number, helpful: boolean) {
		const a = turns[i].a;
		if (!a) return;
		turns[i].voted = true;
		api.post(`/api/v1/chat/${a.id}/feedback`, { session_id: sessionId, helpful }).catch(() => {});
	}

	const examples = $derived([t('ask.ex1'), t('ask.ex2'), t('ask.ex3')]);
	// Citation links are built from doc codes only; the model's text never becomes a link (threat A3).
	const uniqueCites = (a: ChatAnswer) => [...new Map(a.citations.map((c) => [c.doc_code, c])).values()];
</script>

<PageHead n={6} section={t('nav.ask')} title={t('ask.title')} lead={t('ask.lead')} art="shrine" photo={photos.ask} />
<div class="wrap page narrow">

	{#if turns.length === 0}
		<div class="examples">
			<p class="small muted">{t('ask.examples')}</p>
			{#each examples as ex (ex)}
				<button class="chip" onclick={() => send(ex)}>{ex}</button>
			{/each}
		</div>
	{/if}

	<ol class="log" aria-live="polite">
		{#each turns as turn, i (i)}
			<li class="q">{turn.q}</li>
			<li class="a">
				{#if turn.a}
					<div class:refused={turn.a.refused}>
						{#each paragraphs(turn.a.answer) as p, j (j)}<p>{p}</p>{/each}
					</div>
					{#if !turn.a.refused && turn.a.citations.length}
						<div class="cites">
							<span class="small muted">{t('common.source')}:</span>
							{#each uniqueCites(turn.a) as c (c.doc_code)}
								<span class="cite small"><span class="code">[{c.doc_code}]</span> {c.title}{#if c.kind === 'belief'} · <em>{tx('kind.belief')}</em>{/if}</span>
							{/each}
						</div>
					{/if}
					<div class="vote">
						{#if turn.voted}
							<span class="small muted">{t('ask.thanks')}</span>
						{:else}
							<button class="btn quiet small" onclick={() => vote(i, true)}>{t('ask.helpful')}</button>
							<button class="btn quiet small" onclick={() => vote(i, false)}>{t('ask.notHelpful')}</button>
						{/if}
					</div>
				{:else if turn.error}
					<p class="error" role="alert">{turn.error}</p>
				{:else}
					<p class="muted">{t('ask.thinking')}</p>
				{/if}
			</li>
		{/each}
	</ol>

	<form class="composer lux" class:docked={turns.length > 0} onsubmit={(e) => (e.preventDefault(), send())}>
		<label class="field-label" for="ask-q">{t('ask.label')}</label>
		<textarea
			id="ask-q"
			bind:this={input}
			bind:value={q}
			maxlength="500"
			rows="2"
			placeholder={t('ask.placeholder')}
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
					e.preventDefault();
					send();
				}
			}}
		></textarea>
		<div class="row">
			<button class="btn" type="submit" disabled={busy || q.trim().length < 2}>{t('ask.send')}</button>
		</div>
	</form>
	<p class="privacy small muted">{t('ask.privacy')}</p>
</div>

<style>
	.narrow {
		max-width: 900px;
	}
	.examples {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		margin: var(--space-5) 0;
	}
	.examples p {
		width: 100%;
		margin: 0;
	}
	.examples .chip {
		white-space: normal;
		text-align: left;
		min-height: 44px;
		padding-block: 8px;
	}
	.log {
		list-style: none;
		padding: 0;
		margin: var(--space-6) 0;
		display: grid;
		gap: var(--space-4);
	}
	.q {
		justify-self: end;
		max-width: 80%;
		background: var(--fg);
		color: var(--bg);
		padding: var(--space-3) var(--space-5);
		border-radius: 24px 24px 6px 24px;
		font-family: var(--font-head);
		animation: pop 500ms var(--ease-out) both;
	}
	.a {
		justify-self: start;
		max-width: 88%;
		background: var(--bg-raised);
		box-shadow: var(--shadow-1);
		padding: var(--space-4) var(--space-5);
		border-radius: 24px 24px 24px 6px;
		animation: pop 600ms var(--ease-out) both;
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.98);
		}
	}
	.a p {
		margin-bottom: var(--space-2);
	}
	.refused {
		color: var(--fg-muted);
	}
	.cites {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: var(--space-3) 0 var(--space-2);
	}
	.cite {
		background: var(--bg-sunken);
		border-radius: var(--radius-pill);
		padding: 2px 12px;
	}
	.code {
		font-family: var(--font-mono);
		color: var(--accent);
	}
	.vote {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
	.composer {
		position: sticky;
		bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
		background: rgb(24 6 9 / 0.96);
		padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
	}
	.composer textarea {
		border: 0;
		background: transparent;
		box-shadow: none;
		min-height: 56px;
		padding: var(--space-2) 0;
		resize: none;
	}
	.composer .row .btn {
		white-space: nowrap;
		min-height: 48px;
	}
	.composer .row .btn:disabled {
		opacity: 0.55;
		filter: saturate(0.6);
	}
	@media (max-width: 899px) {
		.composer {
			bottom: calc(84px + env(safe-area-inset-bottom));
		}
	}
	.privacy {
		margin: var(--space-3) 0 0;
		max-width: none;
		width: 100%;
		text-align: center;
	}
	.composer .row {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
		align-items: center;
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.narrow {
			max-width: 720px;
		}
	}
	.examples {
		margin-bottom: var(--space-6) !important;
		flex-wrap: wrap;
	}
	.composer {
		margin-top: var(--space-4);
		z-index: 1;
	}
	/* The composer docks to the bottom of the screen only during a conversation;
	   before that it sits in the flow under the example questions. */
	.composer:not(.docked) {
		position: static !important;
	}

	.examples {
		justify-content: center;
		text-align: center;
	}
	:global(.ph .inner) {
		min-height: 0 !important;
		padding-bottom: var(--space-5) !important;
	}
	.examples {
		margin-top: 0 !important;
	}
	@media (max-width: 699px) {
		:global(.ph .lead) {
			display: none;
		}
	}
	@media (max-width: 699px) {
		.examples {
			flex-wrap: nowrap !important;
			justify-content: flex-start !important;
			overflow-x: auto;
			scrollbar-width: none;
			margin-inline: calc(-1 * var(--space-4));
			padding-inline: var(--space-4);
			text-align: left;
		}
		.examples p {
			display: none;
		}
		.examples .chip {
			flex: none;
		}
		:global(.ph h1) {
			font-size: 2.2rem !important;
		}
	}
</style>
