import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-en-tete',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <a routerLink="/" class="text-2xl font-bold flex items-center">
              <svg class="h-8 w-8 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd"></path>
              </svg>
              Pokémons & Pays
            </a>
          </div>

          <!-- Liens de navigation -->
          <div class="hidden md:block">
            <div class="ml-10 flex items-center space-x-4">
              <a routerLink="/pays" 
                 routerLinkActive="bg-blue-700" 
                 class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-150 ease-in-out">
                Pays
              </a>
              <a routerLink="/pokemons" 
                 routerLinkActive="bg-blue-700"
                 class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-150 ease-in-out">
                Pokémons
              </a>
            </div>
          </div>

          <!-- Bouton mobile -->
          <div class="md:hidden">
            <button type="button" 
                    (click)="toggleMenu()"
                    class="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span class="sr-only">Ouvrir le menu</span>
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Menu mobile -->
        <div *ngIf="isMenuOpen" class="md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a routerLink="/pays" 
               (click)="closeMenu()"
               class="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
              Pays
            </a>
            <a routerLink="/pokemons" 
               (click)="closeMenu()"
               class="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
              Pokémons
            </a>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: []
})
export class EnTeteComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}