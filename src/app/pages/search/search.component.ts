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
import { ActivatedRoute, Router } from '@angular/router';

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
	private locationsUnknown: string[] = [];
	public originAddress: string = '48 Saintly Lane, Avondale, Auckland 0600, Nueva Zelanda';
	public search: string = '';
	public addOnBlur = true;
	public keyWordsWanted: string[] = [];
	public keyWordsUnwanted: string[] = [];
	public maxTravelTime: number = 120;
	public maxListingDateDays: number = 60;
	public jobs: Job[] = [];
	public jobsFiltered: Job[] = [];
	private lastSearchId: number = 0;

	constructor(
		private api: ApiService,
		protected ws: WebSocketService,
		private route: ActivatedRoute,
		private router: Router,
	) {
		// cargamos las direcciones desde localStorage en memoria
		this.locations = JSON.parse(localStorage.getItem('locations') || '[]');
		this.locationsUnknown = JSON.parse(localStorage.getItem('locationsUnknown') || '[]')?.locations || [];

		if (!dayjs(JSON.parse(localStorage.getItem('locationsUnknown') || '[]').date).isSame(dayjs(), 'week')) {
			localStorage.removeItem('locationsUnknown');
			this.locationsUnknown = [];
		}

		// acomodamos los filtros según los queryParameters
		this.route.queryParamMap.subscribe(params => {
			let previousSearch = this.search;

			this.search = params.get('search') || this.search;
			this.keyWordsWanted = params.get('keyWordsWanted')?.split(',') || this.keyWordsWanted;
			this.keyWordsUnwanted = params.get('keyWordsUnwanted')?.split(',') || this.keyWordsUnwanted;
			this.maxTravelTime = parseInt(params.get('maxTravelTime') || this.maxTravelTime.toString(), 10);
			this.maxListingDateDays = parseInt(params.get('maxListingDateDays') || this.maxListingDateDays.toString(), 10);

			// realizamos la búsqueda
			if (this.search && previousSearch !== this.search) this.getJobs();
		});

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
		this.clearTable(); // limpiamos la tabla de resultados en cada búsqueda

		const search_id = this.ws.connect();
		this.lastSearchId = search_id;

		this.ws.emit('search', {
			search_id,
			search: this.search,
			topics: [],
			minPage: 1,
			maxPage: 10,
		});

		this.ws.listen('search').subscribe(async (data: Job) => {
			if (this.lastSearchId === data.search_id) {
				data.status = 'new';
				await this.getDistanceInfo(data);
				await this.filterJobs();
			}
		});
	}

	private clearTable() {
		this.jobs = [];
		if (this.jobsTableComponent) this.jobsTableComponent.jobs = this.jobs;
	}

	private async getDistanceInfo(data: Job) {
		/**
		 * buscamos la dirección en localStorage y
		 * si no está ahí, la traemos desde el API
		 */
		const locationIndex: number = this.locations.findIndex(location => {
			return location.rows[0].elements[0].destination.includes(data.location) && location.rows[0].elements[0].origin.includes(this.originAddress);
		});
		const locationsUnknownIndex: number = this.locationsUnknown.findIndex(location => {
			return location.includes(data.location);
		});

		if (locationIndex < 0 && locationsUnknownIndex < 0) {
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

					/**
					 * las direcciones no encontradas las guardamos en un
					 * arreglo temporal para no sobrecargar de peticiones
					 * el API de distancias
					 */
					if (!this.locationsUnknown.includes(data.location)) this.locationsUnknown.push(data.location);

					localStorage.setItem(
						'locationsUnknown',
						JSON.stringify({
							date: dayjs().format(),
							locations: this.locationsUnknown,
						}),
					);

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
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				search: this.search,
				keyWordsWanted: this.keyWordsWanted.join(',') || [],
				keyWordsUnwanted: this.keyWordsUnwanted.join(',') || [],
				maxTravelTime: this.maxTravelTime,
				maxListingDateDays: this.maxListingDateDays,
			},
		});

		this.jobsFiltered = [];
		for await (const job of this.jobs) {
			let hasWantedWords: boolean = false;
			let hasUnwantedWords: boolean = false;
			let isAproved: boolean = false;
			let isDateAproved: boolean = false;
			let isTravelTimeAproved: boolean = false;

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

			if (isAproved && !this.jobsFiltered.find(jobFiltered => jobFiltered.title === job.title)) this.jobsFiltered.push(job);
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
