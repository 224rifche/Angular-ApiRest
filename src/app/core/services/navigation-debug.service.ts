import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationDebugService {
  private router = inject(Router);

  startTracking() {
    // Log initial navigation
    console.log('Initial URL:', window.location.pathname);
    
    // Log all navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      console.log('Navigation Event:', {
        url: event.url,
        urlAfterRedirects: event.urlAfterRedirects,
        routerState: this.router.routerState.snapshot
      });
    });
  }
}
