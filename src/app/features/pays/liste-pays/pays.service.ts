import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, timer } from 'rxjs';
import { catchError, retry, shareReplay, tap, timeout } from 'rxjs/operators';

export interface Pays {
  name: {
    common: string;
    official: string;
  };
  capital?: string[];
  region?: string;
  subregion?: string;
  languages?: { [key: string]: string };
  population: number;
  flags: {
    png: string;
    svg: string;
  };
  cca3: string;
}

export interface PaysDetail extends Pays {
  area?: number;
  latlng?: number[];
  capitalInfo?: {
    latlng?: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaysService {
  private apiUrl = 'https://restcountries.com/v3.1';
  private paysListSubject = new BehaviorSubject<Pays[] | null>(null);
  private paysListCache: Pays[] | null = null;
  private paysDetailCache = new Map<string, Observable<PaysDetail>>();

  constructor(private http: HttpClient) { 
    // Chargement immédiat des données au démarrage
    this.loadPaysInitial();
  }

  /**
   * Charge les pays immédiatement au démarrage
   */
  private loadPaysInitial(): void {
    this.http
      .get<Pays[]>(`${this.apiUrl}/all?fields=name,cca3,flags,capital,region,population,languages`)
      .pipe(
        tap((list) => {
          this.paysListCache = list;
          this.paysListSubject.next(list);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur lors du chargement initial des pays:', error);
          this.paysListSubject.next([]);
          return of([]);
        })
      )
      .subscribe();
  }

  getPays(): Observable<Pays[]> {
    // Si on a déjà des données en cache, on les retourne immédiatement
    if (this.paysListCache && this.paysListCache.length > 0) {
      return of(this.paysListCache);
    }

    // Sinon, on s'abonne au BehaviorSubject
    return new Observable(observer => {
      const subscription = this.paysListSubject.subscribe(pays => {
        if (pays !== null) {
          observer.next(pays);
          observer.complete();
        }
      });

      // Nettoyage
      return () => subscription.unsubscribe();
    });
  }

  getPaysParNom(nom: string): Observable<Pays[]> {
    return this.http.get<Pays[]>(`${this.apiUrl}/name/${nom}?fields=name,cca3,flags,capital,region,population,languages`);
  }

  getPaysParRegion(region: string): Observable<Pays[]> {
    return this.http.get<Pays[]>(`${this.apiUrl}/region/${region}?fields=name,cca3,flags,capital,region,population,languages`);
  }

  getPaysDetail(code: string): Observable<PaysDetail> {
    const normalized = (code || '').trim().toUpperCase();
    const cached = this.paysDetailCache.get(normalized);
    if (cached) return cached;

    const req$ = this.http
      .get<PaysDetail>(
        `${this.apiUrl}/alpha/${encodeURIComponent(normalized)}?fields=name,cca3,flags,capital,region,subregion,population,languages,area,latlng,capitalInfo`
      )
      .pipe(
        timeout({ first: 8000 }),
        retry({
          count: 2,
          delay: (err, retryCount) => {
            const base = err instanceof HttpErrorResponse && err.status === 429 ? 900 : 250;
            return timer(base * retryCount);
          }
        }),
        catchError((err) => {
          this.paysDetailCache.delete(normalized);
          return throwError(() => err);
        }),
        shareReplay(1)
      );

    this.paysDetailCache.set(normalized, req$);
    return req$;
  }

  getCachedPaysFromList(code: string): PaysDetail | null {
    const normalized = (code || '').trim().toUpperCase();
    if (!this.paysListCache) return null;
    const found = this.paysListCache.find(p => p.cca3?.toUpperCase() === normalized);
    return found ? ({ ...found } as PaysDetail) : null;
  }
}