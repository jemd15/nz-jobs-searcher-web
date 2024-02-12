import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.css'
})
export class JobCardComponent {

}
