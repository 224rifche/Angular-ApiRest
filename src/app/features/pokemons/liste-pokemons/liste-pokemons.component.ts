import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-liste-pokemons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6">Liste des Pokémons</h1>
      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600">Contenu de la liste des Pokémons à venir...</p>
      </div>
    </div>
  `,
  styles: []
})
export class ListePokemonsComponent {}
