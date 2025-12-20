import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Route pour la page d'accueil
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  // Route pour la liste des pays
  {
    path: 'pays',
    renderMode: RenderMode.Prerender
  },
  // Route pour la liste des pokémons
  {
    path: 'pokemons',
    renderMode: RenderMode.Prerender
  },
  // Route pour les pages non trouvées
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
