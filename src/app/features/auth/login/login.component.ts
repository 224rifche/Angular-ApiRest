import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl = '/';
  error = '';
  showPassword = false; // Ajout de la propriété pour gérer la visibilité du mot de passe

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // Rediriger vers la page d'accueil si déjà connecté
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // Récupérer l'URL de retour ou utiliser '/' par défaut
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Accès facile aux champs du formulaire
  get f() { return this.loginForm.controls; }

  // Bascher la visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    if (passwordField) {
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }

  onSubmit() {
    this.submitted = true;

    // Arrêter si le formulaire est invalide
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = ''; // Réinitialiser les erreurs précédentes

    this.authService.login(
      this.f['email'].value, 
      this.f['password'].value,
      this.f['rememberMe'].value
    )
    .pipe(first())
    .subscribe({
      next: () => {
        // Redirection vers l'URL de retour ou la page d'accueil
        this.router.navigateByUrl(this.returnUrl);
      },
      error: error => {
        this.error = 'Adresse email ou mot de passe incorrect';
        this.loading = false;
        
        // Réinitialiser le champ mot de passe
        this.loginForm.patchValue({ password: '' });
        
        // Forcer la mise à jour de l'interface utilisateur
        this.loginForm.markAsPristine();
        this.loginForm.markAsUntouched();
      }
    });
  }
}