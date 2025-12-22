import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, retry, shareReplay, tap, throwError, timeout, timer } from 'rxjs';

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
  private paysAll$?: Observable<Pays[]>;
  private paysListCache: Pays[] | null = null;
  private paysDetailCache = new Map<string, Observable<PaysDetail>>();

  constructor(private http: HttpClient) { }

  getPays(): Observable<Pays[]> {
    if (!this.paysAll$) {
      this.paysAll$ = this.http
        .get<Pays[]>(`${this.apiUrl}/all?fields=name,cca3,flags,capital,region,population,languages`)
        .pipe(
          tap((list) => {
            this.paysListCache = list;
          }),
          shareReplay(1)
        );
    }

    return this.paysAll$;
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