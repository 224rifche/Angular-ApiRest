import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, Event } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LayoutService implements OnDestroy {
  private showHeaderFooter = new BehaviorSubject<boolean>(true);
  showHeaderFooter$ = this.showHeaderFooter.asObservable();
  
  private routerSubscription: Subscription;
  private readonly hiddenRoutes = [
    '/login',
    '/register',
    '/reset-password',
    '/auth/',
    '/unauthorized'
  ];

  constructor(private router: Router) {
    console.log('Initialisation du LayoutService');
    
    // Vérifier l'URL actuelle au démarrage
    const initialUrl = this.router.url;
    console.log('URL initiale:', initialUrl);
    this.updateHeaderFooterVisibility(initialUrl);
    
    // S'abonner aux changements de navigation
    this.routerSubscription = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('Événement de navigation détecté');
      const url = event.urlAfterRedirects || event.url;
      console.log('URL après redirection:', url);
      this.updateHeaderFooterVisibility(url);
    });
  }

  private updateHeaderFooterVisibility(url: string): void {
    // Extraire le chemin de base sans les paramètres de requête ni les fragments
    const baseUrl = url.split('?')[0].split('#')[0];
    
    console.log('URL actuelle:', url);
    console.log('Chemin de base:', baseUrl);
    
    // Vérifier si l'URL actuelle commence par l'un des chemins masqués
    const shouldHide = this.hiddenRoutes.some(route => {
      const matches = baseUrl.startsWith(route);
      if (matches) {
        console.log(`Correspondance trouvée pour la route: ${route}`);
      }
      return matches;
    });
    
    console.log('Devrait masquer le header/footer:', shouldHide);
    
    // Mettre à jour l'état
    this.showHeaderFooter.next(!shouldHide);
  }

  // Méthode pour forcer la visibilité (optionnel)
  setHeaderFooterVisibility(show: boolean): void {
    this.showHeaderFooter.next(show);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
