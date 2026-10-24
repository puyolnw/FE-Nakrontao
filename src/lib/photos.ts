// Illustrative stock photos (Unsplash licence) used for page banners until the community
// supplies its own. Admins can replace the home hero in Settings; content photos are per item.
const u = (id: string, w = 1800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const photos = {
	hero: u('photo-1758346971581-81d68e57e9b3', 2200),
	history: u('photo-1562835156-75d18f5ef57f'),
	guide: u('photo-1699941325571-e424dada03a5'),
	places: u('photo-1719886392354-0d3f6315b2c4'),
	plan: u('photo-1757059112718-badebf0d85ca'),
	calendar: u('photo-1789971649652-ae5dfeeaa7b4'),
	ask: u('photo-1750433835485-b1be2eacc19a'),
	community: u('photo-1747396108528-682b02327818'),
	survey: u('photo-1758346974564-07a164871e7d')
};
