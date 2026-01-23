import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-liste-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section style="max-width: 1100px; margin: 0 auto;">
      <h1>Utilisateurs</h1>

      <div *ngIf="loading">Chargement...</div>
      <div *ngIf="error" style="color: #b00020;">{{ error }}</div>

      <table *ngIf="!loading && users.length" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align:left; padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.1);">Username</th>
            <th style="text-align:left; padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.1);">Email</th>
            <th style="text-align:left; padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.1);">Rôle</th>
            <th style="text-align:left; padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.1);">Bloqué</th>
            <th style="text-align:left; padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.1);">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users">
            <td style="padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.06);">{{ u.username }}</td>
            <td style="padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.06);">{{ u.email }}</td>
            <td style="padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.06);">{{ u.is_staff ? 'admin' : 'user' }}</td>
            <td style="padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.06);">{{ u.is_blocked ? 'Oui' : 'Non' }}</td>
            <td style="padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.06); display:flex; gap:8px; flex-wrap: wrap;">
              <button type="button" (click)="toggleStatus(u)">
                {{ u.is_blocked ? 'Débloquer' : 'Bloquer' }}
              </button>
              <button type="button" (click)="resetPassword(u)">Réinitialiser mot de passe</button>
              <button type="button" (click)="delete(u)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && !users.length">Aucun utilisateur.</div>
    </section>
  `
})
export class ListeUsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les utilisateurs';
        this.loading = false;
      }
    });
  }

  toggleStatus(user: User): void {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: () => this.load(),
      error: () => this.error = 'Impossible de modifier le statut'
    });
  }

  resetPassword(user: User): void {
    this.userService.resetUserPassword(user.id).subscribe({
      next: () => {},
      error: () => this.error = 'Impossible de réinitialiser le mot de passe'
    });
  }

  delete(user: User): void {
    this.userService.deleteUser(user.id).subscribe({
      next: () => this.load(),
      error: () => this.error = 'Impossible de supprimer l\'utilisateur'
    });
  }
}
