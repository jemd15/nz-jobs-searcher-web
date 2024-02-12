import { Component } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-filter-menu',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './filter-menu.component.html',
  styleUrl: './filter-menu.component.css'
})
export class FilterMenuComponent {
  value = '';
}
