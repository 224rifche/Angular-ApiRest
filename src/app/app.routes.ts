import { Routes } from '@angular/router';
import { PageNonTrouveeComponent } from './core/components/page-non-trouvee/page-non-trouvee.component';
import { ListePaysComponent } from './features/pays/liste-pays/liste-pays.component';
import { ListePokemonsComponent } from './features/pokemons/liste-pokemons/liste-pokemons.component';
import { AccueilComponent } from './features/accueil/accueil.component';
import { DetailPaysComponent } from './features/pays/detail-pays/detail-pays.component';
import { DetailPokemonComponent } from './features/pokemons/detail-pokemon/detail-pokemon.component';

export const routes: Routes = [
  { 
    path: '',
    component: AccueilComponent,
    title: 'Accueil'
  },
  { 
    path: 'pays',
    component: ListePaysComponent,
    title: 'Liste des pays'
  },
  {
    path: 'pays/:code',
    component: DetailPaysComponent,
    title: 'Détail du pays'
  },
  { 
    path: 'pokemons',
    component: ListePokemonsComponent,
    title: 'Liste des Pokémons'
  },
  {
    path: 'pokemons/:name',
    component: DetailPokemonComponent,
    title: 'Détail du pokémon'
  },
  { 
    path: '**', 
    component: PageNonTrouveeComponent,
    title: 'Page non trouvée'
  }
];