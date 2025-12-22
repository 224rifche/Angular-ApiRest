import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PokemonListItem, PokemonService } from '../pokemon.service';

@Component({
  selector: 'app-liste-pokemons',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './liste-pokemons.component.html',
  styleUrls: ['./liste-pokemons.component.css']
})
export class ListePokemonsComponent implements OnInit {
  private pokemonService = inject(PokemonService);
  private platformId = inject(PLATFORM_ID);

  pokemons: PokemonListItem[] = [];
  loading = true;
  error = '';

  searchTerm = '';
  pageSize = 30;
  currentPage = 1;

  ngOnInit(): void {
    this.loadPokemons();
  }

  get filteredPokemons(): PokemonListItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.pokemons;
    return this.pokemons.filter(p => p.name.toLowerCase().includes(term));
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPokemons.length / this.pageSize));
  }

  get pagedPokemons(): PokemonListItem[] {
    const safePage = Math.min(Math.max(this.currentPage, 1), this.totalPages);
    const start = (safePage - 1) * this.pageSize;
    return this.filteredPokemons.slice(start, start + this.pageSize);
  }

  onFiltersChange(): void {
    this.currentPage = 1;
  }

  prevPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  prefetchDetail(name: string): void {
    this.pokemonService.getPokemonDetail(name).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  private loadPokemons(): void {
    this.pokemonService.getPokemons(200).subscribe({
      next: (data) => {
        this.pokemons = [...data].sort((a, b) => a.name.localeCompare(b.name));
        this.loading = false;
        this.currentPage = 1;
      },
      error: (err: unknown) => {
        this.error = 'Impossible de charger les pokémons. Veuillez réessayer plus tard.';
        this.loading = false;

        if (isPlatformBrowser(this.platformId)) {
          console.error('Erreur API pokémons:', err);
        }
      }
    });
  }
}
