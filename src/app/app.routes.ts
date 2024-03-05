import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'search', pathMatch: 'full' },
	{ path: 'search', component: SearchComponent, pathMatch: 'full' },
];
