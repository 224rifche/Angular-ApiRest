import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnTeteComponent } from './core/components/en-tete/en-tete.component';
import { PiedDePageComponent } from './core/components/pied-de-page/pied-de-page.component';
import { LayoutService } from './core/services/layout.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, EnTeteComponent, PiedDePageComponent],
  template: `
    <div class="app-container" [class.no-header]="!showHeaderFooter">
      <app-en-tete *ngIf="showHeaderFooter"></app-en-tete>
      <main>
        <router-outlet></router-outlet>
      </main>
      <app-pied-de-page *ngIf="showHeaderFooter"></app-pied-de-page>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'pokemons-pays';
  showHeaderFooter = true;
  private subscription = new Subscription();

  constructor(private layoutService: LayoutService) {}

  ngOnInit() {
    this.subscription.add(
      this.layoutService.showHeaderFooter$.subscribe(show => {
        this.showHeaderFooter = show;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
