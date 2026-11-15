<script lang="ts">
	import { tick } from 'svelte';
	import { i18n, t, tx, type Key } from '#lib/i18n.svelte.ts';
	import { api, ApiError } from '#lib/api.ts';
	import { paragraphs } from '#lib/util.ts';
	import { chat, closeChat, openChat } from '#lib/chat.svelte.ts';
	import type { ChatAnswer } from '#lib/types.ts';

	// Floating visitor assistant, mounted once in the layout so the conversation survives navigation.

	interface Turn {
		q: string;
		a?: ChatAnswer;
		error?: string;
		voted?: boolean;
		copied?: boolean;
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
	let q = $state('');
	let busy = $state(false);
	let input = $state<HTMLTextAreaElement>();
	let log = $state<HTMLElement>();

	async function scrollDown() {
		await tick();
		log?.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
	}

	async function send(text = q) {
		const question = text.trim();
		if (question.length < 2 || busy) return;
		busy = true;
		q = '';
		grow();
		turns.push({ q: question });
		const idx = turns.length - 1;
		scrollDown();
		try {
			turns[idx].a = await api.post<ChatAnswer>('/api/v1/chat', { session_id: sessionId, lang: i18n.lang, question });
		} catch (e) {
			turns[idx].error = e instanceof ApiError && e.status === 429 ? t('ask.limit') : e instanceof ApiError ? e.message : t('common.error');
		} finally {
			busy = false;
			scrollDown();
		}
	}

	// A question handed over by openChat() (home search box, old /ask links) is asked once.
	$effect(() => {
		if (chat.open && chat.pending) {
			const p = chat.pending;
			chat.pending = '';
			send(p);
		}
	});
	$effect(() => {
		if (chat.open) tick().then(() => input?.focus());
	});

	function vote(i: number, helpful: boolean) {
		const a = turns[i].a;
		if (!a) return;
		turns[i].voted = true;
		api.post(`/api/v1/chat/${a.id}/feedback`, { session_id: sessionId, helpful }).catch(() => {});
	}

	async function copy(i: number) {
		const a = turns[i].a;
		if (!a) return;
		try {
			await navigator.clipboard.writeText(a.answer);
			turns[i].copied = true;
			setTimeout(() => (turns[i].copied = false), 1600);
		} catch {
			/* clipboard blocked */
		}
	}

	function reset() {
		if (busy) return;
		turns = [];
		input?.focus();
	}

	function grow() {
		if (!input) return;
		input.style.height = 'auto';
		input.style.height = Math.min(input.scrollHeight, 140) + 'px';
	}

	// Section links close the sheet on phones so the page underneath is visible.
	function follow() {
		if (matchMedia('(max-width: 639px)').matches) closeChat();
	}

	const examples = $derived([t('ask.ex1'), t('ask.ex2'), t('ask.ex3')]);
	// Citation links are built from doc codes only; the model's text never becomes a link (threat A3).
	const uniqueCites = (a: ChatAnswer) => [...new Map(a.citations.map((c) => [c.doc_code, c])).values()];

	const icons = {
		book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 16a2 2 0 0 1 2-2h13',
		flame: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-8.5Z',
		pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
		route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 15V9a3 3 0 0 1 3-3h3m6 9v-2a3 3 0 0 0-3-3h-3a3 3 0 0 0-3 3v6',
		calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
		basket: 'M3 9h18l-2 11H5L3 9Zm5 0 4-6 4 6',
		clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2',
		chat: 'M4 5h16v11H9l-5 4V5Z',
		close: 'M6 6l12 12M18 6 6 18',
		plus: 'M12 5v14m-7-7h14',
		arrow: 'M5 12h14m-6-6 6 6-6 6',
		up: 'M12 19V5m-6 6 6-6 6 6',
		refresh: 'M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5'
	};

	// "Continue to" buttons: a fixed map from the question topic to in-site sections, so a link can
	// never come from model output.
	type Section = { href: string; label: Key; icon: keyof typeof icons };
	const S: Record<string, Section> = {
		history: { href: '/history', label: 'ask.goHistory', icon: 'book' },
		guide: { href: '/guide', label: 'ask.goGuide', icon: 'flame' },
		places: { href: '/places', label: 'ask.goPlaces', icon: 'pin' },
		plan: { href: '/plan', label: 'ask.goPlan', icon: 'route' },
		calendar: { href: '/calendar', label: 'ask.goCalendar', icon: 'calendar' },
		community: { href: '/community', label: 'ask.goCommunity', icon: 'basket' },
		visit: { href: '/visit', label: 'ask.goVisit', icon: 'clock' }
	};
	const byTopic: Record<string, Section[]> = {
		history: [S.places, S.guide, S.calendar],
		ritual: [S.calendar, S.places, S.history],
		event: [S.calendar, S.plan, S.places],
		travel: [S.plan, S.visit, S.places],
		community: [S.community, S.places, S.plan],
		other: [S.places, S.history, S.guide]
	};
	const sectionsFor = (a: ChatAnswer) => byTopic[a.topic ?? ''] ?? byTopic.other;
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && chat.open && closeChat()} />

{#snippet icon(d: string, size = 18)}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path {d} /></svg>
{/snippet}

{#if !chat.open}
	<button class="launcher" onclick={() => openChat()} aria-label={t('nav.ask')}>
		<span class="launcher-ic">{@render icon(icons.chat, 22)}</span>
		<span class="launcher-text">{t('nav.ask')}</span>
	</button>
{/if}

{#if chat.open}
	<button class="scrim" aria-label={t('ask.close')} onclick={closeChat}></button>
	<div class="panel" role="dialog" aria-modal="false" aria-label={t('nav.ask')}>
		<header class="head">
			<span class="avatar big">{@render icon(icons.flame, 20)}</span>
			<div class="title">
				<strong>{t('nav.ask')}</strong>
				<span>{t('ask.sub')}</span>
			</div>
			{#if turns.length}
				<button class="icon-btn" onclick={reset} disabled={busy} aria-label={t('ask.newChat')} title={t('ask.newChat')}>{@render icon(icons.refresh, 18)}</button>
			{/if}
			<button class="icon-btn" onclick={closeChat} aria-label={t('ask.close')} title={t('ask.close')}>{@render icon(icons.close, 18)}</button>
		</header>

		<div class="scroll" bind:this={log}>
			{#if turns.length === 0}
				<section class="empty">
					<span class="avatar huge">{@render icon(icons.flame, 28)}</span>
					<h2>{t('ask.hello')}</h2>
					<p>{t('ask.lead')}</p>
					<div class="starters">
						{#each examples as ex (ex)}
							<button class="starter" onclick={() => send(ex)}><span>{ex}</span>{@render icon(icons.arrow, 16)}</button>
						{/each}
					</div>
				</section>
			{/if}

			<ol class="log" aria-live="polite">
				{#each turns as turn, i (i)}
					<li class="msg user"><div class="bubble">{turn.q}</div></li>
					<li class="msg bot">
						<span class="avatar">{@render icon(icons.flame, 16)}</span>
						<div class="body">
							{#if turn.a}
								<div class="prose" class:refused={turn.a.refused}>
									{#each paragraphs(turn.a.answer) as p, j (j)}<p>{p}</p>{/each}
								</div>
								{#if !turn.a.refused && turn.a.citations.length}
									<div class="cites">
										{#each uniqueCites(turn.a) as c (c.doc_code)}
											<span class="cite" title={c.source}><b>{c.doc_code}</b> {c.title}{#if c.kind === 'belief'} · <em>{tx('kind.belief')}</em>{/if}</span>
										{/each}
									</div>
								{/if}
								<div class="tools">
									<button class="tool" onclick={() => copy(i)} aria-label={t('ask.copy')} title={t('ask.copy')}>
										{@render icon(turn.copied ? 'M5 12l5 5L20 7' : 'M9 9h11v11H9zM5 15H4V4h11v1', 15)}
									</button>
									{#if turn.voted}
										<span class="thanks">{t('ask.thanks')}</span>
									{:else}
										<button class="tool" onclick={() => vote(i, true)} aria-label={t('ask.helpful')} title={t('ask.helpful')}>
											{@render icon('M7 11v9H4v-9h3Zm0 0 4-8a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 19H7', 15)}
										</button>
										<button class="tool" onclick={() => vote(i, false)} aria-label={t('ask.notHelpful')} title={t('ask.notHelpful')}>
											{@render icon('M17 13V4h3v9h-3Zm0 0-4 8a2 2 0 0 1-2-2v-4H6a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 7.2 5H17', 15)}
										</button>
									{/if}
								</div>

								{#if i === turns.length - 1}
									{#if !turn.a.refused}
										<nav class="go" aria-label={t('ask.go')}>
											<p class="label">{t('ask.go')}</p>
											{#each sectionsFor(turn.a) as s (s.href)}
												<a class="go-card" href={s.href} onclick={follow}>
													<span class="go-icon">{@render icon(icons[s.icon], 18)}</span>
													<span class="go-text">{t(s.label)}</span>
													<span class="go-arrow">{@render icon(icons.arrow, 15)}</span>
												</a>
											{/each}
										</nav>
									{/if}
									{@const next = turn.a.refused || !turn.a.suggestions?.length ? examples : turn.a.suggestions}
									<div class="related">
										<p class="label">{turn.a.refused ? t('ask.examples') : t('ask.related')}</p>
										{#each next as s (s)}
											<button disabled={busy} onclick={() => send(s)}><span>{s}</span>{@render icon(icons.plus, 15)}</button>
										{/each}
									</div>
								{/if}
							{:else if turn.error}
								<p class="error" role="alert">{turn.error}</p>
							{:else}
								<div class="typing" aria-label={t('ask.thinking')}><span></span><span></span><span></span></div>
							{/if}
						</div>
					</li>
				{/each}
			</ol>
		</div>

		<footer class="foot">
			<form class="composer" onsubmit={(e) => (e.preventDefault(), send())}>
				<label class="sr-only" for="chat-q">{t('ask.label')}</label>
				<textarea
					id="chat-q"
					bind:this={input}
					bind:value={q}
					oninput={grow}
					maxlength="500"
					rows="1"
					placeholder={t('ask.placeholder')}
					onkeydown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
							e.preventDefault();
							send();
						}
					}}
				></textarea>
				<button class="send" type="submit" disabled={busy || q.trim().length < 2} aria-label={t('ask.send')}>{@render icon(icons.up, 18)}</button>
			</form>		</footer>
	</div>
{/if}

<style>
	.launcher,
	.panel {
		--line: color-mix(in srgb, var(--fg) 12%, transparent);
		--soft: color-mix(in srgb, var(--fg) 6%, transparent);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	/* Launcher */
	.launcher {
		position: fixed;
		right: 24px;
		bottom: calc(24px + env(safe-area-inset-bottom));
		z-index: 1001;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 20px 8px 8px;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
		background: var(--bg-raised);
		color: var(--fg);
		font: inherit;
		font-weight: 600;
		box-shadow: 0 14px 40px rgb(0 0 0 / 0.45);
		cursor: pointer;
		animation: rise 500ms var(--ease-out) both;
		transition: transform 180ms var(--ease-out), border-color 180ms;
	}
	.launcher:hover {
		transform: translateY(-3px);
		border-color: var(--accent);
	}
	.launcher-ic {
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background: var(--accent);
		color: var(--bg);
	}

	/* Panel */
	.scrim {
		display: none;
	}
	.panel {
		position: fixed;
		right: 24px;
		bottom: calc(24px + env(safe-area-inset-bottom));
		z-index: 1002;
		width: min(420px, calc(100vw - 48px));
		height: min(680px, calc(100dvh - 120px));
		display: flex;
		flex-direction: column;
		border-radius: 24px;
		border: 1px solid var(--line);
		background: var(--bg);
		color: var(--fg);
		box-shadow: 0 24px 80px rgb(0 0 0 / 0.55);
		overflow: hidden;
		transform-origin: bottom right;
		animation: open 260ms var(--ease-out) both;
	}
	@keyframes open {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.96);
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}

	.head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: 14px 12px 14px 16px;
		border-bottom: 1px solid var(--line);
		background: var(--bg-raised);
	}
	.title {
		flex: 1;
		min-width: 0;
		display: grid;
		line-height: 1.3;
	}
	.title strong {
		font-family: var(--font-head);
		font-size: 1rem;
	}
	.title span {
		font-size: 0.75rem;
		color: var(--fg-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.icon-btn,
	.tool {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 10px;
		border: 0;
		background: transparent;
		color: var(--fg-muted);
		cursor: pointer;
	}
	.tool {
		width: 30px;
		height: 30px;
	}
	.icon-btn:hover,
	.tool:hover {
		background: var(--soft);
		color: var(--fg);
	}
	.avatar {
		flex: none;
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		color: var(--accent);
		background: var(--soft);
		border: 1px solid var(--line);
	}
	.avatar.big {
		width: 38px;
		height: 38px;
	}
	.avatar.huge {
		width: 56px;
		height: 56px;
	}

	.scroll {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: var(--space-4);
	}

	.empty {
		display: grid;
		justify-items: center;
		text-align: center;
		padding-top: var(--space-4);
	}
	.empty h2 {
		font-family: var(--font-head);
		font-size: 1.3rem;
		margin: var(--space-3) 0 var(--space-1);
	}
	.empty p {
		font-size: 0.85rem;
		color: var(--fg-muted);
		margin: 0 0 var(--space-4);
	}
	.starters {
		width: 100%;
		display: grid;
		gap: var(--space-2);
	}
	.starter {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		padding: 12px 14px;
		border-radius: 14px;
		border: 1px solid var(--line);
		background: var(--bg-raised);
		color: var(--fg);
		font: inherit;
		font-size: 0.92rem;
		text-align: left;
		cursor: pointer;
		transition: border-color 160ms;
	}
	.starter :global(svg) {
		flex: none;
		color: var(--fg-muted);
	}
	.starter:hover {
		border-color: var(--accent);
	}

	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-4);
	}
	.msg {
		animation: rise 360ms var(--ease-out) both;
	}
	.user {
		display: flex;
		justify-content: flex-end;
	}
	.bubble {
		max-width: 85%;
		padding: 10px 14px;
		border-radius: 18px 18px 6px 18px;
		background: var(--soft);
		border: 1px solid var(--line);
		white-space: pre-wrap;
		font-size: 0.95rem;
	}
	.bot {
		display: grid;
		grid-template-columns: 28px 1fr;
		gap: 10px;
	}
	.body {
		min-width: 0;
		padding-top: 3px;
	}
	.prose p {
		margin: 0 0 var(--space-2);
		line-height: 1.7;
		font-size: 0.95rem;
		max-width: none;
	}
	.refused {
		color: var(--fg-muted);
	}
	.cites {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 4px 0;
	}
	.cite {
		font-size: 0.74rem;
		padding: 2px 9px;
		border-radius: 999px;
		background: var(--soft);
		border: 1px solid var(--line);
	}
	.cite b {
		font-family: var(--font-mono);
		font-weight: 500;
		color: var(--accent);
	}
	.tools {
		display: flex;
		align-items: center;
		margin-left: -6px;
	}
	.thanks {
		font-size: 0.78rem;
		color: var(--fg-muted);
		padding-left: 6px;
	}

	.label {
		margin: 0 0 6px;
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--fg-muted);
	}
	.go {
		display: grid;
		gap: 6px;
		margin-top: var(--space-3);
	}
	.go-card {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: 12px;
		border: 1px solid var(--line);
		background: var(--bg-raised);
		color: var(--fg);
		text-decoration: none;
		font-size: 0.88rem;
		transition: border-color 160ms;
	}
	.go-card:hover {
		border-color: var(--accent);
	}
	.go-icon {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 9px;
		color: var(--accent);
		background: var(--soft);
	}
	.go-arrow {
		color: var(--fg-muted);
		transition: transform 160ms;
	}
	.go-card:hover .go-arrow {
		transform: translateX(3px);
		color: var(--accent);
	}
	.related {
		margin-top: var(--space-3);
	}
	.related button {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		padding: 10px 2px;
		border: 0;
		border-top: 1px solid var(--line);
		background: transparent;
		color: var(--fg);
		font: inherit;
		font-size: 0.9rem;
		text-align: left;
		cursor: pointer;
	}
	.related button :global(svg) {
		flex: none;
		color: var(--accent);
	}
	.related button:hover:not(:disabled) {
		color: var(--accent);
	}
	.related button:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.typing {
		display: flex;
		gap: 5px;
		padding: 10px 0;
	}
	.typing span {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--fg-muted);
		animation: blink 1.2s infinite ease-in-out both;
	}
	.typing span:nth-child(2) {
		animation-delay: 0.15s;
	}
	.typing span:nth-child(3) {
		animation-delay: 0.3s;
	}
	@keyframes blink {
		0%,
		80%,
		100% {
			opacity: 0.25;
			transform: scale(0.8);
		}
		40% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.foot {
		padding: 10px 12px 8px;
		border-top: 1px solid var(--line);
		background: var(--bg-raised);
	}
	.composer {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		padding: 5px 5px 5px 14px;
		border-radius: 22px;
		border: 1px solid var(--line);
		background: var(--bg);
	}
	.composer:focus-within {
		border-color: var(--accent);
	}
	.composer textarea {
		flex: 1;
		border: 0;
		background: transparent;
		box-shadow: none;
		color: var(--fg);
		font: inherit;
		font-size: 0.95rem;
		min-height: 36px;
		max-height: 140px;
		padding: 7px 0;
		resize: none;
		outline: none;
	}
	.send {
		flex: none;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 0;
		background: var(--accent);
		color: var(--bg);
		cursor: pointer;
	}
	.send:disabled {
		opacity: 0.35;
		cursor: default;
	}

	/* Tablets and phones: lift the launcher and panel above the floating tab bar. */
	@media (max-width: 1023px) {
		.launcher {
			bottom: calc(96px + env(safe-area-inset-bottom));
			right: 16px;
		}
		.panel {
			bottom: calc(96px + env(safe-area-inset-bottom));
			right: 16px;
			height: min(640px, calc(100dvh - 140px));
		}
	}
	/* Phones: compact round launcher and a full-screen sheet. */
	@media (max-width: 639px) {
		.launcher {
			padding: 6px;
		}
		.launcher-text {
			display: none;
		}
		.scrim {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 1001;
			border: 0;
			background: rgb(0 0 0 / 0.5);
		}
		.panel {
			inset: 0;
			width: 100%;
			height: 100dvh;
			border-radius: 0;
			border: 0;
			animation-name: sheet;
		}
		.foot {
			padding-bottom: calc(8px + env(safe-area-inset-bottom));
		}
	}
	@keyframes sheet {
		from {
			transform: translateY(100%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.launcher,
		.panel,
		.msg,
		.typing span {
			animation: none;
		}
	}
</style>
