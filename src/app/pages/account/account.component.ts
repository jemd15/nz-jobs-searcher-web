import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { JobsTableComponent } from '../../components/jobs-table/jobs-table.component';
import { UserJobsService } from '../../providers/user-jobs/user-jobs.service';
import { Job } from '../../models/job.model';

@Component({
	selector: 'app-account',
	standalone: true,
	imports: [JobsTableComponent],
	templateUrl: './account.component.html',
	styleUrl: './account.component.css',
})
export class AccountComponent implements AfterViewInit {
	@ViewChild(JobsTableComponent, { static: true }) jobsTableComponent!: JobsTableComponent;
	public jobsApplied!: Job[];

	constructor(private userJobs: UserJobsService) {
		this.jobsApplied = this.userJobs.getJobsApplied();
	}

	ngAfterViewInit(): void {
		this.jobsTableComponent.jobs = this.jobsApplied;
	}
}
