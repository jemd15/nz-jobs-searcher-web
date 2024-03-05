export interface Distance {
	destination_addresses: string[];
	origin_addresses: string[];
	rows: Row[];
	status: string;
}

export interface Row {
	elements: Element[];
}

export interface Element {
	destination: string;
	distance: Distance;
	duration: Duration;
	origin: string;
	status: string;
}

export interface Distance {
	text: string;
	value: number;
}

export interface Duration {
	text: string;
	value: number;
}
