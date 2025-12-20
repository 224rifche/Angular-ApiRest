import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { EnTeteComponent } from './core/components/en-tete/en-tete.component';
import { PiedDePageComponent } from './core/components/pied-de-page/pied-de-page.component';
import { CommonModule } from '@angular/common';
import { NavigationDebugService } from './core/services/navigation-debug.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    EnTeteComponent,
    PiedDePageComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-en-tete></app-en-tete>
      <main class="flex-grow p-4">
        <div class="container mx-auto">
          <router-outlet></router-outlet>
        </div>
      </main>
      <app-pied-de-page></app-pied-de-page>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'pokemons-pays';
  private router = inject(Router);
  private navigationDebug = inject(NavigationDebugService);

  ngOnInit() {
    // Activer le suivi de navigation
    this.navigationDebug.startTracking();
    
    // Log l'état initial du routeur
    console.log('Initial router state:', {
      url: this.router.url,
      routerState: this.router.routerState.snapshot
    });
  }
}