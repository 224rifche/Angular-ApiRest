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
  // Route pour le détail d'un pays (route paramétrée: pas de prerender)
  {
    path: 'pays/:code',
    renderMode: RenderMode.Server
  },
  // Route pour la liste des pokémons
  {
    path: 'pokemons',
    renderMode: RenderMode.Prerender
  },
  // Route pour le détail d'un pokémon (route paramétrée: pas de prerender)
  {
    path: 'pokemons/:name',
    renderMode: RenderMode.Server
  },
  // Route pour les pages non trouvées
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
