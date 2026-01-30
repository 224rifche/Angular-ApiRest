import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private showHeaderFooter = new BehaviorSubject<boolean>(true);
  showHeaderFooter$ = this.showHeaderFooter.asObservable();

  private hiddenRoutes = ['/login', '/register', '/reset-password'];

  constructor(private router: Router) {
    // Écouter les changements de route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Vérifier si la route actuelle doit masquer le header et le footer
        const shouldHide = this.hiddenRoutes.some(route => event.url.startsWith(route));
        this.showHeaderFooter.next(!shouldHide);
      }
    });
  }

  // Méthode pour forcer la visibilité (optionnel)
  setHeaderFooterVisibility(show: boolean): void {
    this.showHeaderFooter.next(show);
  }
}
