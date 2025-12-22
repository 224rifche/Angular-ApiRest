import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="home">
      <div class="hero">
        <div class="hero-content">
          <p class="badge">Dashboard</p>
          <h1>PokéMonde & Pays</h1>
          <p class="subtitle">
            Une vision claire de l'application: navigue entre les pays du monde et les pokémons.
          </p>

          <div class="hero-actions">
            <a class="btn primary" routerLink="/pays">Explorer les pays</a>
            <a class="btn ghost" routerLink="/pokemons">Voir les pokémons</a>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-kpi">Pays</div>
              <div class="stat-label">Drapeaux, régions, population</div>
            </div>
            <div class="stat">
              <div class="stat-kpi">Pokémons</div>
              <div class="stat-label">Liste et navigation</div>
            </div>
            <div class="stat">
              <div class="stat-kpi">Rapide</div>
              <div class="stat-label">Chargements optimisés</div>
            </div>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="blob"></div>
          <div class="glass-card">
            <div class="glass-title">Aperçu</div>
            <div class="glass-row">
              <span class="dot blue"></span>
              <span class="glass-text">Accueil</span>
            </div>
            <div class="glass-row">
              <span class="dot green"></span>
              <span class="glass-text">Pays</span>
            </div>
            <div class="glass-row">
              <span class="dot violet"></span>
              <span class="glass-text">Pokémons</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Que veux-tu faire ?</h2>
        <p class="section-subtitle">Choisis un module pour commencer.</p>

        <div class="cards">
          <a class="card" routerLink="/pays">
            <div class="card-icon">🌍</div>
            <div class="card-body">
              <h3>Pays</h3>
              <p>Explore tous les pays, leurs drapeaux et les infos essentielles.</p>
              <span class="card-cta">Ouvrir</span>
            </div>
          </a>

          <a class="card" routerLink="/pokemons">
            <div class="card-icon">⚡</div>
            <div class="card-body">
              <h3>Pokémons</h3>
              <p>Accède à la liste des pokémons et navigue dans le module.</p>
              <span class="card-cta">Ouvrir</span>
            </div>
          </a>
        </div>
      </div>

      <div class="section discover">
        <div class="discover-head">
          <h2>Découvrir</h2>
          <p class="section-subtitle">Deux raccourcis rapides pour continuer.</p>
        </div>

        <div class="discover-grid">
          <a class="panel panel-blue" routerLink="/pays">
            <div class="panel-top">
              <span class="panel-kicker">Module</span>
              <h3>Pays</h3>
            </div>
            <p class="panel-text">Parcours la liste complète, avec drapeaux et infos clés.</p>
            <span class="panel-cta">Aller aux pays</span>
          </a>

          <a class="panel panel-violet" routerLink="/pokemons">
            <div class="panel-top">
              <span class="panel-kicker">Module</span>
              <h3>Pokémons</h3>
            </div>
            <p class="panel-text">Accède rapidement à la liste et au module de navigation.</p>
            <span class="panel-cta">Aller aux pokémons</span>
          </a>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent {}
