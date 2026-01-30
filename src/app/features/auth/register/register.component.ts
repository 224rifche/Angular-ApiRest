import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl = '/';
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.registerForm.controls; }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const password2 = form.get('password2')?.value;
    return password === password2 ? null : { mismatch: true };
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const username = this.f['username'].value;
    const email = this.f['email'].value;
    const password = this.f['password'].value;
    const password2 = this.f['password2'].value;

    this.authService.register(email, username, password, password2)
      .pipe(first())
      .subscribe({
        next: () => {
          this.authService.login(email, password, false)
            .pipe(first())
            .subscribe({
              next: () => this.router.navigateByUrl(this.returnUrl),
              error: () => {
                this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl } });
              }
            });
        },
        error: () => {
          this.error = 'Impossible de créer le compte';
          this.loading = false;
        }
      });
  }
}
