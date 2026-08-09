import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="page-shell home-shell">
      <section class="page-section raffle-unavailable" aria-labelledby="raffle-unavailable-title">
        <article class="raffle-unavailable__card">
          <p class="eyebrow">Sorteo finalizado</p>
          <h1 id="raffle-unavailable-title">Este sorteo ya no está disponible.</h1>
          <p class="raffle-unavailable__message">Estamos trabajando en un próximo sorteo.</p>
          <p class="raffle-unavailable__support">
            Muy pronto compartiremos nuevas fechas y todos los detalles para participar.
          </p>
          <a
            class="button whatsapp-button"
            href="https://wa.me/56988207303?text=Hola%20FunKids%2C%20quisiera%20recibir%20informacion%20del%20proximo%20sorteo."
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar por WhatsApp
          </a>
        </article>
      </section>

      <section class="page-section closed-raffle-content">
        <article class="spotlight-card">
          <h2>Mientras tanto, conoce la experiencia FunKids.</h2>
          <div class="gallery-showcase" aria-label="Galería de eventos FunKids">
            <article class="gallery-showcase__item" *ngFor="let moment of galleryMoments">
              <img [src]="moment.src" [alt]="moment.alt" loading="lazy" decoding="async" />
            </article>
          </div>
        </article>

        <article class="info-card trust-card" id="contacto">
          <h2>Fun Kids Diversiones SpA</h2>
          <p><strong>Dirección:</strong> Avenida Balmaceda 2902, local 1010.</p>
          <p>
            <strong>Instagram:</strong>
            <a
              href="https://www.instagram.com/funkids_calama/"
              target="_blank"
              rel="noopener noreferrer"
            >
              @funkids_calama
            </a>
          </p>
          <p><strong>Contacto:</strong> <a href="tel:+56988207303">+56 9 8820 7303</a></p>
        </article>
      </section>

      <a
        class="mobile-whatsapp-cta"
        href="https://wa.me/56988207303?text=Hola%20FunKids%2C%20quisiera%20recibir%20informacion%20del%20proximo%20sorteo."
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
    </main>
  `,
})
export class HomePage {
  protected readonly galleryMoments = [
    { src: '/gallery/funkids-galeria-05.jpeg', alt: 'Evento realizado en FunKids.' },
    { src: '/gallery/funkids-galeria-06.jpeg', alt: 'Celebración infantil en FunKids.' },
    { src: '/gallery/funkids-galeria-07.jpeg', alt: 'Experiencia de cumpleaños en FunKids.' },
    { src: '/gallery/funkids-galeria-08.jpeg', alt: 'Espacio de entretención FunKids.' },
  ] as const;
}
