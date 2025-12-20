import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-non-trouvee',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 class="text-2xl font-semibold mb-4">Page non trouvée</h2>
        <p class="mb-6">Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>
        <a 
          routerLink="/" 
          class="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class PageNonTrouveeComponent {}
