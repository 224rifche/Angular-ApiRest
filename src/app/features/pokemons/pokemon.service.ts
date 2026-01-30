import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, timer } from 'rxjs';
import { catchError, map, retry, shareReplay, tap, timeout } from 'rxjs/operators';

export interface PokemonListItem {
  name: string;
  image: string;
}

export interface PokemonDetail {
  name: string;
  officialArtwork: string;
  height: number;
  weight: number;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  abilities: string[];
}

interface PokeApiListResponse {
  results: Array<{ name: string; url: string }>;
}

interface PokeApiPokemonResponse {
  name: string;
  height: number;
  weight: number;
  sprites?: {
    front_default?: string;
    other?: {
      ['official-artwork']?: {
        front_default?: string;
      };
    };
  };
  types?: Array<{ type?: { name?: string } }>;
  stats?: Array<{ base_stat?: number; stat?: { name?: string } }>;
  abilities?: Array<{ ability?: { name?: string } }>;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2';
  private listSubject = new BehaviorSubject<PokemonListItem[] | null>(null);
  private listCache: PokemonListItem[] | null = null;
  private detailCache = new Map<string, Observable<PokemonDetail>>();

  constructor(private http: HttpClient) {
    // Chargement immédiat des données au démarrage
    this.loadPokemonsInitial();
  }

  /**
   * Charge les pokémons immédiatement au démarrage
   */
  private loadPokemonsInitial(): void {
    this.http
      .get<PokeApiListResponse>(`${this.apiUrl}/pokemon?limit=200&offset=0`)
      .pipe(
        map((res) =>
          res.results.map((p) => ({
            name: p.name,
            image: this.getSpriteFromUrl(p.url)
          }))
        ),
        tap((list) => {
          this.listCache = list;
          this.listSubject.next(list);
        }),
        catchError((error) => {
          console.error('Erreur lors du chargement initial des pokémons:', error);
          this.listSubject.next([]);
          return of([]);
        })
      )
      .subscribe();
  }

  getPokemons(limit = 200): Observable<PokemonListItem[]> {
    // Si on a déjà des données en cache, on les retourne immédiatement
    if (this.listCache && this.listCache.length > 0) {
      return of(this.listCache);
    }

    // Sinon, on s'abonne au BehaviorSubject
    return new Observable(observer => {
      const subscription = this.listSubject.subscribe(pokemons => {
        if (pokemons !== null) {
          observer.next(pokemons);
          observer.complete();
        }
      });

      // Nettoyage
      return () => subscription.unsubscribe();
    });
  }

  getPokemonDetail(name: string): Observable<PokemonDetail> {
    const normalized = (name || '').trim().toLowerCase();
    const cached = this.detailCache.get(normalized);
    if (cached) return cached;

    const req$ = this.http
      .get<PokeApiPokemonResponse>(`${this.apiUrl}/pokemon/${encodeURIComponent(normalized)}`)
      .pipe(
        timeout({ first: 8000 }),
        retry({
          count: 2,
          delay: (err, retryCount) => {
            // Petit backoff, plus long si rate limit
            const base = err instanceof HttpErrorResponse && err.status === 429 ? 900 : 250;
            return timer(base * retryCount);
          }
        }),
        map((raw) => {
        const officialArtwork =
          raw?.sprites?.other?.['official-artwork']?.front_default ||
          raw?.sprites?.front_default ||
          '';

        const types = (raw.types || [])
          .map((t) => t?.type?.name)
          .filter((x): x is string => !!x);

        const statsMap = new Map<string, number>();
        for (const s of raw.stats || []) {
          const key = s?.stat?.name;
          const val = s?.base_stat;
          if (key && typeof val === 'number') statsMap.set(key, val);
        }

        const abilities = (raw.abilities || [])
          .map((a) => a?.ability?.name)
          .filter((x): x is string => !!x);

        return {
          name: raw.name,
          officialArtwork,
          height: raw.height,
          weight: raw.weight,
          types,
          stats: {
            hp: statsMap.get('hp') ?? 0,
            attack: statsMap.get('attack') ?? 0,
            defense: statsMap.get('defense') ?? 0,
            speed: statsMap.get('speed') ?? 0
          },
          abilities
        };
        }),
        catchError((err) => {
          // Permet de retenter plus tard (sinon un Observable en erreur resterait en cache)
          this.detailCache.delete(normalized);
          return throwError(() => err);
        }),
        shareReplay(1)
      );

    this.detailCache.set(normalized, req$);
    return req$;
  }

  private getSpriteFromUrl(url: string): string {
    // URL example: https://pokeapi.co/api/v2/pokemon/1/
    const match = url.match(/\/pokemon\/(\d+)\/?$/);
    const id = match?.[1];
    if (!id) return '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }
}
