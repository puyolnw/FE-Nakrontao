// Field definitions that drive the generic admin list/editor. Mirrors the Go structs in
// server/internal/content/entities.go; the server re-validates everything.

export type Field =
	| { key: string; label: string; type: 'text' | 'url' | 'image'; required?: boolean; help?: string }
	| { key: string; label: string; type: 'i18n'; long?: boolean; required?: boolean }
	| { key: string; label: string; type: 'number'; min?: number; max?: number; step?: number; required?: boolean }
	| { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; required?: boolean }
	| { key: string; label: string; type: 'bool' }
	| { key: string; label: string; type: 'tags' | 'images' }
	| { key: string; label: string; type: 'datetime'; required?: boolean; nullable?: boolean }
	| { key: string; label: string; type: 'places' }
	| { key: string; label: string; type: 'place' }
	| { key: string; label: string; type: 'sellers'; help?: string };

export interface Schema {
	path: string; // API path segment
	title: string;
	columns: { key: string; label: string; i18n?: boolean }[];
	fields: Field[];
	defaults: Record<string, unknown>;
	qr?: boolean; // offer a QR code linking to the public page (scope 7.4)
	publicPath?: string;
}

const kindOpts = [
	{ value: 'history', label: 'ประวัติศาสตร์' },
	{ value: 'belief', label: 'ความเชื่อ' },
	{ value: 'ritual', label: 'พิธีกรรม' },
	{ value: 'practice', label: 'ข้อปฏิบัติ' },
	{ value: 'community', label: 'ชุมชน' }
];
const catOpts = [
	{ value: 'sacred', label: 'ศักดิ์สิทธิ์' },
	{ value: 'history', label: 'ประวัติศาสตร์' },
	{ value: 'culture', label: 'วัฒนธรรม' },
	{ value: 'community', label: 'ชุมชน' },
	{ value: 'food', label: 'อาหาร' },
	{ value: 'stay', label: 'ที่พัก' }
];

export const schemas: Record<string, Schema> = {
	knowledge: {
		path: 'knowledge',
		title: 'องค์ความรู้ (ประวัติ ตำนาน พิธีกรรม)',
		columns: [
			{ key: 'doc_code', label: 'รหัส' },
			{ key: 'title', label: 'หัวข้อ', i18n: true },
			{ key: 'kind', label: 'ประเภท' },
			{ key: 'status', label: 'สถานะ' }
		],
		fields: [
			{ key: 'doc_code', label: 'รหัสเอกสาร (doc_id)', type: 'text', required: true, help: 'ใช้อ้างอิงในคำตอบ AI และชุดทดสอบ เช่น K-001' },
			{ key: 'kind', label: 'ประเภทข้อมูล', type: 'select', options: kindOpts, required: true },
			{ key: 'category', label: 'หมวด', type: 'text' },
			{ key: 'title', label: 'หัวข้อ', type: 'i18n', required: true },
			{ key: 'body', label: 'เนื้อหา', type: 'i18n', long: true, required: true },
			{ key: 'source', label: 'แหล่งอ้างอิง', type: 'text' },
			{ key: 'informant', label: 'ผู้ให้ข้อมูล', type: 'text' },
			{ key: 'reviewer', label: 'ผู้ตรวจสอบ', type: 'text' },
			{
				key: 'status',
				label: 'สถานะการตรวจสอบ',
				type: 'select',
				options: [
					{ value: 'draft', label: 'ร่าง' },
					{ value: 'review', label: 'รอตรวจสอบ' },
					{ value: 'published', label: 'เผยแพร่ (เข้าฐานความรู้ AI)' }
				]
			},
			{ key: 'cover_url', label: 'ภาพปก', type: 'image' },
			{ key: 'video_url', label: 'วิดีโอ YouTube', type: 'url' },
			{ key: 'sort', label: 'ลำดับ', type: 'number', min: 0, max: 9999 }
		],
		defaults: { doc_code: '', kind: 'history', category: '', title: { th: '' }, body: { th: '' }, source: '', informant: '', reviewer: '', status: 'draft', cover_url: '', video_url: '', sort: 0 },
		publicPath: '/history'
	},
	places: {
		path: 'places',
		title: 'สถานที่',
		columns: [
			{ key: 'code', label: 'รหัส' },
			{ key: 'name', label: 'ชื่อ', i18n: true },
			{ key: 'category', label: 'หมวด' },
			{ key: 'published', label: 'เผยแพร่' }
		],
		fields: [
			{ key: 'code', label: 'รหัสสถานที่ (place_id)', type: 'text', required: true },
			{ key: 'category', label: 'หมวด', type: 'select', options: catOpts, required: true },
			{ key: 'name', label: 'ชื่อ', type: 'i18n', required: true },
			{ key: 'description', label: 'รายละเอียด', type: 'i18n', long: true },
			{ key: 'lat', label: 'ละติจูด', type: 'number', min: -90, max: 90, step: 0.000001, required: true },
			{ key: 'lon', label: 'ลองจิจูด', type: 'number', min: -180, max: 180, step: 0.000001, required: true },
			{ key: 'open_hours', label: 'เวลาเปิด-ปิด', type: 'text' },
			{ key: 'visit_minutes', label: 'เวลาเยี่ยมชม (นาที)', type: 'number', min: 1, max: 600, required: true },
			{ key: 'fee', label: 'ค่าเข้าชม', type: 'text' },
			{ key: 'contact', label: 'ช่องทางติดต่อ', type: 'text' },
			{ key: 'tags', label: 'แท็กความสนใจ (ใช้กับระบบแนะนำ)', type: 'tags' },
			{ key: 'images', label: 'รูปภาพ', type: 'images' },
			{ key: 'source', label: 'แหล่งอ้างอิง', type: 'text' },
			{ key: 'published', label: 'เผยแพร่', type: 'bool' }
		],
		defaults: { code: '', category: 'sacred', name: { th: '' }, description: { th: '' }, lat: 15.516, lon: 103.194, open_hours: '', visit_minutes: 30, fee: '', contact: '', tags: [], images: [], source: '', published: true },
		qr: true,
		publicPath: '/places'
	},
	routes: {
		path: 'routes',
		title: 'เส้นทางแนะนำ',
		columns: [
			{ key: 'name', label: 'ชื่อ', i18n: true },
			{ key: 'minutes', label: 'นาที' },
			{ key: 'published', label: 'เผยแพร่' }
		],
		fields: [
			{ key: 'name', label: 'ชื่อเส้นทาง', type: 'i18n', required: true },
			{ key: 'description', label: 'คำอธิบาย', type: 'i18n', long: true },
			{ key: 'place_ids', label: 'ลำดับจุดแวะ', type: 'places' },
			{ key: 'minutes', label: 'เวลาโดยประมาณ (นาที)', type: 'number', min: 1, max: 1440, required: true },
			{ key: 'published', label: 'เผยแพร่', type: 'bool' }
		],
		defaults: { name: { th: '' }, description: { th: '' }, place_ids: [], minutes: 120, published: true }
	},
	events: {
		path: 'events',
		title: 'ปฏิทินกิจกรรมและพิธีกรรม',
		columns: [
			{ key: 'title', label: 'กิจกรรม', i18n: true },
			{ key: 'starts_at', label: 'เริ่ม' },
			{ key: 'published', label: 'เผยแพร่' }
		],
		fields: [
			{ key: 'title', label: 'ชื่อกิจกรรม', type: 'i18n', required: true },
			{ key: 'description', label: 'รายละเอียด', type: 'i18n', long: true },
			{ key: 'preparation', label: 'การเตรียมตัว', type: 'i18n', long: true },
			{ key: 'starts_at', label: 'เริ่ม', type: 'datetime', required: true },
			{ key: 'ends_at', label: 'สิ้นสุด', type: 'datetime', required: true },
			{ key: 'place_id', label: 'สถานที่', type: 'place' },
			{ key: 'contact', label: 'ผู้ประสานงาน', type: 'text' },
			{ key: 'source', label: 'แหล่งอ้างอิง', type: 'text' },
			{ key: 'published', label: 'เผยแพร่', type: 'bool' }
		],
		defaults: { title: { th: '' }, description: { th: '' }, preparation: { th: '' }, starts_at: '', ends_at: '', place_id: null, contact: '', source: '', published: true }
	},
	shops: {
		path: 'shops',
		title: 'ร้านค้าและผลิตภัณฑ์ชุมชน',
		columns: [
			{ key: 'name', label: 'ชื่อ', i18n: true },
			{ key: 'kind', label: 'ประเภท' },
			{ key: 'published', label: 'เผยแพร่' }
		],
		fields: [
			{ key: 'name', label: 'ชื่อร้าน', type: 'i18n', required: true },
			{
				key: 'kind',
				label: 'ประเภท',
				type: 'select',
				options: [
					{ value: 'shop', label: 'ร้านค้า' },
					{ value: 'product', label: 'ผลิตภัณฑ์' },
					{ value: 'food', label: 'ร้านอาหาร' },
					{ value: 'stay', label: 'ที่พัก' }
				]
			},
			{ key: 'products', label: 'สินค้า/บริการ', type: 'i18n' },
			{ key: 'description', label: 'รายละเอียด', type: 'i18n', long: true },
			{ key: 'lat', label: 'ละติจูด', type: 'number', min: -90, max: 90, step: 0.000001 },
			{ key: 'lon', label: 'ลองจิจูด', type: 'number', min: -180, max: 180, step: 0.000001 },
			{ key: 'contact', label: 'โทร/ช่องทางติดต่อ', type: 'text' },
			{ key: 'link', label: 'ลิงก์', type: 'url' },
			{ key: 'images', label: 'รูปภาพ', type: 'images' },
			{ key: 'price_from', label: 'ราคาเริ่มต้น (บาท)', type: 'number', min: 0, step: 1 },
			{ key: 'price_to', label: 'ราคาสูงสุด (บาท)', type: 'number', min: 0, step: 1 },
			{ key: 'price_unit', label: 'หน่วยราคา (เช่น ผืน ใบ กก. ชุด)', type: 'i18n' },
			{ key: 'ships', label: 'ส่งทางไปรษณีย์ได้', type: 'bool' },
			{ key: 'how_to_buy', label: 'วิธีซื้อ (มาซื้อที่บ้าน สั่งล่วงหน้า ขายหน้าศาลช่วงงาน ฯลฯ)', type: 'i18n', long: true },
			{ key: 'story', label: 'เรื่องเล่าจากผู้ผลิต', type: 'i18n', long: true },
			{ key: 'sellers', label: 'ผู้ขาย / ครัวเรือน', type: 'sellers', help: 'ใส่เฉพาะผู้ที่ยินยอมให้เผยแพร่ชื่อ เบอร์ และพิกัดแล้ว ข้อมูลทั้งหมดแสดงบนเว็บ' },
			{ key: 'published', label: 'เผยแพร่', type: 'bool' }
		],
		defaults: { name: { th: '' }, kind: 'shop', products: { th: '' }, description: { th: '' }, lat: null, lon: null, contact: '', link: '', images: [], published: true, price_from: null, price_to: null, price_unit: null, how_to_buy: null, story: null, ships: false, sellers: [] },
		qr: true,
		publicPath: '/community'
	},
	news: {
		path: 'news',
		title: 'ข่าวสารและแบนเนอร์',
		columns: [
			{ key: 'title', label: 'หัวข้อ', i18n: true },
			{ key: 'is_banner', label: 'แบนเนอร์' },
			{ key: 'published_at', label: 'เผยแพร่เมื่อ' }
		],
		fields: [
			{ key: 'title', label: 'หัวข้อ', type: 'i18n', required: true },
			{ key: 'body', label: 'เนื้อหา', type: 'i18n', long: true },
			{ key: 'cover_url', label: 'ภาพปก', type: 'image' },
			{ key: 'video_url', label: 'วิดีโอ YouTube', type: 'url' },
			{ key: 'is_banner', label: 'แสดงเป็นแบนเนอร์หน้าแรก', type: 'bool' },
			{ key: 'published_at', label: 'เผยแพร่เมื่อ (เว้นว่าง = ยังไม่เผยแพร่)', type: 'datetime', nullable: true }
		],
		defaults: { title: { th: '' }, body: { th: '' }, cover_url: '', video_url: '', is_banner: false, published_at: null }
	},
	faq: {
		path: 'faq',
		title: 'คำถามที่พบบ่อย (ฐานความรู้ AI)',
		columns: [
			{ key: 'question', label: 'คำถาม', i18n: true },
			{ key: 'category', label: 'หมวด' },
			{ key: 'published', label: 'เผยแพร่' }
		],
		fields: [
			{ key: 'category', label: 'หมวด', type: 'text' },
			{ key: 'question', label: 'คำถาม', type: 'i18n', required: true },
			{ key: 'answer', label: 'คำตอบมาตรฐาน', type: 'i18n', long: true, required: true },
			{ key: 'doc_code', label: 'รหัสเอกสารอ้างอิง', type: 'text' },
			{ key: 'reviewer', label: 'ผู้ตรวจสอบ', type: 'text' },
			{ key: 'published', label: 'เผยแพร่', type: 'bool' }
		],
		defaults: { category: '', question: { th: '' }, answer: { th: '' }, doc_code: '', reviewer: '', published: true }
	}
};
