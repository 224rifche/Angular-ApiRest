// src/app/features/pays/liste-pays/liste-pays.component.ts
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Pays, PaysService } from './pays.service';

@Component({
  selector: 'app-liste-pays',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './liste-pays.component.html',
  styleUrls: ['./liste-pays.component.css']
})
export class ListePaysComponent implements OnInit {
  private paysService = inject(PaysService);
  private platformId = inject(PLATFORM_ID);

  paysList: Pays[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadPays();
  }

  getLanguages(languages: { [key: string]: string }): string {
    return Object.values(languages).join(', ');
  }

  trackPays(index: number, pays: Pays): string {
    return pays.cca3;
  }

  private loadPays(): void {
    this.paysService.getPays().subscribe({
      next: (data) => {
        this.paysList = [...data].sort((a, b) => a.name.common.localeCompare(b.name.common));
        this.loading = false;
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