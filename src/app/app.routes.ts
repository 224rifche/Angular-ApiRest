import { Routes } from '@angular/router';
import { PageNonTrouveeComponent } from './core/components/page-non-trouvee/page-non-trouvee.component';
import { ListePaysComponent } from './features/pays/liste-pays/liste-pays.component';
import { ListePokemonsComponent } from './features/pokemons/liste-pokemons/liste-pokemons.component';
import { AccueilComponent } from './features/accueil/accueil.component';
import { DetailPaysComponent } from './features/pays/detail-pays/detail-pays.component';
import { DetailPokemonComponent } from './features/pokemons/detail-pokemon/detail-pokemon.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { UnauthorizedComponent } from './core/components/unauthorized/unauthorized.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ListeUsersComponent } from './features/users/liste-users/liste-users.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Connexion'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Créer un compte'
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    title: 'Accès refusé'
  },
  {
    path: 'users',
    component: ListeUsersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    title: 'Utilisateurs'
  },
  { 
    path: '',
    component: AccueilComponent,
    canActivate: [AuthGuard],
    title: 'Accueil'
  },
  { 
    path: 'pays',
    component: ListePaysComponent,
    canActivate: [AuthGuard],
    title: 'Liste des pays'
  },
  {
    path: 'pays/:code',
    component: DetailPaysComponent,
    canActivate: [AuthGuard],
    title: 'Détail du pays'
  },
  { 
    path: 'pokemons',
    component: ListePokemonsComponent,
    canActivate: [AuthGuard],
    title: 'Liste des Pokémons'
  },
  {
    path: 'pokemons/:name',
    component: DetailPokemonComponent,
    canActivate: [AuthGuard],
    title: 'Détail du pokémon'
  },
  { 
    path: '**', 
    component: PageNonTrouveeComponent,
    title: 'Page non trouvée'
  }
];