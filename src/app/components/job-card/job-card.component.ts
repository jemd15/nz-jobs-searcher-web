import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Job } from '../../models/job.model';
import { SafePipe } from '../../pipes/safe/safe.pipe';

@Component({
	selector: 'app-job-card',
	standalone: true,
	imports: [MatButtonModule, MatCardModule, MatIconModule, SafePipe],
	templateUrl: './job-card.component.html',
	styleUrl: './job-card.component.css',
})
export class JobCardComponent {
	@Input() job!: Job;
}
