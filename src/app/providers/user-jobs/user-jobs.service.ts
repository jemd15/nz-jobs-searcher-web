import { Injectable } from '@angular/core';
import { Job } from '../../models/job.model';

@Injectable({
	providedIn: 'root',
})
export class UserJobsService {
	private jobs!: Job[];

	constructor() {
		this.jobs = JSON.parse(localStorage.getItem('userJobs') || '[]');
	}

	public getJobStatus(job: Job): 'new' | 'visited' | 'applied' {
		const status = this.jobs.find(userJob => job.title === userJob.title && job.company == userJob.company && job.site === userJob.site)?.status || 'new';

		return status;
	}

	public updateJob(job: Job): Job[] {
		const jobIndex = this.jobs.findIndex(userJob => job.title === userJob.title && job.company == userJob.company && job.site === userJob.site);

		if (jobIndex >= 0) {
			this.jobs[jobIndex] = job;
		} else {
			this.jobs.push(job);
		}

		localStorage.setItem('userJobs', JSON.stringify(this.jobs));

		return this.jobs;
	}

	public getJobsApplied(): Job[] {
		return this.jobs.filter(job => job.status === 'applied');
	}
}
