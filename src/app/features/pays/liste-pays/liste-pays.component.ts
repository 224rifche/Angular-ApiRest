// src/app/features/pays/liste-pays/liste-pays.component.ts
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Pays, PaysService } from './pays.service';

@Component({
  selector: 'app-liste-pays',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './liste-pays.component.html',
  styleUrls: ['./liste-pays.component.css']
})
export class ListePaysComponent implements OnInit {
  private paysService = inject(PaysService);
  private platformId = inject(PLATFORM_ID);

  paysList: Pays[] = [];
  loading = true;
  error = '';

  searchTerm = '';
  selectedRegion = '';
  pageSize = 24;
  currentPage = 1;

  ngOnInit(): void {
    this.loadPays();
  }

  getLanguages(languages: { [key: string]: string }): string {
    return Object.values(languages).join(', ');
  }

  trackPays(index: number, pays: Pays): string {
    return pays.cca3;
  }

  get regions(): string[] {
    const set = new Set(
      this.paysList
        .map(p => p.region)
        .filter((r): r is string => !!r)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  get filteredPays(): Pays[] {
    const term = this.searchTerm.trim().toLowerCase();
    let list = this.paysList;

    if (this.selectedRegion) {
      list = list.filter(p => (p.region || '').toLowerCase() === this.selectedRegion.toLowerCase());
    }

    if (term) {
      list = list.filter(p => p.name.common.toLowerCase().includes(term));
    }

    return list;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPays.length / this.pageSize));
  }

  get pagedPays(): Pays[] {
    const safePage = Math.min(Math.max(this.currentPage, 1), this.totalPages);
    const start = (safePage - 1) * this.pageSize;
    return this.filteredPays.slice(start, start + this.pageSize);
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

  prefetchDetail(code: string): void {
    // Déclenche la requête et profite du cache (shareReplay) du service.
    // Pas besoin de gérer la réponse ici.
    this.paysService.getPaysDetail(code).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  private loadPays(): void {
    this.paysService.getPays().subscribe({
      next: (data) => {
        this.paysList = [...data].sort((a, b) => a.name.common.localeCompare(b.name.common));
        this.loading = false;
        this.currentPage = 1;
      },
      error: (err) => {
        this.error = 'Impossible de charger les pays. Veuillez réessayer plus tard.';
        this.loading = false;

        if (isPlatformBrowser(this.platformId)) {
          console.error('Erreur API:', err);
        }
      }
    });
  }
}