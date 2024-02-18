import { AfterViewInit, Component, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Job } from '../../models/job.model';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import {MatSort, MatSortModule, SortDirection} from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-jobs-table',
  standalone: true,
  // imports: [MatTableModule, MatSortModule, MatIconModule],
  imports: [MatTableModule, MatIconModule, DatePipe, MatPaginatorModule],
  templateUrl: './jobs-table.component.html',
  styleUrl: './jobs-table.component.css'
})
export class JobsTableComponent implements AfterViewInit, OnChanges {
  
  // @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() jobs!: Job[]
  
  displayedColumns: string[] = [
    'title',
    'location',
    'listingDate',
    'salary',
    'classification',
    'site',
    ' '
  ];
  dataSource: MatTableDataSource<Job>;

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor() {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.jobs);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.jobs);
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
  }

  public handlePage(e: PageEvent) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;

    console.log(this.currentPage, this.pageSize)
  }

  paginate(jobs: Job[]) {

  }
}
