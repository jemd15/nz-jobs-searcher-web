import { COMMA, ENTER } from '@angular/cdk/keycodes';
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
import { MatCardModule } from '@angular/material/card';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: 'app-search',
	standalone: true,
	imports: [
		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatSelectModule,
		MatToolbarModule,
		JobsTableComponent,
		NgClass,
		FormsModule,
		MatCardModule,
		MatSliderModule,
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		MatIconModule,
		MatListModule,
		MatChipsModule,
		MatButtonModule,
	],
	templateUrl: './search.component.html',
	styleUrl: './search.component.css',
})
export class SearchComponent {
	@ViewChild(JobsTableComponent, { static: true }) jobsTableComponent!: JobsTableComponent;

	readonly separatorKeysCodes = [ENTER, COMMA] as const;
	private locations: Distance[] = [];
	public filterText: string = '';
	public originAddress: string = '48 Saintly Lane, Avondale, Auckland 0600, Nueva Zelanda';
	public search: string = 'barista';
	public addOnBlur = true;
	public value: string = '';
	public keyWordsWanted: string[] = [];
	public keyWordsUnwanted: string[] = [];
	public maxTravelTime: number = 120;
	public maxListingDateDays: number = 60;
	public jobs: Job[] = [];
	public jobsFiltered: Job[] = [];

	constructor(
		private api: ApiService,
		protected ws: WebSocketService,
	) {
		// cargamos las direcciones desde localHost en memoria
		this.locations = JSON.parse(localStorage.getItem('locations') || '[]');

		// realizamos la búsqueda
		this.getJobs();

		dayjs.extend(isBetween);
	}

	public addWanted(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();

		// Add our keyword
		if (value) {
			this.keyWordsWanted.push(value);
			this.filterJobs();
		}

		// Clear the input value
		event.chipInput!.clear();
	}

	public removeWanted(value: string): void {
		const index = this.keyWordsWanted.indexOf(value);
		if (index >= 0) {
			this.keyWordsWanted.splice(index, 1);
			this.filterJobs();
		}
	}

	public editWanted(wantedWord: string, event: MatChipEditedEvent) {
		const value = event.value.trim();

		// Remove keyword if it no longer has a name
		if (!value) {
			this.removeWanted(wantedWord);
			return;
		}

		// Edit existing keyword
		const index = this.keyWordsWanted.indexOf(wantedWord);
		if (index >= 0) {
			this.keyWordsWanted[index] = value;
			this.filterJobs();
		}
	}

	public addUnwanted(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();

		// Add our keyword
		if (value) {
			this.keyWordsUnwanted.push(value);
			this.filterJobs();
		}

		// Clear the input value
		event.chipInput!.clear();
	}

	public removeUnwanted(value: string): void {
		const index = this.keyWordsUnwanted.indexOf(value);
		if (index >= 0) {
			this.keyWordsUnwanted.splice(index, 1);
			this.filterJobs();
		}
	}

	public editUnwanted(unwantedWord: string, event: MatChipEditedEvent) {
		const value = event.value.trim();

		// Remove keyword if it no longer has a name
		if (!value) {
			this.removeUnwanted(unwantedWord);
			return;
		}

		// Edit existing keyword
		const index = this.keyWordsUnwanted.indexOf(unwantedWord);
		if (index >= 0) {
			this.keyWordsUnwanted[index] = value;
		}
	}

	public clearFilters() {
		this.keyWordsUnwanted = [];
		this.keyWordsWanted = [];
		this.maxListingDateDays = 60;
		this.maxTravelTime = 120;
		this.jobsTableComponent.jobs = this.jobs;
	}

	private getJobs() {
		const search_id = this.ws.connect();
		this.ws.emit('search', {
			search_id,
			search: this.search,
			topics: ['cafe', 'coffee', 'barista'],
			minPage: 1,
			maxPage: 30,
		});
		console.log(`search_id: search_${search_id}`);
		this.ws.listen('search').subscribe(async (data: Job) => {
			await this.getDistanceInfo(data);
			await this.filterJobs();
		});
	}

	private async getDistanceInfo(data: Job) {
		const locationIndex: number = this.locations.findIndex(location => {
			return location.rows[0].elements[0].destination.includes(data.location) && location.rows[0].elements[0].origin.includes(this.originAddress);
		});

		/**
		 * buscamos la dirección en localStorage y
		 * si no está ahí, la traemos desde el API
		 */
		// if (locationIndex < 0) {
		if (false) {
			this.api
				.getDistanceInfo(this.originAddress, data.location.trim())
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
			data.travelTime = this.locations[locationIndex]?.rows[0].elements[0].duration.text || 'unknown';

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

	public async filterJobs() {
		this.jobsFiltered = [];
		console.count('number of filterJobs calls');
		for await (const job of this.jobs) {
			let hasWantedWords: boolean = false;
			let hasUnwantedWords: boolean = false;
			let isAproved: boolean = false;
			let isDateAproved: boolean = false;
			let isTravelTimeAproved: boolean = false;

			/**
			 * filtramos por las palabras deseadas en el
			 * título, compañía y locación en el trabajo
			 */
			if (this.keyWordsWanted.length) {
				for await (const keyword of this.keyWordsWanted) {
					if (
						job.title.toLowerCase().normalize('NFD').includes(keyword.toLowerCase()) ||
						job.company.toLowerCase().normalize('NFD').includes(keyword.toLowerCase()) ||
						job.location.toLowerCase().normalize('NFD').includes(keyword.toLowerCase())
					)
						hasWantedWords = true;
				}
			} else {
				hasWantedWords = true;
			}

			/**
			 * filtramos por las palabras no deseadas en el
			 * título, compañía y locación en el trabajo
			 */
			if (this.keyWordsUnwanted.length) {
				for await (const keyword of this.keyWordsUnwanted) {
					if (
						job.title.toLowerCase().normalize('NFD').includes(keyword.toLowerCase()) ||
						job.company.toLowerCase().normalize('NFD').includes(keyword.toLowerCase()) ||
						job.location.toLowerCase().normalize('NFD').includes(keyword.toLowerCase())
					) {
						hasUnwantedWords = true;
						break;
					} else {
						hasUnwantedWords = false;
					}
				}
			} else {
				hasUnwantedWords = false;
			}

			/**
			 * filtramos por el tiempo de traslado
			 * máximo seleccionado. Si el tiempo
			 * de traslado es desconocido, se asume
			 * como tiempo 0
			 */
			const travelTimeMins: number = job.travelTime.includes('unknown') ? 0 : this.parseTravelTime(job.travelTime);
			if (travelTimeMins <= this.maxTravelTime) isTravelTimeAproved = true;

			/**
			 * filtramos por el rango de fecha seleccionado
			 */
			if (dayjs(job.listingDate).isBetween(dayjs().subtract(this.maxListingDateDays, 'days'), dayjs(), 'days', '[]')) isDateAproved = true;

			/**
			 * se muestran todas las ofertas de trabajo que
			 * contengan las palabras deseadas, no contengan
			 * las palabras no deseadas y cumplan con el rango
			 * de fecha seleccionado
			 */
			isAproved = hasWantedWords && !hasUnwantedWords && isDateAproved && isTravelTimeAproved;

			if (isAproved) {
				console.count('inside for');
				this.jobsFiltered.push(job);
			}
		}
	}

	private parseTravelTime(travelTime: string): number {
		if (travelTime.includes('hour') && travelTime.includes('min')) {
			return parseInt(travelTime.split(' ')[0], 10) * 60 + parseInt(travelTime.split(' ')[2], 10);
		} else if (travelTime.includes('hour') && !travelTime.includes('min')) {
			return parseInt(travelTime.split(' ')[0], 10) * 60;
		} else if (!travelTime.includes('hour') && travelTime.includes('min')) {
			return parseInt(travelTime.split(' ')[0], 10);
		} else {
			return 0;
		}
	}
}
