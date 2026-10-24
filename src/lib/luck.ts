import type { I18n } from './types';

// Traditional Thai colours of the day (สีประจำวัน). Presented as folk belief, not as advice.
export const dayColors: { hex: string; name: I18n; day: I18n }[] = [
	{ hex: '#d62828', name: { th: 'แดง', zh: '红色', en: 'Red' }, day: { th: 'วันอาทิตย์', zh: '星期日', en: 'Sunday' } },
	{ hex: '#f2c230', name: { th: 'เหลือง', zh: '黄色', en: 'Yellow' }, day: { th: 'วันจันทร์', zh: '星期一', en: 'Monday' } },
	{ hex: '#f28cb1', name: { th: 'ชมพู', zh: '粉色', en: 'Pink' }, day: { th: 'วันอังคาร', zh: '星期二', en: 'Tuesday' } },
	{ hex: '#2e9e5b', name: { th: 'เขียว', zh: '绿色', en: 'Green' }, day: { th: 'วันพุธ', zh: '星期三', en: 'Wednesday' } },
	{ hex: '#f07f1d', name: { th: 'แสด', zh: '橙色', en: 'Orange' }, day: { th: 'วันพฤหัสบดี', zh: '星期四', en: 'Thursday' } },
	{ hex: '#5aa7e0', name: { th: 'ฟ้า', zh: '天蓝色', en: 'Sky blue' }, day: { th: 'วันศุกร์', zh: '星期五', en: 'Friday' } },
	{ hex: '#7b3fa0', name: { th: 'ม่วง', zh: '紫色', en: 'Purple' }, day: { th: 'วันเสาร์', zh: '星期六', en: 'Saturday' } }
];

export function todayColor(d = new Date()) {
	return dayColors[d.getDay()];
}
