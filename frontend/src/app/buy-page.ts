import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-buy-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page-shell">
      <section class="page-section raffle-unavailable" aria-labelledby="buy-unavailable-title">
        <article class="raffle-unavailable__card">
          <p class="eyebrow">Sorteo finalizado</p>
          <h1 id="buy-unavailable-title">Este sorteo ya no está disponible.</h1>
          <p class="raffle-unavailable__message">Estamos trabajando en un próximo sorteo.</p>
          <a class="button primary" routerLink="/">Volver al inicio</a>
        </article>
      </section>
    </main>
  `,
})
export class BuyPage {}
