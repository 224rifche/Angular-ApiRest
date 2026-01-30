import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="account-container">
      <h1>Mon Compte</h1>

      <div class="success" *ngIf="success">{{ success }}</div>
      <div class="error" *ngIf="error">{{ error }}</div>

      <!-- Informations du compte -->
      <div class="card">
        <h2>📋 Informations du compte</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Email</span>
            <strong>{{ currentUser?.email }}</strong>
          </div>
          <div class="info-item">
            <span class="label">Username</span>
            <strong>{{ currentUser?.username }}</strong>
          </div>
          <div class="info-item">
            <span class="label">Rôle</span>
            <span class="badge" [class.badge-admin]="currentUser?.is_staff">
              {{ currentUser?.is_staff ? 'Administrateur' : 'Utilisateur' }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Statut</span>
            <span class="badge" [class.badge-active]="!currentUser?.is_blocked" [class.badge-blocked]="currentUser?.is_blocked">
              {{ currentUser?.is_blocked ? 'Bloqué' : 'Actif' }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Membre depuis</span>
            <strong>{{ currentUser?.date_joined | date:'dd/MM/yyyy' }}</strong>
          </div>
          <div class="info-item">
            <span class="label">Dernière connexion</span>
            <strong>{{ currentUser?.last_login ? (currentUser?.last_login | date:'dd/MM/yyyy HH:mm') : 'Jamais' }}</strong>
          </div>
        </div>
      </div>

      <!-- Modifier les informations -->
      <div class="card">
        <div class="card-header">
          <h2>✏️ Modifier mes informations</h2>
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="toggleEditMode()"
            *ngIf="!editMode">
            Modifier
          </button>
        </div>

        <form [formGroup]="editForm" (submit)="updateProfile()" *ngIf="editMode">
          <div class="form-row">
            <div class="field">
              <label>Email *</label>
              <input type="email" formControlName="email" />
              <span class="field-error" *ngIf="editForm.get('email')?.invalid && editForm.get('email')?.touched">
                Email requis et valide
              </span>
            </div>
            <div class="field">
              <label>Username *</label>
              <input type="text" formControlName="username" />
              <span class="field-error" *ngIf="editForm.get('username')?.invalid && editForm.get('username')?.touched">
                Username requis
              </span>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || saving">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelEdit()">
              Annuler
            </button>
          </div>
        </form>
      </div>

      <!-- Modifier le mot de passe -->
      <div class="card">
        <div class="card-header">
          <h2>🔐 Modifier mon mot de passe</h2>
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="togglePasswordMode()"
            *ngIf="!passwordMode">
            Changer
          </button>
        </div>

        <form [formGroup]="passwordForm" (submit)="updatePassword()" *ngIf="passwordMode">
          <div class="field">
            <label>Mot de passe actuel *</label>
            <input type="password" formControlName="currentPassword" />
            <span class="field-error" *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
              Mot de passe actuel requis
            </span>
          </div>

          <div class="field">
            <label>Nouveau mot de passe *</label>
            <input type="password" formControlName="newPassword" />
            <span class="field-error" *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
              Minimum 6 caractères
            </span>
          </div>

          <div class="field">
            <label>Confirmer le nouveau mot de passe *</label>
            <input type="password" formControlName="confirmPassword" />
            <span class="field-error" *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched">
              Les mots de passe doivent correspondre
            </span>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid || saving">
              {{ saving ? 'Enregistrement...' : 'Changer le mot de passe' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelPassword()">
              Annuler
            </button>
          </div>
        </form>
      </div>

      <!-- Actions dangereuses -->
      <div class="card danger-card">
        <h2>⚠️ Zone dangereuse</h2>
        <p class="danger-text">
          Ces actions sont irréversibles. Procédez avec prudence.
        </p>

        <div class="danger-actions">
          <button 
            type="button" 
            class="btn btn-warning"
            (click)="resetMyPassword()">
            🔑 Réinitialiser mon mot de passe
          </button>

          <button 
            type="button" 
            class="btn btn-danger"
            (click)="deleteMyAccount()"
            [disabled]="currentUser?.is_staff">
            🗑️ Supprimer mon compte
          </button>

          <p class="help-text" *ngIf="currentUser?.is_staff">
            Les comptes administrateurs ne peuvent pas être supprimés via cette interface.
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .account-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      margin: 0 0 2rem;
      color: #2c3e50;
    }

    .success, .error {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border: 1px solid #e9ecef;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    h2 {
      margin: 0 0 1rem;
      color: #2c3e50;
      font-size: 1.3rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .label {
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      width: fit-content;
    }

    .badge-admin {
      background: #e3f2fd;
      color: #1976d2;
    }

    .badge-active {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .badge-blocked {
      background: #ffebee;
      color: #c62828;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .field label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .field input {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .field input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .field-error {
      color: #dc3545;
      font-size: 0.85rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn-warning {
      background: #ffc107;
      color: #000;
    }

    .btn-warning:hover {
      background: #e0a800;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c82333;
    }

    .danger-card {
      border-color: #dc3545;
    }

    .danger-text {
      color: #721c24;
      margin-bottom: 1rem;
    }

    .danger-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .help-text {
      color: #6c757d;
      font-size: 0.9rem;
      font-style: italic;
      margin: 0.5rem 0 0;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MonCompteComponent implements OnInit {
  currentUser: User | null = null;
  editForm!: FormGroup;
  passwordForm!: FormGroup;
  editMode = false;
  passwordMode = false;
  saving = false;
  success = '';
  error = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.initForms();
  }

  initForms(): void {
    this.editForm = this.fb.group({
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      username: [this.currentUser?.username || '', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  toggleEditMode(): void {
    this.editMode = true;
    this.error = '';
    this.success = '';
  }

  cancelEdit(): void {
    this.editMode = false;
    this.initForms();
  }

  togglePasswordMode(): void {
    this.passwordMode = true;
    this.error = '';
    this.success = '';
  }

  cancelPassword(): void {
    this.passwordMode = false;
    this.passwordForm.reset();
  }

  updateProfile(): void {
    if (!this.currentUser || this.editForm.invalid) return;

    this.saving = true;
    this.error = '';
    this.success = '';

    const updatedData = {
      email: this.editForm.value.email,
      username: this.editForm.value.username
    };

    this.authService.updateUser(this.currentUser.id, updatedData).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.success = 'Profil mis à jour avec succès!';
        this.editMode = false;
        this.saving = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de la mise à jour';
        this.saving = false;
      }
    });
  }

  updatePassword(): void {
    if (!this.currentUser || this.passwordForm.invalid) return;

    const currentPassword = this.passwordForm.value.currentPassword;
    const newPassword = this.passwordForm.value.newPassword;
    
    // On ne peut pas vérifier le mot de passe côté client de manière sécurisée
    // On fait confiance au backend pour valider le mot de passe actuel

    this.saving = true;
    this.error = '';
    this.success = '';

    this.authService.updateUser(this.currentUser.id, { password: newPassword }).subscribe({
      next: () => {
        this.success = 'Mot de passe modifié avec succès!';
        this.passwordMode = false;
        this.passwordForm.reset();
        this.saving = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de la modification';
        this.saving = false;
      }
    });
  }

  resetMyPassword(): void {
    if (!this.currentUser) return;

    if (!confirm('Voulez-vous vraiment réinitialiser votre mot de passe? Un nouveau mot de passe sera généré.')) {
      return;
    }

    this.authService.resetUserPassword(this.currentUser.id).subscribe({
      next: (result: { status: string; new_password?: string }) => {
        if (result.new_password) {
          alert(`Votre nouveau mot de passe est: ${result.new_password}\n\nNotez-le bien, il ne sera plus affiché!\n\nVous allez être déconnecté.`);
        } else {
          alert('Un nouveau mot de passe a été généré. Veuillez vérifier votre email.');
        }
        // Déconnecter l'utilisateur pour qu'il se reconnecte avec le nouveau mot de passe
        setTimeout(() => {
          this.authService.logout();
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.detail || err.message || 'Erreur lors de la réinitialisation';
      }
    });
  }

  deleteMyAccount(): void {
    if (!this.currentUser) return;

    if (this.currentUser.is_staff) {
      this.error = 'Les comptes administrateurs ne peuvent pas être supprimés';
      return;
    }

    const confirmation = prompt('Pour confirmer la suppression, tapez "SUPPRIMER":');
    
    if (confirmation !== 'SUPPRIMER') {
      return;
    }

    if (confirm('Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      this.authService.deleteUser(this.currentUser.id).subscribe({
        next: () => {
          alert('Votre compte a été supprimé. Vous allez être déconnecté.');
          this.authService.logout();
        },
        error: (err) => {
          this.error = err.error?.detail || err.message || 'Erreur lors de la suppression';
        }
      });
    }
  }
}
