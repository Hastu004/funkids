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
      <section class="page-section legal-page webpay-result-page">
        <article class="legal-card webpay-result-card" *ngIf="result(); else loadingOrError">
          <header class="webpay-result-header">
            <p class="eyebrow subtle">Resultado Webpay</p>
            <h1 class="webpay-result-title">{{ result()!.title }}</h1>
            <p class="lead webpay-result-lead">{{ result()!.message }}</p>
          </header>

          <div class="hero-actions webpay-result-actions">
            <a class="button primary" routerLink="/">Volver al inicio</a>
            <a class="button secondary" routerLink="/bases-legales">Bases legales</a>
            <button class="button secondary" type="button" (click)="downloadReceiptPdf()">
              Descargar comprobante PDF
            </button>
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
              <p class="webpay-detail-line"><strong>{{ result()!.participant.fullName }}</strong></p>
              <p class="webpay-detail-line" *ngIf="result()!.participant.email">{{ result()!.participant.email }}</p>
              <p class="webpay-detail-line" *ngIf="result()!.participant.phone">{{ result()!.participant.phone }}</p>
            </article>

            <article class="legal-option-card">
              <h3>Compra</h3>
              <p class="webpay-detail-line"><strong>{{ result()!.order.packageLabel }}</strong></p>
              <p class="webpay-detail-line">
                Tickets asignados: <strong>{{ result()!.order.ticketNumbers.join(', ') }}</strong>
              </p>
            </article>

            <article class="legal-option-card" *ngIf="result()!.payment">
              <h3>Pago</h3>
              <p class="webpay-detail-line" *ngIf="result()!.payment?.authorizationCode">
                Codigo autorizacion: <strong>{{ result()!.payment?.authorizationCode }}</strong>
              </p>
              <p class="webpay-detail-line" *ngIf="result()!.payment?.cardNumber">
                Tarjeta: <strong>{{ result()!.payment?.cardNumber }}</strong>
              </p>
              <p class="webpay-detail-line" *ngIf="result()!.payment?.transactionDate">
                Fecha transaccion:
                <strong>{{ result()!.payment?.transactionDate | date: 'dd/MM/yyyy HH:mm' }}</strong>
              </p>
              <p class="webpay-detail-line" *ngIf="result()!.payment?.lastError">{{ result()!.payment?.lastError }}</p>
            </article>
          </div>
        </article>

        <ng-template #loadingOrError>
          <article class="legal-card webpay-result-card">
            <header class="webpay-result-header">
              <p class="eyebrow subtle">Resultado Webpay</p>
              <h1 class="webpay-result-title">{{ error() ? 'No pudimos cargar el pago' : 'Consultando pago' }}</h1>
              <p class="lead webpay-result-lead">{{ error() || 'Estamos consultando el estado de tu transaccion en Webpay.' }}</p>
            </header>
            <div class="hero-actions webpay-result-actions">
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
        next: (response) => {
          this.result.set(response);
          this.autoDownloadReceiptIfNeeded(response);
        },
        error: (error) => {
          this.error.set(error.error?.message ?? 'No fue posible consultar el estado de la compra en Webpay.');
        },
      });
    });
  }

  protected downloadReceiptPdf() {
    const data = this.result();
    if (!data || typeof window === 'undefined') {
      return;
    }

    const pdf = buildWebpayReceiptPdf(data);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante-${sanitizeFilenameSegment(data.orderId)}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private autoDownloadReceiptIfNeeded(data: WebpayResultResponse) {
    if (typeof window === 'undefined' || !isApprovedPurchase(data)) {
      return;
    }

    const storageKey = `funkids_receipt_downloaded_${data.orderId}`;
    if (window.sessionStorage.getItem(storageKey) === '1') {
      return;
    }

    window.sessionStorage.setItem(storageKey, '1');
    setTimeout(() => this.downloadReceiptPdf(), 120);
  }
}

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function buildWebpayReceiptPdf(result: WebpayResultResponse) {
  const lines = buildReceiptLines(result);
  return buildSimplePdf(lines);
}

function buildReceiptLines(result: WebpayResultResponse) {
  const payment = result.payment;
  const lines = [
    'FUNKIDS - COMPROBANTE DE COMPRA',
    `Fecha de emision: ${formatReceiptDate(new Date())}`,
    '',
    `Orden: ${payment?.buyOrder ?? result.orderId}`,
    `Estado compra: ${payment?.status ?? result.status}`,
    `Monto total: ${clpFormatter.format(result.order.amount)}`,
    `Paquete: ${result.order.packageLabel}`,
    `Participaciones: ${result.order.participations}`,
    `Tickets: ${result.order.ticketNumbers.join(', ') || '-'}`,
    '',
    `Participante: ${result.participant.fullName}`,
    `Email: ${result.participant.email ?? '-'}`,
    `Telefono: ${result.participant.phone ?? '-'}`,
  ];

  if (payment?.authorizationCode) {
    lines.push(`Codigo autorizacion: ${payment.authorizationCode}`);
  }

  if (payment?.cardNumber) {
    lines.push(`Tarjeta: ${payment.cardNumber}`);
  }

  if (payment?.transactionDate) {
    lines.push(`Fecha transaccion: ${formatReceiptDate(new Date(payment.transactionDate))}`);
  }

  if (payment?.lastError) {
    lines.push(`Detalle: ${payment.lastError}`);
  }

  lines.push('', 'Este comprobante corresponde a una compra digital en FunKids.');

  return wrapLines(lines, 90).slice(0, 46);
}

function formatReceiptDate(value: Date) {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);
}

function wrapLines(lines: string[], maxChars: number) {
  return lines.flatMap((line) => wrapLine(line, maxChars));
}

function wrapLine(line: string, maxChars: number) {
  const trimmed = line.trim();
  if (!trimmed) {
    return [''];
  }

  const words = trimmed.split(/\s+/);
  const wrapped: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      wrapped.push(current);
    }

    if (word.length <= maxChars) {
      current = word;
      continue;
    }

    let pending = word;
    while (pending.length > maxChars) {
      wrapped.push(pending.slice(0, maxChars));
      pending = pending.slice(maxChars);
    }
    current = pending;
  }

  if (current) {
    wrapped.push(current);
  }

  return wrapped.length > 0 ? wrapped : [''];
}

function buildSimplePdf(lines: string[]) {
  const safeLines = lines.map((line) => escapePdfLiteral(toAscii(line)));
  const content = [
    'BT',
    '/F1 12 Tf',
    '14 TL',
    '50 790 Td',
    ...safeLines.flatMap((line, index) => (index === 0 ? [`(${line}) Tj`] : ['T*', `(${line}) Tj`])),
    'ET',
    '',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let index = 0; index < objects.length; index += 1) {
    offsets[index + 1] = pdf.length;
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function toAscii(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ');
}

function escapePdfLiteral(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function sanitizeFilenameSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

function isApprovedPurchase(result: WebpayResultResponse) {
  return result.status === 'approved' || result.payment?.status === 'AUTHORIZED';
}
