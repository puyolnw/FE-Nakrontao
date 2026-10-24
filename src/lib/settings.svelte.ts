import { api } from './api';
import type { SiteSettings } from './types';

export const site = $state<{ value: SiteSettings; loaded: boolean }>({ value: {}, loaded: false });

export async function loadSettings() {
	try {
		site.value = await api.get<SiteSettings>('/api/v1/settings');
	} catch {
		site.value = {};
	} finally {
		site.loaded = true;
	}
}
