// Shared helpers for the community shops & products list and detail pages.
import Shirt from '@lucide/svelte/icons/shirt';
import Sun from '@lucide/svelte/icons/sun';
import ShoppingBasket from '@lucide/svelte/icons/shopping-basket';
import Wheat from '@lucide/svelte/icons/wheat';
import Leaf from '@lucide/svelte/icons/leaf';
import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed';
import House from '@lucide/svelte/icons/house';
import Flame from '@lucide/svelte/icons/flame';
import HandHeart from '@lucide/svelte/icons/hand-heart';
import Store from '@lucide/svelte/icons/store';
import Package from '@lucide/svelte/icons/package';
import { i18n, tr } from '#lib/i18n.svelte.ts';
import type { I18n, Shop } from '#lib/types.ts';

export const kindLabel: Record<string, I18n> = {
	product: { th: 'ผลิตภัณฑ์', zh: '特产', en: 'Product' },
	food: { th: 'ร้านอาหาร', zh: '餐饮', en: 'Food' },
	stay: { th: 'ที่พัก', zh: '住宿', en: 'Stay' },
	shop: { th: 'ร้านค้า/บริการ', zh: '商店/服务', en: 'Shop & service' }
};

/** A product-specific icon, used until the community supplies real photos. */
export function iconFor(s: Shop) {
	const n = s.name.th ?? '';
	if (/ผ้า|ไหม/.test(n)) return Shirt;
	if (/หมวก/.test(n)) return Sun;
	if (/จักสาน|ไผ่/.test(n)) return ShoppingBasket;
	if (/ข้าว/.test(n)) return Wheat;
	if (/สมุนไพร/.test(n)) return Leaf;
	if (/สักการะ|ธูป/.test(n)) return Flame;
	if (/กิจกรรม|เรียน/.test(n)) return HandHeart;
	return { food: UtensilsCrossed, stay: House, shop: Store, product: Package }[s.kind] ?? Package;
}

const baht = (n: number) => '฿' + n.toLocaleString(i18n.lang === 'zh' ? 'zh-CN' : 'th-TH');

/** "฿350 – 2,500 / ผืน", "฿60 / กก." or "" when no price was entered. */
export function priceText(s: Shop): string {
	const { price_from: a, price_to: b } = s;
	if (a == null && b == null) return '';
	const range = a != null && b != null && a !== b ? `${baht(a)} – ${b.toLocaleString('th-TH')}` : baht((a ?? b)!);
	const unit = tr(s.price_unit);
	return unit ? `${range} / ${unit}` : range;
}

/** Sellers listed on the item, counting the legacy single contact as one. */
export function sellerCount(s: Shop): number {
	const n = s.sellers?.length ?? 0;
	return n || (s.contact || (s.lat !== null && s.lon !== null) ? 1 : 0);
}
