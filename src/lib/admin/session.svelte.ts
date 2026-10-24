import { api } from '#lib/api.ts';
import type { User } from '#lib/types.ts';

export const session = $state<{ user: User | null; checked: boolean }>({ user: null, checked: false });

export async function refreshSession() {
	try {
		session.user = await api.get<User>('/api/v1/auth/me');
	} catch {
		session.user = null;
	} finally {
		session.checked = true;
	}
}
