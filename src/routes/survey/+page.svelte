<script lang="ts">
	import PageHead from '#lib/components/PageHead.svelte';
	import { photos } from '#lib/photos.ts';
	import { i18n, t, tx, tr } from '#lib/i18n.svelte.ts';
	import { api, ApiError } from '#lib/api.ts';
	import { resource } from '#lib/resource.svelte.ts';
	import { site } from '#lib/settings.svelte.ts';
	import Status from '#lib/components/Status.svelte';
	import type { I18n } from '#lib/types.ts';

	interface Q {
		id: number;
		section: 'satisfaction' | 'usability' | 'ai_quality';
		text: I18n;
	}
	const qs = resource<Q[]>(() => '/api/v1/survey');
	const sections = $derived([...new Set((qs.data ?? []).map((q) => q.section))]);

	let consent = $state(false);
	let agree = $state(false);
	let answers = $state<Record<string, number>>({});
	let age = $state('');
	let visitor = $state('');
	let comment = $state('');
	let done = $state(false);
	let err = $state('');
	let busy = $state(false);

	const complete = $derived((qs.data ?? []).every((q) => answers[q.id]));

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!complete) {
			err = t('survey.incomplete');
			return;
		}
		busy = true;
		err = '';
		try {
			const respondent: Record<string, string> = {};
			if (age) respondent.age_range = age;
			if (visitor) respondent.visitor_type = visitor;
			await api.post('/api/v1/survey', { lang: i18n.lang, consent, respondent, answers, comment });
			done = true;
		} catch (e) {
			err = e instanceof ApiError ? e.message : t('common.error');
		} finally {
			busy = false;
		}
	}
</script>

<PageHead section={t('about.survey')} title={t('survey.title')} lead={t('lead.survey')} photo="" />
<div class="wrap section narrow">
	{#if done}
		<p class="notice">{t('survey.thanks')}</p>
	{:else if !consent}
		<!-- Research consent first (scope 8.8); nothing is collected before this. -->
		<div class="consent lux">
			<p>{tr(site.value.consent)}</p>
			{#if sections.length}<div class="secs">{#each sections as s (s)}<span class="chip">{tx(`survey.section.${s}`)}</span>{/each}</div>{/if}
			{#if qs.data?.length}<p class="meta">{qs.data.length} {t('survey.meta')}{sections.length} {t('survey.sections')}</p>{/if}
			<label class="chip big-chip"><input type="checkbox" bind:checked={agree} /><span class="tick"></span>{t('survey.consent')}</label>
			<button class="btn big start" disabled={!agree} onclick={() => (consent = true)}>{t('survey.start')}</button>
			{#if !agree}<p class="hint">{t('survey.hint')}</p>{/if}
		</div>
	{:else}
		<Status loading={qs.loading} error={qs.error} empty={qs.data?.length === 0} />
		<form class="lux sform" onsubmit={submit}>
			<p class="small muted">{t('survey.scale')}</p>
			<fieldset class="who">
				<label class="field">{t('survey.age')}
					<select bind:value={age}>
						<option value=""></option>
						{#each ['<20', '20-29', '30-39', '40-49', '50-59', '60+'] as a (a)}<option value={a}>{a}</option>{/each}
					</select>
				</label>
				<label class="field">{t('survey.visitor')}
					<select bind:value={visitor}>
						<option value=""></option>
						{#each ['tourist_th', 'tourist_cn', 'local', 'other'] as v (v)}<option value={v}>{tx(`survey.visitor.${v}`)}</option>{/each}
					</select>
				</label>
			</fieldset>
			{#each sections as s (s)}
				<fieldset>
					<legend>{tx(`survey.section.${s}`)}</legend>
					{#each (qs.data ?? []).filter((q) => q.section === s) as q (q.id)}
						<div class="item" role="radiogroup" aria-label={tr(q.text)}>
							<p>{tr(q.text)}</p>
							<div class="scale">
								{#each [1, 2, 3, 4, 5] as v (v)}
									<label class:on={answers[q.id] === v}>
										<input type="radio" name="q{q.id}" value={v} bind:group={answers[q.id]} />
										<span>{v}</span>
									</label>
								{/each}
							</div>
						</div>
					{/each}
				</fieldset>
			{/each}
			<label class="field">{t('survey.comment')}<textarea bind:value={comment} maxlength="4000"></textarea></label>
			{#if err}<p class="error" role="alert">{err}</p>{/if}
			<button class="btn" type="submit" disabled={busy}>{t('survey.submit')}</button>
		</form>
	{/if}
</div>

<style>
	.consent,
	.sform {
		padding: var(--space-6) var(--space-5);
	}
	.big-chip {
		white-space: normal;
		align-items: flex-start;
		min-height: 52px;
		padding: 12px 20px;
		border-radius: var(--radius-l);
		line-height: 1.5;
	}
	.big-chip .tick {
		margin-top: 3px;
		flex: none;
	}
	.narrow {
		max-width: 760px;
	}
	.consent {
		border-top: var(--rule) solid var(--line-strong);
		padding-top: var(--space-4);
	}
	form {
		display: grid;
		gap: var(--space-5);
	}
	fieldset {
		border: 0;
		border-top: var(--hair) solid var(--line-strong);
		margin: 0;
		padding: var(--space-3) 0 0;
	}
	legend {
		font-family: var(--font-display);
		line-height: 1.5;
		font-size: var(--text-h4);
		padding: 0;
	}
	.who {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}
	.item {
		padding: var(--space-3) 0;
		border-bottom: var(--hair) solid var(--line);
	}
	.item p {
		margin-bottom: var(--space-2);
	}
	.scale {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		max-width: 360px;
		border: var(--hair) solid var(--line-strong);
	}
	.scale label {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 44px;
		cursor: pointer;
	}
	.scale label + label {
		border-left: var(--hair) solid var(--line-strong);
	}
	.scale input {
		position: absolute;
		opacity: 0;
		inset: 0;
		cursor: pointer;
	}
	.scale label.on {
		background: var(--fg);
		color: var(--bg);
	}
	.scale label:has(input:focus-visible) {
		outline: 2px solid var(--focus);
		outline-offset: -2px;
	}
	.consent {
		display: grid;
		gap: var(--space-3);
		max-width: 720px;
		margin-inline: auto;
	}
	.meta {
		color: var(--fg-muted);
		font-size: var(--text-small);
		margin: 0;
	}
	.secs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.secs .chip {
		cursor: default;
	}
	.start {
		justify-self: center;
		min-width: 240px;
	}
	.start:disabled {
		opacity: 1;
		background: rgb(241 198 106 / 0.12);
		color: var(--gold-300);
		border: 1px dashed rgb(241 198 106 / 0.5);
		box-shadow: none;
	}
	.hint {
		margin: 0;
		text-align: center;
		font-size: var(--text-small);
		color: var(--fg-muted);
	}
	.consent {
		text-align: center;
		justify-items: center;
	}
	.secs {
		justify-content: center;
	}
	.big-chip {
		text-align: left;
		justify-self: stretch;
	}
	.consent > p {
		text-align: center;
	}



	.secs {
		justify-content: center !important;
	}
	.secs .chip {
		min-height: 32px;
		padding: 2px 12px;
		border-color: rgb(241 198 106 / 0.25);
		background: none;
		font-size: var(--text-caption);
		color: var(--fg-muted);
	}
	@media (max-width: 480px) {
		.secs {
			display: grid !important;
			grid-template-columns: 1fr;
			justify-items: center;
		}
	}
	.big-chip {
		text-wrap: balance;
	}
</style>
