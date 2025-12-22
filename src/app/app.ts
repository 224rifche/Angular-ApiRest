// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ListePaysComponent } from './features/pays/liste-pays/liste-pays.component';
import { ListePokemonsComponent } from './features/pokemons/liste-pokemons/liste-pokemons.component';
import { PageNonTrouveeComponent } from './core/components/page-non-trouvee/page-non-trouvee.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pays',
    pathMatch: 'full'
  },
  {
    path: 'pays',
    component: ListePaysComponent,
    title: 'Liste des pays'  // Utiliser title au lieu de data.title
  },
  {
    path: 'pokemons',
    component: ListePokemonsComponent,
    title: 'Liste des Pokémons'
  },
  {
    path: '**',
    component: PageNonTrouveeComponent,
    title: 'Page non trouvée'
  }
];

// ❌ SUPPRIMER tout console.log ici