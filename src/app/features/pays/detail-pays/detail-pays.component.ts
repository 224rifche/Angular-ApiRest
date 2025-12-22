import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';
import { PaysService, PaysDetail } from '../liste-pays/pays.service';
import { WeatherNow, WeatherService } from '../weather.service';
import { ElevationService } from '../elevation.service';

@Component({
  selector: 'app-detail-pays',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container">
      <a class="back" routerLink="/pays">← Retour à la liste</a>

      @if (error) {
        <div class="error">{{ error }}</div>
      }

      @if (!error && pays) {
        <header class="hero">
          <div class="flag">
            <img [src]="pays.flags.png" [alt]="'Drapeau de ' + pays.name.common" loading="lazy">
          </div>
          <div class="hero-info">
            <h1>{{ pays.name.common }}</h1>
            <p class="meta">{{ pays.region || '—' }}</p>
          </div>
        </header>

        @if (loading) {
          <div class="loading">Chargement des détails...</div>
        }

        <section class="grid">
          <article class="card">
            <h2>Informations</h2>
            <div class="row"><span>Nom officiel</span><strong>{{ pays.name.official }}</strong></div>
            <div class="row"><span>Capitale</span><strong>{{ pays.capital?.[0] || 'Non spécifiée' }}</strong></div>
            <div class="row"><span>Habitants</span><strong>{{ pays.population | number }}</strong></div>
            <div class="row"><span>Superficie</span><strong>{{ (pays.area || 0) | number }} km²</strong></div>
          </article>

          <article class="card">
            <h2>Coordonnées</h2>
            <div class="row"><span>Latitude</span><strong>{{ pays.latlng?.[0] ?? '—' }}</strong></div>
            <div class="row"><span>Longitude</span><strong>{{ pays.latlng?.[1] ?? '—' }}</strong></div>
            <div class="row"><span>Altitude moyenne</span><strong>{{ altitudeText }}</strong></div>
          </article>

          <article class="card">
            <h2>Météo</h2>
            @if (weatherLoading) {
              <div class="muted">Chargement de la météo...</div>
            }
            @if (weatherError) {
              <div class="muted">{{ weatherError }}</div>
            }
            @if (!weatherLoading && !weatherError && weather) {
              <div class="row"><span>Température</span><strong>{{ weather.temperature | number:'1.0-0' }} °C</strong></div>
              <div class="row"><span>Climat</span><strong>{{ weather.description }}</strong></div>
              <div class="row"><span>Humidité</span><strong>{{ weather.humidity }}%</strong></div>
              <div class="row"><span>Vent</span><strong>{{ weather.windSpeed | number:'1.0-0' }} m/s</strong></div>
            }
          </article>
        </section>
      }
    </div>
  `,
  styles: [`
    .detail-container{max-width:1100px;margin:0 auto;padding:2rem 1rem}
    .back{display:inline-block;margin-bottom:1rem;text-decoration:none;color:#2563eb;font-weight:700}
    .loading,.error{padding:1rem;text-align:center}
    .error{color:#b91c1c}
    .hero{display:flex;gap:1rem;align-items:center;border:1px solid #e9ecef;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(0,0,0,.06);padding:1rem}
    .flag{width:160px;height:110px;flex:0 0 auto;border-radius:12px;overflow:hidden;border:1px solid #eef2f7}
    .flag img{width:100%;height:100%;object-fit:cover}
    .hero-info h1{margin:0 0 .25rem;color:#0b1220}
    .meta{margin:0;color:#556}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1rem}
    .card{background:#fff;border:1px solid #e9ecef;border-radius:16px;padding:1rem;box-shadow:0 10px 24px rgba(0,0,0,.05)}
    .card h2{margin:0 0 .75rem;font-size:1.1rem;color:#0b1220}
    .row{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.5rem 0;border-top:1px solid #f1f5f9}
    .row:first-of-type{border-top:0}
    .row span{color:#556}
    .muted{color:#556}
    @media (max-width: 900px){.grid{grid-template-columns:1fr}.flag{width:140px}}
  `]
})
export class DetailPaysComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paysService = inject(PaysService);
  private weatherService = inject(WeatherService);
  private elevationService = inject(ElevationService);
  private platformId = inject(PLATFORM_ID);

  pays: PaysDetail | null = null;
  loading = true;
  error = '';

  weather: WeatherNow | null = null;
  weatherLoading = false;
  weatherError = '';

  altitudeText = 'Non disponible';

  private coords: { lat: number; lon: number } | null = null;

  private weatherSub?: Subscription;
  private elevationSub?: Subscription;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => (params.get('code') || '').trim().toUpperCase()),
        distinctUntilChanged(),
        tap((code) => {
          // Reset état à chaque navigation
          this.error = '';
          this.loading = true;

          this.weatherSub?.unsubscribe();
          this.elevationSub?.unsubscribe();
          this.weatherLoading = false;
          this.weather = null;
          this.weatherError = '';
          this.altitudeText = 'Non disponible';
          this.coords = null;

          // Affichage instantané (si on vient de la liste)
          if (code) {
            const cached = this.paysService.getCachedPaysFromList(code);
            if (cached) this.pays = cached;
            else this.pays = null;
          } else {
            this.pays = null;
          }

          if (isPlatformBrowser(this.platformId)) {
            console.log('[Pays] navigation:', code);
          }
        }),
        switchMap((code) => {
          // Watchdog anti-chargement infini pour CE pays
          const startedAt = Date.now();
          const watchdog = setTimeout(() => {
            if (this.loading) {
              this.error = 'Le chargement du pays prend trop de temps. Vérifie ta connexion ou réessaie.';
              this.loading = false;
            }
          }, 10000);

          if (!code) {
            clearTimeout(watchdog);
            this.error = 'Pays introuvable.';
            this.loading = false;
            return of(null);
          }

          return this.paysService.getPaysDetail(code).pipe(
            finalize(() => {
              clearTimeout(watchdog);
              this.loading = false;
              if (isPlatformBrowser(this.platformId)) {
                console.log('[Pays] fin chargement:', code, `${Date.now() - startedAt}ms`);
              }
            })
          );
        })
      )
      .subscribe({
        next: (data: PaysDetail | null) => {
          if (!data) return;
          this.pays = data;
          this.resolveCoords();
          this.loadElevationIfPossible();
          this.loadWeatherIfPossible();
        },
        error: (err: unknown) => {
          // Si on a déjà un fallback (cache liste), on évite de bloquer l'écran
          if (!this.pays) {
            this.error = 'Impossible de charger le détail du pays.';
          }
          this.loading = false;

          if (isPlatformBrowser(this.platformId)) {
            console.error('Erreur détail pays:', err);
          }
        }
      });
  }

  private loadWeatherIfPossible(): void {
    // Reset état UI à chaque tentative
    this.weather = null;
    this.weatherError = '';

    if (!this.coords) {
      this.weatherError = 'Coordonnées indisponibles pour la météo.';
      return;
    }

    const { lat, lon } = this.coords;

    this.weatherLoading = true;
    this.weatherSub?.unsubscribe();
    this.weatherSub = this.weatherService
      .getCurrentWeather(lat, lon)
      .pipe(finalize(() => (this.weatherLoading = false)))
      .subscribe({
        next: (data: WeatherNow) => {
          this.weather = data;
        },
        error: (err: unknown) => {
          this.weatherError = this.weatherService.formatError(err);

          if (isPlatformBrowser(this.platformId)) {
            console.error('Erreur météo:', err);
          }
        }
      });
  }

  private resolveCoords(): void {
    const latlng = this.pays?.latlng;
    const cap = this.pays?.capitalInfo?.latlng;
    const picked = (Array.isArray(latlng) && latlng.length >= 2) ? latlng : cap;

    if (!picked || picked.length < 2) {
      this.coords = null;
      return;
    }

    const lat = picked[0];
    const lon = picked[1];
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      this.coords = null;
      return;
    }

    this.coords = { lat, lon };
  }

  private loadElevationIfPossible(): void {
    if (!this.coords) {
      this.altitudeText = 'Non disponible';
      return;
    }

    this.elevationSub?.unsubscribe();
    this.elevationSub = this.elevationService.getElevationMeters(this.coords.lat, this.coords.lon).subscribe({
      next: (m) => {
        this.altitudeText = typeof m === 'number' ? `${Math.round(m)} m` : 'Non disponible';
      },
      error: () => {
        this.altitudeText = 'Non disponible';
      }
    });
  }
}
