import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map(user => !!user));
    this.isAdmin$ = this.authService.currentUser$.pipe(
      map(user => !!user?.is_staff)
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}