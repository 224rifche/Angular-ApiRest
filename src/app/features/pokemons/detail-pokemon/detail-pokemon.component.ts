import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';

import { PokemonDetail, PokemonService } from '../pokemon.service';

@Component({
  selector: 'app-detail-pokemon',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container">
      <a class="back" routerLink="/pokemons">← Retour à la liste</a>

      @if (loading) {
        <div class="loading">Chargement...</div>
      }

      @if (error) {
        <div class="error">{{ error }}</div>
      }

      @if (!loading && !error && pokemon) {
        <header class="hero">
          <div class="thumb">
            <img [src]="pokemon.officialArtwork" [alt]="pokemon.name" loading="lazy" />
          </div>
          <div class="hero-info">
            <h1>{{ pokemon.name }}</h1>
            <div class="badges">
              @for (t of pokemon.types; track t) {
                <span class="badge">{{ t }}</span>
              }
            </div>
          </div>
        </header>

        <section class="grid">
          <article class="card">
            <h2>Infos</h2>
            <div class="row"><span>Taille</span><strong>{{ pokemon.height }}</strong></div>
            <div class="row"><span>Poids</span><strong>{{ pokemon.weight }}</strong></div>
          </article>

          <article class="card">
            <h2>Statistiques</h2>
            <div class="row"><span>Vie</span><strong>{{ pokemon.stats.hp }}</strong></div>
            <div class="row"><span>Attaque</span><strong>{{ pokemon.stats.attack }}</strong></div>
            <div class="row"><span>Défense</span><strong>{{ pokemon.stats.defense }}</strong></div>
            <div class="row"><span>Vitesse</span><strong>{{ pokemon.stats.speed }}</strong></div>
          </article>

          <article class="card">
            <h2>Capacités</h2>
            <div class="chips">
              @for (a of pokemon.abilities; track a) {
                <span class="chip">{{ a }}</span>
              }
            </div>
          </article>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .detail-container{max-width:1100px;margin:0 auto;padding:2rem 1rem}
      .back{display:inline-block;margin-bottom:1rem;text-decoration:none;color:#2563eb;font-weight:700}
      .loading,.error{padding:1rem;text-align:center}
      .error{color:#b91c1c}
      .hero{display:flex;gap:1rem;align-items:center;border:1px solid #e9ecef;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(0,0,0,.06);padding:1rem}
      .thumb{width:160px;height:160px;flex:0 0 auto;border-radius:16px;overflow:hidden;border:1px solid #eef2f7;background:#fff;display:flex;align-items:center;justify-content:center}
      .thumb img{width:100%;height:100%;object-fit:contain}
      .hero-info h1{margin:0 0 .5rem;color:#0b1220;text-transform:capitalize}
      .badges{display:flex;flex-wrap:wrap;gap:.4rem}
      .badge{display:inline-flex;align-items:center;padding:.2rem .55rem;border-radius:999px;background:#eef2ff;border:1px solid #e9ecef;font-weight:700;text-transform:capitalize}
      .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1rem}
      .card{background:#fff;border:1px solid #e9ecef;border-radius:16px;padding:1rem;box-shadow:0 10px 24px rgba(0,0,0,.05)}
      .card h2{margin:0 0 .75rem;font-size:1.1rem;color:#0b1220}
      .row{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.5rem 0;border-top:1px solid #f1f5f9}
      .row:first-of-type{border-top:0}
      .row span{color:#556}
      .chips{display:flex;flex-wrap:wrap;gap:.5rem}
      .chip{padding:.3rem .6rem;border-radius:999px;background:#f8fafc;border:1px solid #e9ecef;font-weight:700;text-transform:capitalize}
      @media (max-width: 900px){.grid{grid-template-columns:1fr}.thumb{width:140px;height:140px}}
    `
  ]
})
export class DetailPokemonComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);
  private platformId = inject(PLATFORM_ID);

  pokemon: PokemonDetail | null = null;
  loading = true;
  error = '';
  currentName = '';

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => (params.get('name') || '').trim().toLowerCase()),
        distinctUntilChanged(),
        tap((name) => {
          this.currentName = name;
          this.pokemon = null;
          this.error = '';
          this.loading = true;

          if (isPlatformBrowser(this.platformId)) {
            console.log('[Pokémon] navigation:', name);
          }
        }),
        switchMap((name) => {
          // Watchdog anti-chargement infini pour CE pokémon
          const startedAt = Date.now();
          const watchdog = setTimeout(() => {
            if (this.loading) {
              this.error = 'Le chargement du pokémon prend trop de temps. Vérifie ta connexion ou réessaie.';
              this.loading = false;
            }
          }, 10000);

          if (!name) {
            clearTimeout(watchdog);
            this.error = 'Pokémon introuvable.';
            this.loading = false;
            return of(null);
          }

          return this.pokemonService.getPokemonDetail(name).pipe(
            finalize(() => {
              clearTimeout(watchdog);
              this.loading = false;
              if (isPlatformBrowser(this.platformId)) {
                console.log('[Pokémon] fin chargement:', name, `${Date.now() - startedAt}ms`);
              }
            })
          );
        })
      )
      .subscribe({
        next: (data: PokemonDetail | null) => {
          if (data) this.pokemon = data;
        },
        error: (err: unknown) => {
          if (err instanceof HttpErrorResponse && err.status === 404) {
            this.error = `Pokémon introuvable: ${this.currentName}`;
            return;
          }
          this.error = 'Impossible de charger le détail du pokémon.';
          console.error('Erreur détail pokémon:', err);
        }
      });
  }
}
