import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pied-de-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-800 text-white py-6">
      <div class="container mx-auto px-6 text-center">
        <p>© {{ currentYear }} Pokémons & Pays - Tous droits réservés</p>
      </div>
    </footer>
  `,
  styles: []
})
export class PiedDePageComponent {
  currentYear = new Date().getFullYear();
}
