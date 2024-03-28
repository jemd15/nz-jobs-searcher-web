export interface Job {
	title: string;
	company: string;
	location: string;
	listingDate: string;
	salary: string;
	classification: string;
	url: string;
	site: string;
	id: string;
	map: string;
	img: string;
	travelTime: string;
	accent?: string;
	search_id?: number;
	status?: 'new' | 'visited' | 'applied';
}
