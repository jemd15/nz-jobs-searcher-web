import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { Job } from '../../models/job.model';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	private apiUrl: string = environment.backendApi;
	private distanceMatrixUrl: string = environment.distanceMatrixUrl;

	constructor(private http: HttpClient) {}

	getJobs(search: string, topics: string, minPage: number, maxPage: number): Observable<Job[]> {
		return this.http.get<Job[]>(`${this.apiUrl}/jobs?topics=${topics}&maxPage=${maxPage}&search=${search}&minPage=${minPage}`);
	}

	getDistanceInfo(origins: string, destinations: string): Promise<any> {
		let params = new HttpParams()
			.set('origins', origins)
			.set('destinations', destinations)
			.set('key', environment.distanceMatrixApiKey)
			.set('language', 'es-419')
			.set('transit_mode', 'bus')
			.set('mode', 'transit');

		return lastValueFrom(this.http.get<Job[]>(`${this.distanceMatrixUrl}/maps/api/distancematrix/json`, { params }));
	}
}
