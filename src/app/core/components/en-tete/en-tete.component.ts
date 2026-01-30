import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-en-tete',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './en-tete.html',
  styleUrls: ['./en-tete.css']
})
export class EnTeteComponent {
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map(user => !!user));
    this.isAdmin$ = this.authService.currentUser$.pipe(
      map(user => !!user?.is_staff)
    );
    this.currentUser$ = this.authService.currentUser$;

    // Fermer le menu si on clique ailleurs
    if (typeof window !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.user-menu')) {
          this.showUserMenu = false;
        }
      });
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  resetMyPassword(): void {
    this.showUserMenu = false;
    const user = this.authService.currentUserValue;
    if (!user) {
      alert('Utilisateur non connecté');
      return;
    }

    if (confirm('Voulez-vous vraiment réinitialiser votre mot de passe ?')) {
      this.authService.resetUserPassword(user.id).subscribe({
        next: () => {
          alert('Un email de réinitialisation a été envoyé à votre adresse email.');
        },
        error: (err: any) => {
          console.error('Erreur lors de la réinitialisation:', err);
          alert('Erreur lors de la réinitialisation du mot de passe.');
        }
      });
    }
  }
}
