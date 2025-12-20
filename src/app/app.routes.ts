import { Routes } from '@angular/router';
import { PageNonTrouveeComponent } from './core/components/page-non-trouvee/page-non-trouvee.component';
import { ListePaysComponent } from './features/pays/liste-pays/liste-pays.component';
import { ListePokemonsComponent } from './features/pokemons/liste-pokemons/liste-pokemons.component';

console.log('Chargement des routes...');
console.log('ListePaysComponent:', ListePaysComponent);
console.log('ListePokemonsComponent:', ListePokemonsComponent);

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'pays', 
    pathMatch: 'full',
    data: { title: 'Redirection vers /pays' }
  },
  { 
    path: 'pays',
    component: ListePaysComponent,
    data: { title: 'Liste des pays' }
  },
  { 
    path: 'pokemons',
    component: ListePokemonsComponent,
    data: { title: 'Liste des Pokémons' }
  },
  { 
    path: '**', 
    component: PageNonTrouveeComponent,
    data: { title: 'Page non trouvée' }
  }
];

console.log('Routes configurées:', routes);