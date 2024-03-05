import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { Job } from '../../models/job.model';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

@Component({
	selector: 'app-filter-menu',
	standalone: true,
	imports: [MatCardModule, MatSliderModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, MatListModule, MatChipsModule],
	templateUrl: './filter-menu.component.html',
	styleUrl: './filter-menu.component.css',
})
export class FilterMenuComponent {
	readonly separatorKeysCodes = [ENTER, COMMA] as const;
	public addOnBlur = true;
	public value: string = '';
	public keyWordsWanted: string[] = [];
	public keyWordsUnwanted: string[] = [];
	public maxTravelTime: number = 120;
	public maxListingDateDays: number = 60;
	private _jobs!: Job[];
	private jobsUnfiltered!: Job[];
	@Input() set jobs(jobs: Job[]) {
		this._jobs = jobs;
		this.onJobsChanged();
	}

	get jobs() {
		return this._jobs;
	}

	@Output() jobsChange = new EventEmitter<Job[]>();

	constructor(private cdr: ChangeDetectorRef) {
		dayjs.extend(isBetween);
	}

	public onJobsChanged() {
		this.cdr.markForCheck();
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

	private filterJobs() {
		let jobsFiltered: Job[] = [];
		for (const job of this._jobs) {
			let isAproved: boolean = false;
			let isDateAproved: boolean = false;

			if (this.keyWordsWanted.length) {
				for (const keyword of this.keyWordsWanted) {
					if (job.title.includes(keyword)) isAproved = true;
				}
			}

			if (this.keyWordsUnwanted.length) {
				for (const keyword of this.keyWordsUnwanted) {
					if (job.title.includes(keyword)) isAproved = false;
				}
			}

			if ((dayjs(job.listingDate).isBetween(dayjs().subtract(this.maxListingDateDays, 'days'), dayjs()), 'days')) isDateAproved = true;

			if (isAproved && isDateAproved) jobsFiltered.push(job);
		}

		this._jobs = jobsFiltered;
		this.jobsChange.emit(this._jobs);
	}

	public clearFilters() {
		this.keyWordsUnwanted = [];
		this.keyWordsWanted = [];
		this.maxListingDateDays = 60;
		this.maxTravelTime = 120;
	}
}
