import { Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';

export const routes: Routes = [
  { path: 'homepage', component: HomepageComponent },
  { path: '', redirectTo: '/homepage', pathMatch: 'full' }, // Redirect alla homepage di default
  { path: 'voli-mensili', loadComponent: () => import('./pages/voli-mensili/voli-mensili.component').then(m => m.VoliMensiliComponent) },
  { path: 'ritardi', loadComponent: () => import('./pages/ritardi/ritardi.component').then(m => m.RitardiComponent) },
  { path: 'dirottamenti', loadComponent: () => import('./pages/dirottamenti/dirottamenti.component').then(m => m.DirottamentiComponent) },
  { path: 'ricerca-voli', loadComponent: () => import('./pages/ricerca-voli/ricerca-voli.component').then(m => m.RicercaVoliComponent) },
  { path: 'compagnie', loadComponent: () => import('./pages/compagnie/compagnie.component').then(m => m.CompagnieComponent) },
  { path: 'predizione', loadComponent: () => import('./pages/predizione/predizione.component').then(m => m.PredizioneComponent) },
  { path: '', redirectTo: '/homepage', pathMatch: 'full' }
];
