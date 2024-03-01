import { Component } from '@angular/core';
import { FilterMenuComponent } from '../../components/filter-menu/filter-menu.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { JobCardComponent } from '../../components/job-card/job-card.component';
import { ApiService } from '../../providers/api/api.service';
import { Job } from '../../models/job.model';
import { lastValueFrom } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { JobsTableComponent } from '../../components/jobs-table/jobs-table.component';
import { WebSocketService } from '../../providers/websocket/websocket.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FilterMenuComponent, MatFormFieldModule, MatSelectModule, MatToolbarModule, JobCardComponent, MatChipsModule, MatIconModule, JobsTableComponent, NgClass],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {

  public jobs: Job[] = [];
  public wayToShow: string = 'table';

  constructor(
    private api: ApiService,
    protected ws: WebSocketService,
  ) {
    this.getJobs();
  }

  async getJobs() {
    try {
      // this.jobs = await lastValueFrom(this.api.getJobs('barista', 'cafe,coffee,barista', 1, 4))
      this.ws.connect();
      const search_id = localStorage.getItem('search_id');
      this.ws.emit('search', {
        search_id,
        search: 'barista',
        topics: ['cafe','coffee','barista'],
        minPage: 1,
        maxPage: 30
      })
      console.log(`search_id: search_${search_id}`)
      this.ws.listen('search').subscribe(async (data: any) => {
        console.count();
        // data.travelTime = await this.api.getDistanceInfo('48 Saintly Lane, Avondale, Auckland 0600, Nueva Zelanda', data.location).rows.elements.duration.text
        this.api.getDistanceInfo('48 Saintly Lane, Avondale, Auckland 0600, Nueva Zelanda', data.location)
          .then((res: any) => {
            data.travelTime = res.rows[0].elements[0].duration.text

            if (!data.travelTime.includes('hour') && parseInt(data.travelTime.split(' ')[0]) <= 45) {
              data.accent = 'green';
            } else if (!data.travelTime.includes('hour') && parseInt(data.travelTime.split(' ')[0]) > 45) {
              data.accent = 'orange';
            } else {
              data.accent = 'red';
            }

            this.jobs.push(data);
          });
      })
    } catch (error) {

    }
  }

  public changeWayToShow(option: string) {
    this.wayToShow = option;
  }

}