import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingApi } from './landing-api';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
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
                <span>Valor ticket</span>
                <strong>{{ landing.raffle.ticketPrice | currency: 'CLP' : 'symbol-narrow' : '1.0-0' : 'es-CL' }}</strong>
              </article>
              <article class="meta-card">
                <span>Tickets disponibles</span>
                <strong>{{ landing.raffle.remainingTickets }} / {{ landing.raffle.totalTickets }}</strong>
              </article>
            </div>
          </div>

          <aside class="spotlight-card">
            <p class="eyebrow subtle">Sorteo activo</p>
            <h2>{{ landing.raffle.title }}</h2>
            <p>
              Compra tus numeros en una pagina dedicada, valida tu email y elige entre Transbank o Khipu sin salir del
              sitio.
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
          <h2>Ahora el sitio navega por secciones reales en vez de una sola pagina larga.</h2>
          <p>
            Inicio presenta el sorteo, Comprar concentra el checkout y Preguntas resuelve dudas antes del pago.
          </p>
        </div>

        <div class="process-steps">
          <article>
            <strong>1</strong>
            <p>Descubres el sorteo y revisas el valor del ticket desde Inicio.</p>
          </article>
          <article>
            <strong>2</strong>
            <p>En Comprar completas nombre, email valido y defines si quieres cuenta.</p>
          </article>
          <article>
            <strong>3</strong>
            <p>Pagas con Transbank o Khipu y recibes confirmacion al correo.</p>
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
