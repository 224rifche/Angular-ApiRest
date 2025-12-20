import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-liste-pays',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6">Liste des pays</h1>
      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600">Contenu de la liste des pays à venir...</p>
      </div>
    </div>
  `,
  styles: []
})
export class ListePaysComponent {}
