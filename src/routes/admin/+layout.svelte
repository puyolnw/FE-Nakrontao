<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { api } from '#lib/api.ts';
	import { refreshSession, session } from '#lib/admin/session.svelte.ts';
	import { schemas } from '#lib/admin/schemas.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	const onLogin = $derived(page.url.pathname === '/admin/login');

	$effect(() => {
		if (!session.checked) refreshSession();
	});
	$effect(() => {
		if (session.checked && !session.user && !onLogin) goto('/admin/login');
	});

	async function logout() {
		await api.post('/api/v1/auth/logout').catch(() => {});
		session.user = null;
		goto('/admin/login');
	}
	const nav = [
		{ href: '/admin', label: 'ภาพรวม' },
		...Object.values(schemas).map((s) => ({ href: `/admin/c/${s.path}`, label: s.title.split(' (')[0] })),
		{ href: '/admin/survey', label: 'ผลแบบประเมิน' },
		{ href: '/admin/eval', label: 'ทดสอบ AI (วิจัย)' },
		{ href: '/admin/users', label: 'ผู้ใช้งาน', admin: true },
		{ href: '/admin/settings', label: 'ตั้งค่า', admin: true },
		{ href: '/admin/audit', label: 'ประวัติการแก้ไข', admin: true },
		{ href: '/admin/account', label: 'บัญชีของฉัน' }
	];
</script>

<svelte:head><meta name="robots" content="noindex" /></svelte:head>

{#if onLogin}
	{@render children()}
{:else if session.user}
	<div class="shell">
		<aside>
			<a class="brand" href="/admin">ระบบหลังบ้าน</a>
			<nav>
				{#each nav.filter((n) => !n.admin || session.user?.role === 'admin') as n (n.href)}
					<a href={n.href} aria-current={page.url.pathname === n.href ? 'page' : undefined}>{n.label}</a>
				{/each}
			</nav>
			<div class="me small">
				<span>{session.user.name}</span>
				<span class="muted">{session.user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้จัดการเนื้อหา'}</span>
				<button class="btn quiet small" onclick={logout}>ออกจากระบบ</button>
				<a class="small" href="/" target="_blank" rel="noopener">เปิดหน้าเว็บ ↗</a>
			</div>
		</aside>
		<main class="content">{@render children()}</main>
	</div>
{:else}
	<p class="wrap page muted">กำลังตรวจสอบสิทธิ์…</p>
{/if}

<style>
	.shell {
		display: grid;
		min-height: 100vh;
	}
	@media (min-width: 900px) {
		.shell {
			grid-template-columns: 240px 1fr;
		}
	}
	aside {
		border-right: var(--hair) solid var(--line);
		background: var(--bg-raised);
		padding: var(--space-4);
		display: grid;
		align-content: start;
		gap: var(--space-4);
	}
	.brand {
		font-family: var(--font-display);
		line-height: 1.5;
		font-weight: 700;
		font-size: var(--text-lead);
		text-decoration: none;
		border-bottom: var(--rule) solid var(--accent);
		padding-bottom: var(--space-2);
	}
	nav {
		display: grid;
	}
	nav a {
		text-decoration: none;
		padding: var(--space-2) var(--space-2);
		font-size: var(--text-small);
		color: var(--fg-muted);
		border-left: var(--rule) solid transparent;
	}
	nav a[aria-current='page'] {
		color: var(--fg);
		border-left-color: var(--accent);
		background: var(--bg-sunken);
	}
	.me {
		display: grid;
		gap: var(--space-1);
		border-top: var(--hair) solid var(--line);
		padding-top: var(--space-3);
	}
	.content {
		padding: var(--space-5);
		min-width: 0;
	}
	@media (max-width: 899px) {
		nav {
			grid-auto-flow: column;
			overflow-x: auto;
		}
		nav a {
			white-space: nowrap;
			border-left: 0;
			border-bottom: var(--rule) solid transparent;
		}
		nav a[aria-current='page'] {
			border-bottom-color: var(--accent);
		}
	}
</style>
