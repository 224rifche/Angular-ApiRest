// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LayoutService } from './core/services/layout.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Services de base d'Angular
    provideRouter(
      routes,
      withComponentInputBinding()
      // ❌ SUPPRIMER: withDebugTracing() en production
    ),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    
    // Intercepteurs HTTP
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    
    // Services de l'application
    LayoutService
  ]
};