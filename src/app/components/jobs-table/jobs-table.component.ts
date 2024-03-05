import { AfterViewInit, Component, ViewChild, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Job } from '../../models/job.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import {MatSort, MatSortModule, SortDirection} from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgClass } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
	selector: 'app-jobs-table',
	standalone: true,
	// imports: [MatTableModule, MatSortModule, MatIconModule],
	imports: [MatTableModule, MatIconModule, DatePipe, MatPaginatorModule, NgClass],
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

	displayedColumns: string[] = ['title', 'location', 'travelTime', 'listingDate', 'salary', 'classification', 'site', ' '];
	dataSource!: MatTableDataSource<Job>;

	currentPage: number = 1;
	pageSize: number = 10;
	pageSizeOptions: number[] = [5, 10, 25, 100];

	constructor(private cdr: ChangeDetectorRef) {}

	onJobsChanged() {
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

	paginate(jobs: Job[]) {}
}
