import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { Job } from '../../models/job.model';

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	// private apiUrl: string = environment.HOST + '/api'
	private apiUrl: string = 'http://localhost:3000/api';

	private distanceMatrixUrl: string = 'https://api.distancematrix.ai';

	constructor(private http: HttpClient) {}

	getJobs(search: string, topics: string, minPage: number, maxPage: number): Observable<Job[]> {
		return this.http.get<Job[]>(`${this.apiUrl}/jobs?topics=cafe,coffee,barista&maxPage=4&search=barista&minPage=1`);
	}

	getDistanceInfo(origins: string, destinations: string): Promise<any> {
		let params = new HttpParams()
			.set('origins', origins)
			.set('destinations', destinations.trim())
			.set('key', 'B25alS5cq4iZsDuX1933oA9vrccyxUW6tuymGkRhbeJfCmqDDk35XNnaJp7VYz1I')
			.set('language', 'es-419')
			.set('transit_mode', 'bus')
			.set('mode', 'transit');

		return lastValueFrom(this.http.get<Job[]>(`${this.distanceMatrixUrl}/maps/api/distancematrix/json`, { params }));
	}
}
