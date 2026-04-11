import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingApi } from './landing-api';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="page-shell" *ngIf="data() as landing">
      <section class="page-section legal-page">
        <div class="faq-header">
          <p class="eyebrow">Bases legales</p>
          <h1>{{ landing.raffle.title }}</h1>
          <p class="lead">A continuacion se presenta la informacion completa de las bases legales del sorteo.</p>
          <div class="hero-actions">
            <a class="button primary" routerLink="/comprar">Comprar tickets</a>
            <a class="button secondary" routerLink="/">Volver al inicio</a>
          </div>
        </div>

        <div class="legal-sections">
          <article class="legal-card" *ngFor="let section of landing.legalSections">
            <h2>{{ section.title }}</h2>
            <p *ngFor="let paragraph of section.paragraphs">{{ paragraph }}</p>
            <ul *ngIf="section.bullets?.length">
              <li *ngFor="let bullet of section.bullets">{{ bullet }}</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  `,
})
export class LegalPage {
  private readonly api = inject(LandingApi);

  protected readonly data = computed(() => this.api.landing());

  constructor() {
    this.api.loadLanding();
  }
}
