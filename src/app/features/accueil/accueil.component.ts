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
  styles: [`
    .home{max-width:1200px;margin:0 auto;padding:2rem 1rem 3rem}
    .hero{position:relative;overflow:hidden;border-radius:20px;border:1px solid rgba(255,255,255,.25);background:radial-gradient(1200px 500px at 20% 0%, #4facfe 0%, transparent 55%),radial-gradient(900px 400px at 80% 20%, #a855f7 0%, transparent 55%),linear-gradient(135deg,#0b1220 0%, #101b34 40%, #0b1220 100%);box-shadow:0 20px 60px rgba(0,0,0,.25);padding:2rem;display:grid;grid-template-columns:1.6fr 1fr;gap:1.5rem}
    .hero-content{color:#eef3ff}
    .badge{display:inline-flex;align-items:center;gap:.5rem;padding:.35rem .6rem;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);font-weight:600;font-size:.85rem;margin:0 0 .75rem}
    h1{margin:.25rem 0 .75rem;font-size:2.3rem;line-height:1.1;letter-spacing:-.02em}
    .subtitle{margin:0;color:rgba(238,243,255,.85);max-width:60ch}
    .hero-actions{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1.25rem}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.75rem 1rem;border-radius:12px;text-decoration:none;font-weight:700;border:1px solid transparent;transition:transform .12s ease, box-shadow .12s ease, background-color .12s ease, border-color .12s ease;color:inherit}
    .btn:hover{transform:translateY(-1px)}
    .btn.primary{background:linear-gradient(135deg,#22c55e 0%, #16a34a 60%, #22c55e 100%);box-shadow:0 10px 26px rgba(34,197,94,.25)}
    .btn.ghost{background:rgba(255,255,255,.10);border-color:rgba(255,255,255,.18)}
    .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;margin-top:1.5rem}
    .stat{padding:.8rem .9rem;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14)}
    .stat-kpi{font-weight:800}
    .stat-label{margin-top:.15rem;color:rgba(238,243,255,.8);font-size:.9rem}

    .hero-visual{position:relative;min-height:260px;display:flex;align-items:center;justify-content:center}
    .blob{position:absolute;inset:-30% -20%;background:radial-gradient(circle at 30% 30%, rgba(79,172,254,.55), transparent 50%),radial-gradient(circle at 70% 40%, rgba(168,85,247,.55), transparent 55%),radial-gradient(circle at 50% 70%, rgba(34,197,94,.45), transparent 55%);filter:blur(22px)}
    .glass-card{position:relative;width:min(320px,100%);padding:1rem;border-radius:18px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(10px);box-shadow:0 18px 40px rgba(0,0,0,.25)}
    .glass-title{color:#fff;font-weight:800;margin-bottom:.75rem}
    .glass-row{display:flex;align-items:center;gap:.6rem;padding:.55rem .6rem;border-radius:12px;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.10)}
    .glass-row + .glass-row{margin-top:.6rem}
    .dot{width:10px;height:10px;border-radius:999px}
    .dot.blue{background:#4facfe}
    .dot.green{background:#22c55e}
    .dot.violet{background:#a855f7}
    .glass-text{color:rgba(255,255,255,.9);font-weight:600}

    .section{margin-top:2rem}
    .section h2{margin:0 0 .35rem;color:#0b1220;letter-spacing:-.01em}
    .section-subtitle{margin:0 0 1rem;color:#556;max-width:70ch}

    .cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
    .card{display:flex;gap:1rem;align-items:flex-start;padding:1rem;border-radius:16px;background:#fff;border:1px solid #e9ecef;text-decoration:none;color:inherit;box-shadow:0 10px 24px rgba(0,0,0,.06);transition:transform .12s ease, box-shadow .12s ease}
    .card:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(0,0,0,.10)}
    .card-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.35rem;background:linear-gradient(135deg,#eef2ff,#ffffff)}
    .card-body h3{margin:0 0 .35rem}
    .card-body p{margin:0 0 .75rem;color:#556}
    .card-cta{display:inline-block;font-weight:800;color:#2563eb}

    .discover-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
    .panel{display:block;padding:1.25rem;border-radius:18px;text-decoration:none;color:inherit;border:1px solid #e9ecef;box-shadow:0 14px 30px rgba(0,0,0,.08);transition:transform .12s ease, box-shadow .12s ease}
    .panel:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,0,0,.12)}
    .panel-blue{background:linear-gradient(135deg, rgba(79,172,254,.18), rgba(255,255,255,1) 50%)}
    .panel-violet{background:linear-gradient(135deg, rgba(168,85,247,.16), rgba(255,255,255,1) 50%)}
    .panel-top{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.5rem}
    .panel-kicker{font-size:.8rem;font-weight:800;color:#334;opacity:.8}
    .panel-text{margin:0 0 .75rem;color:#556}
    .panel-cta{display:inline-block;font-weight:900;color:#0b1220}

    @media (max-width: 900px){
      .hero{grid-template-columns:1fr;padding:1.5rem}
      .hero-visual{min-height:210px}
      .cards{grid-template-columns:1fr}
      .discover-grid{grid-template-columns:1fr}
      h1{font-size:2rem}
    }
  `]
})
export class AccueilComponent {}
