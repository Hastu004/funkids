import { CommonModule, CurrencyPipe } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { registerLocaleData } from '@angular/common';

type PaymentMethodId = 'haulmer_transbank' | 'khipu';

interface LandingData {
  brand: string;
  hero: {
    badge: string;
    title: string;
    description: string;
  };
  raffle: {
    title: string;
    drawDate: string;
    ticketPrice: number;
    totalTickets: number;
    remainingTickets: number;
    legalDisclaimer: string;
  };
  highlights: Array<{
    title: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  contact: {
    email: string;
    schedule: string;
  };
  paymentMethods: Array<{
    id: PaymentMethodId;
    name: string;
    description: string;
  }>;
}

interface PurchaseResponse {
  status: string;
  participant: {
    fullName: string;
    email: string;
    phone: string | null;
    wantsAccount: boolean;
  };
  order: {
    ticketCount: number;
    ticketNumbers: string[];
    amount: number;
    paymentMethod: PaymentMethodId;
    paymentLabel: string;
  };
  nextStep: string;
  message: string;
}

registerLocaleData(localeEsCl);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly landing = signal<LandingData | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly purchaseResult = signal<PurchaseResponse | null>(null);
  protected readonly selectedPaymentLabel = computed(() => {
    const methodId = this.purchaseForm.controls.paymentMethod.value as PaymentMethodId;
    return this.landing()?.paymentMethods.find((method) => method.id === methodId)?.name ?? '';
  });
  protected readonly totalAmount = computed(() => {
    const ticketPrice = this.landing()?.raffle.ticketPrice ?? 0;
    const ticketCount = Number(this.purchaseForm.controls.ticketCount.value) || 0;
    return ticketPrice * ticketCount;
  });

  protected readonly purchaseForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    ticketCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    wantsAccount: [false],
    password: [''],
    paymentMethod: ['haulmer_transbank' as PaymentMethodId, Validators.required],
    acceptedTerms: [false, Validators.requiredTrue],
  });

  constructor() {
    this.purchaseForm.controls.wantsAccount.valueChanges.subscribe((wantsAccount) => {
      const passwordControl = this.purchaseForm.controls.password;
      if (wantsAccount) {
        passwordControl.addValidators([Validators.required, Validators.minLength(6)]);
      } else {
        passwordControl.clearValidators();
        passwordControl.setValue('');
      }
      passwordControl.updateValueAndValidity();
    });

    this.http.get<LandingData>('http://localhost:3000/api/landing').subscribe({
      next: (landing) => this.landing.set(landing),
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

    this.http.post<PurchaseResponse>('http://localhost:3000/api/purchase', this.purchaseForm.getRawValue()).subscribe({
      next: (response) => {
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
}
