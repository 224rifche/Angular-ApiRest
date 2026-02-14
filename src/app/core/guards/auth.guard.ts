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
    
    console.log('🛡️ AuthGuard - Vérification pour la route:', state.url);
    
    // Si l'utilisateur est connecté, vérifier les permissions
    if (this.authService.isLoggedIn()) {
      console.log('✅ Utilisateur connecté, vérification des permissions...');
      
      // Vérifier si l'utilisateur a le rôle requis
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles?.includes('admin') && !this.authService.currentUserValue?.is_staff) {
        console.log('❌ Accès refusé - rôle admin requis');
        this.router.navigate(['/unauthorized']);
        return false;
      }
      
      console.log('🎉 Accès autorisé pour la route:', state.url);
      return true;
    }

    console.log('❌ Utilisateur non connecté - redirection vers login');
    console.log('📋 URL de retour prévue:', state.url);
    
    // Rediriger vers la page de connexion avec l'URL de retour
    return this.router.createUrlTree(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
  }
}
