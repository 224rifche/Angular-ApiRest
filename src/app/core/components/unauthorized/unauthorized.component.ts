import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section style="max-width: 720px; margin: 2rem auto;">
      <h1>Accès refusé</h1>
      <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
      <a routerLink="/">Retour à l'accueil</a>
    </section>
  `
})
export class UnauthorizedComponent {}
