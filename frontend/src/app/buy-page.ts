import { CommonModule, CurrencyPipe } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import { LandingApi, type PurchaseResponse } from './landing-api';

registerLocaleData(localeEsCl);

const PHONE_PATTERN = /^\+56 9 \d{4} \d{4}$/;

@Component({
  selector: 'app-buy-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink],
  template: `
    <main class="page-shell" *ngIf="data() as landing">
      <section class="page-section checkout-layout">
        <div class="page-intro page-intro--buy">
          <p class="eyebrow">Compra de tickets</p>
          <h1>Selecciona una modalidad de tickets.</h1>
          <p class="lead">
            El formulario solicita nombre, email valido y la modalidad de tickets. El pago se realiza online con
            Webpay.
          </p>

          <div class="hero-meta">
            <article class="meta-card">
              <span>Sorteo</span>
              <strong>{{ landing.raffle.title }}</strong>
            </article>
            <article class="meta-card">
              <span>Vigencia</span>
              <strong>{{ landing.raffle.salePeriod }}</strong>
            </article>
          </div>

          <a class="button secondary" routerLink="/bases-legales">Ver bases legales</a>
        </div>

        <aside class="purchase-card">
          <div class="purchase-card__header">
            <p class="eyebrow subtle">Compra de tickets</p>
            <h2>{{ landing.raffle.title }}</h2>
            <p>Completa tus datos, elige una opcion de tickets y continua al pago con Webpay.</p>
          </div>

          <form [formGroup]="purchaseForm" (ngSubmit)="submitPurchase()" class="purchase-form">
            <label class="field">
              <span>Nombre completo</span>
              <input type="text" formControlName="fullName" placeholder="Ej: Jane Doe" />
              <small class="error" *ngIf="hasError('fullName', 'required') || hasError('fullName', 'minlength')">
                Ingresa un nombre valido.
              </small>
            </label>

            <label class="field">
              <span>Email valido</span>
              <input type="email" formControlName="email" placeholder="nombre@correo.cl" />
              <small class="error" *ngIf="hasError('email', 'required') || hasError('email', 'email')">
                Usa un email valido para confirmar tu compra.
              </small>
            </label>

            <div class="field-grid">
              <label class="field">
                <span>Telefono</span>
                <input
                  type="tel"
                  formControlName="phone"
                  inputmode="numeric"
                  maxlength="15"
                  placeholder="+56 9 1234 5678"
                  (input)="formatPhone()"
                />
                <small class="error" *ngIf="hasError('phone', 'required') || hasError('phone', 'pattern')">
                  Ingresa el telefono con formato +56 9 1234 5678.
                </small>
              </label>

              <label class="field">
                <span>Tickets</span>
                <select formControlName="packageId">
                  <option value="">Selecciona una opcion</option>
                  <option *ngFor="let option of landing.packages" [value]="option.id">{{ option.label }}</option>
                </select>
                <small class="error" *ngIf="hasError('packageId', 'required')">
                  Debes seleccionar una opcion de tickets.
                </small>
              </label>
            </div>

            <div class="payment-methods payment-methods--single">
              <p class="section-label">Medio de pago</p>
              <label class="payment-option payment-option--brand is-selected">
                <input type="radio" formControlName="paymentMethod" value="transbank" />
                <span class="payment-option__control"></span>
                <span class="payment-option__copy">
                  <span class="payment-logo" aria-hidden="true">
                    <span class="payment-logo__mark"></span>
                    <span class="payment-logo__wording">
                      <strong>webpay</strong>
                      <small>by Transbank</small>
                    </span>
                  </span>
                  <strong>Pagar con Webpay</strong>
                  <small>Pago online con Transbank.</small>
                </span>
              </label>
            </div>

            <label class="check-line legal">
              <input type="checkbox" formControlName="acceptedTerms" />
              <span>Acepto las bases legales y entiendo que la compra queda sujeta a validacion de pago.</span>
            </label>
            <small class="error" *ngIf="hasError('acceptedTerms', 'required')">
              Debes aceptar las bases legales.
            </small>

            <div class="checkout-summary">
              <div>
                <span>Total</span>
                <strong>{{ totalAmount() | currency: 'CLP' : 'symbol-narrow' : '1.0-0' : 'es-CL' }}</strong>
              </div>
              <div>
                <span>Tickets</span>
                <strong>{{ selectedParticipations() }}</strong>
              </div>
            </div>

            <button class="button primary submit-button" type="submit" [disabled]="isSubmitting()">
              {{ isSubmitting() ? 'Preparando pago...' : 'Continuar al pago' }}
            </button>

            <p class="helper-text">{{ landing.raffle.legalDisclaimer }}</p>
            <p class="error server-error" *ngIf="submitError()">{{ submitError() }}</p>
          </form>

          <section class="result-card" *ngIf="purchaseResult() as result">
            <p class="eyebrow subtle">Compra iniciada</p>
            <h3>{{ result.order.paymentLabel }}</h3>
            <p>{{ result.message }}</p>
            <p><strong>{{ result.participant.email }}</strong> recibira la confirmacion de pago.</p>
            <p>Tickets asignados: {{ result.order.participations }}</p>
            <p>{{ result.nextStep }}</p>
          </section>
        </aside>
      </section>
    </main>
  `,
})
export class BuyPage {
  private readonly api = inject(LandingApi);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly data = computed(() => this.api.landing());
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly purchaseResult = signal<PurchaseResponse | null>(null);
  protected readonly selectedPackageId = signal('');
  protected readonly totalAmount = computed(() => {
    const selectedPackage = this.data()?.packages.find((item) => item.id === this.selectedPackageId());
    return selectedPackage?.amount ?? 0;
  });
  protected readonly selectedParticipations = computed(() => {
    const selectedPackage = this.data()?.packages.find((item) => item.id === this.selectedPackageId());
    return selectedPackage ? String(selectedPackage.participations) : '-';
  });

  protected readonly purchaseForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    packageId: ['', Validators.required],
    paymentMethod: ['transbank', Validators.required],
    acceptedTerms: [false, Validators.requiredTrue],
  });

  constructor() {
    this.api.loadLanding();
    this.purchaseForm.controls.packageId.valueChanges.subscribe((packageId) => {
      this.selectedPackageId.set(packageId);
    });
  }

  protected submitPurchase() {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      this.submitError.set('Revisa el formulario antes de continuar.');
      this.purchaseResult.set(null);
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');
    this.purchaseResult.set(null);

    this.api.purchase({
      ...this.purchaseForm.getRawValue(),
      wantsAccount: false,
    }).subscribe({
      next: (response) => {
        if (response.webpay?.token && response.webpay.url) {
          this.redirectToWebpay(response.webpay.url, response.webpay.token);
          return;
        }

        this.purchaseResult.set(response);
        this.isSubmitting.set(false);
      },
      error: (error) => {
        this.submitError.set(error.error?.message ?? 'No fue posible iniciar la compra.');
        this.isSubmitting.set(false);
      },
    });
  }

  protected hasError(controlName: keyof typeof this.purchaseForm.controls, errorName: string) {
    const control = this.purchaseForm.controls[controlName];
    return control.touched && control.hasError(errorName);
  }

  protected formatPhone() {
    const phoneControl = this.purchaseForm.controls.phone;
    const digits = phoneControl.value.replace(/\D/g, '').slice(0, 11);

    let formatted = '';

    if (digits.startsWith('56')) {
      const nationalDigits = digits.slice(2);
      formatted = '+56';

      if (nationalDigits.length > 0) {
        formatted += ` ${nationalDigits.slice(0, 1)}`;
      }

      if (nationalDigits.length > 1) {
        formatted += ` ${nationalDigits.slice(1, 5)}`;
      }

      if (nationalDigits.length > 5) {
        formatted += ` ${nationalDigits.slice(5, 9)}`;
      }
    } else {
      const normalizedDigits = digits.startsWith('9') ? digits : `9${digits}`.slice(0, 9);
      formatted = '+56';

      if (normalizedDigits.length > 0) {
        formatted += ` ${normalizedDigits.slice(0, 1)}`;
      }

      if (normalizedDigits.length > 1) {
        formatted += ` ${normalizedDigits.slice(1, 5)}`;
      }

      if (normalizedDigits.length > 5) {
        formatted += ` ${normalizedDigits.slice(5, 9)}`;
      }
    }

    phoneControl.setValue(formatted, { emitEvent: false });
  }

  private redirectToWebpay(url: string, token: string) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'token_ws';
    tokenInput.value = token;

    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
  }
}
