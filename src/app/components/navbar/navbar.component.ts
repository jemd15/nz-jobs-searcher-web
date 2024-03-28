import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
	selector: 'app-navbar',
	standalone: true,
	imports: [MatToolbarModule, FormsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, NgClass, RouterModule],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.css',
})
export class NavbarComponent {
	public searchText: string = '';

	constructor(
		private route: ActivatedRoute,
		private router: Router,
	) {
		// acomodamos los filtros según los queryParameters
		this.route.queryParamMap
			.subscribe(params => {
				this.searchText = params.get('search') || this.searchText;
			})
			.unsubscribe();
	}

	public search() {
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				search: this.searchText,
				maxTravelTime: 120,
				maxListingDateDays: 60,
			},
		});
	}
}
