import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface OpenElevationResponse {
  results?: Array<{ elevation?: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class ElevationService {
  constructor(private http: HttpClient) {}

  getElevationMeters(lat: number, lon: number): Observable<number | null> {
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
    return this.http.get<OpenElevationResponse>(url).pipe(
      map((res) => {
        const e = res?.results?.[0]?.elevation;
        return typeof e === 'number' ? e : null;
      })
    );
  }
}
