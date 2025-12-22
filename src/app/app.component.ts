import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnTeteComponent } from './core/components/en-tete/en-tete.component';
import { PiedDePageComponent } from './core/components/pied-de-page/pied-de-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, EnTeteComponent, PiedDePageComponent],
  template: `
    <div class="app-container">
      <app-en-tete></app-en-tete>
      <main>
        <router-outlet></router-outlet>
      </main>
      <app-pied-de-page></app-pied-de-page>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    main {
      flex: 1;
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'pokemons-pays';
}
