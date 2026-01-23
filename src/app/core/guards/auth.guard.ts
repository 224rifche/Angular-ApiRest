import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.authService.isLoggedIn()) {
      // Vérifier si l'utilisateur a le rôle requis
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles?.includes('admin') && !this.authService.currentUserValue?.is_staff) {
        // Rediriger vers la page d'accès refusé ou une autre page appropriée
        this.router.navigate(['/unauthorized']);
        return false;
      }
      
      return true;
    }

    // Rediriger vers la page de connexion avec l'URL de retour
    return this.router.createUrlTree(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
  }
}
