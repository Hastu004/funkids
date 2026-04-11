import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingApi } from './landing-api';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="page-shell" *ngIf="data() as landing">
      <section class="page-section">
        <div class="faq-header">
          <p class="eyebrow">Preguntas frecuentes</p>
          <h1>Resuelve dudas antes de comprar.</h1>
          <p class="lead">
            Aqui reunimos respuestas breves basadas en las bases legales del sorteo.
          </p>
          <div class="hero-actions">
            <a class="button primary" routerLink="/comprar">Ir a comprar</a>
            <a class="button secondary" routerLink="/">Volver al inicio</a>
          </div>
        </div>

        <div class="faq-grid">
          <article class="faq-item" *ngFor="let faq of landing.faqs">
            <h3>{{ faq.question }}</h3>
            <p>{{ faq.answer }}</p>
          </article>
        </div>

        <section class="contact contact-inline">
          <div class="contact-card">
            <p class="eyebrow subtle">Contacto</p>
            <h2>{{ landing.contact.email }}</h2>
            <p>{{ landing.contact.schedule }}</p>
            <a class="button secondary" [href]="'mailto:' + landing.contact.email">Hablar con FunKids</a>
          </div>
        </section>
      </section>
    </main>
  `,
})
export class FaqPage {
  private readonly api = inject(LandingApi);

  protected readonly data = computed(() => this.api.landing());

  constructor() {
    this.api.loadLanding();
  }
}
