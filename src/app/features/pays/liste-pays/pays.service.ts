import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class PaysService {
  private apiUrl = 'https://restcountries.com/v3.1';
  private paysAll$?: Observable<Pays[]>;

  constructor(private http: HttpClient) { }

  getPays(): Observable<Pays[]> {
    if (!this.paysAll$) {
      this.paysAll$ = this.http
        .get<Pays[]>(`${this.apiUrl}/all?fields=name,cca3,flags,capital,region,population,languages`)
        .pipe(shareReplay(1));
    }

    return this.paysAll$;
  }

  getPaysParNom(nom: string): Observable<Pays[]> {
    return this.http.get<Pays[]>(`${this.apiUrl}/name/${nom}?fields=name,cca3,flags,capital,region,population,languages`);
  }

  getPaysParRegion(region: string): Observable<Pays[]> {
    return this.http.get<Pays[]>(`${this.apiUrl}/region/${region}?fields=name,cca3,flags,capital,region,population,languages`);
  }
}