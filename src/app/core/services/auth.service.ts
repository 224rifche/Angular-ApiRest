import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  is_active: boolean;
  is_blocked: boolean;
  is_staff: boolean;
  last_login?: string;
  date_joined: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject!: BehaviorSubject<User | null>;
  public currentUser$!: Observable<User | null>;
  private inactivityTimer: any;
  private authChannel: BroadcastChannel | null = null;
  
  // Clés de stockage
  private readonly USERS_KEY = 'app_users';
  private readonly CURRENT_USER_KEY = 'current_user';
  private readonly INACTIVITY_TIMEOUT_MS = 5_000; // 5 secondes
  
  // Événements de synchronisation
  private readonly AUTH_EVENTS = {
    LOGIN: 'auth_login',
    LOGOUT: 'auth_logout',
    ACTIVITY: 'auth_activity',
    BLOCK: 'user_blocked',
    UNBLOCK: 'user_unblocked'
  };


  get token(): string | null {
    const userJson = this.storageGet(this.CURRENT_USER_KEY);
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    return user.token || null;
  }

  // Ajoutez cette méthode pour la compatibilité
  refreshAccessToken(): Observable<string | null> {
    // Dans une implémentation réelle, vous pourriez vouloir rafraîchir le token ici
    // Pour l'instant, on retourne simplement le token actuel
    return of(this.token);
  }

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // Initialisation de l'admin par défaut
    this.initializeDefaultAdmin();
    
    // Récupération de l'utilisateur connecté avec validation complète
    this.restoreUserSession();
    
    // Configuration de la synchronisation multi-onglets
    this.setupCrossTabSync();
    
    // Démarrer le timer d'inactivité si un utilisateur est connecté
    if (this.isLoggedIn()) {
      this.resetInactivityTimer();
    }
  }

  private restoreUserSession(): void {
    const userJson = this.storageGet(this.CURRENT_USER_KEY);
    let user: User | null = null;
    
    if (userJson) {
      try {
        user = JSON.parse(userJson);
        
        // Validation complète de l'utilisateur
        if (user && user.is_active && !user.is_blocked) {
          console.log('✅ Session utilisateur restaurée avec succès:', user.username);
          console.log('📧 Email:', user.email);
          console.log('🔑 Rôle:', user.is_staff ? 'Admin' : 'User');
          console.log('📅 Dernière connexion:', user.last_login || 'Jamais');
        } else {
          console.log('❌ Session invalide - utilisateur désactivé ou bloqué');
          user = null;
          this.storageRemove(this.CURRENT_USER_KEY);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la restauration de la session:', error);
        console.log('🧹 Nettoyage des données corrompues...');
        user = null;
        this.storageRemove(this.CURRENT_USER_KEY);
      }
    } else {
      console.log('ℹ️ Aucune session trouvée dans localStorage');
    }
    
    // Initialisation du BehaviorSubject
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    // Log final de l'état
    if (user) {
      console.log('🎉 Utilisateur connecté et prêt à naviguer');
    } else {
      console.log('🔐 Aucun utilisateur connecté - redirection vers login prévue');
    }
  }

  // ========== GESTION DU STOCKAGE ==========
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private storageGet(key: string): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(key);
  }

  private storageSet(key: string, value: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(key, value);
  }

  private storageRemove(key: string): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(key);
  }

  // ========== GESTION DES UTILISATEURS ==========
  private initializeDefaultAdmin(): void {
    const users = this.getAllUsers();
    if (users.length === 0) {
      const admin: User = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        is_active: true,
        is_blocked: false,
        is_staff: true,
        date_joined: new Date().toISOString()
      };
      this.storageSet(this.USERS_KEY, JSON.stringify([admin]));
      console.log('✅ Admin créé avec succès!');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Mot de passe: admin123');
    }
  }

  private getAllUsers(): User[] {
    const usersJson = this.storageGet(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: User[]): void {
    this.storageSet(this.USERS_KEY, JSON.stringify(users));
  }

  // ========== AUTHENTIFICATION ==========
  login(email: string, password: string, rememberMe: boolean = false): Observable<User> {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return throwError(() => new Error('Email ou mot de passe incorrect'));
    }
    
    if (!user.is_active || user.is_blocked) {
      return throwError(() => new Error('Ce compte est désactivé ou bloqué'));
    }
    
    // Mise à jour de la dernière connexion
    user.last_login = new Date().toISOString();
    this.updateUser(user.id, user);
    
    // Connexion de l'utilisateur
    this.storageSet(this.CURRENT_USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    
    // Réinitialisation du timer d'inactivité
    this.resetInactivityTimer();
    
    // Notification des autres onglets
    this.broadcastAuthEvent(this.AUTH_EVENTS.LOGIN);
    
    return of(user);
  }

  logout(): void {
    // Déconnexion de l'utilisateur
    this.storageRemove(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
    
    // Arrêt du timer d'inactivité
    this.clearInactivityTimer();
    
    // Notification des autres onglets
    this.broadcastAuthEvent(this.AUTH_EVENTS.LOGOUT);
    
    // Redirection vers la page de connexion
    this.router.navigate(['/login']);
  }

  register(email: string, username: string, password: string, password2: string): Observable<User> {
    if (password !== password2) {
      return throwError(() => new Error('Les mots de passe ne correspondent pas'));
    }
    
    const users = this.getAllUsers();
    
    // Vérification de l'unicité de l'email
    if (users.some(u => u.email === email)) {
      return throwError(() => new Error('Cet email est déjà utilisé'));
    }
    
    // Création du nouvel utilisateur
    const newUser: User = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      username,
      email,
      password,
      is_active: true,
      is_blocked: false,
      is_staff: false,
      date_joined: new Date().toISOString()
    };
    
    // Sauvegarde de l'utilisateur
    users.push(newUser);
    this.saveUsers(users);
    
    // Connexion automatique
    return this.login(email, password);
  }

  // ========== GESTION DU TEMPS D'INACTIVITÉ ==========
  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    
    if (this.isBrowser()) {
      // Réinitialisation du timer à chaque activité utilisateur
      window.onmousemove = this.resetInactivityTimer.bind(this);
      window.onmousedown = this.resetInactivityTimer.bind(this);
      window.onclick = this.resetInactivityTimer.bind(this);
      window.onscroll = this.resetInactivityTimer.bind(this);
      window.onkeypress = this.resetInactivityTimer.bind(this);
      
      // Démarrage du timer
      this.inactivityTimer = setTimeout(() => {
        this.logout();
      }, this.INACTIVITY_TIMEOUT_MS);
    }
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  }

  // ========== SYNCHRONISATION MULTI-ONGLETS ==========
  private setupCrossTabSync(): void {
    if (!this.isBrowser() || !('BroadcastChannel' in window)) return;
    
    this.authChannel = new BroadcastChannel('auth_channel');
    
    this.authChannel.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case this.AUTH_EVENTS.LOGIN:
          const user = JSON.parse(this.storageGet(this.CURRENT_USER_KEY) || 'null');
          this.currentUserSubject.next(user);
          this.resetInactivityTimer();
          break;
          
        case this.AUTH_EVENTS.LOGOUT:
          this.storageRemove(this.CURRENT_USER_KEY);
          this.currentUserSubject.next(null);
          this.clearInactivityTimer();
          this.router.navigate(['/login']);
          break;
          
        case this.AUTH_EVENTS.BLOCK:
          if (this.currentUserValue?.id === data.userId) {
            this.logout();
          }
          break;
      }
    };
  }

  private broadcastAuthEvent(type: string, data: any = {}): void {
    if (this.authChannel) {
      this.authChannel.postMessage({ type, data });
    }
  }

  // ========== GESTION DES UTILISATEURS (ADMIN) ==========
  getUsers(): Observable<User[]> {
    return of(this.getAllUsers());
  }

  getUser(id: number): Observable<User | undefined> {
    const user = this.getAllUsers().find(u => u.id === id);
    return of(user);
  }

  createUser(userData: Omit<User, 'id'>): Observable<User> {
    const users = this.getAllUsers();
    const newUser = {
      ...userData,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      date_joined: new Date().toISOString(),
      last_login: undefined,
      is_active: true,
      is_blocked: false
    };
    
    users.push(newUser);
    this.saveUsers(users);
    return of(newUser);
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Utilisateur non trouvé'));
    }
    
    const updatedUser = { ...users[index], ...userData };
    users[index] = updatedUser;
    this.saveUsers(users);
    
    // Mise à jour de l'utilisateur connecté si nécessaire
    if (this.currentUserValue?.id === id) {
      this.storageSet(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
    
    return of(updatedUser);
  }

  deleteUser(id: number): Observable<void> {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Utilisateur non trouvé'));
    }
    
    // Vérification du dernier administrateur
    if (users[index].is_staff && this.getAdminCount() <= 1) {
      return throwError(() => new Error('Impossible de supprimer le dernier administrateur'));
    }
    
    users.splice(index, 1);
    this.saveUsers(users);
    
    // Déconnexion si l'utilisateur supprimé est l'utilisateur actuel
    if (this.currentUserValue?.id === id) {
      this.logout();
    }
    
    return of(undefined);
  }

  toggleUserStatus(id: number): Observable<{ status: string; is_blocked: boolean }> {
    return this.getUser(id).pipe(
      map(user => {
        if (!user) {
          throw new Error('Utilisateur non trouvé');
        }
        
        const isBlocked = !user.is_blocked;
        this.updateUser(id, { is_blocked: isBlocked });
        
        // Déconnexion si l'utilisateur est bloqué
        if (isBlocked && this.currentUserValue?.id === id) {
          this.logout();
        }
        
        // Notification des autres onglets
        this.broadcastAuthEvent(
          isBlocked ? this.AUTH_EVENTS.BLOCK : this.AUTH_EVENTS.UNBLOCK,
          { userId: id }
        );
        
        return {
          status: isBlocked ? 'Utilisateur bloqué' : 'Utilisateur débloqué',
          is_blocked: isBlocked
        };
      })
    );
  }

  resetUserPassword(id: number): Observable<{ status: string }> {
    return this.getUser(id).pipe(
      map(user => {
        if (!user) {
          throw new Error('Utilisateur non trouvé');
        }
        
        // Génération d'un mot de passe aléatoire
        const newPassword = Math.random().toString(36).slice(-8);
        this.updateUser(id, { password: newPassword });
        
        // En production, vous devriez envoyer un email avec le nouveau mot de passe
        console.log(`Nouveau mot de passe pour ${user.email}: ${newPassword}`);
        
        return { status: 'Mot de passe réinitialisé avec succès' };
      })
    );
  }

  // ========== MÉTHODES UTILITAIRES ==========
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.is_staff || false;
  }

  private getAdminCount(): number {
    return this.getAllUsers().filter(u => u.is_staff && !u.is_blocked).length;
  }

}