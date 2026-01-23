import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_blocked: boolean;
  is_staff: boolean;
  last_login?: string;
  date_joined?: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
  user: User;
}

interface RegisterResponse {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenExpirationTimer: any;
  private refreshTimer: any;
  private refreshing$?: Observable<string | null>;
  private authChannel?: BroadcastChannel;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private readonly API_URL = 'http://localhost:8000/api/auth';
  private readonly REFRESH_INTERVAL_MS = 30_000;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    const userJson = this.storageGet(this.USER_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      userJson ? JSON.parse(userJson) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    if (this.isBrowser()) {
      // Vérifier le token au chargement
      this.checkTokenExpiration();
      this.setupCrossTabSync();

      if (this.isLoggedIn()) {
        this.startRefreshTimer();
      }
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private storageGet(key: string): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(key);
  }

  private storageSet(key: string, value: string): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.setItem(key, value);
  }

  private storageRemove(key: string): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.removeItem(key);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.storageGet(this.ACCESS_TOKEN_KEY);
  }

  get refreshTokenValue(): string | null {
    return this.storageGet(this.REFRESH_TOKEN_KEY);
  }

  login(email: string, password: string, rememberMe: boolean = false): Observable<User> {
    return this.http.post<TokenResponse>(`${this.API_URL}/token/`, { email, password })
      .pipe(
        tap(response => {
          this.setSession(response, rememberMe);
          this.startRefreshTimer();
          this.broadcastAuthEvent('login');
        }),
        map((response) => response.user),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(email: string, password: string, password2: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/register/`, { email, password, password2 }).pipe(
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  private setSession(authResult: TokenResponse, rememberMe: boolean): void {
    this.storageSet(this.ACCESS_TOKEN_KEY, authResult.access);
    this.storageSet(this.REFRESH_TOKEN_KEY, authResult.refresh);
    this.storageSet(this.USER_KEY, JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);

    // Conserver la clé pour compatibilité, mais la session reste persistante dans tous les cas.
    this.storageSet('rememberMe', rememberMe ? 'true' : 'false');
  }

  logout(): void {
    const refresh = this.refreshTokenValue;
    if (refresh) {
      this.http.post(`${this.API_URL}/logout/`, { refresh_token: refresh }).subscribe({
        next: () => this.clearAuthData(),
        error: () => this.clearAuthData()
      });
      return;
    }

    this.clearAuthData();
  }

  refreshAccessToken(): Observable<string | null> {
    if (this.refreshing$) {
      return this.refreshing$;
    }

    const refresh = this.refreshTokenValue;
    if (!refresh) {
      return of(null);
    }

    this.refreshing$ = this.http.post<{ access: string; refresh?: string }>(`${this.API_URL}/token/refresh/`, { refresh }).pipe(
      tap((response) => {
        this.storageSet(this.ACCESS_TOKEN_KEY, response.access);
        if (response.refresh) {
          this.storageSet(this.REFRESH_TOKEN_KEY, response.refresh);
        }
      }),
      map((response) => response.access),
      catchError((error) => {
        this.clearAuthData();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshing$ = undefined;
      }),
      shareReplay(1)
    );

    return this.refreshing$;
  }

  private clearAuthData(): void {
    this.storageRemove(this.ACCESS_TOKEN_KEY);
    this.storageRemove(this.REFRESH_TOKEN_KEY);
    this.storageRemove(this.USER_KEY);
    this.storageRemove('rememberMe');
    this.currentUserSubject.next(null);
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.clearInactivityTimer();
    
    // Déclencher un événement personnalisé pour notifier les autres onglets
    if (this.isBrowser()) {
      window.localStorage.setItem('logout', Date.now().toString());
    }
    this.broadcastAuthEvent('logout');
    this.router.navigate(['/login']);
  }

  autoLogout(expirationDuration: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue && !!this.token;
  }

  isAdmin(): boolean {
    return !!this.currentUserValue?.is_staff;
  }

  private checkTokenExpiration(): void {
    // Vérifier si le token est expiré
    // Implémentez la logique de vérification du token ici
    
    // Écouter les événements de déconnexion depuis d'autres onglets
    if (this.isBrowser()) {
      window.addEventListener('storage', (event) => {
        if (event.key === 'logout' || (event.key === this.USER_KEY && !event.newValue)) {
          this.clearAuthData();
        }
      });
    }
  }

  private startRefreshTimer(): void {
    if (!this.isBrowser()) {
      return;
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    this.refreshTimer = setInterval(() => {
      if (!this.isLoggedIn()) {
        return;
      }
      this.refreshAccessToken().subscribe({
        next: () => {},
        error: () => {}
      });
    }, this.REFRESH_INTERVAL_MS);
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private setupCrossTabSync(): void {
    if (!this.isBrowser()) {
      return;
    }

    if ('BroadcastChannel' in window) {
      this.authChannel = new BroadcastChannel('auth');
      this.authChannel.onmessage = (msg) => {
        if (msg?.data?.type === 'logout') {
          this.clearAuthData();
        }
        if (msg?.data?.type === 'login') {
          // Recharger l'utilisateur depuis le localStorage
          const userJson = this.storageGet(this.USER_KEY);
          this.currentUserSubject.next(userJson ? JSON.parse(userJson) : null);

          if (this.isLoggedIn()) {
            this.startRefreshTimer();
          }
        }
      };
    }
  }

  private broadcastAuthEvent(type: 'login' | 'logout'): void {
    try {
      this.authChannel?.postMessage({ type, at: Date.now() });
    } catch {
      // ignore
    }
  }
}
