import { AfterViewInit, Component, ViewChild, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Job } from '../../models/job.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import {MatSort, MatSortModule, SortDirection} from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgClass } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { UserJobsService } from '../../providers/user-jobs/user-jobs.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
	selector: 'app-jobs-table',
	standalone: true,
	// imports: [MatTableModule, MatSortModule, MatIconModule],
	imports: [MatTableModule, MatIconModule, DatePipe, MatPaginatorModule, NgClass, MatCardModule, MatToolbarModule, MatButtonModule, MatMenuModule],
	templateUrl: './jobs-table.component.html',
	styleUrl: './jobs-table.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobsTableComponent implements AfterViewInit {
	// @ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	private _jobs!: Job[];
	@Input() set jobs(jobs: Job[]) {
		this._jobs = jobs;
		this.onJobsChanged();
	}
	get jobs() {
		return this._jobs;
	}
	@Input() title!: string;
	@Input() status!: string;
	public displayedColumns: string[] = ['title', 'location', 'travelTime', 'listingDate', 'salary', 'status', 'site', ' '];
	public dataSource!: MatTableDataSource<Job>;
	public currentPage: number = 1;
	public pageSize: number = 10;
	public pageSizeOptions: number[] = [5, 10, 25, 100];

	constructor(
		private cdr: ChangeDetectorRef,
		private userJobs: UserJobsService,
	) {}

	onJobsChanged() {
		this._jobs = this._jobs.filter(job => !this.status || job.status === this.status);

		this.dataSource = new MatTableDataSource(this._jobs);
		this.cdr.markForCheck();
	}

	ngAfterViewInit() {
		// this.dataSource.sort = this.sort;
	}

	public handlePageEvent(e: PageEvent) {
		this.currentPage = e.pageIndex;
		this.pageSize = e.pageSize;

		console.log(this.currentPage, this.pageSize);
	}

	public paginate(jobs: Job[]) {}

	public updateJobStatus(job: Job, status: 'new' | 'visited' | 'applied') {
		job.status = status;
		this.userJobs.updateJob(job);

		this.onJobsChanged();
	}

	public visitJobSite(event: MouseEvent, row: Job): void {
		// Check if the middle mouse button (button 1) is clicked
		if ((event.button === 1 || event.button === 0) && row.status === 'new') this.updateJobStatus(row, 'visited');
	}
}
