import { ApplicationConfig, ɵConsole as Console } from '@angular/core';
import { provideRouter, withDebugTracing, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Active le débogage du routeur
const routerConfig = withRouterConfig({
  onSameUrlNavigation: 'reload',
  paramsInheritanceStrategy: 'always'
});

export const appConfig: ApplicationConfig = {
  providers: [
    // Active le traçage des routes dans la console
    provideRouter(
      routes,
      withDebugTracing(), // Activation du traçage détaillé
      routerConfig
    ),
    provideClientHydration(withEventReplay()),
    // Ajoute le service de console pour le débogage
    { provide: Console, useClass: class extends Console { 
      constructor() { 
        super();
        console.log('Console de débogage initialisée');
      }
    }}
  ]
};
