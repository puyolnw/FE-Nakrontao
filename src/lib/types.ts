export type Lang = 'th' | 'zh' | 'en';
export type I18n = Partial<Record<Lang, string>>;

export interface Knowledge {
	id: number;
	doc_code: string;
	category: string;
	kind: 'history' | 'belief' | 'ritual' | 'practice' | 'community';
	title: I18n;
	body: I18n;
	source: string;
	informant: string;
	reviewer: string;
	status: 'draft' | 'review' | 'published';
	cover_url: string;
	video_url: string;
	sort: number;
	updated_at: string;
}

export interface Place {
	id: number;
	code: string;
	category: 'sacred' | 'culture' | 'history' | 'community' | 'food' | 'stay';
	name: I18n;
	description: I18n;
	lat: number;
	lon: number;
	open_hours: string;
	visit_minutes: number;
	fee: string;
	contact: string;
	tags: string[];
	images: string[];
	source: string;
	published: boolean;
}

export interface Route {
	id: number;
	name: I18n;
	description: I18n;
	place_ids: number[];
	minutes: number;
	published: boolean;
}

export interface EventItem {
	id: number;
	title: I18n;
	description: I18n;
	preparation: I18n;
	starts_at: string;
	ends_at: string;
	place_id: number | null;
	cover_url: string;
	contact: string;
	source: string;
	published: boolean;
}

export interface Shop {
	id: number;
	name: I18n;
	kind: 'shop' | 'food' | 'stay' | 'product';
	products: I18n;
	description: I18n;
	lat: number | null;
	lon: number | null;
	contact: string;
	link: string;
	images: string[];
	published: boolean;
}

export interface News {
	id: number;
	title: I18n;
	body: I18n;
	cover_url: string;
	video_url: string;
	is_banner: boolean;
	published_at: string | null;
}

export interface Citation {
	doc_code: string;
	lang: Lang;
	kind: string;
	title: string;
	source: string;
}

export interface ChatAnswer {
	id: number;
	answer: string;
	citations: Citation[];
	refused: boolean;
	latency_ms: number;
}

export interface PlanStop {
	place: { id: number; category: string; name: I18n; lat: number; lon: number; visit_minutes: number };
	travel_minutes: number;
	arrive_at_minute: number;
	reasons: string[];
}

export interface User {
	id: number;
	email: string;
	name: string;
	role: 'admin' | 'editor';
	active: boolean;
}

export interface SiteSettings {
	site?: { name?: I18n; tagline?: I18n; contact?: string; survey_url?: string; hero_url?: string };
	privacy?: I18n;
	consent?: I18n;
}

export interface Pin {
	lat: number;
	lon: number;
	label: string;
	href?: string;
	kind?: 'sacred' | 'other' | 'me' | 'stop';
	n?: number;
}
