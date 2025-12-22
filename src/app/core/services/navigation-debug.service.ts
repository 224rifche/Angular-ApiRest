// src/app/core/services/debug.service.ts
import { Injectable, PLATFORM_ID, Inject, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private isBrowser: boolean;
  private isDebugEnabled: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isDebugEnabled = isDevMode() && this.isBrowser;
  }

  /**
   * Initialise le débogage uniquement côté client en dev
   */
  init(): void {
    if (!this.isDebugEnabled) return;

    console.log('🔧 Debug service initialized (browser only)');
    this.setupRouterLogging();
  }

  private setupRouterLogging(): void {
    // Log uniquement les navigations réussies (pas tous les événements)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log(`📍 Navigation: ${event.url}`);
    });
  }

  log(message: string, data?: any): void {
    if (!this.isDebugEnabled) return;
    
    if (data) {
      console.log(`[DEBUG] ${message}`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }

  warn(message: string, data?: any): void {
    if (!this.isDebugEnabled) return;
    console.warn(`[WARN] ${message}`, data);
  }
}