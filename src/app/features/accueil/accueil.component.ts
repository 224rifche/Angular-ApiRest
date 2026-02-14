import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaysService } from '../pays/liste-pays/pays.service';
import { PokemonService } from '../pokemons/pokemon.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="home">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-icon">🌍</span>
            <span class="badge-text">Plateforme Mondiale</span>
          </div>
          <h1 class="hero-title">
            Explorez le <span class="highlight">Monde</span> & <span class="highlight">Pokémons</span>
          </h1>
          <p class="hero-subtitle">
            Découvrez les pays du monde entier avec leurs drapeaux, cultures et données géographiques, 
            tout en explorant l'univers fascinant des Pokémon.
          </p>
          
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">{{ stats.paysCount }}</div>
              <div class="stat-label">Pays</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.pokemonCount }}</div>
              <div class="stat-label">Pokémons</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.totalPopulation }}</div>
              <div class="stat-label">Population</div>
            </div>
          </div>

          <div class="hero-actions">
            <a class="btn btn-primary" routerLink="/pays">
              <span class="btn-icon">🌍</span>
              Explorer les Pays
            </a>
            <a class="btn btn-secondary" routerLink="/pokemons">
              <span class="btn-icon">⚡</span>
              Voir les Pokémons
            </a>
          </div>
        </div>

        <div class="hero-visual">
          <div class="floating-elements">
            <div class="element element-1">🌍</div>
            <div class="element element-2">⚡</div>
            <div class="element element-3">🗺️</div>
            <div class="element element-4">🎮</div>
          </div>
          <div class="hero-card">
            <div class="card-header">
              <div class="card-title">PokéMonde & Pays</div>
              <div class="card-subtitle">Votre portail d'exploration</div>
            </div>
            <div class="card-content">
              <div class="feature-item">
                <span class="feature-icon">🌍</span>
                <span class="feature-text">{{ stats.paysCount }} pays disponibles</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🏳️</span>
                <span class="feature-text">Drapeaux du monde entier</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">⚡</span>
                <span class="feature-text">{{ stats.pokemonCount }} Pokémon répertoriés</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <div class="section-header">
          <h2 class="section-title">Fonctionnalités Principales</h2>
          <p class="section-subtitle">Découvrez tout ce que notre plateforme vous offre</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-large">🌍</div>
            <h3>Exploration Mondiale</h3>
            <p>Parcourez les {{ stats.paysCount }} pays du monde avec leurs informations détaillées, drapeaux et données géographiques.</p>
            <a class="feature-link" routerLink="/pays">
              Explorer les pays →
            </a>
          </div>

          <div class="feature-card">
            <div class="feature-icon-large">⚡</div>
            <h3>Univers Pokémon</h3>
            <p>Accédez à une base de données complète des {{ stats.pokemonCount }} Pokémon avec leurs caractéristiques et capacités.</p>
            <a class="feature-link" routerLink="/pokemons">
              Voir les Pokémon →
            </a>
          </div>

          <div class="feature-card">
            <div class="feature-icon-large">📊</div>
            <h3>Données Riches</h3>
            <p>Informations précises sur les populations ({{ stats.totalPopulation.toLocaleString() }} habitants), capitales, langues et bien plus encore.</p>
            <a class="feature-link" routerLink="/pays">
              Consulter les données →
            </a>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <div class="cta-content">
          <h2 class="cta-title">Prêt à commencer votre aventure ?</h2>
          <p class="cta-subtitle">Rejoignez-nous dès maintenant et explorez un monde de possibilités</p>
          <div class="cta-actions">
            <a class="btn btn-primary btn-large" routerLink="/pays">
              Commencer l'Exploration
            </a>
            <a class="btn btn-outline btn-large" routerLink="/pokemons">
              Découvrir les Pokémon
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit, OnDestroy {
  stats = {
    paysCount: 0,
    pokemonCount: 0,
    totalPopulation: 0
  };
  
  private subscriptions: Subscription[] = [];

  constructor(
    private paysService: PaysService,
    private pokemonService: PokemonService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadStats() {
    // Charger les statistiques des pays
    const paysSub = this.paysService.getPays().subscribe({
      next: (pays: any[]) => {
        this.stats.paysCount = pays.length;
        this.stats.totalPopulation = pays.reduce((sum: number, pays: any) => sum + (pays.population || 0), 0);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des pays:', error);
        this.stats.paysCount = 195; // Valeur par défaut
        this.stats.totalPopulation = 7946313216; // Population mondiale approximative
      }
    });

    // Charger les statistiques des Pokémon
    const pokemonSub = this.pokemonService.getPokemons().subscribe({
      next: (pokemons: any[]) => {
        this.stats.pokemonCount = pokemons.length;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des Pokémon:', error);
        this.stats.pokemonCount = 1010; // Valeur par défaut
      }
    });

    this.subscriptions.push(paysSub, pokemonSub);
  }
}
