import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingApi } from './landing-api';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="page-shell" *ngIf="data() as landing">
      <section class="hero">
        <div class="hero-grid">
          <div class="hero-copy">
            <h1>{{ landing.hero.title }}</h1>

            <div class="hero-actions">
              <a class="button primary" routerLink="/comprar">Comprar ahora</a>
              <a class="button secondary" routerLink="/bases-legales">Bases legales</a>
            </div>

            <div class="hero-meta">
              <article class="meta-card">
                <span>Fecha sorteo</span>
                <strong>{{ landing.raffle.drawDate }}</strong>
              </article>
              <article class="meta-card">
                <span>Vigencia</span>
                <strong>{{ landing.raffle.salePeriod }}</strong>
              </article>
            </div>
          </div>

          <aside class="spotlight-card">
            <p class="eyebrow subtle">Premio</p>
            <h2>El ganador podra elegir una de estas opciones.</h2>
            <div class="spotlight-list prize-list">
              <article *ngFor="let prize of landing.prizes">
                <strong>{{ prize.title }}</strong>
                <ul class="prize-items">
                  <li *ngFor="let item of prize.items">{{ item }}</li>
                </ul>
              </article>
            </div>
            <a class="button primary" routerLink="/comprar">Ir al checkout</a>
          </aside>
        </div>
      </section>
    </main>
  `,
})
export class HomePage {
  private readonly api = inject(LandingApi);

  protected readonly data = computed(() => this.api.landing());

  constructor() {
    this.api.loadLanding();
  }
}
