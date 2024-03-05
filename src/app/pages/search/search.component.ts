import { Component, ViewChild } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ApiService } from '../../providers/api/api.service';
import { Job } from '../../models/job.model';
import { MatIconModule } from '@angular/material/icon';
import { JobsTableComponent } from '../../components/jobs-table/jobs-table.component';
import { WebSocketService } from '../../providers/websocket/websocket.service';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Distance } from '../../models/distance.model';

@Component({
	selector: 'app-search',
	standalone: true,
	imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule, MatToolbarModule, JobsTableComponent, NgClass, FormsModule],
	templateUrl: './search.component.html',
	styleUrl: './search.component.css',
})
export class SearchComponent {
	@ViewChild(JobsTableComponent, { static: true }) jobsTableComponent!: JobsTableComponent;

	public jobs: Job[] = [];
	public filterText: string = '';
	private locations: Distance[] = [];
	public originAddress: string = '48 Saintly Lane, Avondale, Auckland 0600, Nueva Zelanda';

	constructor(
		private api: ApiService,
		protected ws: WebSocketService,
	) {
		// cargamos las direcciones desde localHost en memoria
		this.locations = JSON.parse(localStorage.getItem('locations') || '[]');

		// realizamos la búsqueda
		this.getJobs();
	}

	getJobs() {
		this.ws.connect();
		const search_id = localStorage.getItem('search_id');
		this.ws.emit('search', {
			search_id,
			search: 'barista',
			topics: ['cafe', 'coffee', 'barista'],
			minPage: 1,
			maxPage: 30,
		});
		console.log(`search_id: search_${search_id}`);
		this.ws.listen('search').subscribe((data: Job) => {
			console.count();
			this.getDistanceInfo(data);
		});
	}

	async getDistanceInfo(data: Job) {
		const locationIndex: number = this.locations.findIndex(location => {
			return location.destination_addresses[0].includes(data.location) && location.origin_addresses[0].includes(this.originAddress);
		});

		/**
		 * buscamos la dirección en localStorage y
		 * si no está ahí, la traemos desde el API
		 */
		if (locationIndex < 0) {
			this.api
				.getDistanceInfo(this.originAddress, data.location)
				.then((location: Distance) => {
					data.travelTime = location.rows[0].elements[0].duration.text;

					if (!data.travelTime.includes('hour') && parseInt(data.travelTime.split(' ')[0]) <= 45) {
						data.accent = 'green';
					} else if (!data.travelTime.includes('hour') && parseInt(data.travelTime.split(' ')[0]) > 45) {
						data.accent = 'orange';
					} else {
						data.accent = 'red';
					}

					this.jobs.push(data);
					this.locations.push(location);
					localStorage.setItem('locations', JSON.stringify(this.locations));
					this.jobsTableComponent.jobs = this.jobs;
				})
				.catch(() => {
					data.travelTime = 'unknown';
					data.accent = 'none';

					this.jobs.push(data);
					this.jobsTableComponent.jobs = this.jobs;
				});
		} else {
			data.travelTime = this.locations[locationIndex].rows[0].elements[0].duration.text;

			if (!data.travelTime.includes('hour') && parseInt(data.travelTime.split(' ')[0]) <= 45) {
				data.accent = 'green';
			} else if (!data.travelTime.includes('hour') && parseInt(data.travelTime.split(' ')[0]) > 45) {
				data.accent = 'orange';
			} else {
				data.accent = 'red';
			}

			this.jobs.push(data);
			this.jobsTableComponent.jobs = this.jobs;
		}
	}
}
