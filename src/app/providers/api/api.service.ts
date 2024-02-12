import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Job } from "../../models/job.model";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // private apiUrl: string = environment.HOST + '/api'
  private apiUrl: string = 'http://localhost:3000/api'

  constructor(
    private http: HttpClient
  ) { }

  getJobs(search: string, topics: string, minPage: number, maxPage: number): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs?topics=cafe,coffee,barista&maxPage=4&search=barista&minPage=1`)
  }
}