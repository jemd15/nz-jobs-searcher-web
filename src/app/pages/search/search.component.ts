import { Component } from '@angular/core';
import { FilterMenuComponent } from '../../components/filter-menu/filter-menu.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { JobCardComponent } from '../../components/job-card/job-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FilterMenuComponent, MatFormFieldModule, MatSelectModule, MatToolbarModule, JobCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {

}
