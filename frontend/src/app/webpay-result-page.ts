import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LandingApi, type WebpayResultResponse } from './landing-api';

@Component({
  selector: 'app-webpay-result-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <main class="page-shell">
      <section class="page-section legal-page">
        <article class="legal-card" *ngIf="result(); else loadingOrError">
          <p class="eyebrow subtle">Resultado Webpay</p>
          <h1>{{ result()!.title }}</h1>
          <p class="lead">{{ result()!.message }}</p>

          <div class="hero-actions">
            <a class="button primary" routerLink="/">Volver al inicio</a>
            <a class="button secondary" routerLink="/bases-legales">Bases legales</a>
          </div>

          <div class="admin-summary webpay-result-summary">
            <article class="meta-card">
              <span>Orden</span>
              <strong>{{ result()!.payment?.buyOrder ?? result()!.orderId }}</strong>
            </article>
            <article class="meta-card">
              <span>Total</span>
              <strong>{{ result()!.order.amount | currency: 'CLP' : 'symbol-narrow' : '1.0-0' : 'es-CL' }}</strong>
            </article>
            <article class="meta-card">
              <span>Tickets</span>
              <strong>{{ result()!.order.participations }}</strong>
            </article>
            <article class="meta-card">
              <span>Estado</span>
              <strong>{{ result()!.payment?.status ?? result()!.status }}</strong>
            </article>
          </div>

          <div class="legal-options">
            <article class="legal-option-card">
              <h3>Participante</h3>
              <p><strong>{{ result()!.participant.fullName }}</strong></p>
              <p *ngIf="result()!.participant.email">{{ result()!.participant.email }}</p>
              <p *ngIf="result()!.participant.phone">{{ result()!.participant.phone }}</p>
            </article>

            <article class="legal-option-card">
              <h3>Compra</h3>
              <p><strong>{{ result()!.order.packageLabel }}</strong></p>
              <p>Tickets asignados: {{ result()!.order.ticketNumbers.join(', ') }}</p>
            </article>

            <article class="legal-option-card" *ngIf="result()!.payment">
              <h3>Pago</h3>
              <p *ngIf="result()!.payment?.authorizationCode">
                Codigo autorizacion: <strong>{{ result()!.payment?.authorizationCode }}</strong>
              </p>
              <p *ngIf="result()!.payment?.cardNumber">
                Tarjeta: <strong>{{ result()!.payment?.cardNumber }}</strong>
              </p>
              <p *ngIf="result()!.payment?.transactionDate">
                Fecha transaccion:
                <strong>{{ result()!.payment?.transactionDate | date: 'dd/MM/yyyy HH:mm' }}</strong>
              </p>
              <p *ngIf="result()!.payment?.lastError">{{ result()!.payment?.lastError }}</p>
            </article>
          </div>
        </article>

        <ng-template #loadingOrError>
          <article class="legal-card">
            <p class="eyebrow subtle">Resultado Webpay</p>
            <h1>{{ error() ? 'No pudimos cargar el pago' : 'Consultando pago' }}</h1>
            <p class="lead">{{ error() || 'Estamos consultando el estado de tu transaccion en Webpay.' }}</p>
            <div class="hero-actions">
              <a class="button primary" routerLink="/">Volver al inicio</a>
            </div>
          </article>
        </ng-template>
      </section>
    </main>
  `,
})
export class WebpayResultPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(LandingApi);

  protected readonly result = signal<WebpayResultResponse | null>(null);
  protected readonly error = signal('');

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const orderId = params.get('orderId')?.trim();

      if (!orderId) {
        this.error.set('No recibimos un identificador de compra para consultar el resultado.');
        this.result.set(null);
        return;
      }

      this.error.set('');
      this.result.set(null);

      this.api.loadWebpayResult(orderId).subscribe({
        next: (response) => this.result.set(response),
        error: (error) => {
          this.error.set(error.error?.message ?? 'No fue posible consultar el estado de la compra en Webpay.');
        },
      });
    });
  }
}
