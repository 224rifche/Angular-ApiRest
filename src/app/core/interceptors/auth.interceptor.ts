import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Ne pas ajouter le token uniquement pour les endpoints de token
    if (request.url.includes('/api/auth/token/')) {
      return next.handle(request);
    }

    const token = this.authService.token;
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Tentative de refresh (important car ACCESS_TOKEN_LIFETIME=5s côté Django)
          return this.authService.refreshAccessToken().pipe(
            switchMap((newAccess) => {
              if (!newAccess) {
                this.authService.logout();
                this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
                return throwError(() => error);
              }

              const retry = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccess}`
                }
              });
              return next.handle(retry);
            }),
            catchError((refreshErr) => {
              this.authService.logout();
              this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
              return throwError(() => refreshErr);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
