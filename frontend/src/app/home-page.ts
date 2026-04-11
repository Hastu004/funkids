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
            <p class="eyebrow">{{ landing.hero.badge }}</p>
            <div class="hero-accent" aria-hidden="true">
              <span class="hero-accent-heart"></span>
              <span class="hero-accent-dot hero-accent-dot-top"></span>
              <span class="hero-accent-dot hero-accent-dot-bottom"></span>
            </div>
            <h1>{{ landing.hero.title }}</h1>
            <p class="lead">{{ landing.hero.description }}</p>

            <div class="hero-actions">
              <a class="button primary" routerLink="/comprar">Comprar ahora</a>
              <a class="button secondary" routerLink="/preguntas">Como funciona</a>
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
              <article class="meta-card">
                <span>Maximo</span>
                <strong>{{ landing.raffle.maxParticipations }} tickets</strong>
              </article>
            </div>
          </div>

          <aside class="spotlight-card">
            <p class="eyebrow subtle">Resumen</p>
            <h2>{{ landing.raffle.title }}</h2>
            <p>
              La compra de tickets se realiza en modalidades definidas y el sorteo se realiza por seleccion aleatoria.
            </p>
            <div class="spotlight-list">
              <article *ngFor="let highlight of landing.highlights">
                <strong>{{ highlight.title }}</strong>
                <p>{{ highlight.description }}</p>
              </article>
            </div>
            <a class="button primary" routerLink="/comprar">Ir al checkout</a>
          </aside>
        </div>
      </section>

      <section class="benefits">
        <article class="benefit" *ngFor="let highlight of landing.highlights">
          <p class="eyebrow subtle">Checkout FunKids</p>
          <h2>{{ highlight.title }}</h2>
          <p>{{ highlight.description }}</p>
        </article>
      </section>

      <section class="process">
        <div class="process-copy">
          <p class="eyebrow">Flujo pensado para convertir</p>
          <h2>Informacion breve y basada en las bases legales.</h2>
          <p>
            Inicio resume el sorteo, Comprar concentra la compra de tickets y Preguntas muestra solo lo esencial.
          </p>
        </div>

        <div class="process-steps">
          <article>
            <strong>1</strong>
            <p>Revisas vigencia, fecha del sorteo y modalidades.</p>
          </article>
          <article>
            <strong>2</strong>
            <p>Completa nombre, email valido y modalidad de tickets.</p>
          </article>
          <article>
            <strong>3</strong>
            <p>Pagas con Transbank o Khipu y se registra tu compra.</p>
          </article>
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
