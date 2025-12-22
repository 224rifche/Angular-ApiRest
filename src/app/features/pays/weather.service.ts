import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WeatherNow {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
}

interface OpenWeatherResponse {
  main?: {
    temp?: number;
    humidity?: number;
  };
  weather?: Array<{ description?: string }>;
  wind?: {
    speed?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  private cache = new Map<string, Observable<WeatherNow>>();

  getCurrentWeather(lat: number, lon: number): Observable<WeatherNow> {
    const apiKey = environment.weatherApiKey;
    if (!apiKey) {
      return throwError(() => new Error('Clé API météo manquante. Ajoute environment.weatherApiKey (OpenWeatherMap).'));
    }

    // Réduit la cardinalité du cache (utile si les coords ont beaucoup de décimales)
    const latKey = Number(lat.toFixed(2));
    const lonKey = Number(lon.toFixed(2));
    const cacheKey = `${latKey},${lonKey}`;

    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;
    const req$ = this.http.get<OpenWeatherResponse>(url).pipe(
      // Si l'API est trop lente, on coupe pour éviter un chargement sans fin
      timeout({ first: 8000 }),
      map((raw) => {
        const temperature = raw?.main?.temp;
        if (typeof temperature !== 'number') {
          throw new Error('Réponse météo invalide.');
        }

        return {
          temperature,
          description: raw?.weather?.[0]?.description || '—',
          humidity: typeof raw?.main?.humidity === 'number' ? raw.main.humidity : 0,
          windSpeed: typeof raw?.wind?.speed === 'number' ? raw.wind.speed : 0
        };
      }),
      catchError((err) => {
        // Permet de retenter plus tard (sinon un Observable en erreur resterait en cache)
        this.cache.delete(cacheKey);
        return throwError(() => err);
      }),
      shareReplay(1)
    );

    this.cache.set(cacheKey, req$);
    return req$;
  }

  formatError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) return 'Clé API météo invalide (401). Vérifie environment.weatherApiKey.';
      if (err.status === 429) return 'Quota météo dépassé (429). Réessaie plus tard.';
      if (err.status === 0) return 'Météo indisponible (problème réseau).';
      return `Erreur météo (${err.status}).`;
    }
    if ((err as { name?: string } | null)?.name === 'TimeoutError') {
      return 'Météo trop lente à répondre. Réessaie dans quelques secondes.';
    }
    if (err instanceof Error) return err.message;
    return 'Impossible de charger la météo.';
  }
}
